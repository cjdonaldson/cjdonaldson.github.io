# Implementation Plan: Location Form UX Improvements

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-location-form-ux` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-location-form-ux/spec.md`

## Summary

Improve the internal maintainer form `camping/location-form.html` by reorganizing
fields into seven named sections, removing "(optional)" label noise, introducing
multi-column CSS Grid rows for related short fields, and replacing the two independent
booking fields with a radio-button-driven interaction that enforces mutual exclusivity
between `bookingUrl` and `booking` JSON keys. All changes are confined to a single
HTML file using plain HTML5, CSS3, and vanilla JavaScript with no build tooling or new
dependencies.

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES6+)
**Primary Dependencies**: None — zero-build; native browser DOM and FormData APIs only
**Content Sources**: `camping/location-form.html` (single-file in-place replacement)
**Testing/Validation**: Manual browser review; JSON output panel inspection; viewport
resize testing (≥400 px and <400 px); DevTools element inspection
**Target Platform**: Desktop-primary browser (Chrome/Firefox/Safari); GitHub Pages
static hosting; not publicly linked
**Project Type**: Internal maintainer tool — lightweight interactive single-page form
**Performance Goals**: Instant field toggle (display swap, no animation); page load
unchanged from current; total file size stays well under 50 KB
**Constraints**: Single-file modification; no new files in `camping/`; no build system;
no external scripts or stylesheets added
**Scale/Scope**: One file — `camping/location-form.html` (412 lines → estimated
~430–450 lines after changes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content, or
      clearly improves presentation of that content.
      *`location-form.html` is the entry tool for `florida-bound-locations.json`;
      improving its UX directly supports the curation workflow.*
- [x] Each new or changed file has a defined long-term home and status: published,
      under evaluation, or supporting reference.
      *Only `camping/location-form.html` is modified — it is an established file with
      a clear role as an internal maintainer tool.*
- [x] Navigation and discoverability updates are identified for all curated content
      changes.
      *The form is not linked from any user-facing page; no navigation updates needed.*
- [x] The solution uses the lightest viable static-site approach; any heavier tooling
      is explicitly justified.
      *Pure HTML/CSS/JS, single file, no dependencies.*
- [x] Privacy, licensing, and large-asset implications have been reviewed.
      *Internal tool; no new assets; no external data sources; no sensitive data.*

**Constitution Check Result**: ✅ All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/001-location-form-ux/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── location-json-output.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
camping/
├── location-form.html   # ← only file modified by this feature
├── florida-bound-locations.json
├── florida-bound-planner.html
└── ...                  # other camping files unchanged
```

**Structure Decision**: Single-file modification within the existing `camping/`
directory. No new source files are introduced. The form remains a self-contained,
zero-dependency HTML page.
