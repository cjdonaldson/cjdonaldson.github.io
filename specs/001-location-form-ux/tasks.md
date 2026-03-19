---

description: "Task list for Location Form UX Improvements"
---

# Tasks: Location Form UX Improvements

**Feature Branch**: `001-location-form-ux`
**Input**: Design documents from `/specs/001-location-form-ux/`
**Single file modified**: `camping/location-form.html` (412 lines → ~430–450 lines)
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, research.md ✅, quickstart.md ✅

**Tests**: No automated tests requested. Manual browser review and JSON output panel inspection are the validation approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All tasks modify `camping/location-form.html` only.

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines instead of space-based Markdown line breaks. -->

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different blocks of the same file — e.g., `<style>` vs `<body>` vs `<script>` — enabling two implementors to work simultaneously)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file path included in every description

## Path Conventions

- **Only file modified**: `camping/location-form.html`
- All tasks are edits within a single HTML file — CSS lives in `<style>`, markup in `<body>`, logic in `<script>`

---

## Phase 1: Setup

**Purpose**: Understand the current file structure before making any changes.

- [X] T001 Read camping/location-form.html in full (412 lines) — note the existing `.coords-group` CSS pattern (lines 88–92), the 4 current section headers ("Basic Information", "Location Details", "Contact Information", "Booking & Resources"), all field IDs and their `required` attributes, the `optionalFields` array in the submit handler (line 350), and the `resetForm()` function (line 406)

**Checkpoint**: Current file structure understood — implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the shared `.form-row` CSS class and responsive rule that all US1 form-row wrappers depend on.

**⚠️ CRITICAL**: T003–T005 (US1) cannot begin until T002 is complete.

- [X] T002 Add three CSS rules to the `<style>` block in camping/location-form.html immediately after the existing `.coords-group` rule (line 92): (1) `.form-row { display: grid; gap: 15px; margin-bottom: 20px; }` — base multi-column row class; (2) `.form-row > .form-group { margin-bottom: 0; }` — suppress inner margin-bottom to avoid double-spacing inside grid cells; (3) `@media (max-width: 399px) { .form-row { grid-template-columns: 1fr !important; } }` — responsive single-column collapse

**Checkpoint**: Foundation ready — `.form-row` CSS class is available; US1 form-row wrappers can now be added

---

## Phase 3: User Story 1 - Compact Form Layout (Priority: P1) 🎯 MVP

**Goal**: Group short related fields side-by-side using CSS Grid — name/emoji on one row, city/state/zip on one row, phone/email on one row — reducing overall form height and vertical scroll.

**Independent Test**: Open `camping/location-form.html` in a browser at a typical desktop width. Verify that name/emoji appear side-by-side (3:1 ratio), city/state/zip appear on one row (2:1:1 ratio), and phone/email appear side-by-side (1:1 ratio). Resize below 400px and confirm all rows collapse to single-column with no horizontal overflow.

### Implementation for User Story 1

- [X] T003 [P] [US1] Wrap the Name `form-group` div and the Emoji `form-group` div together in `<div class="form-row" style="grid-template-columns: 3fr 1fr">` in camping/location-form.html — the two existing `form-group` divs become the grid cells; no other HTML structure changes inside them
- [X] T004 [P] [US1] Wrap the City `form-group` div, the State `form-group` div, and the ZIP `form-group` div together in `<div class="form-row" style="grid-template-columns: 2fr 1fr 1fr">` in camping/location-form.html — the three existing `form-group` divs become the grid cells
- [X] T005 [P] [US1] Wrap the Phone `form-group` div and the Email `form-group` div together in `<div class="form-row" style="grid-template-columns: 1fr 1fr">` in camping/location-form.html — the two existing `form-group` divs become the grid cells

**Checkpoint**: US1 is independently testable — open form at desktop width and confirm three side-by-side field rows; resize below 400px and confirm single-column collapse

---

## Phase 4: User Story 2 - Clean Field Labels (Priority: P2)

**Goal**: Remove all `(optional)` label noise. Update `required` HTML attributes and `*` label markers to reflect the corrected required/optional field status (address, url, mapUrl now required; emoji now optional).

**Independent Test**: Open the form and read every field label. Verify zero occurrences of the text "(optional)" anywhere on the page. Verify that Name, Street Address, Website URL, Google Maps URL, City, State, ZIP, Latitude, Longitude each display `*`; verify Emoji label has no `*`.

### Implementation for User Story 2

- [X] T006 [P] [US2] Remove the `.optional { color: #999; font-weight: normal; font-size: 12px; }` CSS rule from the `<style>` block in camping/location-form.html (lines 54–58 in current file)
- [X] T007 [P] [US2] Remove all `<span class="optional">(optional)</span>` elements from every field label in camping/location-form.html — affects 16 occurrences: `url`, `siteMap`, `mapUrl`, `bookingUrl`, `booking`, `phone`, `email`, `emailName`, `address`, `hours`, `contactUrl`, `season`, `distances`, `features`, `notes`, `defaultStart`; leave the rest of each label unchanged
- [X] T008 [US2] Apply all required/optional attribute and label corrections in camping/location-form.html: (a) add `required` attribute to `#address`, `#url`, `#mapUrl` inputs; (b) update Street Address label to `Street Address *`, Website URL label to `Website URL *`, Google Maps URL label to `Google Maps URL *`; (c) remove `required` attribute from `#emoji` input; (d) update Emoji label from `Emoji *` to `Emoji` (retain `maxlength="2"` on the input); (e) in the JS submit handler, move `address`, `url`, `mapUrl` out of the `optionalFields` array and add them as direct required-field assignments (`location.address = formData.get('address').trim()` etc.) alongside the existing required fields block; keep `emoji` in the optional-emit pattern (emit when non-empty, omit when empty)

**Checkpoint**: US2 is independently testable — search rendered page source for "(optional)": zero results; inspect required fields marked with `*` and confirm emoji has no `*`

---

## Phase 5: User Story 3 - Booking Method Radio Selection (Priority: P3)

**Goal**: Replace the two independent booking text/URL inputs with a radio group ("Call to Book" / "Book Online") that gates visibility of the booking URL input. JSON emission is controlled by radio state. Switching radios hides but preserves the URL value. Clear Form fully resets booking state.

**Independent Test**: Open form — confirm "Call to Book" is selected by default and no URL input is visible. Select "Book Online" — confirm URL input appears. Enter a URL. Switch to "Call to Book" — confirm URL input disappears but selecting "Book Online" again restores the entered URL. Generate JSON in each state and verify: callToBook → neither `booking` nor `bookingUrl` in output; bookOnline + non-empty URL → only `bookingUrl` in output; bookOnline + empty URL → neither key. Click Clear Form — confirm radio resets to "Call to Book" and URL input is hidden and cleared.

### Implementation for User Story 3

- [X] T009 [P] [US3] Add `updateBookingVisibility()` function to the `<script>` block in camping/location-form.html — function body: `const group = document.getElementById('bookingUrlGroup'); group.style.display = document.getElementById('bookOnline').checked ? 'block' : 'none';` — no animation, instant toggle
- [X] T010 [P] [US3] Replace the Booking URL `form-group` div and the Booking Instructions `form-group` div in camping/location-form.html with: (a) a `<div class="form-group">` containing a `<fieldset>`-style label ("Booking Method") and two radio inputs — `<input type="radio" id="callToBook" name="bookingMethod" value="callToBook" checked onchange="updateBookingVisibility()">` with label "Call to Book", and `<input type="radio" id="bookOnline" name="bookingMethod" value="bookOnline" onchange="updateBookingVisibility()">` with label "Book Online"; (b) immediately after, a `<div id="bookingUrlGroup" style="display: none">` containing a `form-group` div with label "Booking URL" and `<input type="url" id="bookingUrl" name="bookingUrl" placeholder="https://...">` — the `#bookingUrl` input retains its existing id so downstream JS references still resolve
- [X] T011 [US3] Update the form submit handler in camping/location-form.html — remove `'bookingUrl'` and `'booking'` from the `optionalFields` array entirely; add a new conditional block after the optionalFields loop: `if (document.getElementById('bookOnline').checked) { const bUrl = formData.get('bookingUrl')?.trim(); if (bUrl) location.bookingUrl = bUrl; }` — this ensures bookingUrl is only emitted when Book Online is active AND the field is non-empty, and the `booking` key is never emitted
- [X] T012 [US3] Update `resetForm()` in camping/location-form.html — after the existing `document.getElementById('locationForm').reset()` call, add: (a) `document.getElementById('callToBook').checked = true;` — explicitly reset radio to Call to Book in case `form.reset()` does not restore default checked state reliably across browsers; (b) `document.getElementById('bookingUrl').value = '';` — explicitly clear the URL value; (c) `updateBookingVisibility();` — hide the bookingUrlGroup div

**Checkpoint**: US3 is independently testable — exercise the full booking radio interaction described in the Independent Test above; verify JSON output for all three radio/URL combinations; verify Clear Form behavior

---

## Phase 6: User Story 4 - Accurate Section Headings (Priority: P4)

**Goal**: Replace the 4 existing (inaccurate) section headers with 7 correct headers in the exact order: Identity, Address, Coordinates, Contact, Web & Resources, Booking, Additional Details. Move all field groups to the section they belong in.

**Independent Test**: Open form and read section headers top to bottom — verify they appear in the order: Identity, Address, Coordinates, Contact, Web & Resources, Booking, Additional Details. For each header, verify the fields immediately below it match the section topic.

**⚠️ NOTE**: T014 depends on US3 (T009–T012) completing first — the Booking section must contain the radio group created in US3, not the old booking inputs.

### Implementation for User Story 4

- [X] T013 [US4] Update section header text and add the two missing section headers in camping/location-form.html: rename `"Basic Information"` → `"Identity"`; insert a new `<div class="section-header">Address</div>` between the Identity fields and the Coordinates section; rename `"Location Details"` → `"Coordinates"`; rename `"Contact Information"` → `"Contact"`; rename `"Booking & Resources"` → `"Web & Resources"`; insert a new `<div class="section-header">Booking</div>` after the Web & Resources section header and before the Additional Details section — this creates all 7 section header divs in the correct order
- [X] T014 [US4] Move all form-group divs (and form-row wrappers from US1) to their correct sections in camping/location-form.html, producing this final field order: **Identity** → Name/Emoji form-row; **Address** → Street Address form-group, then City/State/ZIP form-row; **Coordinates** → existing `.coords-group` div (Lat/Long — already structured correctly, move as a unit, do not alter its internal HTML); **Contact** → Phone/Email form-row, then Email Contact Name form-group, then Hours form-group; **Web & Resources** → Website URL form-group, Google Maps URL form-group, Site Map Path form-group, Contact URL form-group (all full-width, stacked); **Booking** → booking radio form-group + `#bookingUrlGroup` div (created in US3); **Additional Details** → Season, Distances, Features, Notes, Default Start Location (already in this section — move as a block if needed, do not alter individually)

**Checkpoint**: US4 is independently testable — open form and verify section header order and correct field placement under each header; confirm Lat/Long coords-group is visually unchanged; confirm all form functionality (US1–US3) still works after the restructuring

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification spanning all four user stories after all phases are complete.

- [ ] T016 [P] Perform complete manual browser review of camping/location-form.html — verify all seven quickstart scenarios: (1) section headers in correct order Identity→Additional Details; (2) name/emoji, city/state/zip, phone/email render as multi-column rows at desktop width; (3) all multi-column rows collapse to single-column below 400px; (4) zero "(optional)" text visible on the page; (5) booking radio default + show/hide + URL preservation + JSON output for all three states; (6) Clear Form resets all fields including booking radio to "Call to Book" with URL hidden; (7) fully-filled form JSON contains all required keys, no `booking` key, no spurious keys
- [X] T015 [P] Verify the `<style>` block in camping/location-form.html has no remaining dead CSS: confirm `.optional` rule is gone (T006), `.coords-group` rule is intact and unchanged, `.form-row` and its child/media rules are present (T002)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS US1 form-row HTML changes**
- **US1 (Phase 3)**: Depends on Phase 2 (needs `.form-row` CSS class) — T003/T004/T005 can run in parallel with each other
- **US2 (Phase 4)**: Depends on Phase 2 only — can start in parallel with US1 after Foundation; T006/T007 can run in parallel with each other; T008 should follow T007
- **US3 (Phase 5)**: Depends on Phase 2 only — can start in parallel with US1/US2; T009/T010 can run in parallel with each other; T011/T012 depend on T010
- **US4 (Phase 6)**: T013 depends on Phase 2 only; **T014 depends on US3 completion** (Booking section requires radio group from T010)
- **Polish (Phase 7)**: Depends on all four user story phases completing

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T002) only — no dependency on US2, US3, or US4
- **US2 (P2)**: Depends on Foundational (T002) only — no dependency on US1, US3, or US4
- **US3 (P3)**: Depends on Foundational (T002) only — no dependency on US1 or US2
- **US4 (P4)**: T013 is independent; **T014 requires US3 complete** (radio group must exist before moving it into the Booking section)

### Within Each User Story

- US1: T002 → T003 / T004 / T005 (last three parallel)
- US2: T006 / T007 (parallel) → T008
- US3: T009 / T010 (parallel) → T011 → T012
- US4: T013 → T014

### Parallel Opportunities

- T003, T004, T005 (US1): Three different regions of the HTML `<body>` — two implementors can split these
- T006 (US2, CSS block) runs fully in parallel with T007 (US2, HTML body)
- T009 (US3, `<script>` block) runs fully in parallel with T010 (US3, HTML `<body>`)
- T015 and T016 (Polish) are both read-only verification tasks — run concurrently

---

## Parallel Example: User Story 1

```text
# After T002 (Foundational) is complete, split US1 across two implementors:

Implementor A:
  Task: "Wrap Name + Emoji form-groups in .form-row (3fr 1fr) in camping/location-form.html"
  Task: "Wrap City + State + ZIP form-groups in .form-row (2fr 1fr 1fr) in camping/location-form.html"

Implementor B:
  Task: "Wrap Phone + Email form-groups in .form-row (1fr 1fr) in camping/location-form.html"
```

## Parallel Example: User Story 2

```text
# T006 and T007 target different file regions — split across two implementors:

Implementor A:
  Task: "Remove .optional CSS rule from <style> block in camping/location-form.html"

Implementor B:
  Task: "Remove all 16 (optional) span elements from labels in camping/location-form.html"

# T008 follows both — one implementor updates required attrs + JS optionalFields array
```

## Parallel Example: User Story 3

```text
# T009 and T010 target different file regions — split across two implementors:

Implementor A:
  Task: "Add updateBookingVisibility() function to <script> block in camping/location-form.html"

Implementor B:
  Task: "Replace booking HTML fields with radio group + conditional URL wrapper in camping/location-form.html"

# T011 then T012 follow sequentially — one implementor updates submit handler then resetForm()
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002) — **CRITICAL, blocks US1**
3. Complete Phase 3: US1 (T003–T005)
4. **STOP and VALIDATE**: Open form at desktop and sub-400px widths — confirm multi-column rows and responsive collapse
5. Commit and demo if form layout improvement is sufficient on its own

### Incremental Delivery

1. T001 → T002 → Foundation ready
2. T003–T005 → **US1 complete** — form is visibly shorter, multi-column rows work ✅
3. T006–T008 → **US2 complete** — labels clean, required attrs correct ✅
4. T009–T012 → **US3 complete** — booking radio interaction works, JSON output correct ✅
5. T013–T014 → **US4 complete** — seven sections in correct order with correct fields ✅
6. T015–T016 → Polish verification ✅

Each story adds independent, demonstrable value without requiring subsequent stories.

### Parallel Team Strategy

With two implementors after T001–T002:

- **Implementor A**: US1 (T003–T005) → then US4/T013 (section header text edits)
- **Implementor B**: US2 (T006–T008) → then US3 (T009–T012) → then US4/T014 (field restructuring)

US4/T014 must wait for US3 (Implementor B) to finish T010 before the booking section can be placed.

---

## Notes

- **[P]** tasks target non-overlapping file regions (`<style>`, `<body>`, `<script>`) — two implementors can work simultaneously without conflict
- **[Story]** label maps each task to its user story for independent traceability and cherry-pick commits
- The `.coords-group` div (Latitude/Longitude) is **preserved unchanged** throughout — do not convert it to `.form-row` or alter its internal structure
- Commit after each checkpoint to enable clean rollback per story
- The `booking` HTML input (`id="booking"`) and its JS processing are removed entirely in T010/T011 — the `booking` JSON key is never emitted after this feature
- `emoji` remains in the optional-emit pattern throughout: emitted in JSON only when non-empty; the only change is removal of `required` attribute and `*` label marker (T008)
- Street Address, Website URL, and Google Maps URL become required fields in both HTML (`required` attribute) and JS (moved out of `optionalFields`) — critical user override from spec clarification
