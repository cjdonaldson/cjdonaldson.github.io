# Data Model: Location Record

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: 002-canonical-field-order
**Source**: `camping/florida-bound-locations.json`

---

## Entity: Location Record

A Location Record represents a single camping or RV-park stop in the Florida-bound
route data. Records are stored nested under `data.states[n].locations[m]` in
`camping/florida-bound-locations.json`.

### Canonical 22-Field Order

| Pos | Field | Required | Type | Notes |
|-----|-------|----------|------|-------|
| 1 | `id` | ✅ Required | `string` (8 hex chars) | SHA-256 of `lat,lng` truncated to 8 chars |
| 2 | `name` | ✅ Required | `string` | Display name of the location |
| 3 | `emoji` | Optional | `string` (1–2 chars) | Single emoji representing the location type |
| 4 | `url` | ✅ Required | `string` (URL) | Official website URL |
| 5 | `siteMap` | Optional | `string` (URL) | Link to the site map page |
| 6 | `mapUrl` | ✅ Required | `string` (URL) | Google Maps or directions URL |
| 7 | `bookingUrl` | Optional | `string` (URL) | Online reservation URL; omit if not applicable |
| 8 | `phone` | Optional | `string` | Phone number (e.g., `"222-321-4123"`) |
| 9 | `email` | Optional | `string` | Contact email address |
| 10 | `emailName` | Optional | `string` | Display name for the email contact |
| 11 | `address` | ✅ Required | `string` | Street address |
| 12 | `city` | ✅ Required | `string` | City |
| 13 | `state` | ✅ Required | `string` (2-char) | State abbreviation, uppercase (e.g., `"FL"`) |
| 14 | `zip` | ✅ Required | `string` | ZIP code |
| 15 | `coords` | ✅ Required | `[number, number]` | `[latitude, longitude]`, 4 decimal places |
| 16 | `pricing` | Optional | `Array<{[label]: string}>` | One object per rate type; key is label, value is price string. **Not currently emitted by `location-form.html`.** |
| 17 | `hours` | Optional | `string` | Operating hours (e.g., `"Mon-Fri 8am-8pm \| Sat-Sun 9:30am-6pm"`) |
| 18 | `season` | Optional | `string` | Open season (e.g., `"Year round"`) |
| 19 | `distances` | Optional | `string[]` | Route distances from reference points (e.g., `"425 mi • 7 hrs from 18077"`) |
| 20 | `features` | Optional | `string[]` | Amenity/feature tags (e.g., `"RV propane fill"`) |
| 21 | `notes` | Optional | `string[]` | Free-form notes about the location |
| 22 | `defaultStart` | Optional | `boolean` | `true` if this is the default trip start location; omit otherwise |

### Field Cluster Groupings

```
Identity    : id (1), name (2)
Discovery   : emoji (3), url (4), siteMap (5), mapUrl (6)
Booking     : bookingUrl (7), phone (8), email (9), emailName (10)
Address     : address (11), city (12), state (13), zip (14), coords (15)
Operational : pricing (16), hours (17), season (18), distances (19),
              features (20), notes (21), defaultStart (22)
```

### Validation Rules

- Required fields (`id`, `name`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`,
  `coords`) MUST be present in every record.
- Optional fields MUST be **omitted entirely** (not `null`, not `""`, not `[]`) when
  they have no value.
- `emailName` MAY be absent even when `email` is present; its absence does not shift
  the position of other fields.
- `bookingUrl` is conditionally present: only when booking is done via an online
  reservation system. The form gates this on a booking-method selector.
- `defaultStart` is `true` (boolean) when present. It is never `false`; the field is
  simply absent when the location is not the default start.
- `pricing` is an array of single-key objects. Each key is a human-readable rate label;
  its value is a price string (e.g., `"58.00"`).
- `coords` is a two-element array `[latitude, longitude]` with values rounded to 4
  decimal places.

### State Transitions

Location records are immutable data blobs — there are no lifecycle state transitions.
Records are added, corrected, or removed as maintenance edits.

---

## Entity: State Container

Wraps location records by U.S. state. Not modified by this feature.

| Field | Type | Notes |
|-------|------|-------|
| `state` | `string` | State name or abbreviation (varies in existing data) |
| `locations` | `Location[]` | Array of Location Records for this state |

---

## File Structure

```json
{
  "states": [
    {
      "state": "...",
      "locations": [
        { ...Location Record... },
        ...
      ]
    },
    ...
  ]
}
```

Top-level structure: object with one key `states`. Value is array of 6 state objects
containing a combined 23 location records.
