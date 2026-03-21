# Contract: Location JSON Output Schema

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: `001-location-id-form`
**Contract type**: JSON output blob produced by `camping/location-form.html`
**Consumer**: Site maintainer (copy-paste into camping data files)
**Version after this feature**: v2 (adds `id`; normalizes `coords` to 4 decimal places)

---

## Purpose

`camping/location-form.html` is a maintenance tool. Its output is a JSON object that a
maintainer copies and pastes into the site's camping location data files. This contract
documents the guaranteed shape and semantics of that output blob, so that:

1. The implementation task can be validated against a precise spec.
2. Future changes to the form can be assessed for backward compatibility.
3. The standalone `location-id-gen.js` script (which reads existing data files) can
   be cross-checked for consistency with the form output.

---

## Output Object Schema

### Required Fields (always present)

| Key | Type | Description |
|-----|------|-------------|
| `id` | `string` | **FIRST KEY.** 8 lowercase hex characters. SHA-256 of `"${lat4},${lng4}"`, first 8 chars. |
| `name` | `string` | Location name, trimmed. |
| `url` | `string` | Website URL, trimmed. |
| `mapUrl` | `string` | Google Maps URL, trimmed. |
| `address` | `string` | Street address, trimmed. |
| `city` | `string` | City name, trimmed. |
| `state` | `string` | 2-character uppercase state abbreviation. |
| `zip` | `string` | ZIP code, trimmed. |
| `coords` | `[number, number]` | `[latitude, longitude]` each normalized to exactly 4 decimal places via `parseFloat(toFixed(4))`. |

### Optional Fields (present only when non-empty / applicable)

| Key | Type | Description |
|-----|------|-------------|
| `emoji` | `string` | Single emoji character, trimmed. |
| `phone` | `string` | Phone number, trimmed. |
| `email` | `string` | Email address, trimmed. |
| `emailName` | `string` | Contact name for email, trimmed. |
| `hours` | `string` | Business hours description, trimmed. |
| `siteMap` | `string` | Relative path to site map PDF, trimmed. |
| `season` | `string` | Operating season description, trimmed. |
| `bookingUrl` | `string` | Booking URL; present only when `bookingMethod === 'bookOnline'` and non-empty. |
| `distances` | `string[]` | Array of distance descriptions; one per non-empty textarea line. |
| `features` | `string[]` | Array of feature descriptions; one per non-empty textarea line. |
| `notes` | `string[]` | Array of notes; one per non-empty textarea line. |
| `defaultStart` | `boolean` (`true`) | Present and `true` only when "Yes" is selected. |

---

## `id` Field Contract

```
id = SHA-256("${lat.toFixed(4)},${lng.toFixed(4)}").hex.slice(0, 8)
```

| Property | Value |
|----------|-------|
| Algorithm | SHA-256 via `crypto.subtle.digest('SHA-256', TextEncoder.encode(coordStr))` |
| Input format | `"<lat4>,<lng4>"` — UTF-8 string, no spaces, comma-separated |
| Coordinate normalization | `parseFloat(raw).toFixed(4)` — exactly 4 decimal digits, half-up rounding |
| Output length | Exactly 8 characters |
| Character set | `[0-9a-f]` (lowercase hex) |
| Determinism | Same physical coordinate → same `id`, always |
| Compatibility | Identical to `location-id-gen.js` for the same normalized input |

### Example

```
Input:  latitude = "27.139"  longitude = "-82.45"
lat4  = "27.1390"
lng4  = "-82.4500"
coordStr = "27.1390,-82.4500"
id   = first 8 chars of SHA-256("27.1390,-82.4500") in hex
```

To verify: `node location-id-gen.js "27.1390,-82.4500"` must produce the same value.

---

## `coords` Field Contract

```
coords = [parseFloat(lat4), parseFloat(lng4)]
```

- Values are **numbers** (not strings) in the JSON output.
- Each value has at most 4 significant decimal digits after the decimal point (trailing
  zeros are dropped by `parseFloat`, e.g., `"27.1390"` → `27.139`).
- These values are consistent with the coordinate string used to derive `id`.

---

## Key Ordering

`id` is the first key in the serialized JSON object. All other keys follow in the order
they are assigned by the handler (as documented in `data-model.md`).

---

## Error Output (non-JSON)

When `crypto.subtle` is unavailable, the form renders a plain-text error message in the
output area instead of JSON. This is not a valid location record and must not be
copy-pasted into data files.

```
ID generation is not supported in this context.
Please open this file in Firefox, or serve it over HTTP/HTTPS.
```

---

## Versioning Notes

| Version | Change |
|---------|--------|
| v1 | Original output (no `id`; `coords` used raw `parseFloat` values) |
| v2 | Added `id` as first key; `coords` values normalized to 4 decimal places |

v2 is a **backward-compatible addition** for consumers that do not require `id`. For
consumers that generate IDs from raw coordinates, the `coords` normalization is a
**breaking change** for coordinates with more than 4 decimal places of precision (the
output now rounds them).
