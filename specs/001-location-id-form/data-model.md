# Data Model: Location ID Generation in Location Form

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: `001-location-id-form`
**Phase**: 1 — Design & Contracts

---

## Overview

This feature introduces no new persistent data stores, files, or schemas. All changes
are localized to the in-memory JavaScript object (`location`) assembled by the form's
submit handler before it is serialized to JSON and displayed. The data model described
here captures the structure of that in-memory object and the derivation pipeline for the
new `id` field.

---

## Entity: Location JSON Object

The generated JSON object is the primary output of `camping/location-form.html`. After
this feature, the object shape is:

```jsonc
{
  "id":           "<8-char hex>",       // NEW — always first key; derived from coords
  "name":         "<string>",           // required
  "url":          "<URL string>",       // required
  "mapUrl":       "<URL string>",       // required
  "address":      "<string>",           // required
  "city":         "<string>",           // required
  "state":        "<2-char uppercase>", // required
  "zip":          "<string>",           // required
  "coords":       [<number>, <number>], // required — normalized to 4 decimal places

  // Optional — present only when non-empty
  "emoji":        "<string>",
  "phone":        "<string>",
  "email":        "<string>",
  "emailName":    "<string>",
  "hours":        "<string>",
  "siteMap":      "<relative path>",
  "season":       "<string>",
  "bookingUrl":   "<URL string>",       // only when bookingMethod === 'bookOnline'
  "distances":    ["<string>", ...],    // array; one entry per textarea line
  "features":     ["<string>", ...],    // array; one entry per textarea line
  "notes":        ["<string>", ...],    // array; one entry per textarea line
  "defaultStart": true                  // boolean; present only when selected
}
```

### Changed Fields (vs. current implementation)

| Field | Before | After |
|-------|--------|-------|
| `id` | absent | first key; 8-char hex string |
| `coords[0]` (latitude) | `parseFloat(raw)` — may have arbitrary decimals | `parseFloat(raw.toFixed(4))` — exactly 4 decimal places |
| `coords[1]` (longitude) | `parseFloat(raw)` — may have arbitrary decimals | `parseFloat(raw.toFixed(4))` — exactly 4 decimal places |

---

## Entity: Location ID

| Attribute | Value |
|-----------|-------|
| **Type** | String |
| **Format** | Exactly 8 lowercase hexadecimal characters (`[0-9a-f]{8}`) |
| **Uniqueness** | Stable per coordinate pair; two records at the same 4-decimal-place location will share an `id` by design |
| **Source** | First 8 characters of the SHA-256 hex digest of the coordinate string |
| **Determinism** | Identical input → identical output; matches `location-id-gen.js` |

---

## Entity: Coordinate String (hash input)

The coordinate string is the normalized, canonical input to the SHA-256 function.

| Attribute | Value |
|-----------|-------|
| **Format** | `"<lat>,<lng>"` with no spaces |
| **Latitude** | `parseFloat(latField).toFixed(4)` — e.g., `"27.1392"` |
| **Longitude** | `parseFloat(lngField).toFixed(4)` — e.g., `"-82.4526"` |
| **Example** | `"27.1392,-82.4526"` |
| **Encoding** | UTF-8 via `TextEncoder` before digest |
| **Rounding** | Standard half-up (JavaScript `toFixed`) |

---

## Derivation Pipeline

```text
Form input
  ├── latitude  (raw string from <input type="number">)
  └── longitude (raw string from <input type="number">)
         │
         ▼
  Normalization
  ├── lat4 = parseFloat(latitude).toFixed(4)   → e.g., "27.1392"
  └── lng4 = parseFloat(longitude).toFixed(4)  → e.g., "-82.4526"
         │
         ▼
  Coordinate string
  └── coordStr = `${lat4},${lng4}`              → e.g., "27.1392,-82.4526"
         │
         ▼
  Encoding
  └── bytes = new TextEncoder().encode(coordStr)  → Uint8Array (UTF-8)
         │
         ▼
  Hash (async)
  └── hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
         │
         ▼
  Hex conversion
  └── hexStr = Array.from(new Uint8Array(hashBuffer))
                 .map(b => b.toString(16).padStart(2, '0'))
                 .join('')                       → 64-char hex string
         │
         ▼
  Truncation
  └── id = hexStr.slice(0, 8)                  → e.g., "a1b2c3d4"
```

---

## Validation Rules

| Field | Rule | Source |
|-------|------|--------|
| `latitude` | Required; numeric; browser `required` attribute enforces non-blank | FR-003 |
| `longitude` | Required; numeric; browser `required` attribute enforces non-blank | FR-003 |
| `id` | Derived; never user-supplied; always 8 lowercase hex chars | FR-001, FR-002 |
| `coords[0]` | Stored as `parseFloat(lat4)` — a number, not a string | FR-008 |
| `coords[1]` | Stored as `parseFloat(lng4)` — a number, not a string | FR-008 |
| `crypto.subtle` | Must be defined; if absent, abort with error — no JSON output | FR-010 |

---

## State Transitions

The submit handler is stateless (no DOM state changes during computation):

```text
User clicks "Generate JSON"
  │
  ├─[crypto.subtle absent]──▶ display error in #output → END (no JSON)
  │
  ├─[form invalid]──────────▶ browser validation UI → END (handler not called)
  │
  └─[crypto.subtle present, form valid]
       │
       ├── e.preventDefault()  (synchronous)
       ├── normalize lat4, lng4
       ├── build coordStr
       ├── await digest  (async — imperceptible latency, no UI state change)
       ├── derive id
       ├── build location object  (id first, then all other fields)
       ├── JSON.stringify(location, null, 2)
       ├── update #jsonOutput.textContent
       ├── add .show to #output
       └── scroll #output into view
```

---

## No New Files or Schemas

This feature does not introduce:
- New JSON data files in `camping/`
- New HTML pages or CSS files
- New JavaScript modules or external scripts
- Changes to any existing JSON data files

The only file modified is `camping/location-form.html`.
