# Tasks: Add Stable Location IDs

**Input**: Design documents from `specs/001-add-location-ids/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · data-model.md ✅ · research.md ✅ · quickstart.md ✅

**Scope**: `camping/florida-bound-locations.json` (data file only) + `validate-ids.js`, `location-id-gen.js`, `location-id-add.js` (repo root). No changes to any camping planner runtime `.js` file; no planner page edits.

**No tests requested**: Validation is via the required `validate-ids.js` script (FR-005) and manual browser-console spot-checks (SC-004). No separate test files.

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no conflicting edits)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

---

## Phase 1: Setup — Audit Current State

**Purpose**: Confirm the JSON file is in a known state before any edits.

- [x] T001 Audit `camping/florida-bound-locations.json`: run `node -e "const d=require('./camping/florida-bound-locations.json'); let n=0; d.states.forEach(s=>s.locations.forEach(l=>{n++;const bad=l.coords.some(c=>!/^-?\d+\.\d{4}$/.test(c.toFixed(4)));console.log(n,l.name,l.coords,bad?'PRECISION_BAD':'ok',Object.keys(l)[0]==='id'?'HAS_ID':'NO_ID');})); console.log('Total:',n);"` and confirm: 23 locations total, no `id` fields present, Hamburg PA has corrected coords (`[40.5577, -76.0019]` and `[40.5606, -75.9961]`), and identify which coords have fewer than 4 decimal places in the raw source

---

## Phase 2: Foundational — Fix Coordinate Precision

**Purpose**: Three coordinates are stored with 3 decimal places in the JSON source, violating FR-008. These MUST be corrected before any `id` is assigned, because the stored form must match `toFixed(4)` output.

**⚠️ CRITICAL**: These edits MUST complete before Phase 3. Adding IDs before fixing precision would embed incorrect source representations.

**Coordinates to fix** (raw JSON value → required value):

| Location | Field | Current (raw JSON) | Required |
|---|---|---|---|
| Cattail Creek Campground | `coords[1]` | `-77.585` | `-77.5850` |
| Spacious Skies Sandy Run | `coords[1]` | `-78.983` | `-78.9830` |
| Country Oaks Campground & RV | `coords[1]` | `-81.689` | `-81.6890` |

> **Note**: `toFixed(4)` on the parsed number already produces the correct formula input (e.g. `(-77.585).toFixed(4)` → `"-77.5850"`), so the pre-computed IDs in `research.md` are valid. The fix here is a source-format correction only — no ID values change.

- [x] T002 In `camping/florida-bound-locations.json`, change Cattail Creek Campground's second coord from `-77.585` to `-77.5850` (add trailing zero so raw JSON text has exactly 4 decimal places)
- [x] T003 In `camping/florida-bound-locations.json`, change Spacious Skies Sandy Run's second coord from `-78.983` to `-78.9830` (add trailing zero so raw JSON text has exactly 4 decimal places)
- [x] T004 In `camping/florida-bound-locations.json`, change Country Oaks Campground & RV's second coord from `-81.689` to `-81.6890` (add trailing zero so raw JSON text has exactly 4 decimal places)

**Checkpoint**: All 23 coords now have exactly 4 decimal places. Validate with:
```bash
python3 -c "
import json, re
data = json.load(open('camping/florida-bound-locations.json'))
ok = True
for s in data['states']:
    for loc in s['locations']:
        for c in loc['coords']:
            if not re.match(r'^-?\d+\.\d{4}$', f'{c:.4f}'):
                print('BAD PRECISION:', loc['name'], c); ok = False
print('All coords OK' if ok else 'FAIL')
"
```

---

## Phase 3: User Story 1 — Add `id` to All 23 Locations (Priority: P1) 🎯 MVP

**Goal**: Every location object in `camping/florida-bound-locations.json` gains an `id` field as its first key, using the pre-computed values from `research.md`.

**Independent Test**: Open `camping/florida-bound-locations.json` in a text editor; confirm every location object opens with `"id":` before `"name":`, all values are 8 lowercase hex characters, and no two values are the same.

**ID reference** (from `research.md` pre-computed table — use these verbatim):

| id | Location | State | coords (stored) |
|----|----------|-------|----------------|
| `5c4ce2cb` | Royal Coachman | FL | `[27.1392, -82.4526]` |
| `0450fbdd` | Papa Lew's | FL | `[28.3345, -82.2292]` |
| `5fd7359d` | Flywheeler Park | FL | `[27.7536, -81.7787]` |
| `7e1e55c0` | Camping World Roanoke | VA | `[37.3226, -79.9745]` |
| `a1122425` | Smith Mountain Campground | VA | `[36.9039, -79.6389]` |
| `cf0b163f` | Indian Heritage RV Park | VA | `[36.6914, -79.8725]` |
| `1a3f891d` | Hidden Acres Family Campground | VA | `[38.0331, -77.3869]` |
| `7d5692f4` | South 40 Campground | VA | `[37.2095, -77.3975]` |
| `37ffd3de` | Shenandoah River State Park | VA | `[38.8489, -78.3104]` |
| `1092cc3b` | Cattail Creek Campground | VA | `[36.5964, -77.5850]` |
| `bf531552` | Spacious Skies Sandy Run | NC | `[34.8396, -78.9830]` |
| `926cae37` | Florence RV Park | SC | `[34.1625, -79.7089]` |
| `cce6e85c` | Spacious Skies Campgrounds Savannah | GA | `[32.0359, -81.1564]` |
| `1f25e7ca` | Country Oaks Campground & RV | GA | `[30.7997, -81.6890]` |
| `1d3b7719` | Eagle's Roost RV Resort | GA | `[30.6793, -83.0918]` |
| `674cc343` | Deep Bend Landing | GA | `[31.4753, -81.9831]` |
| `c8474e10` | Lake Harmony RV Park | GA | `[31.5853, -81.4494]` |
| `8b6ab13e` | Okefenokee RV Park | GA | `[30.8515, -82.0191]` |
| `90817842` | Jenny Ridge RV Park | GA | `[30.8145, -81.9987]` |
| `62369192` | McIntosh Lake RV Park | GA | `[31.8646, -81.5028]` |
| `413a7acf` | Riegelsville | PA | `[40.5936, -75.1886]` |
| `d1bac0ce` | Cabela's Hamburg | PA | `[40.5577, -76.0019]` |
| `c0a975b4` | Camping World Hamburg | PA | `[40.5606, -75.9961]` |

**Key-order rule** (FR-002): `id` MUST be the literal first key in each object. Example of correct form:
```json
{
  "id": "5c4ce2cb",
  "name": "Royal Coachman",
  "emoji": "⛱️",
  ...
}
```

### Implementation for User Story 1

- [x] T005 [US1] In `camping/florida-bound-locations.json`, insert `"id": "5c4ce2cb"` as the first key in Royal Coachman, `"id": "0450fbdd"` in Papa Lew's, and `"id": "5fd7359d"` in Flywheeler Park (all 3 Florida locations)
- [x] T006 [US1] In `camping/florida-bound-locations.json`, insert id fields for all 7 Virginia locations: Camping World Roanoke → `7e1e55c0`, Smith Mountain Campground → `a1122425`, Indian Heritage RV Park → `cf0b163f`, Hidden Acres Family Campground → `1a3f891d`, South 40 Campground → `7d5692f4`, Shenandoah River State Park → `37ffd3de`, Cattail Creek Campground → `1092cc3b`; confirm `id` is first key in each object
- [x] T007 [US1] In `camping/florida-bound-locations.json`, insert id fields for NC and SC locations: Spacious Skies Sandy Run → `bf531552`, Florence RV Park → `926cae37`; confirm `id` is first key in each object
- [x] T008 [US1] In `camping/florida-bound-locations.json`, insert id fields for all 8 Georgia locations: Spacious Skies Campgrounds Savannah → `cce6e85c`, Country Oaks Campground & RV → `1f25e7ca`, Eagle's Roost RV Resort → `1d3b7719`, Deep Bend Landing → `674cc343`, Lake Harmony RV Park → `c8474e10`, Okefenokee RV Park → `8b6ab13e`, Jenny Ridge RV Park → `90817842`, McIntosh Lake RV Park → `62369192`; confirm `id` is first key in each object
- [x] T009 [US1] In `camping/florida-bound-locations.json`, insert id fields for all 3 Pennsylvania locations: Riegelsville → `413a7acf`, Cabela's Hamburg → `d1bac0ce`, Camping World Hamburg → `c0a975b4`; confirm `id` is first key in each object
- [x] T010 [US1] Spot-check 3 IDs via browser DevTools console (F12 → Console) using the formula from `specs/001-add-location-ids/quickstart.md`: verify Royal Coachman `[27.1392, -82.4526]` → `5c4ce2cb`, Cattail Creek `[36.5964, -77.5850]` → `1092cc3b`, and Cabela's Hamburg `[40.5577, -76.0019]` → `d1bac0ce`; all three must match their stored values

**Checkpoint**: US1 complete — 23 location objects each have `id` as their first key, all values are 8 lowercase hex chars, no duplicates. Independently verifiable by opening the JSON in any editor.

---

## Phase 4: User Story 2 — Validation Script (Priority: P2)

**Goal**: A Node.js script (`validate-ids.js`) at the repo root allows any developer to verify the data file in one command. The script enforces FR-005 (uniqueness + format + stale-ID detection).

**Independent Test**: Run `./validate-ids.js camping/florida-bound-locations.json` from the repo root and confirm exit code 0 with a success summary. Then run it against a deliberately corrupted copy (one id changed) and confirm exit non-zero with a human-readable error naming the affected location.

### Implementation for User Story 2

- [x] T011 [US2] Create `validate-ids.js` at the repository root as a Node.js CommonJS script with shebang (`#!/usr/bin/env node`); the script reads the JSON file path from `process.argv[2]` (required — exits with usage error if omitted); walks all nested objects that have a `coords` field; for each such object performs four checks — (1) `id` field exists, (2) `id` matches `/^[0-9a-f]{8}$/`, (3) the computed value `require('crypto').createHash('sha256').update(\`${coords[0].toFixed(4)},${coords[1].toFixed(4)}\`, 'utf8').digest('hex').slice(0,8)` equals the stored `id` (stale-ID detection), (4) after all locations are collected, all `id` values are unique; on any failure, print a human-readable error identifying the location `name` and the specific problem, then `process.exit(1)`; on success, print `"✓ validate-ids: N locations checked, all IDs valid"` and exit 0
- [x] T012 [US2] `chmod +x validate-ids.js` so it can be run as `./validate-ids.js <file>`
- [x] T013 [US2] Run `./validate-ids.js camping/florida-bound-locations.json` from the repository root; confirm the output is `"✓ validate-ids: 23 locations checked, all IDs valid"` and the exit code is 0; if non-zero, inspect the error message, correct the identified issue in `camping/florida-bound-locations.json`, and re-run until clean

**Checkpoint**: US2 complete — `./validate-ids.js camping/florida-bound-locations.json` exits 0 cleanly. Developer can independently reproduce any location's ID by running the formula in a browser console (documented in `quickstart.md`).

---

## Phase 5: User Story 3 — Future-Maintainer Documentation (Priority: P3)

**Goal**: Any maintainer adding a new campground can derive a valid `id` without reading source code — the documented formula in `specs/001-add-location-ids/quickstart.md` is the single, self-contained reference.

**Independent Test**: Follow the "Adding an ID for a New Location" four-step checklist in `quickstart.md` using hypothetical coordinates (e.g., `[29.9511, -90.0715]`); confirm the result is 8 lowercase hex characters and does not appear in the existing `id` list.

### Implementation for User Story 3

- [x] T014 [P] [US3] Verify `specs/001-add-location-ids/quickstart.md` is accurate and self-contained: (a) paste the browser console snippet into DevTools and confirm `locationId(27.1392, -82.4526)` returns `5c4ce2cb`; (b) confirm the Node.js snippet produces `5fd7359d` for `[27.7536, -81.7787]`; (c) confirm the "Adding an ID for a New Location" four-step checklist references `validate-ids.js` as the final verification step; if any discrepancy exists, update `specs/001-add-location-ids/quickstart.md` to match actual behaviour

**Checkpoint**: US3 complete — `quickstart.md` is an accurate, standalone reference for any future maintainer.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation confirming all acceptance criteria are met before committing.

- [x] T015 [P] Run the three `jq` one-liners from `specs/001-add-location-ids/data-model.md` validation checklist against `camping/florida-bound-locations.json`; confirm all three return `true`: (1) all coords-bearing locations have an `id` field, (2) all `id` values are unique, (3) all `id` values match `/^[0-9a-f]{8}$/`
- [x] T016 [P] Verify coordinate precision: run `grep -oP '"coords":\s*\[\K[^\]]+' camping/florida-bound-locations.json` and confirm every numeric value in the output has exactly 4 decimal places (no `-77.585`, `-78.983`, or `-81.689` style values remain)
- [x] T017 Run a final end-to-end check: `./validate-ids.js camping/florida-bound-locations.json` exits 0; `node -e "const d=require('./camping/florida-bound-locations.json'); let bad=[]; d.states.forEach(s=>s.locations.forEach(l=>{ if(Object.keys(l)[0]!=='id') bad.push(l.name); })); console.log(bad.length?'FAIL: id not first in: '+bad.join(', '):'OK: id is first key in all 23 locations');"` outputs `OK`; and the total location count is 23

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user story work**
- **US1 (Phase 3)**: Depends on Foundational (coords must be precise before IDs are added)
- **US2 (Phase 4)**: Depends on US1 (script validates the completed data file)
- **US3 (Phase 5)**: Depends on Foundational; can proceed in parallel with US1 and US2 (different files — `quickstart.md` only)
- **Polish (Phase 6)**: Depends on US1 + US2

### User Story Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational: coord precision)
        ├── Phase 3 (US1: add IDs to JSON)          ← P1 — MVP
        │     └── Phase 4 (US2: validation script)  ← P2
        ├── Phase 5 (US3: quickstart verify) [P]    ← P3 — parallel with US1/US2
        └── Phase 6 (Polish)
```

### Within Each User Story

- **US1** (T005→T009): Sequential edits to the same file — do not attempt parallel edits
- **US2** (T011→T013): T011 and T012 can be written in parallel (different files); T013 waits for both
- **US3** (T014): Single verification task, independent of US1/US2 file edits

### Parallel Opportunities

| Tasks | Can run together? | Reason |
|-------|------------------|--------|
| T002, T003, T004 | ⚠️ Same file — do sequentially in one pass | Avoid merge conflicts |
| T005 → T009 | ⚠️ Same file — do sequentially in one pass | Avoid merge conflicts |
| T011, T012 | ✅ Independent steps | `validate-ids.js` creation and `chmod +x` are sequential but fast |
| T014, T011/T012 | ✅ Different files | `quickstart.md` vs root scripts |
| T015, T016 | ✅ Read-only checks | No writes; safe to run together |

---

## Parallel Example: User Story 2

```bash
# T011: Create validate-ids.js with shebang, all validation checks, required file-path arg
# T012: chmod +x validate-ids.js

# Then T013 runs:
./validate-ids.js camping/florida-bound-locations.json
# → ✓ validate-ids: 23 locations checked, all IDs valid
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T004) ← **CRITICAL — do not skip**
3. Complete Phase 3: User Story 1 (T005–T010)
4. **STOP and VALIDATE**: Open JSON in editor, confirm all 23 locations open with `"id":`, run jq uniqueness check
5. Commit `camping/florida-bound-locations.json` — MVP is deployable

### Incremental Delivery

1. **Setup + Foundational** → coord precision corrected → safe baseline
2. **US1** → all 23 IDs in JSON → independently testable; commit
3. **US2** → validation script in place → CI-ready; commit alongside data file
4. **US3** → quickstart verified → documentation complete; commit if needed
5. **Polish** → final end-to-end pass → PR-ready

### Single-Developer Sequence (recommended)

```
T001 → T002 → T003 → T004
      → T005 → T006 → T007 → T008 → T009 → T010
      → T011 + T012 (parallel) → T013
      → T014
      → T015 + T016 (parallel) → T017
```

---

## Notes

- All 23 IDs are pre-computed in `specs/001-add-location-ids/research.md` — use them verbatim; do not re-derive
- The Hamburg PA collision is already resolved in the JSON (`[40.5577, -76.0019]` / `[40.5606, -75.9961]`)
- Coord precision fix (Phase 2) is a source-format correction only; the pre-computed IDs are unaffected
- **No `.js` runtime files should be touched** — this feature is data-file + validation tooling only (see spec.md Out of Scope)
- `validate-ids.js` must use Node.js built-in `crypto` only — zero external dependencies
- Commit `validate-ids.js`, `location-id-gen.js`, and `location-id-add.js` together with the updated data file (FR-005)
