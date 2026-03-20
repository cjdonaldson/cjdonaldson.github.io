# Implementation Plan: Add Stable Location IDs

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-add-location-ids` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-add-location-ids/spec.md`

## Summary

Add a deterministic `id` field to every location object in
`camping/florida-bound-locations.json`. The `id` is the first 8 characters of
the SHA-256 hex digest of `"<lat>,<lng>"` computed from the location's `coords`
array — no external libraries required. The field must appear as the first key
in each location object and must be unique across all 23 locations.

**Pre-implementation blocker**: Two Pennsylvania locations (Cabela's Hamburg and
Camping World Hamburg) share identical coordinates `[40.5514, -75.9386]` and
would produce the same `id`. Their coordinates must be corrected before IDs can
be committed. See `research.md` for details.

## Technical Context

**Language/Version**: JSON (data file), vanilla JavaScript (formula — browser-native only)
**Primary Dependencies**: `crypto.subtle.digest` (browser) / Node.js `crypto` module (tooling) — zero external libraries
**Content Sources**: `camping/florida-bound-locations.json` (23 locations across 6 states)
**Testing/Validation**: Manual spot-check in browser console; required Node.js validation script (`validate-ids.js` at repo root) committed alongside the data file, enforcing uniqueness, format, and ID–coords consistency (stale-ID detection exits non-zero)
**Target Platform**: GitHub Pages static site; any modern browser supporting `crypto.subtle`
**Project Type**: Static data file update (camping content)
**Performance Goals**: No runtime cost — IDs are pre-computed and stored in the JSON file
**Constraints**: No build system; key-order preservation required; pure hand-editable JSON
**Scale/Scope**: One file (`camping/florida-bound-locations.json`), 23 location objects

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
      *Rationale: `id` fields enable the camping planner to reference locations
      stably, directly improving maintainability of that camping content.*
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
      *Rationale: `camping/florida-bound-locations.json` is an active, published
      data file. The `id` additions are permanent, stable additions to it.*
- [x] Navigation and discoverability updates are identified for all curated content
      changes.
      *Rationale: This change is internal to the JSON data file and adds no new
      pages or navigation structures. No navigation update required.*
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
      *Rationale: IDs are computed once and stored as plain strings in JSON.
      The formula uses only browser-native `crypto.subtle` — no build tools,
      no dependencies, no new files beyond the data file itself.*
- [x] Privacy, licensing, and large-asset implications have been reviewed.
      *Rationale: The data file contains only public campground information.
      SHA-256 digests of GPS coordinates carry no privacy concern. No large
      assets involved.*

**Constitution Check result: PASS ✅** — No violations; Complexity Tracking table not required.

**Post-design re-check**: Constitution check still passes after Phase 1 design.
The only artifact changes are a pre-computed data file edit and supporting
spec documentation. No new pages, no new navigation, no new dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-location-ids/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

*(No `contracts/` directory — this feature modifies a purely internal data file
and defines no external-facing API, command schema, or interface.)*

### Source Code (repository root)

```text
camping/
├── florida-bound-locations.json   # ← only data file changed by this feature
└── site-map/

validate-ids.js        # Required deliverable — validates uniqueness, format, and ID–coords consistency
location-id-gen.js     # Required deliverable — generates a stable ID from a coord string
location-id-add.js     # Required deliverable — adds missing IDs to locations with valid coords
```

**Structure Decision**: Single-file data update within the existing
`camping/` collection. No new directories or pages are introduced.
