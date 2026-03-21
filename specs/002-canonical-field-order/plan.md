# Implementation Plan: Canonical JSON Field Order for Location Records

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `002-canonical-field-order` | **Date**: 2026-03-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-canonical-field-order/spec.md`

## Summary

Formalize a 22-field canonical JSON field order for location records, reorder the 7
out-of-order records in `camping/florida-bound-locations.json` (zero value changes),
and fix `camping/location-form.html` so its JSON generator assigns fields in canonical
order. Delivered as three independent work streams: (1) schema doc, (2) data file
reorder, (3) form handler reorder.

## Technical Context

**Language/Version**: HTML5, vanilla JS (ES2017+), JSON, Markdown — no build tools
**Primary Dependencies**: None beyond the browser's built-in `JSON.stringify` and
insertion-order object semantics (ES2015+, universally supported)
**Content Sources**: `camping/florida-bound-locations.json` (23 records, nested under
`data.states[].locations[]`), `camping/location-form.html` (502-line single-file form)
**Testing/Validation**: Manual browser open of `location-form.html`; scripted Python
key-order validation of the JSON file; visual diff to confirm zero value changes
**Target Platform**: GitHub Pages / any static browser; `location-form.html` requires
`https://` or `localhost` for `crypto.subtle` (ID generation)
**Project Type**: Static content maintenance — data correctness and tooling quality
**Performance Goals**: No runtime impact; file size change is negligible
**Constraints**: Lightweight maintenance, no build system, single-file HTML constraint
for form; no value changes permitted in JSON reorder
**Scale/Scope**: 2 source files modified (`florida-bound-locations.json`,
`location-form.html`), 1 schema reference doc created
(`specs/002-canonical-field-order/contracts/location-record.md`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
      *Rationale: fixes canonical ordering of the location data file that powers
      florida-bound pages and ensures the form tool produces clean, paste-ready JSON.*
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
      *`florida-bound-locations.json` — active data; `location-form.html` — active
      tooling; `contracts/location-record.md` — supporting reference in feature spec.*
- [x] Navigation and discoverability updates are identified for all curated content
      changes.
      *No navigation change required: no new pages, no file renames, no links broken.*
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
      *Data reorder via Python one-shot script (not committed); form fix is pure JS
      object-key ordering; schema is plain Markdown.*
- [x] Privacy, licensing, and large-asset implications have been reviewed.
      *All data is already public camping info; no new external data introduced.*

**Constitution Check: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-canonical-field-order/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── location-record.md   # Canonical schema reference (FR-001)
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
camping/
├── florida-bound-locations.json   # 23 records — 7 reordered, 16 unchanged
└── location-form.html             # JS generator block rewritten for canonical order
```

**Structure Decision**: Static content collection — existing `camping/` directory.
No new directories in `camping/`. Schema reference lives in the feature spec directory
as a supporting artifact; it is not published to the site.
