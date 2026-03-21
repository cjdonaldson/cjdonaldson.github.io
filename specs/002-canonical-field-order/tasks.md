# Tasks: Canonical JSON Field Order for Location Records

**Input**: Design documents from `/specs/002-canonical-field-order/`
**Branch**: `002-canonical-field-order`
**Sources**: spec.md · plan.md · research.md · data-model.md · contracts/location-record.md · quickstart.md

**Tests**: No automated tests requested. Manual browser verification and scripted
self-verification (built into the reorder script itself) serve as the validation
mechanism for all three work streams.

**Work Streams**:
1. **US1 (P1)** — Reorder 7 out-of-order records in `camping/florida-bound-locations.json`
2. **US2 (P2)** — Confirm `specs/002-canonical-field-order/contracts/location-record.md` as the authoritative canonical schema
3. **US3 (P3)** — Rewrite the JSON generator block in `camping/location-form.html` to emit fields in canonical order

**Canonical 22-field order (FR-002)**:
`id`(1) · `name`(2) · `emoji`(3) · `url`(4) · `siteMap`(5) · `mapUrl`(6) · `bookingUrl`(7) ·
`phone`(8) · `email`(9) · `emailName`(10) · `address`(11) · `city`(12) · `state`(13) ·
`zip`(14) · `coords`(15) · `pricing`(16) · `hours`(17) · `season`(18) · `distances`(19) ·
`features`(20) · `notes`(21) · `defaultStart`(22)

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — operates on a different file or has no dependency on incomplete sibling tasks
- **[US1/US2/US3]**: User story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm the branch and working state before any modifications

- [X] T001 Confirm working branch is `002-canonical-field-order`; verify `camping/florida-bound-locations.json` (23 records) and `camping/location-form.html` exist and are at their unmodified baseline; confirm `specs/002-canonical-field-order/contracts/location-record.md` is present

---

## Phase 2: Foundational (Pre-flight Audits)

**Purpose**: Baseline audits of both source files before any edits — confirms the
known violations match research.md and no surprises exist. These two audits target
different files and can run in parallel.

**⚠️ CRITICAL**: Complete both audits before beginning any user-story work. If either
audit reveals discrepancies from research.md, revisit the plan before proceeding.

- [X] T002 [P] Audit `camping/florida-bound-locations.json` — walk `states[].locations[]` and collect each record's field sequence; confirm exactly 7 records are out of canonical order (ids: `0450fbdd`, `926cae37`, `1f25e7ca`, `1d3b7719`, `674cc343`, `8b6ab13e`, `413a7acf`) and 16 are already compliant; confirm no record contains a field outside the 22-field canonical list

- [X] T003 [P] Audit `camping/location-form.html` — locate the `submit` event listener JSON generator block (approx. lines 409–468); confirm the 6 ordering bugs from research.md R-04 are present: `address` before contact cluster, `url`/`mapUrl` after `address`, `coords`/`zip`/`city`/`state` before contact fields, `emoji` after all required fields, `siteMap`/`hours` out of position in `optionalFields` loop, `bookingUrl` after the loop instead of at position 7

**Checkpoint**: Both audits match research.md — user-story work can now begin in parallel

---

## Phase 3: User Story 1 — Fix Existing Location Records (Priority: P1) 🎯 MVP

**Goal**: Every record in `camping/florida-bound-locations.json` has fields in
canonical order; zero field values changed; the 16 already-compliant records are
untouched.

**Independent Test**: Open `camping/florida-bound-locations.json`, select any of the
7 target records (e.g., `0450fbdd`), and verify its fields appear in canonical order.
Cross-check `notes` at position 21 (not before `address`). Verify the 16 already-
canonical records are byte-identical to their pre-run state.

### Implementation for User Story 1

- [X] T004 [US1] Write `reorder-locations.py` (repo root, **not to be committed**) implementing the following pipeline in order:
  - Define `CANONICAL = ['id','name','emoji','url','siteMap','mapUrl','bookingUrl','phone','email','emailName','address','city','state','zip','coords','pricing','hours','season','distances','features','notes','defaultStart']`
  - **Full-pass unknown-field guard**: iterate ALL records in `states[].locations[]` and collect every field name absent from `CANONICAL` along with its record `id`; if any unknowns found, print each unknown field name and each record `id` that contains it, then `sys.exit(1)` — do NOT write anything
  - **Backup safety**: write `camping/florida-bound-locations.json.bak`; if the write fails (e.g., permissions, disk full), abort without touching the original
  - **Rebuild each record**: `{k: record[k] for k in CANONICAL if k in record}` — preserves only present canonical fields in canonical order
  - **Self-verify no value changes**: for every rebuilt record compare `rebuilt[k] == original[k]` for all present keys; if any value differs, print the record `id`, field name, original value, and rebuilt value, then `sys.exit(1)` without writing
  - **Write**: `json.dumps(data, indent=2, ensure_ascii=False)` back to `camping/florida-bound-locations.json`

- [X] T005 [US1] Run `python3 reorder-locations.py` from repo root; confirm the script exits 0, `camping/florida-bound-locations.json.bak` was created, and the script's output (or a post-run check) reports 7 records reordered and 16 records unchanged

- [X] T006 [US1] Validate `camping/florida-bound-locations.json` post-reorder: (a) `json.load` succeeds with no parse error, (b) all 7 target record IDs now have fields in canonical sequence, (c) each of the 16 previously-correct records is unchanged — specifically verify `notes` follows `coords`/`pricing` in `0450fbdd`, `distances` precedes `features` in `926cae37`/`1f25e7ca`/`1d3b7719`, `season` precedes `distances` in `674cc343`, `email` precedes `notes` in `8b6ab13e`, and `defaultStart` is last in `413a7acf`

- [X] T007 [US1] Delete `camping/florida-bound-locations.json.bak` — the backup served its purpose; do not commit it; delete `reorder-locations.py` — one-shot script, not part of the committed codebase

**Checkpoint**: `camping/florida-bound-locations.json` is fully canonical and ready
to commit. User Story 1 is independently testable and complete.

---

## Phase 4: User Story 2 — Formalize the Canonical Schema (Priority: P2)

**Goal**: `specs/002-canonical-field-order/contracts/location-record.md` is confirmed
as the single authoritative canonical field reference — complete, accurate, and
consistent with the now-corrected data file.

**Independent Test**: Open `contracts/location-record.md` and verify it lists all 22
fields with canonical positions, required/optional status, and value types. Without
consulting any other file, a reviewer can determine whether any given location record
field is correct.

### Implementation for User Story 2

- [X] T008 [P] [US2] Review `specs/002-canonical-field-order/contracts/location-record.md` — verify the Canonical Field Order table lists all 22 fields at correct positions; confirm `hours` is at position 17 (between `pricing` at 16 and `season` at 18); confirm `pricing` includes the note that `location-form.html` does not emit it; confirm the Conformance Checklist section is present; confirm required fields are `id`, `name`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`, `coords` (9 total)

- [X] T009 [US2] Cross-check `specs/002-canonical-field-order/contracts/location-record.md` against the post-reorder `camping/florida-bound-locations.json` — confirm every field that appears in any record is documented in the schema at the correct canonical position; confirm every required field is present in all 23 records; confirm no schema field is unaccounted for in the data

**Checkpoint**: Schema document is verified as authoritative and consistent with the
data file. User Story 2 is independently testable and complete.

---

## Phase 5: User Story 3 — Fix Form to Emit Canonical Order (Priority: P3)

**Goal**: The JSON generator block in `camping/location-form.html` assigns fields in
canonical position order (1–22), replacing the current mixed-loop approach with an
explicit linear sequence. All existing conditional logic is preserved. `pricing`
(position 16) is not in the form and is explicitly skipped.

**Independent Test**: Open `camping/location-form.html` in a browser (served via
`localhost` for `crypto.subtle`), fill in all fields, click Generate, and verify JSON
output keys appear in canonical order. Verify `bookingUrl` appears at position 7 (after
`mapUrl`, before `phone`) when Book Online is selected.

### Implementation for User Story 3

- [X] T010 [US3] In `camping/location-form.html`, replace the entire JSON generator block in the `submit` event listener (approx. lines 409–468) with a canonical-ordered sequence of explicit single-field assignments — remove the `optionalFields` forEach loop and the `arrayFields` forEach loop entirely; the replacement block must assign fields in this exact order, preserving all original conditional guards verbatim:
  ```
  const location = { id };                                        // pos  1
  location.name = ...;                                            // pos  2
  if (emoji?.trim()) location.emoji = emoji.trim();               // pos  3
  location.url = ...;                                             // pos  4
  if (siteMap?.trim()) location.siteMap = siteMap.trim();         // pos  5
  location.mapUrl = ...;                                          // pos  6
  if (bookingMethod === 'bookOnline' && bookingUrl?.trim())        // pos  7
    location.bookingUrl = bookingUrl.trim();
  if (phone?.trim()) location.phone = phone.trim();               // pos  8
  if (email?.trim()) location.email = email.trim();               // pos  9
  if (emailName?.trim()) location.emailName = emailName.trim();   // pos 10
  location.address = ...;                                         // pos 11
  location.city = ...;                                            // pos 12
  location.state = ...;                                           // pos 13
  location.zip = ...;                                             // pos 14
  location.coords = [...];                                        // pos 15
  // pricing (pos 16) — not in form; omitted intentionally
  if (hours?.trim()) location.hours = hours.trim();               // pos 17
  if (season?.trim()) location.season = season.trim();            // pos 18
  const dArr = distances split/filtered; if (dArr.length)         // pos 19
    location.distances = dArr;
  const fArr = features split/filtered; if (fArr.length)          // pos 20
    location.features = fArr;
  const nArr = notes split/filtered; if (nArr.length)             // pos 21
    location.notes = nArr;
  if (defaultStart === 'true') location.defaultStart = true;      // pos 22
  ```
  Adapt variable names and value-reading calls to match the existing form's DOM access patterns exactly — do not change how field values are read, only the assignment order and structure

- [X] T011 [US3] Inspect `camping/location-form.html` source after the edit — read the generator block and confirm: (a) field assignments appear in canonical position order 1–22, (b) no forEach loop remains for field ordering, (c) all 6 conditional guards from the original code are present (`emoji` trim check, `siteMap` trim check, `bookingUrl` booking-method gate, `phone`/`email`/`emailName`/`hours`/`season` trim checks, `distances`/`features`/`notes` split-and-filter, `defaultStart` boolean gate), (d) `pricing` is absent with a comment noting it is out of scope

- [X] T012 [US3] Open `camping/location-form.html` in a browser (localhost); fill in only the 9 required fields (`id` via Generate ID, `name`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`, `coords`); click Generate; verify the JSON output contains exactly those 9 fields in canonical order with no optional fields present

- [X] T013 [US3] In the same browser session fill all optional fields except pricing (`emoji`, `siteMap`, select Book Online and enter `bookingUrl`, `phone`, `email`, `emailName`, `hours`, `season`, at least one `distances` entry, at least one `features` entry, at least one `notes` entry, set `defaultStart` to true); click Generate; verify: all fields appear in canonical order, `bookingUrl` is at position 7 (between `mapUrl` and `phone`), `defaultStart` is the last field

**Checkpoint**: Form emits canonical-ordered JSON for all field combinations. User
Story 3 is independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks spanning all three work streams

- [X] T014 [P] Run a final automated key-order scan across all 23 records in `camping/florida-bound-locations.json` — for each record, assert `list(record.keys()) == [k for k in CANONICAL if k in record]`; all 23 must pass (SC-001)

- [X] T015 [P] Run `git diff camping/florida-bound-locations.json` and confirm the diff contains only key-order changes — no value lines differ, no records are added or removed, total record count remains 23 (SC-002)

- [X] T016 Confirm `reorder-locations.py` and `florida-bound-locations.json.bak` are absent from `git status` (deleted or never staged); stage `camping/florida-bound-locations.json`, `camping/location-form.html`, and `specs/002-canonical-field-order/contracts/location-record.md` for commit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user-story work
- **US1 (Phase 3)**: Depends on Foundational audits — no dependency on US2 or US3
- **US2 (Phase 4)**: Depends on Foundational audits — no dependency on US1 or US3; can run in parallel with US1
- **US3 (Phase 5)**: Depends on Foundational audits — logically follows US2 (schema defines the target order for the form); no hard code dependency on US1 completing
- **Polish (Phase 6)**: Depends on US1 and US3 completing (US2 is independent reference doc)

### User Story Dependencies

| Story | Depends On | Blocks |
|-------|-----------|--------|
| US1 (P1) | Phase 2 complete | Phase 6 (T014, T015) |
| US2 (P2) | Phase 2 complete | US3 (logical, not code) |
| US3 (P3) | Phase 2 complete | Phase 6 (T016) |

### Within Each User Story

```
US1: T004 (write script) → T005 (run script) → T006 (validate output) → T007 (cleanup)
US2: T008 (review schema) → T009 (cross-check vs data)
US3: T010 (edit form) → T011 (inspect source) → T012 (test required-only) → T013 (test all-optional)
```

### Parallel Opportunities

- **T002 and T003** (Phase 2) target different files — run in parallel
- **US1 (T004–T007) and US2 (T008–T009)** — fully independent; run in parallel after Phase 2
- **T008** (schema review) — read-only; can run in parallel with any non-conflicting task
- **T014 and T015** (Phase 6) — independent checks; run in parallel

---

## Parallel Example: Running US1 and US2 Together

```
After Phase 2 completes:

  Stream A (US1):                           Stream B (US2):
  T004 Write reorder-locations.py           T008 Review contracts/location-record.md
  T005 Run reorder-locations.py             T009 Cross-check schema vs data
  T006 Validate post-reorder JSON
  T007 Delete .bak and script
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational audits (T002–T003)
3. Complete Phase 3: User Story 1 (T004–T007)
4. **STOP and VALIDATE**: open `camping/florida-bound-locations.json`, spot-check all 7 corrected records
5. Optionally run T014 + T015 (Polish) to confirm zero value drift
6. The data file is immediately committable and reviewable as standalone value

### Incremental Delivery

1. Setup + Foundational → baseline confirmed
2. US1 → canonical data file (MVP — delivers clean, reviewable JSON now)
3. US2 → schema doc confirmed (authoritative reference for PR review)
4. US3 → form fix (prevents future drift)
5. Polish → final consistency sweep + commit

### Parallel Team Strategy

With two contributors after Phase 2:

- **Contributor A**: US1 (T004–T007) — Python script + data file
- **Contributor B**: US2 (T008–T009) + US3 (T010–T013) — schema review + form edit
- Merge order: US1 first (data), then US2+US3 (schema + form) — or all together

---

## Summary

| Phase | Tasks | Story | Parallelizable |
|-------|-------|-------|----------------|
| Phase 1: Setup | T001 | — | No |
| Phase 2: Foundational | T002–T003 | — | T002 ‖ T003 |
| Phase 3: US1 (P1) | T004–T007 | US1 | Sequential within story |
| Phase 4: US2 (P2) | T008–T009 | US2 | T008 parallel with other work |
| Phase 5: US3 (P3) | T010–T013 | US3 | Sequential within story |
| Phase 6: Polish | T014–T016 | — | T014 ‖ T015 |
| **Total** | **16 tasks** | | |

**Parallel opportunities**: 3 identified (T002‖T003, US1‖US2, T014‖T015)

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) — data file corrected and
independently verifiable; delivers standalone value even if US2 and US3 are deferred.
