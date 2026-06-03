import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Candidate } from "@/content/sample-data";
import { screenCriteria, type ScreenCriterionId } from "@/content/binary-screen";
import { readSop } from "@/lib/sop-storage";

/**
 * Workflow Understanding Agent — reads an uploaded SOP PDF with Claude and
 * proposes answers to the 6 binary readiness-screen dimensions, STRICTLY
 * grounded in the document. Any dimension the SOP does not address is returned
 * as `yes: null` (never guessed) so the UI can badge it "not stated in SOP".
 *
 * Security: the Anthropic API key is read from the environment at call time and
 * never hardcoded. A missing key fails with a clear, user-facing message.
 */

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

/** A single grounded suggestion for one screen dimension. */
export interface ReadinessSuggestion {
  /** true = SOP supports Yes, false = SOP shows a gap, null = not stated. */
  yes: boolean | null;
  /** Short quote/paraphrase grounding the answer (omitted when null). */
  evidence?: string;
  /** Extracted fact for dimensions with a factField (volume, owner). */
  factValue?: string;
}

export type ReadinessSuggestions = Record<ScreenCriterionId, ReadinessSuggestion>;

export interface UnderstandingResult {
  suggestions: ReadinessSuggestions;
  /** Dimensions the SOP did not address (yes === null). */
  notStated: ScreenCriterionId[];
}

/** Thrown when the agent cannot run (missing key, no SOP, bad model output). */
export class UnderstandingAgentError extends Error {}

// ─── Tool result validation ───────────────────────────────────

const suggestionSchema = z.object({
  yes: z.boolean().nullable(),
  evidence: z.string().optional(),
  factValue: z.string().optional(),
});

const dimensionIds = screenCriteria.map((c) => c.id) as [ScreenCriterionId, ...ScreenCriterionId[]];

const reportSchema = z.object(
  Object.fromEntries(dimensionIds.map((id) => [id, suggestionSchema])) as Record<
    ScreenCriterionId,
    typeof suggestionSchema
  >,
);

// ─── Prompt + tool definitions ────────────────────────────────

function buildToolSchema(): Anthropic.Tool {
  const properties: Record<string, unknown> = {};
  for (const cr of screenCriteria) {
    properties[cr.id] = {
      type: "object",
      description: `${cr.shortLabel.en}: ${cr.question.en}`,
      properties: {
        yes: {
          type: ["boolean", "null"],
          description:
            "true if the SOP clearly supports this dimension, false if it shows a gap, null if the SOP does not address it at all (do NOT guess).",
        },
        evidence: {
          type: "string",
          description: "A short quote or paraphrase from the SOP grounding the answer. Omit when yes is null.",
        },
        factValue: {
          type: "string",
          description: cr.factField
            ? `Extracted value for "${cr.factField.en}" if stated in the SOP, else omit.`
            : "Leave unset (this dimension has no fact field).",
        },
      },
      required: ["yes"],
      additionalProperties: false,
    };
  }

  return {
    name: "report_readiness",
    description:
      "Report grounded readiness-screen answers for each of the 6 dimensions, based ONLY on the SOP content.",
    input_schema: {
      type: "object",
      properties: properties as Anthropic.Tool.InputSchema["properties"],
      required: dimensionIds as unknown as string[],
      additionalProperties: false,
    },
  };
}

function buildSystemPrompt(): string {
  return [
    "You are a process-analysis assistant for an agentic-automation readiness review.",
    "You will be given a Standard Operating Procedure (SOP) PDF for a single workflow.",
    "Assess the workflow against 6 binary readiness dimensions and call the `report_readiness` tool.",
    "",
    "CRITICAL grounding rules — you must NOT hallucinate:",
    "- Base every answer ONLY on what the SOP actually states.",
    "- If the SOP does not address a dimension, set `yes` to null and omit evidence. Do not infer or guess.",
    "- When you set yes true/false, include a short evidence quote/paraphrase from the SOP.",
    "- Extract factValue only when the SOP explicitly states it (e.g. monthly volume, named owner).",
    "- Prefer null over a weak guess. A blank answer is correct when the SOP is silent.",
  ].join("\n");
}

function buildUserPrompt(candidate: Pick<Candidate, "name" | "description">): string {
  const dims = screenCriteria
    .map((cr, i) => `${i + 1}. ${cr.id} — ${cr.shortLabel.en}: ${cr.whatItMeans.en}`)
    .join("\n");
  return [
    `Workflow under review: ${candidate.name}`,
    candidate.description ? `Known description: ${candidate.description}` : "",
    "",
    "Dimensions to assess (use these exact keys in the tool call):",
    dims,
    "",
    "Read the attached SOP and call `report_readiness` with one entry per dimension.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Public entrypoint ────────────────────────────────────────

/**
 * Run the understanding agent for a candidate that has an uploaded SOP.
 * Throws {@link UnderstandingAgentError} on a missing key/SOP or unusable
 * model output.
 */
export async function runUnderstandingAgent(
  projectId: string,
  candidate: Candidate,
): Promise<UnderstandingResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new UnderstandingAgentError(
      "The Understanding Agent is not configured: set ANTHROPIC_API_KEY in the server environment.",
    );
  }
  if (!candidate.sopFile) {
    throw new UnderstandingAgentError("This workflow has no uploaded SOP to analyze.");
  }

  const pdf = await readSop(projectId, candidate.sopFile.storedName);
  const base64 = pdf.toString("base64");
  const model = process.env.PLAYBOOK_AGENT_MODEL ?? DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      system: buildSystemPrompt(),
      tools: [buildToolSchema()],
      tool_choice: { type: "tool", name: "report_readiness" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: buildUserPrompt(candidate) },
          ],
        },
      ],
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    throw new UnderstandingAgentError(`The Understanding Agent request failed: ${detail}`);
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "report_readiness",
  );
  if (!toolUse) {
    throw new UnderstandingAgentError("The agent did not return a structured readiness report.");
  }

  const parsed = reportSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new UnderstandingAgentError("The agent returned an invalid readiness report.");
  }

  const suggestions = parsed.data as ReadinessSuggestions;
  const notStated = dimensionIds.filter((id) => suggestions[id].yes === null);
  return { suggestions, notStated };
}
