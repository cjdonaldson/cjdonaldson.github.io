# Tasks: Location ID Generation in Location Form

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines instead of space-based Markdown line breaks. -->

**Feature**: `001-location-id-form`
**Input**: Design documents from `specs/001-location-id-form/`
**Source of truth**: `camping/location-form.html` (single file modified — 16,352 bytes baseline)
**Reference algorithm**: `location-id-gen.js` (read-only; Node.js implementation to cross-check against)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (no shared file writes)
- **[Story]**: Maps task to user story (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every description

---

## Phase 1: Setup

**Purpose**: Understand the existing handler and establish verified reference values before touching any code

- [X] T001 Read `camping/location-form.html` lines 390–462 (the `submit` event listener) and note the exact function signature, the `const location = {}` initialization line, and the `coords` assignment — these are the three edit sites for this feature
- [X] T002 [P] Run `node location-id-gen.js "27.1392,-82.4526"` and record the output (`5c4ce2cb`); repeat for `"36.1716,-115.1391"` (`7967325d`) and `"25.7617,-80.1918"` (`e627ef2f`) — these become the acceptance values for SC-002

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Promote the submit handler to `async` — required before any `await` can appear in the handler body; must be complete before all user-story phases

**⚠️ CRITICAL**: No user-story work can begin until T003 is complete

- [X] T003 In `camping/location-form.html` line 390, change `function(e)` to `async function(e)` on the `addEventListener('submit', ...)` callback — `e.preventDefault()` on line 391 remains the first synchronous statement and is unaffected by the async promotion (per research.md §4)

**Checkpoint**: Handler is now async — user-story implementation can proceed

---

## Phase 3: User Story 1 — Generated JSON Includes `id` (Priority: P1) 🎯 MVP

**Goal**: Every JSON blob produced by the form contains a correct 8-character hex `id` derived from the entered coordinates via SHA-256 (Web Crypto API)

**Independent Test**: Open `camping/location-form.html` in Firefox over `file://`, enter latitude `27.1392` and longitude `-82.4526` with the other required fields filled, click **Generate JSON**, and confirm `"id": "5c4ce2cb"` appears in the output (value verified against `location-id-gen.js` in T002)

### Implementation for User Story 1

- [X] T004 [US1] In `camping/location-form.html`, immediately after `e.preventDefault()` on line 391, add a `crypto.subtle` availability guard: `if (!crypto.subtle) { ... return; }` — the error branch must render the message **"ID generation is not supported in this context. Please open this file in Firefox, or serve it over HTTP/HTTPS."** into `document.getElementById('jsonOutput').textContent`, add the `.show` class to `#output`, and `return` without producing any JSON (FR-010; research.md §5)
- [X] T005 [US1] In `camping/location-form.html`, after the guard from T004, add coordinate normalization variables and the ID derivation block: read `latitude` and `longitude` from `formData`, compute `lat4 = parseFloat(...).toFixed(4)` and `lng4 = parseFloat(...).toFixed(4)`, build `coordStr = \`${lat4},${lng4}\``, encode with `new TextEncoder().encode(coordStr)`, `await crypto.subtle.digest('SHA-256', bytes)`, convert the resulting `ArrayBuffer` to a 64-char hex string via `Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')`, and derive `const id = hexStr.slice(0, 8)` (research.md §2)
- [X] T006 [US1] In `camping/location-form.html`, change `const location = {};` (line 394) to `const location = { id };` so `id` is the first — and at this point only — assigned key before any other field is set (FR-001, FR-004; research.md §6)
- [x] T007 [P] [US1] Manual test — US1 happy path: open `camping/location-form.html` in Firefox over `file://`, fill in the quickstart.md minimum required fields with latitude `27.1392` / longitude `-82.4526`, click **Generate JSON**, and verify: (a) `"id"` key is present in the output, (b) its value is exactly `"5c4ce2cb"` (8 lowercase hex chars), (c) the value matches the T002 reference output

**Checkpoint**: US1 is independently functional — JSON output now always includes a correct `id`

---

## Phase 4: User Story 2 — Coordinate Normalization to 4 Decimal Places (Priority: P2)

**Goal**: Coordinates with fewer or more than 4 decimal places are silently normalized to exactly 4 decimal places before ID computation and before being written into the JSON output, so the generated `id` always matches `location-id-gen.js` for the same physical location regardless of how many decimals the maintainer typed

**Independent Test**: Open `camping/location-form.html` in Firefox, enter latitude `27.139` (3 decimal places) and longitude `-82.45` (2 decimal places), generate JSON, run `node location-id-gen.js "27.1390,-82.4500"`, and confirm both produce the same `id`

### Implementation for User Story 2

- [X] T008 [US2] In `camping/location-form.html`, confirm that the `lat4` and `lng4` variables introduced in T005 already provide normalized values via `parseFloat(...).toFixed(4)` — this is the single normalization point for both hash input (US2, FR-003) and JSON output (FR-008); no additional change is needed if T005 was implemented correctly (verify by inspection)
- [X] T009 [US2] In `camping/location-form.html`, replace the existing `coords` assignment (lines 401–404): change `parseFloat(formData.get('latitude'))` and `parseFloat(formData.get('longitude'))` to `parseFloat(lat4)` and `parseFloat(lng4)` respectively — this writes the 4-decimal normalized numbers (not raw user input) into the JSON output (FR-008; research.md §7; data-model.md "Changed Fields")
- [x] T010 [P] [US2] Manual test — US2 normalization: (a) enter latitude `27.139` / longitude `-82.45`, generate JSON, confirm `id` matches `node location-id-gen.js "27.1390,-82.4500"`; (b) enter latitude `27.13920` / longitude `-82.45260`, generate JSON, confirm `id` matches `node location-id-gen.js "27.1392,-82.4526"`; (c) confirm `coords` in the output is `[27.139, -82.45]` for case (a) and `[27.1392, -82.4526]` for case (b) (quickstart.md §"Coordinate Normalization")

**Checkpoint**: US2 is independently functional — normalization produces IDs consistent with the standalone script for any decimal precision

---

## Phase 5: User Story 3 — `id` Field Placement in JSON Output (Priority: P3)

**Goal**: `"id"` is always the first key in the serialized JSON object, making the identifier immediately visible when the maintainer inspects or pastes the output

**Independent Test**: Open `camping/location-form.html` in Firefox, generate any valid JSON, and confirm that `"id"` is the first property in the output blob

### Implementation for User Story 3

- [X] T011 [US3] In `camping/location-form.html`, verify that `const location = { id };` (set in T006) is still the initialization line and that no other key has been inserted before `id` — if any other field assignment appears before `id` in the handler body, reorder so `const location = { id }` is declared first; this guarantees insertion-order serialization via `JSON.stringify` places `id` first (FR-004; research.md §6)
- [x] T012 [P] [US3] Manual test — US3 placement: open `camping/location-form.html` in Firefox, generate a valid JSON blob with all optional fields populated, visually inspect the raw output and confirm `"id"` is the very first key (precedes `"name"`, `"address"`, etc.)

**Checkpoint**: All three user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full acceptance verification across all stories and requirements

- [x] T013 [P] Cross-check `id` against `location-id-gen.js` for all three coordinate pairs from T002 in a single session: enter each pair in the form, generate JSON, compare each `id` to the recorded reference values — all three must match exactly (SC-002)
- [x] T014 Full regression walkthrough per FR-005 and SC-003 using the checklist in `specs/001-location-id-form/quickstart.md §"No Regressions"`: test browser field validation (leave required field blank → no JSON), optional fields omitted from output, array fields (features/notes/distances), Copy to Clipboard, Clear Form, and Booking URL toggle — all must behave identically to pre-change behavior
- [x] T015 [P] Error-path test: open `camping/location-form.html` in Chrome over `file://` (drag-and-drop or File > Open), fill in any valid form data, click **Generate JSON**, and confirm: (a) the output area shows the error message containing *"not supported in this context"* and the Firefox/HTTP instruction, (b) no JSON object is present anywhere in the output (FR-010, SC-004)
- [X] T016 [P] File size gate: run `wc -c camping/location-form.html` and confirm the result is ≤ 18,400 bytes (the 16,352-byte baseline + 2,048-byte maximum increase per SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user-story phases
- **Phase 3 (US1)**: Depends on Phase 2 (async handler) — no dependency on US2 or US3
- **Phase 4 (US2)**: Depends on Phase 3 (T005 introduces `lat4`/`lng4` variables that T008 verifies and T009 reuses in `coords`)
- **Phase 5 (US3)**: Depends on Phase 3 (T006 introduces `const location = { id }` that T011 verifies)
- **Phase 6 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational: async handler)
            └── Phase 3 (US1: guard + id derivation + id in object)  ← MVP stop point
                    ├── Phase 4 (US2: coords normalization — depends on lat4/lng4 from T005)
                    └── Phase 5 (US3: id placement — depends on location = {id} from T006)
                            └── Phase 6 (Polish: full acceptance)
```

- **US2 has a soft dependency on US1**: T008 verifies the `lat4`/`lng4` variables from T005; T009 reuses them for the `coords` field. US2 should not be started until T005 is complete.
- **US3 has a soft dependency on US1**: T011 verifies the `const location = { id }` initialization from T006. US3 should not be started until T006 is complete.
- US2 and US3 have no dependency on each other and can proceed in parallel once US1 is complete.

### Within Each Phase

- T001 and T002 in Phase 1 can run in parallel (both are read-only)
- T007, T010, T012 are manual verification tasks and can run in parallel with each other once their respective implementation tasks are done
- T013, T015, T016 in Phase 6 can run in parallel; T014 is the most time-intensive and should be started first

### Parallel Opportunities

```
# Phase 1 — run simultaneously
T001: Read camping/location-form.html handler
T002: Run node location-id-gen.js for 3 coord pairs

# After T003 (Foundational) — US2 and US3 both unblock after US1 completes
T010 (US2 test)  +  T012 (US3 test)  ← run in parallel once T009 and T011 are done

# Phase 6 — run simultaneously
T013: 3-pair cross-check
T015: Chrome error-path test
T016: File size gate
```

---

## Parallel Example: User Story 1

```bash
# After T003 (async handler) is done, T004, T005, T006 are sequential (same handler body)
# Once T006 is merged, launch US1 verification in parallel with starting US2/US3 work:

Task A: "Manual test US1 happy path — T007"           # Firefox, coords 27.1392/-82.4526
Task B: "Verify lat4/lng4 normalization vars — T008"  # Inspection only, no file write
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003) — **CRITICAL, blocks everything**
3. Complete Phase 3: US1 (T004 → T005 → T006 → T007)
4. **STOP and VALIDATE**: run T007 manual test; cross-check with `node location-id-gen.js`
5. The form is already correct for maintainers entering coords to exactly 4 decimal places
6. Ship if US2/US3 polish can wait

### Incremental Delivery

1. Setup + Foundational → async handler ready
2. US1 complete → every generated JSON has an `id` (**MVP shipped**)
3. US2 complete → normalization handles any decimal precision → `id` always matches standalone script
4. US3 complete → `id` is visually first in output → quality of life confirmed
5. Phase 6 → full acceptance sign-off

### Single-Developer Sequence (Recommended)

```
T001 → T002 (parallel) → T003 → T004 → T005 → T006 → T007
                                                        ↓
                                              T008 → T009 → T010
                                                        ↓
                                                   T011 → T012
                                                        ↓
                                        T013 + T014 + T015 + T016 (T014 first)
```

---

## Notes

- **Single-file feature**: All code changes are confined to `camping/location-form.html`. Virtually no tasks can be parallelized at the file-write level — the [P] markers on implementation tasks indicate they can be *prepared* (read, draft, plan) concurrently, but the actual edits are sequential within the same file.
- **[P] on test/verification tasks** is genuine parallelism — those tasks only read the browser output or run the terminal command; they do not touch `camping/location-form.html`.
- Tasks T004–T006 are sequential edits to adjacent lines in the same handler body; complete them as a single commit to keep the handler in a consistent state.
- Tasks T008–T009 are also adjacent edits; complete them together.
- The `distances` field appears in both `optionalFields` and `arrayFields` in the existing handler (lines 416–446). This is a pre-existing issue — do not fix it as part of this feature (out of scope per FR-005 "no regressions" = make no unrelated changes).
- Commit after T006 (US1 complete), after T009 (US2 complete), after T011 (US3 complete), and after Phase 6 passes.
