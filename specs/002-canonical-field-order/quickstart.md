# Quickstart: Canonical Field Order — Implementation Guide

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: 002-canonical-field-order
**Branch**: `002-canonical-field-order`
**For**: Implementer executing `tasks.md`

---

## What This Feature Does

Three coordinated changes:

1. **Schema doc** (`contracts/location-record.md`) — already written; no code change.
2. **Data reorder** — reorder the 7 out-of-order records in
   `camping/florida-bound-locations.json` using a one-shot Python script.
3. **Form fix** — rewrite the JSON generator block in `camping/location-form.html`
   so fields are assigned in canonical order (positions 1–22).

Zero field values change. No new dependencies.

---

## Work Stream 1 — Data File Reorder

### Approach

Run a Python script that:
1. Reads `florida-bound-locations.json`
2. For each location record, rebuilds the object by iterating the canonical key list
   and picking only keys present in that record
3. Writes the file back with `json.dumps(indent=2)`

### Canonical Key List (Python)

```python
CANONICAL = [
    'id', 'name', 'emoji', 'url', 'siteMap', 'mapUrl', 'bookingUrl',
    'phone', 'email', 'emailName', 'address', 'city', 'state', 'zip',
    'coords', 'pricing', 'hours', 'season', 'distances', 'features',
    'notes', 'defaultStart',
]
```

### Reorder Function

```python
def reorder(record, canonical):
    present = set(record.keys())
    reordered = {k: record[k] for k in canonical if k in present}
    # Preserve any unrecognized fields at the end (schema guard)
    extras = {k: record[k] for k in record if k not in present or k not in canonical}
    if extras:
        raise ValueError(f"Unrecognized fields in record {record.get('id')}: {list(extras)}")
    return reordered
```

### Verify Before Committing

```python
# After reorder: confirm 7 records changed, 16 unchanged, zero value changes
import json, copy

with open('camping/florida-bound-locations.json') as f:
    original = json.load(f)
with open('camping/florida-bound-locations.json') as f:  # after rewrite
    updated = json.load(f)

orig_locs = [loc for s in original['states'] for loc in s['locations']]
upd_locs  = [loc for s in updated['states'] for loc in s['locations']]

changed = sum(1 for o, u in zip(orig_locs, upd_locs) if list(o.keys()) != list(u.keys()))
val_same = all(o == u for o, u in zip(orig_locs, upd_locs))  # values match despite key order diff
print(f"Records reordered: {changed}")   # expect 7
print(f"All values identical: {val_same}")  # expect True
```

### Records That Must Change

| id | Current issue | Fix |
|----|--------------|-----|
| `0450fbdd` | `notes` before `address` | Move `notes` after `coords`, `pricing` |
| `926cae37` | `features` before `distances` | Swap `features` ↔ `distances` |
| `1f25e7ca` | `features` before `distances` | Swap `features` ↔ `distances` |
| `1d3b7719` | `features` before `distances` | Swap `features` ↔ `distances` |
| `674cc343` | `season` after `distances` | Move `season` before `distances` |
| `8b6ab13e` | `notes` and `email` out of order | Move both to canonical positions |
| `413a7acf` | `defaultStart` before `city`; `notes` before `distances` | Rebuild in full canonical order |

---

## Work Stream 2 — Form Handler Reorder

### File

`camping/location-form.html` — single-file static HTML. The JS generator block is
the `submit` event listener on `#locationForm` (lines 390–477).

### Current vs. Required Assignment Order

**Current order** (buggy):
```js
const location = { id };
location.name = ...;
location.address = ...;    // ← wrong: pos 11 assigned at pos 2
location.url = ...;
location.mapUrl = ...;
location.coords = [...];
location.zip = ...;
location.city = ...;
location.state = ...;
// emoji optional
// loop: phone, email, emailName, hours, siteMap, season  ← siteMap/hours out of place
// bookingUrl conditional                                 ← should be pos 7
// loop: distances, features, notes
// defaultStart
```

**Required order** (canonical positions 1–22):
```js
const location = { id };           // pos 1
location.name = ...;               // pos 2
if (emoji) location.emoji = ...;   // pos 3 (optional)
location.url = ...;                // pos 4
if (siteMap) location.siteMap = ...; // pos 5 (optional)
location.mapUrl = ...;             // pos 6
if (bookingUrl) location.bookingUrl = ...; // pos 7 (optional, conditional)
if (phone) location.phone = ...;   // pos 8 (optional)
if (email) location.email = ...;   // pos 9 (optional)
if (emailName) location.emailName = ...; // pos 10 (optional)
location.address = ...;            // pos 11
location.city = ...;               // pos 12
location.state = ...;              // pos 13
location.zip = ...;                // pos 14
location.coords = [...];           // pos 15
// pricing (pos 16) — not in form; skip
if (hours) location.hours = ...;   // pos 17 (optional)
if (season) location.season = ...; // pos 18 (optional)
if (distances) location.distances = [...]; // pos 19 (optional array)
if (features) location.features = [...];   // pos 20 (optional array)
if (notes) location.notes = [...];         // pos 21 (optional array)
if (defaultStart) location.defaultStart = true; // pos 22 (optional boolean)
```

### Key Change Detail

Replace the current block spanning lines 409–468 with the canonical-ordered block
above. **Preserve all existing conditional logic exactly**:
- `emoji`: emit when `formData.get('emoji')?.trim()` is truthy
- `siteMap`, `phone`, `email`, `emailName`, `hours`, `season`: emit when
  `formData.get(field)?.trim()` is truthy
- `bookingUrl`: emit only when `#bookingMethod.value === 'bookOnline'` AND
  `#bookingUrl.value.trim()` is non-empty
- `distances`, `features`, `notes`: split textarea by newline, filter blanks, emit
  array when at least one item remains
- `defaultStart`: emit `true` only when `formData.get('defaultStart') === 'true'`

The `optionalFields` loop and `arrayFields` loop are replaced by explicit individual
assignments — this makes the order unambiguous and removes the source of bugs.

### Verification

1. Open `camping/location-form.html` in a browser (via `http://` or file served over
   `https://` for `crypto.subtle`).
2. Fill in all fields including all optional ones.
3. Click Generate.
4. Inspect the JSON output — keys must appear in canonical order.
5. Repeat with only required fields — only required fields appear, in canonical order.
6. Verify `bookingUrl` appears at position 7 (after `mapUrl`, before `phone`) when
   Book Online is selected.

---

## Quick Reference: Canonical Order (Cheat Sheet)

```
 1  id          (required)
 2  name        (required)
 3  emoji       (optional)
 4  url         (required)
 5  siteMap     (optional)
 6  mapUrl      (required)
 7  bookingUrl  (optional — Book Online only)
 8  phone       (optional)
 9  email       (optional)
10  emailName   (optional)
11  address     (required)
12  city        (required)
13  state       (required)
14  zip         (required)
15  coords      (required)
16  pricing     (optional — data only; not in form)
17  hours       (optional)
18  season      (optional)
19  distances   (optional array)
20  features    (optional array)
21  notes       (optional array)
22  defaultStart (optional boolean)
```
