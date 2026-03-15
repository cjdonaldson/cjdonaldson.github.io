# Implementation Plan: One-Line Filter Fields

**Branch**: `[001-one-line-filter-fields]` | **Date**: 2026-03-15 | **Spec**: [`/specs/001-one-line-filter-fields/spec.md`](/home/chuck/github/cjdonaldson.github.io/specs/001-one-line-filter-fields/spec.md)
**Input**: Feature specification from `/specs/001-one-line-filter-fields/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Keep the Florida Bound planner's existing `Filter by` and `Max value` controls on one horizontal row in every dynamically rendered planner instance by introducing a small shared layout wrapper in the planner markup and matching lightweight CSS, without changing filtering behavior or site navigation.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: HTML5, CSS3, vanilla JavaScript (existing browser-executed static assets)
**Primary Dependencies**: Browser DOM APIs, existing Florida Bound planner scripts/styles, static JSON fetch for planner data, no new libraries
**Storage**: N/A
**Content Sources**: Existing `camping/florida-bound-planner.html`, `camping/florida-bound-grid.js`, `camping/florida-bound-planner.css`, `camping/florida-bound-grid.css`, and existing Florida Bound location data (`camping/florida-bound-locations.json`)
**Testing/Validation**: Manual browser review via local static server, add/remove planner instances, change filter values, narrow-width spot checks, confirm no link/asset regressions
**Target Platform**: GitHub Pages-style static hosting; desktop and mobile browsers that support modern flexbox and `fetch`
**Project Type**: Lightweight interactive static-site planner page
**Performance Goals**: Preserve current planner responsiveness, add no new network requests, keep DOM/CSS changes negligible, maintain readable grouped controls
**Constraints**: Scope limited to presentation/order of existing controls, no filtering logic changes, no new build tooling, publish-ready assets only, maintain existing discovery path to planner page
**Scale/Scope**: One published planner experience (`camping/florida-bound-planner.html`) and its supporting render/style files, plus planning artifacts under `specs/001-one-line-filter-fields/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content. The Florida Bound planner is an existing published camping-planning page, and this feature improves usability of its filter controls.
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference. Published assets remain in `camping/`; planning artifacts live in `specs/001-one-line-filter-fields/` as supporting reference for implementation.
- [x] Navigation and discoverability updates are identified for all curated content
      changes. No new page or route is introduced, so no navigation changes are required; the behavior remains discoverable on the existing planner page.
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified. The design uses existing HTML/CSS/JS patterns only and adds no new tooling or dependency.
- [x] Privacy, licensing, and large-asset implications have been reviewed. No new data sources, personal data, copyrighted assets, or large binaries are introduced.

**Gate Status (pre-research)**: PASS
**Gate Status (post-design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-one-line-filter-fields/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
camping/
├── florida-bound-planner.html
├── florida-bound-grid.js
├── florida-bound-planner.css
├── florida-bound-data-loader.js
└── florida-bound-utils.js

specs/001-one-line-filter-fields/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── planner-filter-row.md
```

**Structure Decision**: Use the existing lightweight interactive page structure under `camping/`, with planner markup generated in `camping/florida-bound-grid.js` and styling in `camping/florida-bound-planner.css`. Planning and design artifacts remain isolated in `specs/001-one-line-filter-fields/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations require justification for this feature.
