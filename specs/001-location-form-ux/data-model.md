# Data Model: Location Form UX Improvements

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase 1 output** | Branch: `001-location-form-ux` | Date: 2026-03-19

---

## Entity: Location Entry

A camping location record produced by `camping/location-form.html` and consumed by
the Florida Bound planner via `camping/florida-bound-locations.json`.

### Fields

| Field | JSON Key | Type | Required | Source |
|-------|----------|------|----------|--------|
| Name | `name` | string | ✅ Yes | Text input |
| Emoji | `emoji` | string (1 emoji char) | No | Text input, maxlength=2 |
| Website URL | `url` | string (URL) | ✅ Yes | URL input |
| Google Maps URL | `mapUrl` | string (URL) | ✅ Yes | URL input |
| Street Address | `address` | string | ✅ Yes | Text input |
| City | `city` | string | ✅ Yes | Text input |
| State | `state` | string (2-char uppercase) | ✅ Yes | Text input, maxlength=2, toUpperCase() |
| ZIP Code | `zip` | string | ✅ Yes | Text input |
| Latitude | `coords[0]` | number | ✅ Yes | Number input, step=any |
| Longitude | `coords[1]` | number | ✅ Yes | Number input, step=any |
| Site Map Path | `siteMap` | string | No | Text input |
| Contact URL | `contactUrl` | string (URL) | No | URL input |
| Booking URL | `bookingUrl` | string (URL) | No | URL input — emitted only when "Book Online" is active and non-empty |
| Phone | `phone` | string | No | Tel input |
| Email | `email` | string (email) | No | Email input |
| Email Contact Name | `emailName` | string | No | Text input |
| Hours | `hours` | string | No | Text input |
| Season | `season` | string | No | Text input |
| Distances | `distances` | string[] | No | Textarea, one per line |
| Features | `features` | string[] | No | Textarea, one per line |
| Notes | `notes` | string[] | No | Textarea, one per line |
| Default Start | `defaultStart` | boolean | No | Select — emitted as `true` only when selected |

### Removed Fields

| Old Field | Old JSON Key | Replacement |
|-----------|-------------|-------------|
| Booking Instructions | `booking` | Removed. Replaced by the "Call to Book" / "Book Online" radio interaction. Absence of `bookingUrl` is the implicit call-to-book indicator. Existing records containing `"booking": "Call to book"` are unaffected. |

### Validation Rules

- **Name**: Non-empty string (HTML `required`)
- **Website URL**: Non-empty URL (HTML `required type="url"`)
- **Google Maps URL**: Non-empty URL (HTML `required type="url"`)
- **Street Address**: Non-empty string (HTML `required`)
- **City**: Non-empty string (HTML `required`)
- **State**: Non-empty, maxlength 2 (HTML `required maxlength="2"`); converted to
  uppercase in JS before JSON emission
- **ZIP Code**: Non-empty string (HTML `required`)
- **Latitude / Longitude**: Valid number, `step="any"` (HTML `required type="number"`)
- **Emoji**: Optional, maxlength 2 (`maxlength="2"`); omitted from JSON when empty
- All optional string fields: omitted from JSON output when empty or whitespace-only
- All optional array fields: omitted from JSON output when all lines are empty;
  empty lines within a non-empty textarea are filtered out
- **bookingUrl**: Omitted when "Call to Book" is selected (regardless of field value),
  or when "Book Online" is selected but the field is empty

---

## Entity: Booking Method (UI State)

A mutually exclusive radio selection that controls which booking data appears in the
generated JSON. This is a UI-only concept — it has no persistent representation in the
JSON schema beyond presence/absence of `bookingUrl`.

### States

| Radio Value | Label | Default | bookingUrl in JSON | booking in JSON |
|-------------|-------|---------|-------------------|-----------------|
| `callToBook` | Call to Book | ✅ Yes | Never emitted | Never emitted |
| `bookOnline` | Book Online | No | Emitted if non-empty | Never emitted |

### State Transitions

```
Initial load → "Call to Book" selected, URL input hidden
    │
    ├─ User selects "Book Online"
    │       → URL input appears (display: block)
    │       → Any previously entered URL is restored
    │
    └─ User selects "Call to Book"
            → URL input is hidden (display: none)
            → URL field value is PRESERVED (not cleared)
            → JSON output will NOT include bookingUrl
```

### Clear Form Behavior

When "Clear Form" is activated:
1. All form fields are reset (including `bookingUrl` value cleared)
2. Booking radio returns to "Call to Book"
3. URL input wrapper is hidden
4. JSON output panel is hidden

---

## Form Section Layout

Describes the logical grouping of fields into the seven sections required by FR-001.

| Section | Fields | Layout |
|---------|--------|--------|
| Identity | Name *, Emoji | Two-column row: `3fr 1fr` |
| Address | Street Address *, City * / State * / ZIP Code * | Street Address: full-width; City/State/ZIP: three-column row `2fr 1fr 1fr` |
| Coordinates | Latitude *, Longitude * | Two-column row: `1fr 1fr` (existing) |
| Contact | Phone / Email, Email Contact Name, Hours | Phone/Email: two-column row `1fr 1fr`; Email Contact Name: full-width; Hours: full-width |
| Web & Resources | Website URL, Google Maps URL, Site Map Path, Contact URL | All full-width rows (FR-038) |
| Booking | Booking radio group (Call to Book / Book Online), Booking URL (conditional) | Radio group full-width; URL input full-width, toggled |
| Additional Details | Season, Distances, Features, Notes, Default Start Location | All full-width rows |

### Responsive Collapse

At viewport widths < 400 px (CSS `@media (max-width: 399px)`):
- Every multi-column row wrapper (`form-row` class) collapses to `grid-template-columns: 1fr`
- No JavaScript involved; single CSS rule covers all multi-column rows
