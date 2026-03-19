# Contract: Location JSON Output

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase 1 output** | Branch: `001-location-form-ux` | Date: 2026-03-19
**Producer**: `camping/location-form.html` (Generate JSON button)
**Consumer**: `camping/florida-bound-locations.json` → Florida Bound planner

---

## Overview

The form produces a single JSON object representing one camping location entry.
The maintainer copies this object into `florida-bound-locations.json`. The contract
defines which keys are always present, which are conditional, and the exact emission
rules for the mutually exclusive booking fields.

---

## JSON Output Schema

```jsonc
{
  // --- Required fields (always present) ---
  "name":    "string — location display name",
  "url":     "string — website URL",
  "mapUrl":  "string — Google Maps URL",
  "address": "string — street address",
  "city":    "string — city name",
  "state":   "string — 2-char uppercase state code",
  "zip":     "string — ZIP code",
  "coords":  [number, number],          // [latitude, longitude]

  // --- Optional single-value fields (omitted when empty) ---
  "emoji":      "string — single emoji character",
  "siteMap":    "string — relative path to site map PDF",
  "contactUrl": "string — contact page URL",
  "phone":      "string — phone number",
  "email":      "string — email address",
  "emailName":  "string — name of email contact",
  "hours":      "string — operating hours description",
  "season":     "string — season description",

  // --- Booking (mutually exclusive; at most one may appear) ---
  // "bookingUrl" appears ONLY when "Book Online" is selected AND the field is non-empty.
  // "booking" is NEVER emitted by the new form (legacy records unaffected).
  // Absence of "bookingUrl" is the implicit "Call to Book" indicator.
  "bookingUrl": "string — online booking URL",   // conditional; see rules below

  // --- Optional array fields (omitted when empty; empty lines filtered) ---
  "distances": ["string", "..."],   // one entry per line from textarea
  "features":  ["string", "..."],   // one entry per line from textarea
  "notes":     ["string", "..."],   // one entry per line from textarea

  // --- Optional boolean field (omitted unless true) ---
  "defaultStart": true              // only when explicitly selected
}
```

---

## Booking Key Emission Rules

These rules supersede general optional-field handling and must be enforced in JS:

| Condition | `bookingUrl` emitted? | `booking` emitted? |
|-----------|----------------------|-------------------|
| Radio = "Call to Book" (any URL value) | ❌ Never | ❌ Never |
| Radio = "Book Online", URL non-empty | ✅ Yes | ❌ Never |
| Radio = "Book Online", URL empty | ❌ No | ❌ Never |

Both `bookingUrl` and `booking` MUST NOT appear simultaneously in any output object.

---

## Example Outputs

### Minimal valid entry (all required fields, no optional fields)

```json
{
  "name": "Mock Campground",
  "url": "https://example.com",
  "mapUrl": "https://maps.app.goo.gl/mock",
  "address": "1234 Mock Road",
  "city": "Osprey",
  "state": "FL",
  "zip": "34229",
  "coords": [27.1392, -82.4526]
}
```

### Full entry with "Book Online"

```json
{
  "name": "Oscar Scherer State Park",
  "emoji": "🌿",
  "coords": [27.1392, -82.4526],
  "zip": "34229",
  "city": "Osprey",
  "state": "FL",
  "address": "1843 S Tamiami Trail",
  "url": "https://www.floridastateparks.org/oscar-scherer",
  "mapUrl": "https://maps.app.goo.gl/abc123",
  "siteMap": "./site-map/OscarScherer.pdf",
  "contactUrl": "https://www.floridastateparks.org/contact",
  "phone": "941-483-5956",
  "email": "oscar.scherer@example.com",
  "emailName": "Park Ranger",
  "hours": "8am-sunset daily",
  "bookingUrl": "https://reserveamerica.com/camping/oscar-scherer/r/campsiteDetails.do",
  "season": "Year round",
  "distances": [
    "429 mi • 7 hrs from Smith Mountain",
    "300 mi • 5 hrs to Papa Lew's"
  ],
  "features": [
    "Electric hookups",
    "Water hookup",
    "RV Dump Station"
  ],
  "notes": [
    "Reservations required in season"
  ]
}
```

### Entry with "Call to Book" (no booking keys in output)

```json
{
  "name": "Myakka River State Park",
  "emoji": "🐊",
  "url": "https://www.floridastateparks.org/myakka-river",
  "mapUrl": "https://maps.app.goo.gl/myakka123",
  "address": "13207 SR-72",
  "city": "Sarasota",
  "state": "FL",
  "zip": "34241",
  "coords": [27.2296, -82.3143],
  "phone": "941-361-6511",
  "season": "Year round"
}
```

---

## Backward Compatibility Notes

- Existing records in `florida-bound-locations.json` that contain
  `"booking": "Call to book"` are **unaffected** — the form does not modify
  existing records.
- The new form will never emit a `booking` key; it only emits `bookingUrl`.
- The planner already treats absence of `bookingUrl` as "Call to Book" per the
  clarification session (2026-03-19).
- All other keys (`name`, `emoji`, `coords`, `zip`, `city`, `state`, `url`,
  `address`, `mapUrl`, `phone`, `email`, `emailName`, `hours`, `contactUrl`,
  `siteMap`, `season`, `distances`, `features`, `notes`, `defaultStart`) are
  unchanged in structure; `address`, `url`, and `mapUrl` are now always emitted
  (required fields), and `emoji` is now conditionally emitted (optional field,
  omitted when empty).
