# Tasks: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence`
**Input**: Design documents from `specs/001-route-plan-sequence/`
**Prerequisites used**: plan.md, spec.md, data-model.md, contracts/data-and-dom.md, research.md, quickstart.md

**Tests**: No automated test framework. All validation is manual browser review over HTTP
(`python3 -m http.server 8080` from repo root, open `http://localhost:8080/camping/florida-bound-planner.html`)
per the quickstart.md checklist. No automated tests are generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story. Four source files are changed; no new files or dependencies.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with sibling tasks (different files, no incomplete dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4 map to spec.md stories)
- Exact file paths are included in every description

---

## Phase 1: Setup (Codebase Inventory)

**Purpose**: Understand the current structure of the four files that will be modified before
any changes are made.

- [ ] T001 Review `renderPlanner()` and `updateRouteDisplay()` in `camping/florida-bound-grid.js`, and `loadLocationData()` in `camping/florida-bound-data-loader.js` to confirm existing element ID patterns (e.g. `route-display-{id}`), event-wiring conventions, and the shape of each stop object in `planner.route`

**Checkpoint**: Ready to begin foundational changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared prerequisites that MUST be complete before any user-story work begins.
All three tasks touch different files and can run in parallel.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add `id: location.id` to the location object literal inside `loadLocationData()` in `camping/florida-bound-data-loader.js` so every flattened `LocationObject` in `locationData[]` exposes the stable 8-char hex ID (FR-001; data-model.md § 1 Location)
- [ ] T003 [P] Inject the full sequence area HTML block into `renderPlanner()` in `camping/florida-bound-grid.js` — wrapper `div#sequence-area-{id}` (initially `style="display:none"`), title row with `<label>` + `<input type="text" list="route-titles-{id}">` + `<datalist id="route-titles-{id}">`, sequence row with `<label>` + `<textarea id="sequence-text-{id}" rows="2" spellcheck="false">` + `<button id="sequence-copy-btn-{id}" type="button">📋 Copy</button>`, and a hidden `<div id="sequence-copy-warning-{id}">` — per contracts/data-and-dom.md § 6
- [ ] T004 [P] Add base CSS layout rules for `.sequence-area`, `.sequence-row`, and `.sequence-title-row` (flexbox row, label + control alignment, `display:none` default for wrapper) to `camping/florida-bound-planner.css`

**Checkpoint**: Foundation ready — all user story phases can now begin

---

## Phase 3: User Story 1 — Live Route Sequence Display (Priority: P1) 🎯 MVP

**Goal**: After adding a second stop, a colon-separated sequence string of location IDs
appears below the "View Route in Google Maps" link and auto-updates on every add/remove.
The entire sequence area is hidden when the route has fewer than two stops.

**Independent Test**: Serve the repo over HTTP (`python3 -m http.server 8080`), open
`http://localhost:8080/camping/florida-bound-planner.html`, add two stops, confirm a
`:`-joined string of two IDs appears below the map link, add a third stop and confirm the
string extends, remove a stop and confirm it shortens, and with only one stop confirm the
entire sequence area is hidden.

### Implementation for User Story 1

- [ ] T005 [US1] Add `updateSequenceArea(planner)` function to `camping/florida-bound-grid.js`: compute `planner.route.map(loc => loc.id).join(':')`, write the result into `#sequence-text-{id}` textarea value, and toggle `#sequence-area-{id}` between `display:none` and `display:block` based on `planner.route.length >= 2` (research.md RQ-7, FR-002, FR-003, FR-004)
- [ ] T006 [US1] Call `updateSequenceArea(planner)` from within `updateRouteDisplay(plannerId)` in `camping/florida-bound-grid.js` so the sequence area refreshes on every route change with no user action required (FR-004)
- [ ] T007 [P] [US1] Add CSS for `.sequence-textarea` (readable height, monospace or clear font, `resize: vertical`, `word-break: break-all`) in `camping/florida-bound-planner.css`
- [ ] T008 [US1] Manual validation per quickstart.md steps 1–4: confirm sequence area is hidden with one stop, appears with two stops showing two IDs joined by `:`, extends when a third stop is added, and shortens when a stop is removed

**Checkpoint**: User Story 1 fully functional and independently testable — MVP deliverable

---

## Phase 4: User Story 2 — Copy Sequence to Clipboard (Priority: P2)

**Goal**: A single click on the copy button places the current sequence string on the system
clipboard. The button shows brief visual feedback on success. If the browser denies clipboard
access, existing clipboard contents are left unchanged and a warning message is displayed.

**Independent Test**: Build a 2-stop route, click the **Copy** button, paste into a text
editor, confirm pasted value exactly matches the displayed sequence string, confirm the
button label changes briefly (~1.5 s) then resets to original.

### Implementation for User Story 2

- [ ] T009 [US2] Implement async `copySequence(plannerId)` in `camping/florida-bound-grid.js` using `navigator.clipboard.writeText(text)` — on success, change the button label/icon for ~1.5 s then restore original; in `.catch()`, call `showClipboardWarning(plannerId)` to make `#sequence-copy-warning-{id}` visible — do NOT write to clipboard on failure (research.md RQ-4, FR-005, FR-006)
- [ ] T010 [US2] Wire `click` event on `#sequence-copy-btn-{id}` to call `copySequence(plannerId)` inside the `renderPlanner()` event-wiring section in `camping/florida-bound-grid.js`
- [ ] T011 [P] [US2] Add CSS for `.sequence-copy-btn` (aligned to right of textarea, clear button style) and `.sequence-copy-warning` (error/warning color, hidden by default) in `camping/florida-bound-planner.css`
- [ ] T012 [US2] Manual validation per quickstart.md steps 5–6: click copy on a 2-stop route, paste into a text editor and confirm exact match; confirm button shows brief feedback for ~1.5 s then resets to original label

**Checkpoint**: User Stories 1 AND 2 both independently functional

---

## Phase 5: User Story 3 — Restore Route from Pasted Sequence (Priority: P3)

**Goal**: When a valid sequence string is pasted into the textarea, the planner
reconstructs the route in order. Unrecognized IDs render as inline error rows in the
route display at the correct ordinal position. Clearing the textarea causes no route change.

**Independent Test**: Paste a known 3-stop sequence (e.g., `5c4ce2cb:0450fbdd:5fd7359d`)
into the textarea and confirm all three stops appear in route order. Paste a sequence with
one unknown ID (e.g., `5c4ce2cb:BADID:5fd7359d`) and confirm valid stops load plus an
error row at the unknown ID's position. Clear the textarea and confirm no route change.

### Implementation for User Story 3

- [ ] T013 [US3] Implement `sanitiseSequence(raw)` in `camping/florida-bound-grid.js`: `raw.trim()`, strip chars outside `[a-zA-Z0-9:\-]`, normalise `-` to `:`, collapse consecutive colons, strip leading/trailing colons — returns empty string for blank input (research.md RQ-6, FR-008)
- [ ] T014 [US3] Implement `restoreRouteFromSequence(plannerId, sequenceStr)` in `camping/florida-bound-grid.js`: call `sanitiseSequence`, split on `:`, return early if empty, for each token lookup `getLocationData()` by `.id` — push matching `LocationObject` or `{ errorId: token }` sentinel — assign to `planner.route`, reset `planner.stays` to equal-length zeros array, call `updateRouteDisplay(plannerId)` (data-model.md § State Transitions — Route reconstruction from paste, FR-008, FR-009)
- [ ] T015 [US3] Add error-row rendering inside `updateRouteDisplay()` in `camping/florida-bound-grid.js`: when a route stop is a `{ errorId }` sentinel, render `<div class="waypoint-item waypoint-error">` containing the unknown ID text and a `⚠ Unknown ID` label at the correct ordinal index (research.md RQ-5, FR-009)
- [ ] T016 [US3] Wire `input` and `change` events on `#sequence-text-{id}` textarea in the `renderPlanner()` event-wiring section in `camping/florida-bound-grid.js` to call `restoreRouteFromSequence(plannerId, textarea.value)` (FR-007)
- [ ] T017 [P] [US3] Add CSS for `.waypoint-error`, `.waypoint-error-id` (monospace, error color), and `.waypoint-error-label` (warning icon label style) in `camping/florida-bound-planner.css`
- [ ] T018 [US3] Manual validation per quickstart.md steps 7–9: paste valid 3-stop sequence and confirm route loads in order; paste sequence with one bad ID and confirm valid stops load with an error row at the bad ID's position; clear textarea and confirm no route change and no error

**Checkpoint**: User Stories 1, 2, AND 3 all independently functional

---

## Phase 6: User Story 4 — Named Route Plans Dropdown (Priority: P4)

**Goal**: Named route plans from the `routes` array in `florida-bound-locations.json` appear
in the title field dropdown on page load. Selecting a plan populates the sequence textarea
and reconstructs the route. The title field accepts free-text of any length while displaying
30–40 characters at a time.

**Independent Test**: Add one entry to the `routes` array in
`camping/florida-bound-locations.json`, reload the page, confirm the plan name appears in
the title dropdown, select it, verify the route reconstructs with the correct stops.

### Implementation for User Story 4

- [ ] T019 [US4] Add `let routeData = []` module-scoped variable to `camping/florida-bound-data-loader.js` and assign `routeData = (data.routes || [])` inside `loadLocationData()` after the JSON fetch resolves (data-model.md § 2 NamedRoutePlan, contracts/data-and-dom.md § 2.1)
- [ ] T020 [US4] Add `function getRouteData() { return routeData; }` export in `camping/florida-bound-data-loader.js` (contracts/data-and-dom.md § 2.3, FR-013)
- [ ] T021 [P] [US4] Add top-level `"routes"` array with at least one real example entry (`{ "title": "...", "sequence": "..." }` using valid location IDs from the existing data) before the `"states"` key in `camping/florida-bound-locations.json` (contracts/data-and-dom.md § 1.2 `routes` array schema)
- [ ] T022 [US4] After data load in `camping/florida-bound-grid.js`, populate `<datalist id="route-titles-{id}">` with one `<option value="planTitle">` per entry from `getRouteData()`; leave the datalist empty without error when `getRouteData()` returns `[]` (FR-013)
- [ ] T023 [US4] Wire `input` event on `#route-title-input-{id}` inside the `renderPlanner()` event-wiring section in `camping/florida-bound-grid.js`: compare `input.value` against each `getRouteData()[n].title`; on exact match, set `#sequence-text-{id}` value to the plan's `sequence` and call `restoreRouteFromSequence(plannerId, plan.sequence)` (data-model.md § State Transitions — Named plan selection, FR-014)
- [ ] T024 [P] [US4] Add CSS for `.route-title-input` with `width: 36ch` so 30–40 characters are visible at a time; do NOT set `maxlength` or `overflow: hidden` — the field must scroll through titles of any length as the cursor moves (FR-010, FR-011, research.md RQ-3)
- [ ] T025 [US4] Manual validation per quickstart.md steps 10–11: add entry to `routes` array, reload page, confirm plan name appears in title dropdown, select it, confirm sequence field populates and route loads with correct stops

**Checkpoint**: All four user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify behavior that spans multiple user stories and confirm no regressions.

- [ ] T026 [P] Resize the browser to a narrow mobile-width viewport and confirm the sequence area (textarea, copy button, title field) remains readable and does not overflow the viewport horizontally; adjust flexbox/wrapping rules in `camping/florida-bound-planner.css` if needed (SC-007)
- [ ] T027 Verify per-planner independence (FR-015) in `camping/florida-bound-grid.js`: if the page contains multiple planner instances confirm each has its own independent `sequence-area-{id}`, `sequence-text-{id}`, `sequence-copy-btn-{id}`, `route-title-input-{id}`, and `route-titles-{id}` with no cross-planner state bleed
- [ ] T028 [P] Review `camping/florida-bound-planner.css` for duplicate or conflicting rules introduced across Phases 3–6; consolidate without changing behavior
- [ ] T029 Run the complete quickstart.md manual test checklist (all 12 steps) as a final end-to-end validation pass across all four user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion
  - US1 (P1): no dependency on other user stories
  - US2 (P2): no dependency on US1 (copy reads the textarea value; independent)
  - US3 (P3): no dependency on US2 (paste/restore is independent)
  - US4 (P4): depends on US3 — title input handler calls `restoreRouteFromSequence()` from US3; implement US4 after US3 is complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — no story dependencies
- **US2 (P2)**: Start after Phase 2 — no story dependencies
- **US3 (P3)**: Start after Phase 2 — no story dependencies
- **US4 (P4)**: Start after US3 is complete — calls `restoreRouteFromSequence()` defined in US3

### Within Each User Story

- JS implementation tasks before their manual validation task
- CSS tasks `[P]` can run in parallel with JS tasks in the same story (different files)
- Event wiring after the handler function it calls is implemented

### Parallel Opportunities

- T002, T003, T004 (Phase 2) — all different files, fully parallel
- T007 `[P]` with T005+T006 (US1) — CSS and JS are different files
- T011 `[P]` with T009+T010 (US2) — CSS and JS are different files
- T017 `[P]` with T013–T016 (US3) — CSS and JS are different files
- T021 `[P]` and T024 `[P]` with T019–T020+T022–T023 (US4) — JSON and CSS are different files
- T026 `[P]` and T028 `[P]` in Phase 7 — read/review tasks on different concerns

---

## Parallel Example: User Story 3

```
# Launch in parallel once Phase 2 is complete:
Task A (JS):  "Implement sanitiseSequence() and restoreRouteFromSequence() in camping/florida-bound-grid.js" (T013, T014)
Task B (CSS): "Add waypoint-error styles in camping/florida-bound-planner.css" (T017)

# Sequential after Task A completes:
Task C: "Add error-row rendering inside updateRouteDisplay() in camping/florida-bound-grid.js" (T015)
Task D: "Wire input/change events on sequence textarea in camping/florida-bound-grid.js" (T016)
Task E: "Manual validation steps 7–9" (T018)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T004) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: Manual test steps 1–4 from quickstart.md
5. Deploy/demo — live sequence display is independently valuable

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Live display works → validate → deploy (MVP)
3. Phase 4 (US2) → Copy works → validate → deploy
4. Phase 5 (US3) → Paste/restore works → validate → deploy
5. Phase 6 (US4) → Named plans dropdown works → validate → deploy
6. Phase 7 → Polish and final validation

### Suggested Sequence for a Single Developer

```
T001 →
T002 + T003 + T004 (parallel) →
T005 → T006 → T007 + T008 (T007 parallel with T005–T006) →
T009 → T010 → T011 + T012 (T011 parallel with T009–T010) →
T013 → T014 → T015 → T016 → T017 + T018 (T017 parallel with T013–T016) →
T019 → T020 → T021 + T022 → T023 → T024 + T025 (T021 and T024 parallel with JS tasks) →
T026 + T027 + T028 (T026 and T028 parallel) → T029
```

---

## Summary

| Phase | Stories | Tasks | Parallel-eligible |
|-------|---------|-------|-------------------|
| 1 Setup | — | 1 | — |
| 2 Foundational | — | 3 | All 3 (T002–T004) |
| 3 US1 Live Display (P1) | US1 | 4 | T007 ∥ T005–T006 |
| 4 US2 Copy (P2) | US2 | 4 | T011 ∥ T009–T010 |
| 5 US3 Restore (P3) | US3 | 6 | T017 ∥ T013–T016 |
| 6 US4 Named Plans (P4) | US4 | 7 | T021, T024 ∥ JS tasks |
| 7 Polish | — | 4 | T026, T028 ∥ T027 |
| **Total** | **4** | **29** | **9 parallel-eligible** |

**MVP scope**: Complete Phases 1–3 (T001–T008, 8 tasks) to deliver User Story 1 independently.
