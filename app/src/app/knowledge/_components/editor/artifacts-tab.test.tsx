import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { ArtifactsTab } from "./artifacts-tab";
import * as api from "@/lib/api-client";

vi.mock("@/lib/api-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/api-client")>()),
  listArtifacts: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe("ArtifactsTab", () => {
  it("shows empty state when there are no artifacts", async () => {
    vi.mocked(api.listArtifacts).mockResolvedValue([]);
    render(
      <LocaleProvider>
        <ArtifactsTab useCaseId="uc-1" />
      </LocaleProvider>,
    );
    await waitFor(() => expect(screen.getByText(/no artifacts yet/i)).toBeInTheDocument());
  });

  it("lists artifacts returned by the API", async () => {
    vi.mocked(api.listArtifacts).mockResolvedValue([
      {
        id: "art-1",
        useCaseId: "uc-1",
        title: "Underwriting Playbook",
        kind: "link",
        type: "playbook",
        status: "published",
        owner: "A",
        url: "https://e.com",
        createdAt: 1,
        updatedAt: 2,
        changelog: [],
      },
    ]);
    render(
      <LocaleProvider>
        <ArtifactsTab useCaseId="uc-1" />
      </LocaleProvider>,
    );
    await waitFor(() => expect(screen.getByText("Underwriting Playbook")).toBeInTheDocument());
  });
});
