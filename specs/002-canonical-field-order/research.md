# Research: Canonical JSON Field Order for Location Records

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase**: 0 — Outline & Research
**Feature**: 002-canonical-field-order
**Status**: Complete — all unknowns resolved

---

## R-01 · JSON Object Key Ordering in JavaScript

**Question**: Does `JSON.stringify` reliably preserve insertion order for location
record fields? Is there any edge case that could break canonical ordering?

**Decision**: Assign fields to the output object in canonical order; rely on
`JSON.stringify` to emit them in that order.

**Rationale**: ECMAScript 2015 (ES6) specifies that plain string keys in an object
follow insertion order when enumerated — provided the key is not an array index
(non-negative integer string). All 22 location record field names (`id`, `name`,
`emoji`, …, `defaultStart`) are non-integer strings, so insertion order is guaranteed.
`JSON.stringify` uses `[[OwnPropertyKeys]]` which respects this order. All target
browsers (evergreen) and Node.js have followed this behavior since 2015.

**Alternatives considered**: Post-processing via a key-sort step. Rejected: unnecessary
complexity; insertion order is simpler, and it makes the intent explicit in code.

---

## R-02 · Data File Structure

**Question**: What is the exact structure of `camping/florida-bound-locations.json`?
Are location records flat at the top level or nested?

**Finding**: The file contains a single root object with one key, `states`, whose value
is an array of 6 state objects. Each state object has a `locations` array. Total: 23
location records nested at `data.states[n].locations[m]`.

**Impact on data reorder**: A reorder script must walk `states[].locations[]`, reorder
each record's keys, and write back the file preserving outer structure and formatting.

---

## R-03 · Out-of-Order Records

**Question**: Which specific records need reordering?

**Finding**: Exactly 7 records are out of canonical order (confirmed by automated
key-position scan):

| id | Name | Issue |
|---------|------|-------|
| `0450fbdd` | Papa Lew's | `notes` appears before `address` (pos 21 → 11) |
| `926cae37` | Florence RV Park | `features` appears before `distances` (pos 20 → 19) |
| `1f25e7ca` | Country Oaks Campground | `features` appears before `distances` |
| `1d3b7719` | Eagle's Roost RV Resort | `features` appears before `distances` |
| `674cc343` | Deep Bend Landing | `season` appears after `distances` (pos 18 → 19) |
| `8b6ab13e` | Okefenokee RV Park | `notes` and `email` swapped (notes pos 21, email pos 9) |
| `413a7acf` | Riegelsville | `defaultStart` before `city` (pos 22 → 12); `notes` before `distances` |

The remaining 16 records are already in canonical order and MUST NOT be modified.

---

## R-04 · Form Field Assignment — Current vs. Required Order

**Question**: What is the current field assignment order in `location-form.html` and
what must change?

**Current assignment sequence** (lines 409–468):
```
id → name → address → url → mapUrl → coords → zip → city → state
  → [emoji?]
  → loop(['phone','email','emailName','hours','siteMap','season'])
  → [bookingUrl?]
  → loop(['distances','features','notes'])
  → [defaultStart?]
```

**Problems**:
1. `address` (pos 11) assigned immediately after `name` (pos 2) — should come after
   the entire contact cluster.
2. `url` and `mapUrl` assigned after `address` — both should precede `phone`/email.
3. `coords` (pos 15), `zip` (pos 14), `city` (pos 12), `state` (pos 13) assigned in
   wrong relative order and far too early.
4. `emoji` inserted after all required fields — must come after `name`, before `url`.
5. `optionalFields` array omits positional context: `siteMap` (pos 5) appears last
   in the loop after `emailName` (pos 10); `hours` (pos 17) loops with contact fields.
6. `bookingUrl` emitted after the optionalFields loop, which comes after `emailName` —
   but bookingUrl must be at pos 7, between `mapUrl` and `phone`.

**Required assignment sequence** (canonical positions 1–22):
```
id (1) → name (2) → [emoji (3)?] → url (4) → [siteMap (5)?] → mapUrl (6)
  → [bookingUrl (7)?]
  → [phone (8)?] → [email (9)?] → [emailName (10)?]
  → address (11) → city (12) → state (13) → zip (14) → coords (15)
  → [pricing (16)  — not in form, skip]
  → [hours (17)?] → [season (18)?]
  → [distances (19)?] → [features (20)?] → [notes (21)?]
  → [defaultStart (22)?]
```

**Decision**: Rewrite the generator block as a single linear sequence of explicit
`if`-guarded assignments, one field at a time, in canonical position order. This is
clearer than the current mixed approach of direct assignment, a loop, and conditional
blocks, and eliminates the ordering bugs.

---

## R-05 · `pricing` Field — Form vs. Data Discrepancy

**Question**: The spec mentions `pricing` as an optional form field (US3 AC-2), but
`pricing` is absent from `location-form.html`. What is its data type and status?

**Finding**: `pricing` appears in 17 of 23 records as an **array of single-key
objects**, e.g., `[{"fhu back-in": "58.00"}]`. The form has no `pricing` input element
and no pricing assignment in the JS generator. This is a pre-existing gap, not
introduced by this feature.

**Decision**: `pricing` is documented in the canonical schema at its defined position
(pos 16) as optional. The form fix restores correct field ORDER for the fields it
already emits; adding `pricing` to the form is out of scope for this feature. The
schema document notes the form gap.

---

## R-06 · Records Already Compliant — Non-Modification Guarantee

**Question**: How do we guarantee the 16 already-correct records are not changed?

**Decision**: The reorder script reconstructs each record by filtering the canonical
key list to only the keys present in that record. Records whose key sequence already
matches produce an identical object — no byte changes. The output JSON is formatted
with `json.dumps(indent=2)` to match the existing file indentation. A post-run diff
confirms zero value changes.

---

## Summary: All Unknowns Resolved

| ID | Unknown | Resolution |
|----|---------|------------|
| R-01 | JS key order guarantee | ES2015 insertion order; no risk for string keys |
| R-02 | JSON file structure | Nested: `states[].locations[]`, 23 total records |
| R-03 | Which records need fix | 7 identified; 16 already canonical |
| R-04 | Form order issues | 6 ordering bugs found; full rewrite of generator block |
| R-05 | `pricing` in form | Absent from form; out of scope for this feature |
| R-06 | Non-modification guarantee | Filter-to-present-keys approach; diff confirmation |
