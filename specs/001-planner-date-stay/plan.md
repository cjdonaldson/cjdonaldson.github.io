# Implementation Plan: Florida Bound Planner Date & Stay Driven Schedule

**Branch**: `001-planner-date-stay` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-planner-date-stay/spec.md`

## Summary

Extend the existing Florida Bound route planner so that the top route item owns an
editable departure-date picker (min = today) and every downstream item shows a
read-only derived date plus an editable stay-in-days field. All dates are recomputed
in plain JavaScript whenever the departure date or any stay value changes. No new
files, libraries, or build steps are introduced — the feature is a focused addition
to `florida-bound-grid.js` (logic) and `florida-bound-planner.css` (styling).

## Technical Context

**Language/Version**: HTML5, CSS3, vanilla JavaScript (ES5-compatible; existing
codebase convention)
**Primary Dependencies**: Browser-native `<input type="date">` and
`<input type="number">`; `Date` object arithmetic; DOM events — no external libraries
**Content Sources**: Existing `camping/` files modified in place; no new data files
**Testing/Validation**: Manual browser review — open
`camping/florida-bound-planner.html` and exercise the acceptance scenarios in the
spec; no automated test runner
**Target Platform**: GitHub Pages; static browsers; mobile + desktop (same as today)
**Project Type**: Lightweight interactive planner page (existing)
**Performance Goals**: Date recomputation is synchronous and instant on each `input`
event; no server calls or async work
**Constraints**: Plain HTML/CSS/JS only; no build step; no frameworks; public-safe;
lightweight to maintain
**Scale/Scope**: One JS file changed (`florida-bound-grid.js`), one CSS file changed
(`florida-bound-planner.css`), HTML shell unchanged

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] The change directly supports curated camping, RV, or adjacent site content —
      it improves an existing Florida Bound trip-planning tool.
- [x] Each new or changed file has a defined long-term home: `camping/` existing
      files, modified in place and published; `specs/001-planner-date-stay/` for
      design docs (supporting reference, not published to site).
- [x] Navigation and discoverability: no new pages are added; the planner is reached
      from the existing `florida-bound.html` landing page; no index updates needed.
- [x] Lightest viable static-site approach: plain JS/CSS edits to existing files; no
      build system, no libraries, no framework.
- [x] Privacy, licensing, large-asset implications: none — no new assets, no personal
      data, no external libraries.

*Post-design re-check*: All gates remain green. The chosen design (parallel `stays`
array on the planner object, ISO-string date arithmetic, targeted label redraws) adds
no new files or dependencies and fits entirely within the existing code structure.

## Project Structure

### Documentation (this feature)

```text
specs/001-planner-date-stay/
├── plan.md          ← this file
├── research.md      ← Phase 0 output (decisions and rationale)
├── data-model.md    ← Phase 1 output (entities and state shape)
├── quickstart.md    ← Phase 1 output (manual verification guide)
└── tasks.md         ← Phase 2 output (/speckit.tasks — NOT created here)
```

No `contracts/` directory: this feature makes no changes to external interfaces.
All behavior is internal to the planner page.

### Source Code (repository root)

```text
camping/
├── florida-bound-planner.html   ← unchanged (HTML shell, loads scripts)
├── florida-bound-grid.js        ← all date/stay logic added here
└── florida-bound-planner.css    ← styles for date input, stay input, derived-date label
```

**Structure Decision**: All planner logic already lives in `florida-bound-grid.js`.
Extending that file (rather than adding a new module) keeps the `<script>` load order
unchanged and avoids touching the HTML shell. The file is 414 lines and the addition
is self-contained, so a single-file approach remains practical for this feature size.
