# Feature Specification: Canonical JSON Field Order for Location Records

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature Branch**: `002-canonical-field-order`
**Created**: 2026-03-20
**Status**: Completed
**Input**: User description: "consistent and meaningful JSON field ordering for location records — formalize the canonical field order model, fix existing records in the JSON data file, and update camping/location-form.html to generate JSON in that order"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Existing Location Records (Priority: P1)

A maintainer auditing the camping data opens `florida-bound-locations.json` and needs every location record to have its fields in a predictable, consistent order so that records are easy to compare side-by-side, diffs are clean, and manual edits are straightforward.

**Why this priority**: The data file is the foundation for all other work streams. Fixing it first yields an immediately reviewable, consistently ordered dataset and unblocks both the schema documentation and the form fix. It delivers standalone value — a clean, canonical data file — even if the form is not yet updated.

**Independent Test**: Can be fully tested by opening `camping/florida-bound-locations.json`, selecting any location record, and verifying its fields appear in the canonical order defined in FR-002.

**Acceptance Scenarios**:

1. **Given** the current `florida-bound-locations.json` contains 7 records whose fields are out of canonical order, **When** the file is updated with field-reordering only, **Then** every record's fields appear in canonical order, no field values are changed, no fields are added or removed, and the file remains valid JSON.
2. **Given** a record that had `notes` appearing before `address` (e.g., id `0450fbdd`), **When** the fix is applied, **Then** `notes` appears after `coords` and `pricing`, and all other fields retain their values.
3. **Given** a record that had `features` appearing before `distances` (e.g., ids `926cae37`, `1f25e7ca`, `1d3b7719`), **When** the fix is applied, **Then** `distances` appears before `features`.
4. **Given** a record that had `season` appearing after `distances` (e.g., id `674cc343`), **When** the fix is applied, **Then** `season` appears before `distances`.
5. **Given** a record that had `defaultStart` appearing before `city` (e.g., id `413a7acf`), **When** the fix is applied, **Then** `defaultStart` appears last among all fields.
6. **Given** any record that was already in canonical order, **When** the fix is applied, **Then** the record is unchanged.

---

### User Story 2 - Formalize the Canonical Schema (Priority: P2)

A maintainer adding a new location or reviewing a pull request needs a single authoritative reference that defines exactly which fields a location record may contain, which are required vs. optional, and what order they must appear in — so there is no ambiguity about correct structure.

**Why this priority**: The schema document makes both the data fix and the form fix verifiable. Without it, "correct order" is defined only by tribal knowledge or by reading code. It is worth doing before or alongside the data fix, but the schema itself has no runtime effect — it is reference documentation.

**Independent Test**: Can be fully tested by opening the schema document and confirming it lists every field that appears in `florida-bound-locations.json` and `location-form.html`, with each field's name, required/optional status, data type, and canonical position.

**Acceptance Scenarios**:

1. **Given** a maintainer who has never seen the location data before, **When** they read the schema document, **Then** they can determine without any other reference whether a field is required or optional, what type its value must be, and where it belongs relative to every other field.
2. **Given** the schema document exists, **When** a maintainer checks a location record against it, **Then** they can verify correctness using only the schema without inspecting code.
3. **Given** the `hours` field exists in three current records and is supported by the form but was absent from the initial canonical definition, **When** the schema is written, **Then** `hours` is assigned a defined canonical position (after `pricing`, before `season`) and is documented as optional.

---

### User Story 3 - Fix the Location Form to Emit Canonical Order (Priority: P3)

A maintainer filling out `camping/location-form.html` to add a new location copies the generated JSON blob and pastes it into the data file. Currently the form emits fields in a non-canonical order, forcing manual reordering after every paste.

**Why this priority**: The form fix eliminates future drift. It depends on the schema being defined (Story 2) so the correct order is known. The data file already has correct values; this story prevents new records from needing the same data-fix treatment.

**Independent Test**: Can be fully tested by opening `camping/location-form.html` in a browser, filling in all fields (required and optional), clicking Generate, and verifying the output JSON has fields in canonical order as defined in FR-002.

**Acceptance Scenarios**:

1. **Given** a maintainer fills in only required fields in the form, **When** they click Generate, **Then** the output JSON contains exactly the required fields in canonical order: `id`, `name`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`, `coords`.
2. **Given** a maintainer fills in all fields including optional ones (`emoji`, `siteMap`, `bookingUrl`, `phone`, `email`, `emailName`, `pricing`, `hours`, `season`, `distances`, `features`, `notes`, `defaultStart`), **When** they click Generate, **Then** all present fields appear in canonical order.
3. **Given** a maintainer fills in some but not all optional fields, **When** they click Generate, **Then** only the filled-in optional fields appear in the output, each at its canonical position relative to the other present fields.
4. **Given** the `bookingUrl` field is only emitted when the booking method is set to "Book Online", **When** that method is selected and a URL is entered, **Then** `bookingUrl` appears in its canonical position (after `mapUrl`, before `phone`).
5. **Given** the `defaultStart` flag is set to true, **When** JSON is generated, **Then** `defaultStart` appears as the last field in the record.
6. **Given** the form's JavaScript source is read, **When** the optional-field conditional blocks (forEach loops and inline checks) in the JSON generation handler are examined in source order, **Then** they appear in the same sequence as the canonical field list defined in FR-002 — so that code order mirrors output order and any positional error is immediately visible during review.

---

### Edge Cases

- A record that contains only required fields and no optional fields must still pass canonical-order validation.
- A record with `email` but without `emailName` must place `email` at its canonical position; absence of `emailName` does not shift `email`.
- A record with `hours` but no `pricing` must place `hours` after `coords`, at the position `pricing` would have occupied, since optional fields retain their canonical slot relative to each other.
- The `hours` field exists in current data and the form but was not listed in the initial canonical definition. It must be assigned a canonical position (after `pricing`, before `season`) and treated identically to other optional fields.
- No field values may change during the data-file reorder; only key order within each record object is modified.
- Records that are already in canonical order must not be modified at all.
- If the reorder script encounters a field not in the canonical 22-field list, it MUST abort immediately without modifying any record. The error output MUST list every unknown field name and every record `id` that contains it. Partial rewrites (processing some records before discovering the unknown field) are not permitted — validation MUST be completed across all records before any write occurs.
- Before overwriting in place, the script MUST create `florida-bound-locations.json.bak` in the same directory. If the `.bak` write fails, the script MUST abort without touching the original file.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A canonical field schema document MUST be created that lists every recognized location record field (name, required/optional status, value type, and canonical position index), serving as the authoritative reference for both the data file and the form.
- **FR-002**: The canonical field order MUST be: `id`, `name`, `emoji`\*, `url`, `siteMap`\*, `mapUrl`, `bookingUrl`\*, `phone`\*, `email`\*, `emailName`\*, `address`, `city`, `state`, `zip`, `coords`, `pricing`\*, `hours`\*, `season`\*, `distances`\*, `features`\*, `notes`\*, `defaultStart`\* — where \* denotes optional fields that are omitted entirely when not applicable.
- **FR-003**: Every record in `camping/florida-bound-locations.json` MUST have its fields in canonical order after this change; all 7 currently out-of-order records MUST be corrected.
- **FR-004**: The field reordering of `florida-bound-locations.json` MUST be a data-only change: no field values added, removed, or altered. The reorder script MUST enforce this programmatically: after building the reordered candidate structure but before writing, it MUST compare every field value in the candidate against the original and abort without modifying the file if any value difference is detected.
- **FR-005**: The JSON generation handler in `camping/location-form.html` MUST assign fields to the output object in canonical order so that `JSON.stringify` produces canonical-ordered output without any post-processing step.
- **FR-006**: The form fix MUST preserve all existing optional-field conditional logic (emit only when non-empty, `bookingUrl` gated on booking method, `defaultStart` gated on boolean value) while correcting field assignment order.
- **FR-007**: The `hours` field MUST be assigned canonical position 17 (between `pricing` and `season`) in both the schema document and the form's field-assignment sequence.
- **FR-008**: Required fields (`id`, `name`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`, `coords`) MUST always be present in every location record. Optional fields MUST be omitted entirely (not set to null or empty string) when they have no value.
- **FR-009**: The reorder script MUST abort immediately — without modifying any record — if it encounters a field not present in the 22-field canonical list. The error message MUST identify every unknown field name and every record `id` that contains it. The data file MUST remain unmodified. The schema MUST be updated to assign the unknown field a canonical position before the script is re-run.
- **FR-010**: Before overwriting `florida-bound-locations.json` in place, the reorder script MUST write a `.bak` copy of the original file (e.g., `florida-bound-locations.json.bak`) in the same directory. No dry-run mode is required; the `.bak` file serves as the sole recovery mechanism. If the `.bak` file cannot be written, the script MUST abort without modifying the original.
- **FR-011**: The optional-field conditional blocks (forEach loops and inline checks) in the `camping/location-form.html` JSON generation handler MUST be reordered to match the canonical field sequence defined in FR-002. Code order must mirror output order for readability and visual verifiability; this is a source-code organization requirement and does not change runtime output behavior.

### Key Entities

- **Location Record**: A single camping or RV-park entry in `florida-bound-locations.json`. Contains identity fields (`id`, `name`), discovery fields (`url`, `siteMap`, `mapUrl`), booking fields (`bookingUrl`, `phone`, `email`, `emailName`), address fields (`address`, `city`, `state`, `zip`, `coords`), and operational fields (`pricing`, `hours`, `season`, `distances`, `features`, `notes`, `defaultStart`). The canonical field order groups these clusters logically: identity → discovery → booking/contact → address/location → operational details.
- **Canonical Schema**: The reference document (`schema.md` in the feature spec directory) that defines each field's name, required/optional status, value type, and canonical position. Acts as the contract between the data file and the form generator.
- **Location Form**: `camping/location-form.html` — a single-file static HTML form that a maintainer uses to generate a JSON blob for a new location. The generated blob is pasted directly into the data file, so its field order must match the canonical order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 23 location records in `florida-bound-locations.json` have fields in canonical order — verifiable by automated comparison of each record's key sequence against the canonical list.
- **SC-002**: All 7 currently out-of-order records are corrected and zero records that were already correct are altered — enforced by the reorder script itself, which programmatically compares every field value in the reordered candidate against the original before any write occurs and aborts if any value differs.
- **SC-003**: The canonical schema document covers every field that appears in the current data file (including `hours`) and every field the form can emit, with no field unaccounted for.
- **SC-004**: A new location record generated by the form and pasted directly into the data file requires zero manual field reordering — verified by generating a record with all optional fields populated and comparing key order to the canonical list.
- **SC-005**: The form continues to produce functionally identical output (same field values, same conditional omissions) before and after the fix — confirmed by generating the same inputs against both old and new form code and comparing values only.
- **SC-006**: The optional-field conditional blocks in the form handler's JSON generation function appear in canonical field order in the source code — verifiable by reading `camping/location-form.html` and confirming each conditional block or forEach loop appears in the same left-to-right sequence as the 22-field canonical list in FR-002.

## Assumptions

- The data file `camping/florida-bound-locations.json` is the only JSON file containing location records that requires reordering. Other files under `camping/` (e.g., `florida-bound-planner.*`) consume but do not define location records and are out of scope.
- JSON field order in JavaScript objects is insertion order, which is what `JSON.stringify` preserves for non-integer string keys. The form fix relies on this standard behavior.
- The `hours` field, while absent from the initial canonical definition provided, is a legitimate recognized field (it exists in 3 current records and is supported by the form). Its canonical position after `pricing` and before `season` is a reasonable default based on semantic grouping (operational schedule details).
- The `pricing` field is treated as an optional field in the schema because not all location types (e.g., free public land) will have pricing information.
- No location record currently contains fields outside the 22-field canonical set (`id`, `name`, `emoji`, `url`, `siteMap`, `mapUrl`, `bookingUrl`, `phone`, `email`, `emailName`, `address`, `city`, `state`, `zip`, `coords`, `pricing`, `hours`, `season`, `distances`, `features`, `notes`, `defaultStart`). If any such field is discovered at script runtime, the reorder script MUST abort with a descriptive error identifying the unknown field(s) and record id(s); the schema must be updated to assign a canonical position before the script is re-run.

## Clarifications

### Session 2026-03-20

- Q: How should the reorder script handle a field not in the canonical 22-field list? → A: Abort immediately with a descriptive error listing every unknown field name and every record id that contains it; leave the data file unmodified; require the schema to be updated with a canonical position before re-running.
- Q: What backup/safety mechanism should the reorder script use before overwriting the data file? → A: Write a `.bak` copy of the original file in the same directory before overwriting in place; no dry-run mode; abort without modifying the original if the `.bak` write fails.
- Q: How should the "no value change" guarantee be verified? → A: The reorder script itself performs the check — after building the reordered candidate structure but before writing, it programmatically compares every field value between the original and the candidate and aborts if any value differs.
- Q: What canonical position should the `hours` field occupy in the 22-field schema? → A: After `pricing` and before `season` — canonical position 17 of 22; documented as optional.
- Q: Should the optional-field conditional blocks (forEach loops) in the form handler also be reordered to match canonical positions? → A: Yes — reorder forEach loops to match canonical field sequence; cosmetic change for code readability and visual verifiability.
