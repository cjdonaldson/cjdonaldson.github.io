# Research: Location Form UX Improvements

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase 0 output** | Branch: `001-location-form-ux` | Date: 2026-03-19

No NEEDS CLARIFICATION items were surfaced in the Technical Context — the technology
stack is fully known (HTML5 / CSS3 / vanilla JS) and the spec is fully clarified.
Research here documents the implementation patterns chosen for each design decision
so the task author and reviewer have a clear rationale record.

---

## 1. Multi-Column Form Layout

**Decision**: CSS Grid with `grid-template-columns` per multi-column row wrapper.

**Rationale**: CSS Grid is the lightest, most maintainable approach for aligned
side-by-side form fields in a static file. No JS, no framework. A wrapper `<div>`
with `display: grid` and the desired column template is applied to each multi-column
row. The existing `coords-group` pattern already uses this exact approach
(`display: grid; grid-template-columns: 1fr 1fr; gap: 15px`) — confirmed by
inspecting line 88–92 of `camping/location-form.html`. Extending this pattern for
Name/Emoji, City/State/ZIP, and Phone/Email provides structural consistency with the
existing code and requires zero new dependencies.

**Column templates by row**:
- Name / Emoji: `3fr 1fr` — name gets most width; emoji is a single character
- City / State / ZIP: `2fr 1fr 1fr` — city wider; state (2-char) and ZIP narrower
- Phone / Email: `1fr 1fr` — equal width
- Latitude / Longitude (existing): `1fr 1fr` — preserve unchanged

**Alternatives considered**:
- Flexbox: viable but requires more boilerplate for equal-height alignment across
  label + input pairs; Grid is cleaner for this use case.
- CSS columns: unsuitable — designed for flowing text, not form field alignment.
- Table layout: rejected; semantically inappropriate and harder to maintain.

---

## 2. Responsive Collapse at < 400 px

**Decision**: Single `@media (max-width: 399px)` rule that sets
`grid-template-columns: 1fr` on all multi-column wrappers.

**Rationale**: The spec explicitly requires a single `@media (max-width: 399px)` rule
and forbids JavaScript layout switching (FR-037). A class-based selector targeting all
multi-column row wrappers keeps the rule terse. Using a shared CSS class
(e.g., `.form-row`) for all multi-column wrappers means the media query only needs
one rule: `.form-row { grid-template-columns: 1fr; }`.

**Alternatives considered**:
- Per-row media query overrides: works but is verbose and fragile when row count grows.
- JavaScript `resize` listener: explicitly prohibited by FR-037.
- Container queries: not widely supported in all target browsers and adds no value
  over a viewport media query for this use case.

---

## 3. Radio Button Conditional Show/Hide

**Decision**: Two `<input type="radio">` elements with an inline `onchange` handler
(or small `<script>` block) that toggles `display: none` / `display: block` on a
`<div>` wrapping the `bookingUrl` input.

**Rationale**: The spec requires an instant toggle via `display: none` / `display: block`
with no CSS transition or animation (FR-025). This is the canonical, zero-library
approach. The hidden `bookingUrl` field retains its DOM value because the field is
never cleared by the toggle — only its containing wrapper visibility changes.
`display: none` removes the element from layout flow, preventing the empty URL field
from producing a gap. The existing `resetForm()` function needs to be extended to
clear `bookingUrl` and reset the radio to "Call to Book" (FR-026, FR-035).

**Toggle function (sketch)**:
```javascript
function updateBookingVisibility() {
    const bookOnline = document.getElementById('bookOnline').checked;
    document.getElementById('bookingUrlGroup').style.display =
        bookOnline ? 'block' : 'none';
}
```

**Value preservation**: Because `display: none` does not clear input values, the URL
entered under "Book Online" survives a switch to "Call to Book" and is restored when
"Book Online" is reselected (FR-024). No additional code is needed.

**JSON gating**: The `generateJson` logic must check `document.getElementById('bookOnline').checked`
(not `formData.get('bookingUrl')` alone) so that a URL entered but hidden under
"Call to Book" is never emitted (FR-028).

**Alternatives considered**:
- CSS `visibility: hidden`: keeps the element in layout flow, creating a persistent
  blank gap — rejected.
- CSS transition on `max-height` or `opacity`: adds animation, explicitly prohibited
  by FR-025.
- Removing/re-adding the element from the DOM: clears the value on removal; defeats
  the preserve-on-hide requirement (FR-024).

---

## 4. "(optional)" Label Removal

**Decision**: Remove every `<span class="optional">(optional)</span>` element from
all field labels. Remove the `.optional` CSS rule if no remaining usage warrants it.

**Rationale**: Straightforward HTML edit. The `.optional` class is used exclusively
for "(optional)" label spans — confirmed by searching `camping/location-form.html`.
Once all spans are removed the class is dead CSS and should be removed to keep the
file clean (FR-011).

**Alternatives considered**: None — the requirement is unambiguous.

---

## 5. Section Restructuring

**Decision**: Replace the four existing section headers
("Basic Information", "Location Details", "Contact Information", "Booking & Resources")
with seven headers matching the spec: Identity, Address, Coordinates, Contact,
Web & Resources, Booking, Additional Details. Move fields to their correct sections.

**Current state (from inspection)**:
- "Basic Information" — contains Name, Emoji, Website URL, Site Map Path,
  Google Maps URL, Booking URL, Booking Instructions, Phone, Email, Email Contact Name,
  Street Address, City, State, ZIP Code (14 fields — mixed concerns)
- "Location Details" — contains Latitude, Longitude (correct)
- "Contact Information" — contains Hours only (missing Phone, Email, Email Contact Name)
- "Booking & Resources" — contains Contact URL only (mislabeled, incomplete)
- "Additional Details" — contains Season, Distances, Features, Notes,
  Default Start Location (correct)

**Required field moves**:
- Phone, Email, Email Contact Name → Contact section
- Hours → Contact section (was correctly positioned but section was mislabeled)
- Website URL, Google Maps URL, Site Map Path, Contact URL → Web & Resources section
- Booking URL + Booking Instructions → replaced by radio group in Booking section
- Street Address, City, State, ZIP → Address section
- Name, Emoji → Identity section

**Rationale**: Pure HTML restructuring, no logic change. Correct grouping reduces
cognitive load for the maintainer (User Story 4).

---

## 6. JSON Output Key Compatibility

**Decision**: Preserve all existing JSON keys exactly. Add conditional emission logic
for `bookingUrl`: emit only when "Book Online" is selected AND the URL field is
non-empty; never emit `booking` (the old text field is removed entirely).

**Key inventory** (from FR-031 + existing JS analysis):
`name`, `emoji`, `coords`, `zip`, `city`, `state`, `url`, `address`, `mapUrl`,
`phone`, `email`, `emailName`, `hours`, `contactUrl`, `siteMap`, `season`,
`distances`, `features`, `notes`, `defaultStart`, `bookingUrl`

**Dropped key**: `booking` — the old free-text "Call to book" field is replaced by
the radio interaction. Existing JSON records that already contain `"booking": "Call to book"`
are unaffected (the form does not modify existing records).

**Rationale**: The spec (FR-027–FR-031) is explicit. The existing JS already uses an
`optionalFields` array pattern; adapting it to conditionally include `bookingUrl`
is a small, targeted change.
