# Contract: Location Record — Canonical Field Schema

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: 002-canonical-field-order
**Implements**: FR-001, FR-002, FR-007, FR-008
**Status**: Authoritative reference — supersedes all prior informal definitions

---

## Purpose

This document is the single authoritative reference that defines which fields a
location record may contain, which are required vs. optional, what type each value
must be, and what position each field occupies in canonical order. Any location
record in `camping/florida-bound-locations.json` and any JSON blob produced by
`camping/location-form.html` MUST conform to this schema.

---

## Canonical Field Order

```
 1  id            required   string (8 hex chars)
 2  name          required   string
 3  emoji         optional   string (1–2 chars emoji)
 4  url           required   string (URL)
 5  siteMap       optional   string (URL)
 6  mapUrl        required   string (URL)
 7  bookingUrl    optional   string (URL)
 8  phone         optional   string
 9  email         optional   string
10  emailName     optional   string
11  address       required   string
12  city          required   string
13  state         required   string (2-char uppercase)
14  zip           required   string
15  coords        required   [number, number]
16  pricing       optional   Array<{[label: string]: string}>
17  hours         optional   string
18  season        optional   string
19  distances     optional   string[]
20  features      optional   string[]
21  notes         optional   string[]
22  defaultStart  optional   boolean (true only; omit when false)
```

---

## Field Reference

### Identity Cluster (positions 1–2)

**`id`** — Required — `string`
- 8 hex character identifier derived from `SHA-256(lat.toFixed(4) + "," + lng.toFixed(4))`, first 8 characters of the hex digest.
- Example: `"a1122425"`
- Unique within the data file.

**`name`** — Required — `string`
- Human-readable display name of the campground or location.
- Example: `"Smith Mountain Campground"`

### Discovery Cluster (positions 3–6)

**`emoji`** — Optional — `string`
- A single emoji character (1–2 UTF-16 code units) representing the location type.
- Omit when no emoji has been assigned.
- Example: `"🏕️"`

**`url`** — Required — `string`
- The official website URL for the location.
- Example: `"https://www.smithmountaincampground.com"`

**`siteMap`** — Optional — `string`
- URL to a site map or site-layout page showing individual site positions.
- Omit when no site map is available.

**`mapUrl`** — Required — `string`
- A Google Maps (or equivalent) URL for directions to the location.

### Booking / Contact Cluster (positions 7–10)

**`bookingUrl`** — Optional — `string`
- Online reservation URL. Present only when the location uses an online booking system.
- In `location-form.html`: emitted only when the booking method selector is set to "Book Online" and a URL is entered.

**`phone`** — Optional — `string`
- Contact phone number.
- Example: `"222-321-4123"`

**`email`** — Optional — `string`
- Contact email address.

**`emailName`** — Optional — `string`
- Display name for the email contact (e.g., the person or department to reach).
- MAY be absent even when `email` is present.

### Address / Location Cluster (positions 11–15)

**`address`** — Required — `string`
- Street address.

**`city`** — Required — `string`
- City name.

**`state`** — Required — `string`
- Two-character state abbreviation, uppercase.
- Example: `"FL"`, `"VA"`, `"GA"`

**`zip`** — Required — `string`
- ZIP or postal code.

**`coords`** — Required — `[number, number]`
- Geographic coordinates `[latitude, longitude]`.
- Both values are rounded to 4 decimal places.
- Example: `[36.9039, -79.6389]`

### Operational Cluster (positions 16–22)

**`pricing`** — Optional — `Array<{[label: string]: string}>`
- Rate information. Each element is a single-key object where the key is a
  human-readable rate label and the value is a price string.
- Example: `[{"fhu back-in": "58.00"}]`
- **Note**: `location-form.html` does not currently support adding pricing; this
  field must be added manually when relevant.

**`hours`** — Optional — `string`
- Operating hours.
- Example: `"Mon-Fri 8am-8pm | Sat-Sun 9:30am-6pm"`
- Canonical position: 17 — after `pricing`, before `season`.

**`season`** — Optional — `string`
- Open season description.
- Example: `"Year round"`, `"May–October"`

**`distances`** — Optional — `string[]`
- Array of route-distance strings from named reference points.
- Example: `["425 mi • 7 hrs from 18077"]`

**`features`** — Optional — `string[]`
- Array of amenity or feature tags.
- Example: `["RV propane fill", "RV Dump Station", "Good Sam Discount"]`

**`notes`** — Optional — `string[]`
- Array of free-form notes about the location.
- Example: `["Private", "Members only"]`

**`defaultStart`** — Optional — `boolean`
- Set to `true` when this location is the default trip start point.
- The field is **omitted entirely** when the location is not the default start.
- Never set to `false`; absence implies false.

---

## Ordering Rules for Optional Fields

When optional fields are absent, the remaining present fields maintain their canonical
positions relative to one another. Absence of a field does NOT cause adjacent fields to
shift their canonical index — canonical position numbers are fixed. The correct field
order is determined by sorting present fields by their canonical position number.

**Example**: A record with `pricing` but no `season` or `distances` places `pricing`
at its canonical slot (pos 16), then the next present field follows at its own canonical
slot — e.g., `features` at pos 20.

---

## Conformance Checklist (for reviewers)

When verifying a location record, confirm:

- [ ] Only fields from the 22-field canonical set are present.
- [ ] All 9 required fields (`id`, `name`, `url`, `mapUrl`, `address`, `city`,
      `state`, `zip`, `coords`) are present.
- [ ] No optional field is set to `null`, `""`, `[]`, or `false`; absent means omitted.
- [ ] Fields appear in canonical position order (lowest position number first).
- [ ] `defaultStart`, if present, is `true` (boolean, not string `"true"`).
- [ ] `coords` is a two-element numeric array with 4-decimal-place precision.
- [ ] `state` is a two-character uppercase string.
