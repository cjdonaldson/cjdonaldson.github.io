---
description: "Task list for Florida Bound Planner Date & Stay Driven Schedule"
---

# Tasks: Florida Bound Planner Date & Stay Driven Schedule

**Input**: Design documents from `/specs/001-planner-date-stay/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅
**Source files changed**: `camping/florida-bound-grid.js` (logic) · `camping/florida-bound-planner.css` (styling)
**HTML shell**: `camping/florida-bound-planner.html` — **untouched**
**Tests**: Manual browser verification per `quickstart.md` — no automated test runner

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story increment.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (operates on a different file from concurrent tasks; no unmet dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup

**Purpose**: Confirm the working baseline — verify the current planner renders without errors
before any changes are made.

- [ ] T001 Open `camping/florida-bound-planner.html` in a browser, click **+ Add Planner**, add two stops, and confirm the existing route display renders correctly with no console errors — this is the regression baseline for the feature

**Checkpoint**: Baseline confirmed — implementation may begin

---

## Phase 2: Foundational — Planner State & Date Helpers

**Purpose**: Extend the in-memory planner object and add helper functions that all three user
stories depend on. **No user story work can begin until this phase is complete.**

**⚠️ CRITICAL**: These tasks establish `planner.departureDate` and `planner.stays[]` — the
shared state that drives every downstream computation. All later tasks assume this shape exists.

- [ ] T002 In `createPlanner()` in `camping/florida-bound-grid.js`, add `departureDate: ""` and `stays: [0]` to the returned planner object literal alongside the existing `id` and `route` fields (keeps `route` and `stays` the same length from the moment of creation)

- [ ] T003 In `addWaypoint()` in `camping/florida-bound-grid.js`, add `planner.stays.push(0)` immediately after `planner.route.push(location)` so `route` and `stays` grow in lockstep

- [ ] T004 In `removeWaypoint()` in `camping/florida-bound-grid.js`, add `planner.stays.splice(index, 1)` immediately after `planner.route.splice(index, 1)` so `route` and `stays` shrink in lockstep; the existing guard that restores `[startLocation]` when `route` empties must also reset `stays` to `[0]`

- [ ] T005 In `resetRoute()` in `camping/florida-bound-grid.js`, add `planner.stays = [0]` and `planner.departureDate = ""` alongside the existing `planner.route = [startLocation]` assignment so all three fields return to their initial state together

- [ ] T006 Add a `todayIso()` helper function in `camping/florida-bound-grid.js` (place it above `updateRouteDisplay`) that returns today's date as an ISO-8601 string `"YYYY-MM-DD"` using `new Date()`, `getFullYear()`, `getMonth() + 1`, and `getDate()` with zero-padded month and day — no external libraries

- [ ] T007 Add an `addDays(isoString, days)` helper function in `camping/florida-bound-grid.js` (place it immediately after `todayIso`) that creates `new Date(isoString + "T00:00:00")`, calls `date.setDate(date.getDate() + days)`, and returns the result formatted as an ISO-8601 `"YYYY-MM-DD"` string using the same zero-pad approach as `todayIso`; it must handle `days = 0` (returns the same date) and multi-day values correctly

- [ ] T008 Add a `computeDerivedDates(planner)` function in `camping/florida-bound-grid.js` (place it immediately after `addDays`) that: (a) returns an empty array `[]` if `planner.departureDate` is falsy or empty; (b) sets `dates[0] = planner.departureDate`; (c) iterates `i = 1` to `planner.route.length - 1`, setting `dates[i] = addDays(dates[i-1], planner.stays[i-1])`; (d) returns the `dates` array — `dates[1]` will always equal `planner.departureDate` since `stays[0]` is never applied

**Checkpoint**: Planner state is extended; helpers are in place — User Story 1 can begin

---

## Phase 3: User Story 1 — Departure-Date Anchor on Top Item (Priority: P1) 🎯 MVP

**Goal**: The top route item shows a single editable departure-date picker below the location
name. No stay field is shown for the top item. The picker's `min` attribute prevents selecting
a date earlier than today.

**Independent Test** (Quickstart Scenarios 1 & 7): Open `camping/florida-bound-planner.html`,
click **+ Add Planner**, confirm the single route item shows a date input and no stay field,
and confirm the picker blocks past dates.

### Implementation for User Story 1

- [ ] T009 [US1] In `updateRouteDisplay()` in `camping/florida-bound-grid.js`, inside the `planner.route.forEach` loop at the point where `div.innerHTML` is assembled for each waypoint item, add a conditional block: when `index === 0`, append an `<input type="date" class="departure-date-input" value="..." min="...">` element below the `<span>` holding the location name, with `value` bound to `planner.departureDate` (empty string when not yet set) and `min` set to `todayIso()` — do **not** add a stay field for `index === 0`

- [ ] T010 [US1] Immediately after appending the top-item `div` to `display` in `updateRouteDisplay()` in `camping/florida-bound-grid.js`, query-select the `.departure-date-input` inside that specific `div` and attach a `change` event listener that: (a) reads `e.target.value`; (b) assigns it to `planner.departureDate`; (c) calls `updateRouteDisplay(plannerId)` — this triggers a full re-render so downstream derived dates update immediately

- [ ] T011 [P] [US1] In `camping/florida-bound-planner.css`, add styles for `.departure-date-input`: display as block, margin-top of ~4px, font-size matching the existing waypoint-item text, width auto or fit-content, no extra border beyond the native date-input appearance — keep styling minimal and consistent with existing `.waypoint-item` styles

- [ ] T012 [US1] Manually verify Quickstart Scenario 1 (top item shows date input, no stay field) and Scenario 7 (past dates blocked by `min` attribute) against `camping/florida-bound-planner.html`; confirm no console errors and no visual regression to existing distance/direction/stop controls

**Checkpoint**: US1 complete — departure-date anchor is independently functional and testable

---

## Phase 4: User Story 2 — Downstream Derived Dates & Editable Stays (Priority: P2)

**Goal**: Every downstream route item (index > 0) shows a read-only derived date and an
editable non-negative whole-day stay field. No direct date picker appears for downstream items.

**Independent Test** (Quickstart Scenario 2): Set the departure date, add one downstream stop,
confirm it shows a read-only date equal to the departure date and an editable stay field (default 0),
confirm there is no date input on the downstream stop.

### Implementation for User Story 2

- [ ] T013 [US2] At the top of the `planner.route.forEach` loop body in `updateRouteDisplay()` in `camping/florida-bound-grid.js` (before building `div.innerHTML`), call `const derivedDates = computeDerivedDates(planner)` once before the loop starts (hoist it above the `forEach`), so each iteration can read `derivedDates[index]` without recomputing

- [ ] T014 [US2] In `updateRouteDisplay()` in `camping/florida-bound-grid.js`, inside the same `div.innerHTML` conditional block: when `index > 0`, append a `<span class="derived-date-label">` containing `derivedDates[index]` (or an em-dash `—` placeholder when `derivedDates` is empty / departure date not yet set) below the location-name `<span>` — no `<input type="date">` for downstream items

- [ ] T015 [US2] In `updateRouteDisplay()` in `camping/florida-bound-grid.js`, still within the `index > 0` branch, append an `<input type="number" class="stay-input" min="0" step="1" value="...">` stay field below the derived-date span, with `value` bound to `planner.stays[index]` (default `0`)

- [ ] T016 [US2] Immediately after appending each downstream `div` to `display` in `updateRouteDisplay()` in `camping/florida-bound-grid.js`, query-select the `.stay-input` inside that specific `div` and attach an `input` event listener that: (a) parses `parseInt(e.target.value, 10) || 0`; (b) clamps the result to `Math.max(0, parsedValue)`; (c) assigns it to `planner.stays[index]`; (d) calls `updateRouteDisplay(plannerId)` — full re-render recomputes all later derived dates

- [ ] T017 [P] [US2] In `camping/florida-bound-planner.css`, add styles for `.derived-date-label` (display block, muted/secondary color or italic to visually distinguish it as read-only, margin-top ~2px, font-size matching waypoint text) and `.stay-input` (display inline-block, width ~60px, margin-top ~4px, font-size matching waypoint text) — keep styling consistent with existing `.waypoint-item` layout

- [ ] T018 [US2] Manually verify Quickstart Scenario 2 (first downstream stop shows derived date = departure date, editable stay = 0, no date picker) against `camping/florida-bound-planner.html`; confirm no console errors and no visual regression

**Checkpoint**: US2 complete — downstream derived dates and stay inputs are independently functional

---

## Phase 5: User Story 3 — Cascade Recomputation on Change (Priority: P3)

**Goal**: Changing the departure date recomputes all downstream derived dates; changing a
downstream stay recomputes only later derived dates; removing a stop or resetting the route
recomputes remaining derived dates correctly.

**Independent Test** (Quickstart Scenarios 3–6): Build a three-stop route with stays 2, 3, 1;
change departure date and each stay individually; remove a middle stop; reset the route — confirm
all derived dates are recomputed correctly at each step, the edited stop's own date is unchanged,
and reset returns to single-item state.

**Note**: The recomputation logic is already implemented by T008 (`computeDerivedDates`) and
wired by T010 (departure date event) and T016 (stay input event). This phase is **integration
verification only** — no new code is required unless a scenario fails, in which case the failing
task identifies the fix location.

### Verification for User Story 3

- [ ] T019 [US3] Manually verify Quickstart Scenario 3 (stay cascade): build a three-stop route, set stays to 2, 3, 1, then change the middle stay to 5 — confirm the middle stop's derived date is unchanged and the third stop's derived date advances by 2 days (the difference between old stay 3 and new stay 5); confirm the top item and first downstream stop are unaffected

- [ ] T020 [US3] Manually verify Quickstart Scenario 4 (departure date recomputes all): with multiple stops showing derived dates, change the top departure date — confirm every downstream derived date shifts by the same number of days as the departure date change while all stay values remain unchanged

- [ ] T021 [US3] Manually verify Quickstart Scenario 5 (remove middle stop recomputes remaining): build a route with top + three downstream stops with stays 2, 3, 1; remove the second downstream stop (stay 3) — confirm the remaining derived dates recompute from departure + retained stays [2, 1] with no stale dates and no console errors

- [ ] T022 [US3] Manually verify Quickstart Scenario 6 (reset returns to single-item state): with multiple stops shown, click **Reset Route** — confirm only the top item is shown, the departure-date field is cleared (empty value), no stay fields are visible, and `planner.stays` is `[0]` (verifiable via browser console: `planners[0].stays`)

**Checkpoint**: All three user stories are complete and independently verified — proceed to polish

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality sweep across both changed files; no new functionality.

- [ ] T023 [P] Review `camping/florida-bound-planner.css` for responsive layout — confirm the departure-date input and stay input are usable on narrow mobile viewports (≤ 375px width) without overflowing the `.waypoint-item` container; adjust `width` or `max-width` on `.departure-date-input` and `.stay-input` if needed

- [ ] T024 [P] Open `camping/florida-bound-planner.html` and exercise all 7 Quickstart scenarios in sequence; confirm zero console errors throughout and no visual regressions to existing controls (distance/direction labels, filter dropdowns, Add Stop button, Google Maps link)

- [ ] T025 Remove the pre-existing debug `console.log('generateInfoTooltip DEBUG:', ...)` statement from `generateInfoTooltip()` in `camping/florida-bound-grid.js` (line ~390 in the original file) — it is unrelated to this feature but produces noise in the console during manual verification

- [ ] T026 Do a final read of `camping/florida-bound-grid.js` confirming: (a) `route` and `stays` are always the same length after every mutation (add/remove/reset); (b) `computeDerivedDates` is called once per render, not inside the loop; (c) event listeners are attached after `display.appendChild(div)`, not before; (d) no `var`/`function` hoisting issues were introduced (match existing ES5-compatible style throughout)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; can start after Phase 2 (independently of US1 except that US1 sets `planner.departureDate` which US2 reads — implement US1 first)
- **User Story 3 (Phase 5)**: Depends on US1 (Phase 3) and US2 (Phase 4) both complete — integration verification requires both stories working
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Notes |
|-------|-----------|-------|
| US1 (P1) | Phase 2 | Independent; no dependency on US2 or US3 |
| US2 (P2) | Phase 2 + US1 rendering order | Reads `planner.departureDate` set by US1; implement US1 first |
| US3 (P3) | US1 + US2 | Verification only; no new code unless a scenario fails |

### Within Each User Story

1. State mutation / helper code before UI rendering
2. Rendering changes before event-listener wiring
3. JS changes before CSS changes (CSS marked [P] can be done concurrently)
4. Implementation before manual verification

### Parallel Opportunities

- **T011 [P]** (departure-date CSS) can run concurrently with any T009–T010 JS work
- **T017 [P]** (derived-date + stay CSS) can run concurrently with any T013–T016 JS work
- **T023 [P]** and **T024 [P]** in Phase 6 can run concurrently

---

## Parallel Example: User Story 1

```bash
# These can proceed in parallel (different files):
Task T009+T010: "Add departure-date input and change event in camping/florida-bound-grid.js"
Task T011:      "Add .departure-date-input CSS in camping/florida-bound-planner.css"

# Then sequentially:
Task T012: "Manual verification — Quickstart Scenarios 1 and 7"
```

## Parallel Example: User Story 2

```bash
# These can proceed in parallel (different files):
Task T013-T016: "Add derived-date span, stay input, and event wiring in camping/florida-bound-grid.js"
Task T017:      "Add .derived-date-label and .stay-input CSS in camping/florida-bound-planner.css"

# Then sequentially:
Task T018: "Manual verification — Quickstart Scenario 2"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup baseline
2. Complete Phase 2: Foundational state + helpers (**required — blocks everything**)
3. Complete Phase 3: User Story 1 (departure date anchor)
4. **STOP and VALIDATE**: Quickstart Scenarios 1 & 7 pass
5. The planner now has a departure-date anchor — shippable as a partial improvement

### Incremental Delivery

1. **Setup + Foundational** → state shape correct, helpers ready
2. **+ US1** → departure date anchor works → validate → shippable
3. **+ US2** → downstream derived dates + stay inputs → validate → shippable
4. **+ US3** → cascade recomputation verified → full feature complete
5. **Polish** → CSS responsive pass, console clean

### Single-Developer Sequence (Recommended for /speckit.implement)

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008
     → T009 → T010 → T011 → T012
     → T013 → T014 → T015 → T016 → T017 → T018
     → T019 → T020 → T021 → T022
     → T023 → T024 → T025 → T026
```

---

## Notes

- All 26 tasks modify exactly two files: `camping/florida-bound-grid.js` and `camping/florida-bound-planner.css`
- `camping/florida-bound-planner.html` is **never touched**
- Existing behavior (distance labels, direction filter, Google Maps link, multi-planner support) must pass regression at T024
- ES5-compatible JavaScript style is required throughout (match `var`/`function` conventions already in the file)
- `stays[0]` is intentionally unused (top item has no stay field) — this is by design per data-model.md
- A `stays` value of `0` is valid; adjacent stops may share the same derived date (FR-011)
- `min` on the departure picker is reset on every `updateRouteDisplay` call to handle pages open past midnight (Research Decision 3)
