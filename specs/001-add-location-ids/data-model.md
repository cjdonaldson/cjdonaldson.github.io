# Data Model: Add Stable Location IDs

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase**: 1 — Design & Contracts
**Feature**: `001-add-location-ids`

---

## File Under Change

**`camping/florida-bound-locations.json`**

Top-level structure (unchanged):

```json
{
  "states": [ <StateObject>, ... ]
}
```

---

## StateObject (unchanged)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | State full name |
| `emoji` | string | yes | Display emoji |
| `open` | boolean | yes | Whether state section is expanded |
| `locations` | `LocationObject[]` | yes | Ordered list of locations |

---

## LocationObject — Before & After

### Before (current schema)

```json
{
  "name": "string",
  "emoji": "string",
  ...other fields in arbitrary order...
  "coords": [number, number]
}
```

### After (target schema)

```json
{
  "id": "8-char lowercase hex string",
  "name": "string",
  "emoji": "string",
  ...other fields preserved in original order...
  "coords": [number, number]
}
```

**Key ordering rule**: `id` MUST be the first key. All other keys remain in
their current order (FR-002).

---

## LocationObject Field Reference

| Field | Type | Required | Position | Notes |
|-------|------|----------|----------|-------|
| `id` | string | **yes (new)** | **first** | 8 lowercase hex chars, SHA-256-derived from `coords` |
| `name` | string | yes | 2nd | Human-readable campground name |
| `emoji` | string | yes | 3rd | Display emoji (may be `"?"` or `"x"` placeholders) |
| `url` | string | no | — | Campground info or maps link |
| `siteMap` | string | no | — | Relative path to site-map image or PDF |
| `mapUrl` | string | no | — | Google Maps deep-link |
| `bookingUrl` | string | no | — | Online reservation link |
| `phone` | string | no | — | Contact phone number |
| `email` | string | no | — | Contact email address |
| `emailName` | string | no | — | Contact name for email |
| `address` | string | no | — | Street address |
| `city` | string | yes | — | City name |
| `state` | string | yes | — | Two-letter state abbreviation |
| `zip` | string | no | — | ZIP code |
| `coords` | `[number, number]` | **yes (ID source)** | — | `[latitude, longitude]`; source for `id` derivation |
| `pricing` | object[] | no | — | Array of `{ "descriptor": "price" }` objects |
| `features` | string[] | no | — | Notable features list |
| `notes` | string[] | no | — | Arbitrary maintainer notes |
| `hours` | string | no | — | Operating hours |
| `season` | string | no | — | Open season description |
| `distances` | string[] | no | — | Human-readable distances from reference points |
| `defaultStart` | boolean | no | — | Marks the default trip start location |

---

## ID Field Specification

### Derivation Rule (FR-004)

```
input  = `${lat.toFixed(4)},${lng.toFixed(4)}`   // always 4 decimal places
digest = SHA-256(UTF-8(input))                     // 32 bytes
id     = hex(digest).slice(0, 8)                   // first 8 hex characters (4 bytes)
```

### Constraints

- Format: `/^[0-9a-f]{8}$/` (FR-003)
- Uniqueness: must be globally unique across all locations in the file (FR-005)
- Stability: changes only if `coords` changes (FR-004)
- Reproducibility: computable in a browser console with no libraries (FR-007)

### Coordinate Precision Rule (FR-008)

All `coords` values in the JSON source MUST be written with exactly 4 decimal places.
Using `toFixed(4)` in the formula ensures the hash input is always identical to what is
written in the file. A coordinate with fewer or more than 4 decimal places is a data error
and must be corrected before an `id` is assigned or committed.

**Valid**: `[36.5964, -77.5850]`, `[27.1392, -82.4526]`, `[34.8396, -78.9830]`

**Invalid**: `[36.5964, -77.585]` (3 decimal places), `[27.14, -82.45]` (2 decimal places),
`[27.13920, -82.45260]` (5 decimal places)

---

## Pre-Change / Post-Change Example

### Before

```json
{
  "name": "Royal Coachman",
  "emoji": "⛱️",
  "url": "https://rvonthego.com/florida/royal-coachman-rv-resort/",
  "city": "Nokomis",
  "state": "FL",
  "coords": [27.1392, -82.4526]
}
```

### After

```json
{
  "id": "5c4ce2cb",
  "name": "Royal Coachman",
  "emoji": "⛱️",
  "url": "https://rvonthego.com/florida/royal-coachman-rv-resort/",
  "city": "Nokomis",
  "state": "FL",
  "coords": [27.1392, -82.4526]
}
```

---

## Validation Checklist (pre-commit)

| Check | Method |
|-------|--------|
| Every location has an `id` field | `jq '[.. | objects | select(has("coords")) | has("id")] | all'` |
| All `id` values match format `/^[0-9a-f]{8}$/` | `jq '[.. | objects | .id? // empty] | map(test("^[0-9a-f]{8}$")) | all'` |
| All `id` values are unique | `jq '[.. | objects | .id? // empty] | (length == (unique | length))'` |
| `id` is the first key in each location | Manual diff inspection; or `jq` key-order verification |
| Re-computing formula matches stored `id` for all locations | `validate-ids.js` — script recomputes each `id` from `coords` and exits non-zero on any mismatch (SC-004) |
| All coordinates have exactly 4 decimal places | Inspect raw JSON source; regex `/\d\.\d{4}[^0-9]/` on each coord value |
