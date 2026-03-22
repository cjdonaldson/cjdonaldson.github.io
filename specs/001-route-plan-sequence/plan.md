# Implementation Plan: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence` | **Date**: 2025-07-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-route-plan-sequence/spec.md`

## Summary

Add a route sequence area to `camping/florida-bound-planner.html` that displays an
ordered, colon-separated string of location IDs below the "View Route in Google Maps"
link. The area (textarea + copy button + plan-title combobox) is hidden when the route
has fewer than two stops and auto-updates on every add/remove. Users can paste a sequence
back in to reconstruct a route, and named plans stored in `florida-bound-locations.json`
are offered in a native `<datalist>` dropdown.

All changes stay within the existing four source files; no new files, no new dependencies,
no build step.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla ES2020 JavaScript
**Primary Dependencies**: Browser Clipboard API (`navigator.clipboard.writeText`), native
HTML5 `<datalist>`, existing `florida-bound-data-loader.js` and `florida-bound-grid.js`
**Content Sources**: `camping/florida-bound-locations.json` (existing data file, new
`routes` array key added); existing JS/CSS files in `camping/`
**Testing/Validation**: Manual browser review over HTTP (`python3 -m http.server`); all
acceptance scenarios from spec run by hand. No automated test framework is used or needed.
**Target Platform**: GitHub Pages (HTTPS) and local HTTP dev server; desktop and mobile
browsers (Chrome 90+, Firefox 90+, Safari 14+)
**Project Type**: Lightweight interactive static-site planner
**Performance Goals**: No additional network requests; the sequence is computed from data
already in memory. CSS additions are minimal (< 50 lines).
**Constraints**: No framework, no build step, no server-side components. Changes stay in
the four existing files. The page must remain usable on mobile-width viewports.
**Scale/Scope**: Four files changed (`florida-bound-data-loader.js`,
`florida-bound-locations.json`, `florida-bound-grid.js`,
`florida-bound-planner.css`); one feature spec directory added.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
      *The planner is a camping trip planning tool. Sequence copy/restore directly
      improves the usability of curated route content.*
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
      *All four changed files are already published under `camping/`. The spec artifacts
      live in `specs/001-route-plan-sequence/` as supporting planning reference.*
- [x] Navigation and discoverability updates are identified for all curated content
      changes.
      *No new pages or navigation entries are needed. The sequence area is embedded within
      the existing planner page. No index or landing-page updates are required.*
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
      *Native `<datalist>` for the combobox (zero JS library), Clipboard API for copy
      (one async call), inline DOM for the sequence area. No frameworks, no bundler.*
- [x] Privacy, licensing, and large-asset implications have been reviewed.
      *No external data, no third-party scripts, no new binary assets. Clipboard access
      is initiated by explicit user gesture; no ambient data collection.*

**Post-design re-check**: All gates still pass. Phase 1 design introduces no new
violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-route-plan-sequence/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── data-and-dom.md  # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
camping/
├── florida-bound-planner.html        # unchanged (HTML entry point)
├── florida-bound-data-loader.js      # CHANGED — add id field + getRouteData()
├── florida-bound-grid.js             # CHANGED — sequence area logic
├── florida-bound-planner.css         # CHANGED — sequence area styles
└── florida-bound-locations.json      # CHANGED — add top-level routes array
```

**Structure Decision**: Lightweight interactive pages (Option 3 from template). All
changes are confined to the existing `camping/` directory. No new directories or pages
are added.

## Complexity Tracking

> No Constitution Check violations. Table omitted.
