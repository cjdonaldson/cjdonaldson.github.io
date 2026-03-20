# Feature Specification: Add Stable Location IDs

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature Branch**: `001-add-location-ids`
**Created**: 2026-03-19
**Status**: Complete
**Input**: User description: "Add a stable unique id field to each location object in camping/florida-bound-locations.json."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer Adds an ID to All Locations (Priority: P1)

A site maintainer wants every location in the data file to carry a stable, unique identifier so
that downstream code — such as the camping planner page — can reference a specific campground
without relying on its array index or mutable name string.

**Why this priority**: Without stable IDs, any code that bookmarks, links to, or persists a
location reference breaks whenever the array is reordered or a name is edited. This is the core
value of the feature.

**Independent Test**: Open `camping/florida-bound-locations.json` in a text editor, verify that
every location object has an `id` field as its first key, and confirm no two locations share the
same value.

**Acceptance Scenarios**:

1. **Given** the current data file with 23 location objects across 6 states, **When** the file is
   updated, **Then** every location object contains an `id` field positioned before all other fields.
2. **Given** two different location objects, **When** their `id` values are compared, **Then** they
   are never equal.
3. **Given** the same location object, **When** the `id` generation rule is applied a second time
   (e.g. by running the documented formula in a browser console), **Then** the result matches the
   `id` already stored in the file.

---

### User Story 2 - Developer Verifies or Regenerates an ID at Runtime (Priority: P2)

A developer working on the planner page wants to be able to independently compute the expected
`id` for any location using only the data that is already present in the JSON, so that the page
can detect stale or mismatched IDs without a server round-trip.

**Why this priority**: Reproducibility is what makes the ID "stable." If the formula cannot be
re-run in the browser, the ID is effectively opaque and loses its utility as a cross-reference
key.

**Independent Test**: Using the formula documented in the spec, open a browser console, paste the
formula with any location's coordinates, and confirm the output matches the `id` stored for that
location in the file.

**Acceptance Scenarios**:

1. **Given** a location's `coords` array `[lat, lng]`, **When** the documented formula is applied,
   **Then** the resulting string equals the `id` stored in the JSON for that location.
2. **Given** coordinates that differ by even one decimal place from a stored location, **When**
   the formula is applied, **Then** the result does not match any existing `id`.

---

### User Story 3 - Maintainer Adds a New Location in the Future (Priority: P3)

A maintainer adding a new campground to the data file wants to know exactly how to generate a
valid `id` for the new entry without reading source code.

**Why this priority**: Documented, reproducible ID generation prevents human error and keeps the
data file self-consistent over time.

**Independent Test**: Follow the ID generation steps in the spec to compute an `id` for a
hypothetical new location and confirm the result is 8 hexadecimal characters and does not
collide with any existing `id` in the file.

**Acceptance Scenarios**:

1. **Given** a new location object with a `coords` field, **When** the maintainer follows the
   documented formula, **Then** they can produce an `id` without any tooling beyond a browser
   console.
2. **Given** two distinct GPS coordinate pairs, **When** the formula is applied to each,
   **Then** the resulting IDs are different.

---

### Edge Cases

- A location's coordinates are missing: this is treated as a data error; the file must not be
  updated until valid coordinates are supplied.
- A coordinate value does not have exactly 4 decimal places: this is a data error; the value
  must be corrected to exactly 4 decimal places before an `id` is assigned or committed.
- Two locations happen to occupy the exact same GPS coordinates: this would produce a hash
  collision and must be caught during validation; the maintainer must correct one set of
  coordinates before publishing.
- A location's coordinates are later corrected (e.g., a typo fix): the stored `id` will no
  longer match the value recomputed from the updated `coords`. The validation script MUST detect
  this mismatch and exit non-zero with a human-readable error. The maintainer must regenerate the
  `id` from the corrected coordinates and update any downstream references before committing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every location object in `camping/florida-bound-locations.json` MUST contain an
  `id` field.
- **FR-002**: The `id` field MUST appear as the first key in each location object.
- **FR-003**: Each `id` value MUST be exactly 8 lowercase hexadecimal characters.
- **FR-004**: Each `id` MUST be derived deterministically from the location's `coords` value
  (latitude and longitude) using the formula defined below.
- **FR-005**: No two locations in the file MUST share the same `id` value; uniqueness MUST be
  verified before the file is committed. A validation script (`validate-ids.js` at the repository
  root) is a **required deliverable** and MUST be committed alongside the updated data file. The
  script MUST exit non-zero and print a human-readable error when any uniqueness or format
  constraint is violated. The script MUST also recompute each location's `id` from its stored
  `coords` and fail if any stored `id` does not match the recomputed value; a stale `id` (stored
  value not matching the recomputed value from current `coords`) is a machine-enforced error
  condition, not a manual concern.
- **FR-006**: A location object that is missing a `coords` field MUST be treated as a data error
  and MUST NOT receive an `id` until valid coordinates are added.
- **FR-007**: The ID generation formula MUST be fully reproducible using only browser-native
  capabilities (no external libraries required).
- **FR-008**: Every coordinate value in `camping/florida-bound-locations.json` MUST be written
  with exactly 4 decimal places (e.g., `-77.5850`, not `-77.585` or `-77.58500`). A coordinate
  that does not have exactly 4 decimal places is a data error and MUST be corrected before an
  `id` is assigned or committed.

### ID Generation Formula

The `id` is the first 8 characters of the SHA-256 hex digest of the UTF-8 string formed by
concatenating the latitude and longitude with a comma separator, each formatted to exactly
4 decimal places using `toFixed(4)`. Because FR-008 requires all `coords` values in the JSON
to already have exactly 4 decimal places, the formula input is always consistent with what is
written in the file.

**Input string**: `"<lat toFixed(4)>,<lng toFixed(4)>"` — e.g., coordinates `[27.1392, -82.4526]`
→ input `"27.1392,-82.4526"`; coordinates `[36.5964, -77.5850]` → input `"36.5964,-77.5850"`.

**Algorithm** (browser JavaScript):

```
const input = `${lat.toFixed(4)},${lng.toFixed(4)}`;
const bytes = new TextEncoder().encode(input);
const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
const id = hex.slice(0, 8);
```

**Example**: `[27.1392, -82.4526]` → input `"27.1392,-82.4526"` → `id` = first 8 hex chars of
SHA-256(`"27.1392,-82.4526"`).

### Key Entities

- **Location**: A single campground or stop in the trip planner data file. Key attributes
  relevant to this feature: `id` (new, derived), `coords` (source for ID derivation), `name`,
  `city`, `state`.
- **Data File** (`camping/florida-bound-locations.json`): Top-level object with a `states` array;
  each state contains a `locations` array of location objects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 23 location objects in the file contain an `id` field — verifiable by inspecting
  the file or running a one-line count check.
- **SC-002**: All 23 `id` values are unique — verifiable by comparing a deduplicated set of IDs to
  the full set; counts must match.
- **SC-003**: Every `id` is exactly 8 lowercase hexadecimal characters — verifiable by regex
  `/^[0-9a-f]{8}$/` applied to all values.
- **SC-004**: For each location, re-applying the documented formula to its stored `coords` produces
  the same `id` already present in the file — verifiable by running the formula in a browser
  console for any sampled location.
- **SC-005**: The `id` field appears before all other fields in every location object — verifiable
  by confirming `Object.keys(location)[0] === 'id'` for every location at runtime.
- **SC-006**: Every coordinate value in the file is written with exactly 4 decimal places —
  verifiable by inspecting the raw JSON source and confirming no coordinate has fewer or more than
  4 digits after the decimal point.

## Out of Scope

The following work is explicitly **deferred** to a follow-on feature and is **not** part of this
feature's acceptance criteria:

- **Planner page JavaScript updates**: No changes to any camping planner runtime `.js` file are
  required or permitted as part of this feature. The `id` field is added to the data file only.
  Consuming the new `id` field in the camping planner page is a separate, follow-on feature.
  Tooling scripts at the repository root (`validate-ids.js`, `location-id-gen.js`,
  `location-id-add.js`) are in scope as required supporting deliverables.

## Assumptions

- **Coordinates are always present**: Every location in the current file has a `coords` field;
  the feature specification treats a missing `coords` as a blocking data error, not a graceful
  fallback case.
- **Coordinates are written with exactly 4 decimal places**: All `coords` values in the JSON
  source are stored with exactly 4 digits after the decimal point. The ID formula uses
  `toFixed(4)` on the parsed number, which produces the same string as what is written in the
  file, eliminating any ambiguity between raw JSON text and formula input.
- **Coordinates will not change casually**: GPS coordinates are treated as stable identifiers.
  If coordinates are corrected, the maintainer accepts that the `id` changes and updates any
  downstream references.
- **8-character prefix is sufficient for uniqueness**: With 23 locations across a single trip
  route, the collision probability for an 8-hex-char (32-bit) prefix is negligible. If the file
  ever grows to thousands of locations, the prefix length should be revisited.
- **JSON key order is meaningful**: The file is maintained by hand or by tooling that preserves
  key insertion order. Modern JavaScript engines and JSON serializers respect insertion order for
  string keys.

## Clarifications

### Session 2026-03-20

- Q: What is the scope boundary for this feature — data file only, or does it include planner page JS updates? → A: Data-file only. Updating the planner page JS is explicitly out of scope and deferred to a follow-on feature.
- Q: Is a validation script a required deliverable, and where should it live? → A: Yes, required. Script is `validate-ids.js` at the repository root; it must be committed alongside the updated data file. No bash wrapper is needed — the shebang line makes the script directly executable. FR-005 updated to reflect this.
- Q: When coordinates change after an ID is assigned, how should stale IDs be detected? → A: Validation script detects stale IDs — the script recomputes each `id` from its stored `coords` and exits non-zero if any stored `id` does not match the recomputed value. Stale IDs are a machine-enforced, testable constraint. FR-005, the stale-ID edge case, and plan artifacts updated accordingly.
