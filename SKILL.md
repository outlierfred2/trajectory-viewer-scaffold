---
name: build-trajectory-viewer
description: Generate a tailored agent trajectory viewer repository from this scaffold and a supplied JSON schema or representative trajectories, ready for GitHub Pages.
---

# Build a trajectory viewer

Use this repository as the template. Locate it relative to this SKILL.md, never through a hard-coded machine path. Read README.md and src/adapters.js before adapting it.

## Outcome

Create a separate repository containing a static viewer that makes the supplied agent's sequence of thoughts, messages, tool actions and observations easy to follow. The expected JSON structure comes from the invoking agent/user. This scaffold repository is the reusable source; make target-specific changes in the new destination.

## Generate

1. Inspect supplied schema and representative records. Identify the event container, chronological ordering, actor/role, reasoning, message blocks, tool names, arguments, results, call/result IDs, timestamps, run identity, status and useful metrics. Distinguish recorded reasoning from inferred explanations; never invent thoughts or missing values. If only a schema is available, generate clearly synthetic fixtures and disclose that real input is unverified. If neither schema nor examples are available, request one before claiming format support.
2. Run `node scripts/create-viewer.mjs <destination>` from this repository to copy the deployable starter without its history or local data. Use an empty/nonexistent destination. Initialize Git there when a new repository is requested. Select a product title based on the task; update page title, heading and package name.
3. Implement target-specific normalization in the destination's src/adapters.js. Preserve the normalized contract described below and every original record. Add a dedicated adapter before generic adapters and select it in detect(). Normalize wrapped/nested sessions or mixed event types with code rather than forcing them into simple dotted paths. Retain input order unless the source explicitly defines another order. Avoid sorting by ambiguous timestamps. For multiple sessions, provide explicit run selection rather than mixing their events.
4. Populate dedicated readable fields for reasoning, messages, tool calls and observations. Correlate tool outputs using explicit IDs only; preserve unmatched outputs visibly. Keep structured arguments/results as formatted JSON and text blocks in their original order. Expose necessary run metadata and scores with clear labels and units, retaining zero/false values. Keep unmapped fields accessible through raw disclosures. Never silently discard events with unfamiliar types.
5. Make the default experience specific to this schema; manual field mapping is a fallback, not the main setup flow. Update labels/filters and specialized views where needed. Keep file loading local by default; do not commit user trajectories. The demo must use synthetic data and exercise the dedicated adapter. Document a source-to-display mapping in the generated README, including assumptions and unsupported variants.
6. Add representative synthetic fixtures and tests for the dedicated adapter, including optional/missing values, structured content, tools/results, unknown events and ordering. Run `npm test` and `npm run build`. Preview the built site and check file import, demo, filters, reasoning/tools, raw fields and a narrow viewport using available browser tooling. If preview tooling is unavailable, disclose the gap. Verify asset URLs work beneath a GitHub project subpath.

## Normalized contract

`normalize(doc, mapping)` and dedicated adapters return `{ events, raw, metadata? }`. Each event has `id`, `role`, `content`, `raw`, and optional `reasoning`, `toolCalls`, `observation`, `timestamp`. `content` is display text; use text() for structured values. `toolCalls` is an array of `{ name, arguments, result?, id? }`. `raw` retains the source value. The UI consumes this contract, never source-specific paths. Use `read(doc, mapping)` as the UI entry point: it dispatches custom adapter normalize functions and otherwise uses generic mapping. Update this contract and its callers together if the target requires richer ordered content blocks or branches.

## Deployment and handoff

The generated repository includes a build script and `.github/workflows/pages.yml`. All runtime assets use relative paths and require no backend or secrets. Build output is `dist/`.

When remote creation/pushing is requested, use the available GitHub tooling and existing authorization. Do not claim a repo was published without verifying the remote operation. Set Settings → Pages → Source to GitHub Actions (or configure through an available API), push to main, and verify the deployment when authorized. If the user only requests a deployable repo, prepare everything locally and provide the remaining publishing steps. Do not upload private samples as part of deployment.

Deliver the destination, supported input shape, mapping assumptions, validation results, and either the verified Pages URL or the exact remaining deployment step. A successful build alone does not establish that Pages is live.
