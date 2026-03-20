# Feature Specification: Location Form UX Improvements

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature Branch**: `001-location-form-ux`
**Created**: 2025-03-16
**Status**: Delivered

## Overview

The `camping/location-form.html` file is an internal maintainer tool — a single-page form used to generate JSON entries for camping locations in the Florida Bound trip planner. This feature improves the form's usability by reducing vertical scroll height through multi-column field layouts, removing noisy "(optional)" label text, restructuring sections with accurate headings, and replacing two independent booking fields with a radio-button-driven interaction that enforces mutual exclusivity.

No changes are made to the planner, data loader, or JSON schema. All existing JSON output keys are preserved.

## Clarifications

### Session 2026-03-19

- Q: What sentinel value does the `booking` JSON key hold when "Call to Book" is active? → A: No `booking` key is emitted. Absence of `bookingUrl` is the implicit "Call to Book" indicator — if `bookingUrl` is missing or null the consumer infers call-to-book. New "Call to Book" entries will carry neither booking key in JSON output (existing location records that already contain `"booking": "Call to book"` are unaffected).
- Q: What responsive behavior should multi-column rows exhibit on viewports narrower than 400px? → A: Graceful collapse — a single CSS `@media (max-width: 399px)` rule stacks every multi-column row to single-column.
- Q: Should Site Map Path and Contact URL share a row or each occupy a full-width row in the Web & Resources section? → A: Full-width, stacked — Site Map Path and Contact URL each get their own full-width row, matching the treatment of Website URL and Google Maps URL.
- Q: What mechanism controls the show/hide transition for the Booking URL input field? → A: Instant toggle — `display: none` / `display: block` with no animation or transition effect.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compact Form Layout (Priority: P1)

A site maintainer opens the location entry form to add a new camping location. Currently the form is very tall, requiring continuous scrolling through fields that are stacked one-per-row. With this improvement, short related fields are grouped side-by-side: name and emoji on one row, city/state/zip on one row, and phone and email on one row. The maintainer can see more of the form at once and complete entries faster.

**Why this priority**: Excessive vertical scrolling is the primary daily friction point. This directly reduces the time and effort to enter each location without removing any fields.

**Independent Test**: Open `camping/location-form.html` in a browser at a typical desktop width. Verify that name/emoji, city/state/zip, and phone/email each appear as a row of side-by-side inputs, and that the overall form is visibly shorter than the current version.

**Acceptance Scenarios**:

1. **Given** the form is open, **When** viewing the Identity section, **Then** Name and Emoji appear side-by-side on one row
2. **Given** the form is open, **When** viewing the Address section, **Then** City, State, and ZIP Code appear on one row
3. **Given** the form is open, **When** viewing the Contact section, **Then** Phone and Email appear on one row
4. **Given** the form is open, **When** viewing the Coordinates section, **Then** Latitude and Longitude appear on one row (existing behavior preserved)
5. **Given** the form is open on a narrow viewport (≥ 400px wide), **When** viewing any multi-column row, **Then** fields remain readable and do not overflow or overlap
6. **Given** the form is open on a viewport narrower than 400px, **When** viewing any multi-column row, **Then** every row stacks to a single column with no horizontal overflow

---

### User Story 2 - Clean Field Labels (Priority: P2)

A maintainer reading the form no longer sees the repeated "(optional)" text appended to most field labels. Since required fields are already identified by a `*` marker, the absence of a star already signals that a field is optional. Removing the "(optional)" text reduces label clutter and makes the form faster to scan.

**Why this priority**: Visual cleanup with no data loss. The `*` convention already communicates required vs optional; the "(optional)" text is redundant.

**Independent Test**: Open the form and read every field label top to bottom. Verify zero occurrences of the text "(optional)" anywhere in the form.

**Acceptance Scenarios**:

1. **Given** the form is open, **When** reading any field label, **Then** no label contains the text "(optional)"
2. **Given** the form is open, **When** reading the required field labels (Name, Website URL, Google Maps URL, Street Address, City, State, ZIP, Latitude, Longitude), **Then** each still displays a `*` marker; Emoji does not display a `*` marker

---

### User Story 3 - Booking Method Radio Selection (Priority: P3)

A maintainer adding a location must choose how it is booked: either via an online booking link, or by calling the site directly. Instead of two separate independent fields that could both be filled simultaneously (creating invalid data), the form presents a radio button group with exactly two options: "Call to Book" (the default) and "Book Online". Selecting "Book Online" reveals a URL input; selecting "Call to Book" shows no additional input — the radio selection itself is the full indicator. Only the relevant information appears in the generated JSON.

When the maintainer switches from "Book Online" to "Call to Book", the URL field is **hidden but not cleared** — its value is preserved and restored if the maintainer returns to "Book Online". The JSON output determines what is emitted: only the active selection's data is included.

**Why this priority**: Enforces the data integrity rule that `bookingUrl` and `booking` are mutually exclusive. Prevents invalid entries where both keys appear in the output. Preserving the URL across radio switches avoids accidental data loss. Defaulting to "Call to Book" reflects the most common booking reality for campgrounds.

**Independent Test**: Open the form. Confirm "Call to Book" is selected by default and no URL input is visible. Select "Book Online" — confirm a URL input appears. Enter a URL. Switch to "Call to Book" — confirm the URL input disappears but selecting "Book Online" again restores the entered URL. Generate JSON for each radio state and inspect output for correct key presence.

**Acceptance Scenarios**:

1. **Given** the form loads, **When** viewing the Booking section, **Then** "Call to Book" is selected by default and no URL input field is visible
2. **Given** "Book Online" is selected, **When** viewing the Booking section, **Then** a URL input for the booking link is visible
3. **Given** "Call to Book" is selected, **When** viewing the Booking section, **Then** no additional input field is shown — the radio selection alone conveys the booking method
4. **Given** "Book Online" is selected and a URL is entered, **When** JSON is generated, **Then** output contains `bookingUrl` and does not contain `booking`
5. **Given** "Call to Book" is selected, **When** JSON is generated, **Then** output contains neither `booking` nor `bookingUrl` (absence of `bookingUrl` is the implicit call-to-book indicator)
6. **Given** "Book Online" is selected with a URL entered, **When** switching to "Call to Book", **Then** the URL field is hidden but its value is retained; the URL is restored if switching back to "Book Online"
7. **Given** any booking option is selected, **When** the URL input field appears or disappears, **Then** the transition is smooth and does not cause an abrupt layout jump

---

### User Story 4 - Accurate Section Headings (Priority: P4)

A maintainer scanning the form can identify the correct section at a glance without needing to read every field. Section headers accurately describe their contents: "Identity" groups name and emoji, "Address" groups address fields, "Contact" groups phone/email/hours, "Web & Resources" groups all URL and map path fields, "Booking" contains the booking method choice, and "Additional Details" holds season, distances, features, notes, and default start.

**Why this priority**: Reduces cognitive load when returning to the form, particularly when only a subset of fields needs to be updated.

**Independent Test**: Open the form. Read each section header in sequence. For each header, verify that the fields immediately below it match the header's described topic, and that no field is under a misleadingly named section.

**Acceptance Scenarios**:

1. **Given** the form is open, **When** scanning the section headers from top to bottom, **Then** they appear in this order: Identity, Address, Coordinates, Contact, Web & Resources, Booking, Additional Details
2. **Given** the Identity section, **When** reviewing its fields, **Then** it contains Name and Emoji
3. **Given** the Address section, **When** reviewing its fields, **Then** it contains Street Address, City, State, and ZIP Code
4. **Given** the Coordinates section, **When** reviewing its fields, **Then** it contains Latitude and Longitude
5. **Given** the Contact section, **When** reviewing its fields, **Then** it contains Phone, Email, Email Contact Name, and Hours
6. **Given** the Web & Resources section, **When** reviewing its fields, **Then** it contains Website URL, Google Maps URL, Site Map Path, and Contact URL
7. **Given** the Booking section, **When** reviewing its fields, **Then** it contains the booking radio group and its single conditional input (no other fields)
8. **Given** the Additional Details section, **When** reviewing its fields, **Then** it contains Season, Distances, Features, Notes, and Default Start Location

---

### Edge Cases

- What if the maintainer switches from "Book Online" (with a URL already typed) to "Call to Book"? The URL field is hidden but **its value is retained**. If the maintainer switches back to "Book Online", the URL is restored. The JSON output suppresses `bookingUrl` while "Call to Book" is active.
- What if the maintainer switches from "Call to Book" to "Book Online"? The URL field reappears with any previously entered value intact.
- What if "Call to Book" is selected when the form is submitted? Neither `booking` nor `bookingUrl` is emitted; the absence of `bookingUrl` is the implicit call-to-book indicator.
- What if "Book Online" is selected but the URL field is left empty and the form is submitted? Neither booking key appears in output (empty values are excluded, consistent with all other optional fields).
- What if state is entered in lowercase? The JSON output continues to convert it to uppercase (existing behavior preserved).
- What if emoji receives more characters than expected? The existing single-character constraint on the emoji field is preserved.
- What happens when "Clear Form" is activated? All fields are reset including the hidden booking URL, booking radio returns to "Call to Book" (the default), and the URL input is hidden.

## Requirements *(mandatory)*

### Functional Requirements

#### Section Structure

- **FR-001**: The form MUST organize all fields into seven named sections appearing in this order: Identity, Address, Coordinates, Contact, Web & Resources, Booking, Additional Details
- **FR-002**: The Identity section MUST contain exactly: Name (required), Emoji (optional), Website URL (required), Google Maps URL (required)
- **FR-003**: The Address section MUST contain exactly: Street Address (required), City (required), State (required), ZIP Code (required)
- **FR-004**: The Coordinates section MUST contain exactly: Latitude (required), Longitude (required)
- **FR-005**: The Contact section MUST contain exactly: Phone, Email, Email Contact Name, Hours
- **FR-006**: The Web & Resources section MUST contain exactly: Site Map Path, Contact URL
- **FR-007**: The Booking section MUST contain exactly: the booking method radio group and its single conditional input field
- **FR-008**: The Additional Details section MUST contain exactly: Season, Distances, Features, Notes, Default Start Location

#### Label Cleanup

- **FR-009**: All field labels MUST NOT contain the text "(optional)" in any form, in any section
- **FR-010**: All required fields (Name, Street Address, Website URL, Google Maps URL, City, State, ZIP Code, Latitude, Longitude) MUST display a `*` marker in their label; Emoji MUST NOT display a `*` marker
- **FR-011**: No field label styling or class associated exclusively with the "(optional)" marker text may remain applied to any element

#### Multi-Column Layouts

- **FR-012**: Name and Emoji MUST appear on the same row in the Identity section
- **FR-013**: City, State, and ZIP Code MUST appear on the same row in the Address section
- **FR-014**: Street Address MUST occupy its own full-width row above City/State/ZIP
- **FR-015**: Phone and Email MUST appear on the same row in the Contact section
- **FR-016**: Email Contact Name MUST occupy its own full-width row
- **FR-017**: Hours MUST occupy its own full-width row
- **FR-018**: Latitude and Longitude MUST continue to appear on the same row (existing behavior preserved)
- **FR-019**: At viewport widths of 400px and wider, no multi-column row may produce horizontal overflow or field overlap
- **FR-037**: At viewport widths below 400px, every multi-column row MUST collapse to a single column; this MUST be implemented via a single CSS `@media (max-width: 399px)` rule — no JavaScript layout switching is permitted
- **FR-038**: In the Web & Resources section, Website URL, Google Maps URL, Site Map Path, and Contact URL MUST each occupy their own full-width row; no two of these fields may be placed side-by-side

#### Booking Radio Interaction

- **FR-020**: The Booking section MUST present a radio button group with exactly two options: "Call to Book" (default), "Book Online"
- **FR-021**: On initial form load, "Call to Book" MUST be selected and no booking URL input field MUST be visible
- **FR-022**: When "Book Online" is selected, a URL input (mapped to `bookingUrl`) MUST become visible
- **FR-023**: When "Call to Book" is selected, no additional input field is shown; the radio selection itself is the complete booking indicator
- **FR-024**: When switching between radio options, the booking URL field MUST be hidden (not cleared) — its value MUST be preserved and restored when "Book Online" is reselected
- **FR-025**: The booking URL input field MUST appear and disappear via an instant toggle (`display: none` / `display: block`) with no CSS transition or animation
- **FR-026**: The Clear Form action MUST clear the booking URL field value in addition to resetting the radio to "Call to Book"

#### JSON Output Compatibility

- **FR-027**: When "Book Online" is selected and the URL field contains a non-empty value, the generated JSON MUST include the `bookingUrl` key and MUST NOT include the `booking` key
- **FR-028**: When "Call to Book" is selected, the generated JSON MUST include neither the `booking` key nor the `bookingUrl` key, regardless of any URL value in the (hidden) URL field; the absence of `bookingUrl` is the implicit call-to-book indicator
- **FR-029**: When "Book Online" is selected with an empty URL field, the generated JSON MUST include neither `bookingUrl` nor `booking`
- **FR-030**: The generated JSON MUST NOT contain both `bookingUrl` and `booking` simultaneously under any condition
- **FR-031**: All other JSON keys must be output identically to current behavior: `name`, `emoji`, `coords`, `zip`, `city`, `state`, `url`, `address`, `mapUrl`, `phone`, `email`, `emailName`, `hours`, `contactUrl`, `siteMap`, `season`, `distances`, `features`, `notes`, `defaultStart`
- **FR-032**: State value MUST continue to be converted to uppercase in the JSON output regardless of how it is entered

#### General Form Behavior

- **FR-033**: The Generate JSON button MUST continue to produce and display a formatted JSON block below the form
- **FR-034**: The Copy to Clipboard button MUST continue to copy the JSON output text
- **FR-035**: The Clear Form button MUST reset all fields (including the hidden booking URL), return the booking radio to "Call to Book", hide the URL input, and clear the JSON output display
- **FR-036**: All existing field constraints (emoji maxlength, state maxlength, number type for coordinates, required validation) MUST be preserved, with the following updates: Street Address, Website URL, and Google Maps URL gain HTML `required` validation; Emoji loses `required` but retains `maxlength="2"`

### Key Entities

- **Location Entry**: A camping location record with identity (name, emoji), address, geographic coordinates, contact details, web and map links, booking method, and additional trip metadata. Each entry corresponds to one JSON object in the Florida Bound location dataset.
- **Booking Method**: A mutually exclusive choice applied to a location. When booked online, `bookingUrl` holds the booking link. When "Call to Book" is the method, neither `bookingUrl` nor `booking` is emitted — the absence of `bookingUrl` is the implicit call-to-book indicator. Neither key is required; at most one may be present per entry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer entering a typical location (all sections filled) requires fewer distinct scroll actions to reach the bottom of the form compared to the current version, measurable by counting scroll events in a browser session
- **SC-002**: Every field label in the form passes a text scan with zero occurrences of "(optional)" — verifiable by searching the rendered page text
- **SC-003**: Simultaneously emitting both `bookingUrl` and `booking` in JSON output is impossible by form design — only the active radio selection's data is included
- **SC-004**: Generated JSON for a "Book Online" location with a URL entered contains `bookingUrl` and no `booking` key — inspectable in the output panel within 10 seconds
- **SC-005**: Generated JSON for a "Call to Book" location contains neither `booking` nor `bookingUrl` — absence of `bookingUrl` is the implicit indicator; inspectable in the output panel within 10 seconds
- **SC-006**: Generated JSON for a "Book Online" location with an empty URL contains neither `bookingUrl` nor `booking` — inspectable in the output panel within 10 seconds
- **SC-007**: A booking URL entered under "Book Online" is preserved (not lost) when switching to "Call to Book" and switching back — verifiable by inspecting the URL field value after round-tripping the radio
- **SC-008**: The form renders without horizontal overflow or field overlap at a viewport width of 400px
- **SC-011**: At a viewport width of 399px (or narrower), every multi-column row visibly stacks to a single column with no horizontal overflow — verifiable by resizing the browser window below 400px wide
- **SC-009**: All JSON output keys from the current implementation continue to appear correctly in generated output (`name`, `emoji`, `url`, `mapUrl`, `address`, `city`, `state`, `zip`, `coords`, `phone`, `email`, `emailName`, `hours`, `contactUrl`, `bookingUrl`/`booking`, `siteMap`, `season`, `distances`, `features`, `notes`, `defaultStart`)
- **SC-010**: The booking URL input appears and disappears instantly via `display` toggle with no animation; surrounding form sections reflow immediately and without visual lag

## Assumptions

- The form is used exclusively by site maintainers; it is not publicly linked from the Florida Bound planner or any end-user-facing page
- "Book Online" and "Call to Book" are the only booking modes needed; no additional booking types are required
- Switching between booking radio options **hides the URL field but does not clear its value** — the URL is preserved and restored if "Book Online" is reselected; the JSON output is the arbiter of what is emitted
- "Call to Book" requires no additional text input; the radio selection itself is the full booking indicator; when "Call to Book" is active neither `booking` nor `bookingUrl` is emitted — the absence of `bookingUrl` is the implicit call-to-book indicator
- "Call to Book" (radio pre-selected, no URL input visible) is the correct default state because calling is the most common booking method for campgrounds
- All four fields in the Web & Resources section (Website URL, Google Maps URL, Site Map Path, Contact URL) each occupy their own full-width row; URL strings can be long enough to warrant the full available width and no two of these fields are placed side-by-side
- Reducing padding or margin between form groups slightly (visual tightening) is acceptable provided field labels and inputs remain clearly legible at default browser zoom
- The form width remains at the current ~800px maximum
- No draft-saving, pre-population from existing data, or import functionality is in scope

## Implementation Addendum

**Recorded**: 2025-07-14
**Status**: Delivered — documents final resolved state as implemented after interactive refinement

This addendum captures how the delivered implementation diverged from the original spec during the speckit lifecycle (clarify → plan → tasks → implement) and the subsequent interactive UX refinement session. It is a record of intent, not a correction to the original spec.

---

### Section Structure: Spec vs. Delivered

The spec prescribed **seven sections**: Identity, Address, Coordinates, Contact, Web & Resources, Booking, Additional Details.

The delivered implementation uses **four sections**:

| # | Delivered Section | Replaces |
|---|-------------------|----------|
| 1 | Overview | Identity |
| 2 | Location \* | Address + Coordinates |
| 3 | Contact | Contact (unchanged) |
| 4 | Additional Details | Additional Details (unchanged) |

Web & Resources and Booking were eliminated as standalone sections. Their fields were redistributed or removed (see Field Changes below).

---

### Section Consolidation Details

**Identity → Overview**

The Identity section was renamed "Overview" and expanded to absorb the booking interaction and web links:

- Name, Emoji (optional), Website URL, Site Map Path, Reservation (select), Reservation URL all appear in this section.

**Address + Coordinates → Location \***

The two separate sections were merged into one "Location \*" section with two rows:

- **Row 1 (`addr-row`)**: Street Address, City, State, ZIP — laid out as a flex row with label-above-input columns.
- **Row 2**: Google Maps URL, Latitude, Longitude — also in a flex row.

The section heading carries the asterisk ("Location \*") as the sole required-field indicator for this section; individual field labels do not carry `*` markers (see speckit.analyze findings).

**Web & Resources eliminated**

Website URL moved to Overview. Site Map Path moved to Overview. `contactUrl` was removed entirely — inspection of `florida-bound-locations.json` confirmed the field is unused across all production records.

**Booking → Reservation (in Overview)**

The Booking section was eliminated. Booking became a "Reservation" `<select>` element plus a "Reservation URL" input, both placed inside the Overview section. The label "Booking" was renamed "Reservation" throughout.

---

### Field Changes

| Field | Original Spec | Delivered |
|-------|--------------|-----------|
| `address` | Optional | **Required** |
| `url` (Website URL) | Optional | **Required** |
| `mapUrl` (Google Maps URL) | Optional | **Required** |
| `emoji` | Required | **Optional** |
| `contactUrl` | Present | **Removed** (unused in production data) |
| Booking control | Radio buttons (Call to Book / Book Online) | **`<select>`** (same two options) |
| Booking URL visibility | Hidden when "Call to Book"; shown when "Book Online" | Always visible; **disabled** when "Call to Book", enabled when "Book Online" |
| Section label | "Booking" | **"Reservation"** |

---

### Layout Patterns

**`addr-row` pattern**

A custom flexbox class applied to multi-field rows in the Location section:

```css
display: flex;
align-items: flex-end;
gap: 10px;
```

Each child is a label-above-input column. This pattern differs from the `.form-row` CSS Grid pattern used elsewhere in the form.

**Field widths (delivered)**

| Field | Width |
|-------|-------|
| City | 10em |
| State | 3em |
| ZIP | 5em |
| Latitude | 9em |
| Longitude | 9em |
| Phone | 8em |
| Email | 32em |
| Email / Contact Name | 10em |
| Site Map Path | 18em |
| Reservation URL | 42em |

**Global input padding**: `0.5em`

---

### Reservation URL Visual State

The Reservation URL field is always present in the DOM (never hidden). Its enabled/disabled state mirrors the Reservation `<select>` value:

- **"Call to Book" selected**: field is `disabled`; background `#f0f0f0`, border `#d0d0d0`, text color `#bbb`, cursor `not-allowed`
- **"Book Online" selected**: field is enabled; background `white`; `0.25s` CSS transition on background-color

Because disabled inputs are excluded from `FormData`, the JSON emit reads `#bookingUrl` value directly via `document.getElementById` rather than via `FormData`.

---

### Responsive Behavior

A single breakpoint governs narrow-viewport layout:

```css
@media (max-width: 399px) {
  /* collapses .form-row CSS Grid to single column */
  /* collapses .addr-row flex to single column */
}
```

The `.form-row` collapse rule uses `!important` to override inline `style=` grid-template attributes set directly on elements. This is a known workaround and is flagged as **technical debt** to be addressed in a future session by moving grid-template values to CSS classes rather than inline styles.

---

### speckit.analyze Findings — Session Resolution

The `speckit.analyze` agent surfaced the following findings after implementation. Resolutions are recorded here:

| Finding | Description | Resolution |
|---------|-------------|------------|
| M1 | `'distance'` typo in `optionalFields` JavaScript array (should be `'distances'`) | **Fixed** by the user during the refinement session |
| H3 | Required fields lack `*` markers on individual form labels | **Intentional** — the asterisk appears only in the section heading "Location \*"; individual field labels are left unmarked by user decision |
| Remaining findings | F1 (status header), I1 (phantom Type field), I2/I3 (contactUrl/radio→select terminology), I4 (contract table labels), I5 (field widths), A1 (audit trail), F2 (legacy keys), I6 (plan.md radio language) | All resolved in this addendum update; see individual sections above for corrections applied |
