# Quickstart: Generating and Verifying Location IDs

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: `001-add-location-ids`

This guide shows how to generate, verify, or regenerate a location `id` using
only a browser console or Node.js — no libraries required.

---

## The Formula

The `id` for a location is the **first 8 characters** of the SHA-256 hex digest
of the UTF-8 string `"<lat toFixed(4)>,<lng toFixed(4)>"`, where `lat` and `lng`
are the JavaScript `Number` values from the location's `coords` array, formatted
to exactly 4 decimal places. Because all `coords` values in the JSON source are
required to have exactly 4 decimal places (FR-008), the formula input always
matches what is written in the file.

---

## In a Browser Console

Open DevTools (F12) → Console tab and paste:

```js
async function locationId(lat, lng) {
  const input = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8);
}

// Example: Royal Coachman [27.1392, -82.4526]
locationId(27.1392, -82.4526).then(id => console.log(id));
// Expected output: 5c4ce2cb
```

The result should match the `id` already stored in
`camping/florida-bound-locations.json` for that location.

---

## In Node.js (for batch validation or generation)

```js
import { createHash } from 'crypto';

function locationId(lat, lng) {
  const input = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  return createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 8);
}

// Example: Flywheeler Park [27.7536, -81.7787]
console.log(locationId(27.7536, -81.7787)); // → 5fd7359d
```

Run with: `node --input-type=module < script.mjs`

---

## Adding an ID for a New Location

1. Obtain the GPS coordinates for the new location (e.g., right-click in
   Google Maps → "What's here?").
2. Run the formula in a browser console with the new coordinates.
3. Verify the result does not match any existing `id` in the file:
   ```bash
   grep '"id"' camping/florida-bound-locations.json
   ```
4. Add the `id` field as the **first key** of the new location object in the
   JSON file.

---

## Pre-Commit Validation

### Validation Script (preferred — covers all checks including stale-ID detection)

Run the required validation script from the repository root:

```bash
./validate-ids.sh
# or directly:
node validate-ids.js camping/florida-bound-locations.json
```

The script exits `0` on success. On any violation it exits non-zero and prints a
human-readable error identifying which location failed and why. Checks performed:

- Every location has an `id` field
- Every `id` matches the format `/^[0-9a-f]{8}$/`
- All `id` values are unique across the file
- Each stored `id` matches the value recomputed from its `coords` (stale-ID detection)

### Manual One-Liners (secondary / spot-check)

Requires `jq`:

```bash
# All locations have an id field
jq '[.. | objects | select(has("coords")) | has("id")] | all' \
  camping/florida-bound-locations.json

# All ids are unique
jq '[.. | objects | .id? // empty] | (length == (unique | length))' \
  camping/florida-bound-locations.json

# All ids match the 8-hex-char format
jq '[.. | objects | .id? // empty] | map(test("^[0-9a-f]{8}$")) | all' \
  camping/florida-bound-locations.json
```

All three should return `true`. Note: these one-liners do **not** check for stale IDs
(stored `id` vs recomputed value from `coords`); use the validation script for that.

---

## Reference: All 23 IDs

| id | Location | State |
|----|----------|-------|
| `5c4ce2cb` | Royal Coachman | FL |
| `0450fbdd` | Papa Lew's | FL |
| `5fd7359d` | Flywheeler Park | FL |
| `7e1e55c0` | Camping World Roanoke | VA |
| `a1122425` | Smith Mountain Campground | VA |
| `cf0b163f` | Indian Heritage RV Park | VA |
| `1a3f891d` | Hidden Acres Family Campground | VA |
| `7d5692f4` | South 40 Campground | VA |
| `37ffd3de` | Shenandoah River State Park | VA |
| `1092cc3b` | Cattail Creek Campground | VA |
| `bf531552` | Spacious Skies Sandy Run | NC |
| `926cae37` | Florence RV Park | SC |
| `cce6e85c` | Spacious Skies Campgrounds Savannah | GA |
| `1f25e7ca` | Country Oaks Campground & RV | GA |
| `1d3b7719` | Eagle's Roost RV Resort | GA |
| `674cc343` | Deep Bend Landing | GA |
| `c8474e10` | Lake Harmony RV Park | GA |
| `8b6ab13e` | Okefenokee RV Park | GA |
| `90817842` | Jenny Ridge RV Park | GA |
| `62369192` | McIntosh Lake RV Park | GA |
| `413a7acf` | Riegelsville | PA |
| `d1bac0ce` | Cabela's Hamburg | PA |
| `9bb9e11b` | Camping World Hamburg | PA |
