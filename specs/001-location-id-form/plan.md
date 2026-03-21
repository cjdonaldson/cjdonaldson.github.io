# Implementation Plan: Location ID Generation in Location Form

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-location-id-form` | **Date**: 2026-03-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-location-id-form/spec.md`

## Summary

Modify `camping/location-form.html` to compute a deterministic 8-character hex `id`
(SHA-256 of normalized `"lat,lng"`) and insert it as the first key in the generated
JSON output. The form is a single self-contained static HTML file; the implementation
inlines the Web Crypto API (`crypto.subtle.digest`) directly in the existing submit
handler, which is promoted to `async`. If `crypto.subtle` is unavailable (Chrome over
`file://`), the handler displays a clear error and blocks all JSON output.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES2017 — async/await, TextEncoder)
**Primary Dependencies**: Web Crypto API (`crypto.subtle.digest('SHA-256', …)`,
available in all modern browsers on HTTPS and in Firefox on `file://`); `TextEncoder`
(universally available); zero external dependencies added
**Content Sources**: `camping/location-form.html` (single file being modified);
`location-id-gen.js` (Node.js reference implementation at repo root — algorithm source
of truth, not bundled)
**Testing/Validation**: Manual browser testing — Firefox over `file://`, and any
HTTPS-served modern browser; cross-check generated `id` against `node location-id-gen.js`
CLI output for ≥3 coordinate pairs
**Target Platform**: Static file; Firefox over `file://` (primary local use), GitHub
Pages HTTPS (published); Chrome over `file://` is explicitly unsupported and returns an
error message
**Project Type**: Single-file self-contained static maintenance tool
**Performance Goals**: `SubtleCrypto.digest` on a short string is imperceptible (<1 ms);
no spinner or disabled-state required; total file-size increase ≤2 KB over baseline
**Constraints**: No new build tools; no external scripts or CDN references; single file
must remain self-contained; handler must be `async`; no polyfill for `crypto.subtle`
**Scale/Scope**: One file changed — `camping/location-form.html`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
      *`location-form.html` is the authoring tool that creates camping location data.
      Adding the `id` field closes a post-processing gap and ensures every new record is
      born complete — directly serving the content workflow.*
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
      *Only `camping/location-form.html` is modified; it is an existing published
      maintenance tool. No new files are introduced to the site.*
- [x] Navigation and discoverability updates are identified for all curated content
      changes.
      *No new pages or assets are added; no navigation updates are required.*
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
      *The implementation is a small inline JavaScript change using only native browser
      APIs. No libraries, bundlers, or build steps are introduced.*
- [x] Privacy, licensing, and large-asset implications have been reviewed.
      *No external requests, no new assets, no personal data. File size increase is well
      under 2 KB.*

## Project Structure

### Documentation (this feature)

```text
specs/001-location-id-form/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
camping/
└── location-form.html   # Only file modified by this feature
location-id-gen.js       # Reference algorithm (Node.js) — read-only for this feature
```

**Structure Decision**: Single-file modification within the existing `camping/`
directory. No new source files, directories, or assets are introduced. The feature is
entirely contained within the `<script>` block of `camping/location-form.html`.

## Complexity Tracking

> *No Constitution Check violations — table omitted.*
