# Tasks: One-Line Filter Fields

**Input**: Design documents from `/specs/001-one-line-filter-fields/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅, contracts/planner-filter-row.md ✅

**Tests**: No automated tests — manual browser review is the validated approach per research.md Decision 5.
Validation tasks are included in each story phase to confirm acceptance criteria before moving on.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no pending dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in every description

## Path Conventions

- `camping/florida-bound-grid.js` — planner render logic
- `camping/florida-bound-grid.css` — grid-level stylesheet (audit alongside planner CSS)
- `camping/florida-bound-planner.css` — planner stylesheet
- `camping/florida-bound-planner.html` — published planner page
- `camping/florida-bound-locations.json` — location data (existing network fetch; must not increase)
- `specs/001-one-line-filter-fields/contracts/planner-filter-row.md` — UI contract

---

## Phase 1: Setup

**Purpose**: Audit current markup and stylesheet to ground the implementation in real code before changing anything.

- [X] T001 Audit `camping/florida-bound-grid.js` — locate `renderPlanner()` and identify the exact lines where the `Filter by` label/select and `Max value` label/input are emitted; also note the standalone `<label>Direction:</label>` and `<div id="filter-direction-{id}">` sibling elements that must remain outside `.filter-row`
- [X] T002 [P] Audit both `camping/florida-bound-planner.css` and `camping/florida-bound-grid.css` — note the existing flex container patterns (e.g., `.filter-direction-container` gap: 12px) in both files to use as style reference and to identify any competing layout rules

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the shared CSS row class that both user-story phases depend on.

**⚠️ CRITICAL**: US1 implementation cannot begin until this phase is complete.

- [X] T003 Add `.filter-row` rule to `camping/florida-bound-planner.css` — `display: flex; flex-direction: row; flex-wrap: nowrap; gap: 12px;` matching the gap used by `.filter-direction-container` for visual consistency; also `.filter-row select { width: 10em; }` and `.filter-row input[type="number"] { width: 5em; }` added during testing to prevent controls from spanning full row width

**Checkpoint**: CSS class ready — US1 JS change can now begin.

---

## Phase 3: User Story 1 — Scan filter controls together (Priority: P1) 🎯 MVP

**Goal**: Every planner instance presents `Filter by` and `Max value` on one horizontal row, `Filter by` first, without changing filtering logic.

**Independent Test**: Open `http://localhost:8000/camping/florida-bound-planner.html` with one planner visible and confirm the `Filter by` label + select and the `Max value` label + numeric input appear side-by-side on a single row in that order.

### Implementation for User Story 1

- [X] T004 [US1] In `camping/florida-bound-grid.js` inside `renderPlanner()`, wrap the `Filter by` label/select and `Max value` label/input in `<div class="filter-row">…</div>`, placing `Filter by` first and `Max value` second, while preserving the existing IDs `filter-type-{id}` and `filter-value-{id}` and their `for`/`id` label associations unchanged

### Validation for User Story 1

- [X] T005 [P] [US1] Start a local static server (`python3 -m http.server 8000` from repo root) and open `http://localhost:8000/camping/florida-bound-planner.html`; confirm a single planner displays `Filter by` first and `Max value` second on one horizontal row
- [X] T006 [P] [US1] Change `Filter by` between its options and update `Max value`; confirm the one-row layout remains intact and the planner continues to function (waypoint options refresh correctly)

**Checkpoint**: US1 complete — single-planner one-line filter row is functional and verified.

---

## Phase 4: User Story 2 — Keep layout consistent across planners (Priority: P2)

**Goal**: Every planner instance on the page shows the same one-row filter layout regardless of how many planners are open or what add/remove operations have been performed.

**Independent Test**: Open `http://localhost:8000/camping/florida-bound-planner.html`, add at least three planners, and confirm each planner displays `Filter by` and `Max value` on one row in the same order.

### Validation for User Story 2

- [X] T007 [US2] Add at least three planners on `http://localhost:8000/camping/florida-bound-planner.html`; confirm every planner instance shows `Filter by` and `Max value` on one horizontal row in the same order
- [X] T008 [US2] Remove one planner from the multi-planner view; confirm the remaining planners retain the one-row filter layout without any disruption
- [X] T009 [P] [US2] Refresh the page; confirm the planner re-renders with the one-row filter layout after reload (no state dependency on prior render)
- [X] T010 [P] [US2] Resize the browser to 375px viewport width; confirm `Filter by` and `Max value` remain visually grouped as one row (horizontal scroll at this width is acceptable — `flex-wrap: nowrap` intentionally preserves grouping over visibility) and that the `Direction` controls remain outside that row

**Checkpoint**: US2 complete — all planner instances consistently show the one-line filter row.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final contract compliance and regression checks across both stories.

- [X] T011 [P] Verify no existing control IDs were modified — confirm `filter-type-{id}` and `filter-value-{id}` are unchanged in `camping/florida-bound-grid.js`, satisfying the DOM constraints in `specs/001-one-line-filter-fields/contracts/planner-filter-row.md`
- [X] T012 [P] Open the browser console on `http://localhost:8000/camping/florida-bound-planner.html` and confirm: zero JavaScript errors; no broken asset references; the Network tab shows no new requests beyond the existing `florida-bound-locations.json` fetch; the planner page remains reachable via existing navigation links from `camping/florida-bound.html`
- [X] T013 Inspect the rendered DOM in browser DevTools to confirm both the standalone `<label>Direction:</label>` element and the `<div id="filter-direction-{id}">` div remain outside the `.filter-row` wrapper per the UI contract in `specs/001-one-line-filter-fields/contracts/planner-filter-row.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001 and T002 run in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS US1 implementation
- **User Story 1 (Phase 3)**: Depends on Phase 2 (CSS class must exist); T005–T006 depend on T004
- **User Story 2 (Phase 4)**: Depends on Phase 3 checkpoint — T009 and T010 run in parallel
- **Polish (Phase 5)**: Depends on all user story phases complete; T011 and T012 run in parallel

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 only — no dependency on US2
- **US2 (P2)**: Requires US1 complete — US2 is verified by the same markup change but tests multi-instance behavior

### Within Each User Story

- Implementation (T004) before validation (T005–T006) for US1
- Validation tasks T009 and T010 within US2 can run in parallel

### Parallel Opportunities

- T001 + T002 (Setup): run in parallel — different files
- T009 + T010 (US2 validation): run in parallel — different check types
- T011 + T012 (Polish): run in parallel — different concerns

---

## Parallel Example: User Story 1 Validation

```bash
# After T004 lands, run these together:
Task: "Validate single-planner one-row layout at http://localhost:8000/camping/florida-bound-planner.html"  (T005)
Task: "Validate interaction — change filter values, confirm row stays intact"  (T006)
```

## Parallel Example: User Story 2 Validation

```bash
# After T008 lands, run these together:
Task: "Refresh page — confirm one-row layout after reload"  (T009)
Task: "Narrow-width check — confirm Filter by + Max value stay grouped"  (T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003) — CRITICAL gate
3. Complete Phase 3: User Story 1 (T004–T006)
4. **STOP and VALIDATE**: single planner passes acceptance scenarios
5. Proceed to US2 validation or deploy MVP

### Incremental Delivery

1. Setup + Foundational → CSS class ready
2. US1 implementation + validation → MVP: one planner works ✅
3. US2 validation → confirmed: all planners work consistently ✅
4. Polish → contract compliance and regression clean ✅

### Key Decisions Reflected in Tasks

- **Flex wrapper approach** (research Decision 1): T003 adds `.filter-row` CSS; T004 adds wrapper in JS
- **Static-site, dependency-free** (research Decision 2): no build step tasks, no library installs
- **No-wrap narrow behavior** (research Decision 3): T010 validates grouping is preserved at narrow widths
- **UI contract only** (research Decision 4): T011 enforces unchanged control IDs per the contract
- **Manual validation** (research Decision 5): validation tasks use local static server per quickstart.md

---

## Notes

- [P] tasks = different files or independent checks, no blocking dependencies
- [Story] label maps each task to its user story for traceability
- Commit after T004 and after each validation phase checkpoint
- No automated test harness required — manual review per quickstart.md is the validated method
- Formatting rule: no trailing whitespace on any line in this file or in changed source files
