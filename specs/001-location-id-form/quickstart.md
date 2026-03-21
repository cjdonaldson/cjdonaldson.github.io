# Quickstart: Testing Location ID Generation

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: `001-location-id-form`
**Audience**: Developer implementing or reviewing this feature

---

## Prerequisites

- Firefox (required for `file://` testing — Chrome blocks `crypto.subtle` on `file://`)
- Node.js (for cross-checking `id` values against `location-id-gen.js`)
- Repository cloned at a local path

---

## Quick Test: Happy Path

### 1. Open the form in Firefox

```bash
# From repository root — open directly from filesystem
firefox camping/location-form.html
```

Or serve over HTTP for any browser:

```bash
# Python 3 (any directory)
python3 -m http.server 8080
# Then open: http://localhost:8080/camping/location-form.html
```

### 2. Fill in minimum required fields

Use these test coordinates (chosen to produce a known `id`):

| Field | Value |
|-------|-------|
| Name | `Test Location` |
| Website URL | `https://example.com` |
| Google Maps URL | `https://maps.app.goo.gl/test` |
| Latitude | `27.1392` |
| Longitude | `-82.4526` |
| Street Address | `123 Test St` |
| City | `Sarasota` |
| State | `FL` |
| ZIP Code | `34230` |

### 3. Click **Generate JSON**

Scroll down to see the output. Expected result shape:

```json
{
  "id": "xxxxxxxx",
  "name": "Test Location",
  "address": "123 Test St",
  "url": "https://example.com",
  "mapUrl": "https://maps.app.goo.gl/test",
  "coords": [27.1392, -82.4526],
  "zip": "34230",
  "city": "Sarasota",
  "state": "FL"
}
```

- `id` must be the **first key** in the output.
- `id` must be exactly 8 lowercase hex characters.
- `coords` values must be `27.1392` and `-82.4526` (normalized, not raw).

### 4. Cross-check `id` against `location-id-gen.js`

```bash
node location-id-gen.js "27.1392,-82.4526"
```

The value printed must exactly match the `"id"` in the form output.

---

## Test: Coordinate Normalization (User Story 2)

### Under-specified decimals

1. Enter latitude `27.14` and longitude `-82.45`
2. Generate JSON
3. Check that `coords` is `[27.14, -82.45]` (stored as `27.1400` → `parseFloat` → `27.14`)
4. Run: `node location-id-gen.js "27.1400,-82.4500"`
5. The `id` in the form output must match.

### Over-specified decimals

1. Enter latitude `27.13920` and longitude `-82.45260`
2. Generate JSON
3. Check that `id` matches `node location-id-gen.js "27.1392,-82.4526"`
   (5th decimal is dropped by `toFixed(4)` half-up rounding)

### Exact 4 decimals (no change)

1. Enter latitude `27.1392` and longitude `-82.4526`
2. Output `id` must match `node location-id-gen.js "27.1392,-82.4526"` — same as
   Quick Test above.

---

## Test: `crypto.subtle` Unavailable (Error Path)

1. Open `camping/location-form.html` in **Chrome** using `file://` (drag-and-drop the
   file onto a Chrome window, or use `File > Open` in Chrome)
2. Fill in any valid form data
3. Click **Generate JSON**
4. Expected: the output area shows an error message containing the phrase
   *"not supported in this context"* and instructions to use Firefox or HTTP/HTTPS
5. Confirm: no JSON object is displayed

---

## Test: No Regressions (User Story — FR-005)

After applying the change, verify all existing behaviors still work:

| Behavior | How to test |
|----------|-------------|
| Browser field validation | Leave a required field blank; click Generate JSON — browser should show validation UI, no JSON produced |
| Optional fields omitted | Leave optional fields blank; confirm they are absent from JSON output |
| Array fields (features, notes, distances) | Enter multi-line values; confirm JSON arrays are correct |
| Copy to Clipboard | Generate JSON; click Copy button; paste into a text editor and confirm content matches |
| Clear Form | Click Clear Form; confirm all fields reset and output area hides |
| Booking URL | Switch reservation to "Book Online"; enter a URL; confirm `bookingUrl` appears in JSON |

---

## Acceptance Checklist

- [x] `id` is present in every generated JSON blob
- [x] `id` is the first key in the JSON object
- [x] `id` is exactly 8 lowercase hex characters
- [x] `id` matches `node location-id-gen.js` for at least 3 coordinate pairs
- [x] `coords` values are normalized 4-decimal numbers (not raw user input)
- [x] Chrome over `file://` shows error and produces no JSON
- [x] Firefox over `file://` works correctly
- [x] All pre-existing form behaviors pass the regression check above
- [x] File size increase is ≤2 KB over the pre-change baseline
