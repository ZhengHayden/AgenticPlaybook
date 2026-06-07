# Artifact Preview (HTML / Markdown / PDF) — Design

**Date:** 2026-06-07
**Status:** Approved

## Goal

Let users preview a Knowledge artifact's file in-app, without downloading it,
for the three most common viewable formats: **PDF**, **HTML**, and **Markdown**.
Other file types (Office docs, images, zips) and link artifacts keep their
current behavior (Download / Open Link).

## User-facing behavior

- In the artifact list (`ArtifactRow`), file artifacts whose type is previewable
  gain a **Preview** action beside Download.
- Clicking Preview opens a full-screen in-app **modal** that renders the file:
  - **PDF** — embedded in an `<iframe>` using the browser's native PDF viewer.
  - **HTML** — rendered in a **sandboxed** `<iframe>` (no script execution,
    no same-origin access).
  - **Markdown** — converted to HTML with `marked`, then displayed in a
    sandboxed `<iframe srcdoc>` with minimal typographic CSS.
- The modal has loading and error states, a footer Download link, and closes on
  backdrop click or Escape.

## Previewability rule

A pure helper decides previewability from the file's MIME type **and** filename
extension, because `.md`/`.html` files frequently upload with a generic or wrong
MIME type:

```
previewKind(file: ArtifactFile): "pdf" | "html" | "markdown" | null
```

- `pdf` — mime `application/pdf` OR extension `pdf`
- `html` — mime `text/html` | `application/xhtml+xml` OR extension `html`/`htm`/`xhtml`
- `markdown` — mime `text/markdown` OR extension `md`/`markdown`
- otherwise `null` (no Preview button shown)

## Serving bytes inline

The existing route `GET /api/knowledge/artifacts/[aid]/download` forces
`Content-Disposition: attachment`. Add an opt-in query param:

- `?disposition=inline` → serve with `Content-Disposition: inline` so the bytes
  can render in an iframe / native viewer.
- Default (no param) stays `attachment` — download behavior unchanged.
- **Security:** for inline **HTML/XHTML** responses, also send
  `Content-Security-Policy: sandbox` and `X-Content-Type-Options: nosniff`, so a
  direct hit on the inline URL cannot execute scripts in the app's origin.

## Components / files

| File | Change |
|------|--------|
| `lib/artifact-preview.ts` (new) | `previewKind()` + `artifactInlineUrl(id)` helper |
| `api/knowledge/artifacts/[aid]/download/route.ts` | inline disposition + CSP/nosniff for HTML |
| `app/knowledge/_components/editor/artifact-preview-modal.tsx` (new) | the modal |
| `app/knowledge/_components/editor/artifact-row.tsx` | Preview button (when `previewKind != null`) |
| `lib/i18n.ts` | `preview` label (en + zh) |

## Dependency

- `marked` — Markdown → HTML only. MIT, lightweight, ships its own types. No
  separate HTML sanitizer is needed because rendered Markdown is isolated inside
  a sandboxed iframe.

## Testing

- **Unit** — `previewKind()`: pdf/html/markdown by mime and by extension;
  generic-mime fallback to extension; `null` for `.pptx`, `.png`, `.zip`, links.
- **Route** — `?disposition=inline` returns `Content-Disposition: inline`;
  inline HTML response carries `Content-Security-Policy: sandbox`; default still
  `attachment`.
- **Component** — modal renders Markdown as HTML; mounts an iframe for PDF and
  for HTML; shows an error state when bytes fail to load.

## Out of scope

- Office formats (`.pptx`/`.docx`/`.xlsx`), images, archives — Download only.
- Link artifacts — already open in a new tab.
- Inline editing of artifact content (preview is read-only).
