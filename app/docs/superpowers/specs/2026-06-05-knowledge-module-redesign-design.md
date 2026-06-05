# Knowledge Module Redesign — Design

**Date:** 2026-06-05
**Scope:** Full restructure of `/knowledge` (page IA + detail editor + new Artifacts & versioning module)
**Status:** Approved for planning

## Problem

The `/knowledge` module is a sector-based Agentic Use Case Library. A use case
is browsed via `Sector → Industry → Company → Function → Workflow → Use Case`
and edited in a full-screen, 5-tab editor (Overview / Impact / Agentic /
References / Validation).

Two problems:

1. **The detail tabs are unbalanced.** Overview is heavy (7 fields); Impact is
   two textareas; Validation is a status pill + one note. The weight is lopsided
   and the editor reads as one rich tab plus four thin ones.
2. **It is not a knowledge *asset* register.** A use case is pure metadata.
   There is no way to attach the actual deliverable (playbook, deck, prompt set,
   SOP, code, diagram), no change tracking, and no versioning. This is the core
   capability a professional knowledge module needs.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Redesign scope | Full restructure (page IA + editor + asset module) |
| Where artifacts live | A tab inside each use case (use case = knowledge-asset record) |
| Artifact storage | **Both** uploaded files (VM disk) **and** external links |
| Versioning depth | **Current + changelog** — keep only the latest file/link plus a who/when/what log; no historical bytes retained |
| Governance | **Lightweight status** — Draft / Published / Deprecated + owner + updated date (existing use-case validation kept as-is) |
| Inline preview | Out of scope for v1 — Download (file) / Open (link) only |

## Tab Rebalance

Five uneven tabs → five balanced tabs:

| Tab | Content |
|---|---|
| **Overview** | Identity & classification: workflow placement, name, domain, description, tech tag, maturity, owner/sponsors, status summary |
| **Impact** | KPIs (baseline → target rows) + business objectives |
| **Agentic Design** | Archetypes, interaction mode, A2A pattern + design rationale note |
| **Artifacts** *(new)* | Deliverables: upload/link, type, status, owner, version, changelog |
| **Evidence** | Validation status + evidence note **merged with** market/competitor references |

The two thin tabs (References + Validation) merge into one solid **Evidence**
tab; the freed weight is balanced by the new **Artifacts** tab. Overview/Impact/
Agentic are lightly enriched so all five carry comparable substance.

> Note: Validation currently has its own API endpoint and is excluded from the
> generic use-case PATCH. The Evidence tab merges the two in the **UI** only; the
> validation write path stays on its existing endpoint. References stay on the
> use-case PATCH. No change to validation persistence.

## Page Shell

- Keep the `Sector › Industry › Company` scope bar and the sidebar + list browse
  (grouped / cards / table).
- **Rebalance stats** from 6 maturity-heavy cards to 4 asset-aware cards
  (Use cases · Validated · Artifacts · Published) **+ a compact maturity bar**
  (proven / emerging / pilot).
- Add a **"Has artifacts"** filter facet to the sidebar.
- Add a small **◆ count** artifact badge to each use-case list row.

## Artifacts Tab (UI)

- **List**: one row per artifact — kind icon (file/link), title, status badge
  (Published / Draft / Deprecated), type chip, metadata line
  (file·size·version·owner·updated, or link host). File rows expose
  **Download / Replace / Edit**; link rows expose **Open / Edit**. An
  expandable **Change log** lists history per artifact.
- **Add / Edit form**: Title, Kind (Upload file | External link), Type, File/URL,
  Status, Owner, Version, and a **Change note** appended to the changelog on save.
- **Replace** (file kind): overwrites current bytes, bumps version, appends a
  changelog entry.

## Data Model

New type (lives in `src/content/knowledge-artifacts.ts`), serialized as the
JSON blob in a new table, mirroring `knowledge_use_cases`:

```ts
type ArtifactKind = "file" | "link";
type ArtifactType =
  | "playbook" | "deck" | "promptSet" | "sop"
  | "code" | "diagram" | "dataset" | "other";
type ArtifactStatus = "draft" | "published" | "deprecated";

interface ArtifactFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; // server-derived only
}

interface ArtifactChangeEntry {
  at: number;
  author: string;
  note: string;
  versionLabel?: string;
}

interface KnowledgeArtifact {
  id: string;
  useCaseId: string;
  title: string;
  kind: ArtifactKind;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  versionLabel?: string;
  createdAt: number;
  updatedAt: number;
  file?: ArtifactFile;        // kind === "file"
  url?: string;               // kind === "link"
  changelog: ArtifactChangeEntry[];
}
```

## Storage (single VM)

- **SQLite table `knowledge_artifacts`**: `id`, `use_case_id`, `kind`, `status`,
  `type`, `updated_at`, `data` (JSON). Filter columns + JSON blob, exactly like
  `knowledge_use_cases`. Bootstrapped in `client.ts` `CREATE TABLE IF NOT EXISTS`.
- **Files on disk**: `data/artifacts/<useCaseId>/<artifactId>/<fileName>`. Path
  derived server-side from ids; never accepted from the client.
- **Replace** overwrites the current file bytes and appends a changelog entry;
  historical bytes are not retained (per the "current + changelog" decision).
- Deleting a use case cascade-deletes its artifact rows and on-disk directory.

## API Routes

Mirror the existing `src/app/api/knowledge/...` envelope (`ApiResponse<T>`):

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/knowledge/use-cases/[id]/artifacts` | List artifacts for a use case |
| POST | `/api/knowledge/use-cases/[id]/artifacts` | Create (multipart=file, json=link) |
| PATCH | `/api/knowledge/artifacts/[aid]` | Update meta/status, or replace file/link (appends changelog) |
| DELETE | `/api/knowledge/artifacts/[aid]` | Delete artifact + bytes |
| GET | `/api/knowledge/artifacts/[aid]/download` | Stream the current file |

Client helpers added to `src/lib/api-client.ts`.

## Validation & Safety (system boundaries)

- **Zod schemas** for create/patch (kind-discriminated union: file vs link).
- **Upload**: max size cap (constant, e.g. 25 MB) + MIME allow-list; reject
  otherwise with a clear error.
- **Path safety**: `storagePath` built only from sanitized `useCaseId`/
  `artifactId`/sanitized `fileName`; no client-supplied paths → no traversal.
- **Download**: stream from the resolved, validated path under `data/artifacts/`.
- Errors handled explicitly at the route layer; user-facing messages in the UI.

## Components (file plan — many small files)

- `src/content/knowledge-artifacts.ts` — artifact types + constants (kinds,
  types, statuses).
- `src/db/knowledge-artifacts-repo.ts` — repo (list/create/patch/delete/replace).
- `src/db/knowledge-artifacts-validation.ts` — zod schemas + input types.
- `src/lib/artifact-storage.ts` — disk read/write/delete + path derivation + caps.
- `src/app/api/knowledge/use-cases/[id]/artifacts/route.ts`
- `src/app/api/knowledge/artifacts/[aid]/route.ts`
- `src/app/api/knowledge/artifacts/[aid]/download/route.ts`
- `src/app/knowledge/_components/editor/artifacts-tab.tsx` (+ `artifact-row.tsx`,
  `artifact-form.tsx` if the tab exceeds ~300 lines).
- Edits: `editor/evidence-tab.tsx` (merge references + validation), remove the
  separate references/validation tabs; `use-case-editor.tsx` tab list; page
  shell stats + filters in `knowledge-client.tsx` / `library-sidebar.tsx`.
- i18n keys for all new labels in `src/lib/i18n.ts` (en + zh).

## Build Order (each step shippable)

1. Artifact types + constants + zod validation (no UI).
2. `knowledge_artifacts` table + repo + `artifact-storage.ts`.
3. API routes (CRUD + upload + download) with boundary validation.
4. Tab rebalance: merge References + Validation → Evidence; enrich Impact/Agentic.
5. Artifacts tab UI (list, add/edit form, replace, changelog).
6. Page shell: rebalanced stats, "Has artifacts" filter, count badges.
7. Tests (repo + API + components) toward 80% coverage.

## Testing

- **Unit**: repo CRUD, path derivation/sanitization, zod schemas, changelog
  append on replace.
- **Integration**: API routes (upload happy path, oversize reject, bad MIME
  reject, link create, replace appends changelog, download stream, cascade
  delete).
- **Component**: Artifacts tab (render list, add/edit form, replace flow),
  Evidence tab merge.
- **E2E (Playwright)**: add a file artifact → see it listed → replace → changelog
  grows → delete.

## Out of Scope (v1)

- Inline document/image preview (download/open only).
- Historical file byte retention / restore (changelog text only).
- Cross-library Asset Registry (a possible fast-follow, approach "C").
- Approval/review workflow and role-based permissions.
- Many-to-many artifact ↔ use-case linking (artifacts belong to one use case).
