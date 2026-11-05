# Trajectory viewer scaffold

A dependency-free, local-file trajectory reader. Built independently as a reusable starting point. WIP ~ send feedback to [Fred Davis](https://scale.enterprise.slack.com/team/U0BU44F534M)

If needed, sanitized your trajectory JSON first with https://outlierfred2.github.io/JSONsanitizer/

Run `npm start`, then open http://localhost:8000. Requires Python 3. Run `npm test` with Node.js 18+.

Open one or more JSON files or load the built-in example. Search includes every original event field. Expand events to inspect messages and the complete original record. Nothing is uploaded; refreshing clears loaded files and mappings.

## Handling changing schemas

`src/adapters.js` is the schema boundary. The UI consumes `{ events: [{ id, role, content, raw }], raw }` only. Built-in detection handles `steps`, `messages`, and root arrays. Unknown formats can be mapped in the sidebar using dotted paths, for example events `data.turns`, role `actor.name`, and content `payload.text`. Blank events means the root; blank content displays the whole record. Mapping changes remain attached to each loaded run for the current session.

For a recurring format, add an entry to `adapters` with `id`, `label`, `matches(doc)` and `mapping`. More complex formats (branching runs, interleaved tool outputs, multiple sessions) should get a dedicated transformation into the same normalized contract. Keep schema logic out of `src/app.js`. Add a representative fixture and an adapter test whenever introducing a format.

## Scope

This starter includes multi-file navigation, format detection, manual mappings, role filters, search, expandable events and raw inspection. It deliberately has no assumed folder layout, scoring schema or metadata taxonomy. Tool calls and unfamiliar fields are retained under All event fields. Specialized tool rendering, JSONL import, persistent mapping profiles and folder grouping are extension points. Large files are currently parsed and rendered in memory; add worker parsing and windowed rendering for large datasets.

Text is rendered using DOM textContent; uploaded markup is displayed as text. There are no external scripts, analytics or runtime dependencies.

## Generate a tailored viewer with an agent

Start with [SKILL.md](SKILL.md) at the repository root. Tell the agent to use it and supply a JSON schema or representative trajectory plus the desired destination. For example:

> Use SKILL.md to create a new trajectory viewer repository at /path/to/my-viewer for the attached JSON structure. Show recorded reasoning, tool arguments/results and run scores. Prepare it for GitHub Pages.

The skill lives alongside its scaffold assets; keep this repository together when distributing it. It can be read directly by an agent without installing a global skill.

The generator `node scripts/create-viewer.mjs /path/to/my-viewer` copies the runnable starter into an empty destination outside this repository. It excludes Git history and SKILL.md. Generated viewers have no dependency on the source checkout. Add custom adapters with `normalize(doc)` and dispatch through `read()`; generic mappings remain available for simple formats. The UI displays optional reasoning, toolCalls, observation, timestamp and run metadata supplied by adapters.

Run `npm run build` to produce `dist/`. The included GitHub Actions workflow tests, builds and deploys this directory on pushes to `main`. In the new GitHub repository, select **Settings → Pages → Source → GitHub Actions**. Initialize Git, commit and push the generated project to main. All assets are relative so repository subpaths work. Deployment is not performed by the local generator.
