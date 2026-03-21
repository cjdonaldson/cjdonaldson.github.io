# Feature Specification: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature Branch**: `001-route-plan-sequence`
**Created**: 2025-07-18
**Status**: Draft
**Input**: User description: "The file camping/florida-bound-planner.html is to use the location 'id' field value in a way to allow specifying a route plan. The concatenated sequence with a separator (a colon or dash) is to be presented below the 'View Route in Google Maps' link. It is to change as locations are added or removed. A copy to clipboard button is to be provided to the right of the value. A concatenated plan sequence can also be pasted into the field and the route presented. The new field may be associated with a title and that these will be stored in camping/florida-bound-locations.json where the 'title' would be in an editable dropdown selector. Given the route dynamicness the route string input field will most likely be a text area. The title input should show 30 to 40 characters and not restrict the title to that length; it can overflow the box with cursor move showing that amount of text to keep the cursor in view."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Live Route Sequence Display (Priority: P1)

A planner user builds a route by adding stops one by one. After adding a second stop, a
route sequence string automatically appears below the "View Route in Google Maps" link. The
string reflects the current route in order and updates instantly each time a stop is added or
removed—no manual action required.

**Why this priority**: This is the foundation for all other sequence features and delivers
standalone value as a shareable, human-readable route identifier even without copy or paste
functionality.

**Independent Test**: Open `camping/florida-bound-planner.html` over HTTP, add two stops to
a route, and confirm a sequence string containing two IDs separated by a colon appears below
the map link. Add a third stop and confirm the string extends. Remove a stop and confirm the
string shortens accordingly.

**Acceptance Scenarios**:

1. **Given** a planner with only the default start location, **When** a second stop is added,
   **Then** a sequence string of two location IDs joined by `:` appears below the map link.
2. **Given** a visible sequence string with two IDs, **When** a third stop is added, **Then**
   the sequence string extends to include the new ID without page reload.
3. **Given** a visible sequence string with three IDs, **When** the middle stop is removed,
   **Then** the sequence string immediately reflects only the two remaining IDs in order.
4. **Given** a planner with only one location, **When** no second stop has been added, **Then**
   the entire sequence input area (text area, copy button, and title field) is hidden.

---

### User Story 2 - Copy Sequence to Clipboard (Priority: P2)

A planner user who has built a route wants to save or share it. They click a copy button
immediately to the right of the route sequence string. The sequence is placed on the clipboard
in a single action and the button briefly changes to signal success, so the user knows the
copy worked without any ambiguity.

**Why this priority**: Sharing or saving a route is a primary use case. The live display alone
has limited value without a frictionless way to capture it.

**Independent Test**: Open `camping/florida-bound-planner.html` over HTTP, build a 2-stop
route, click the copy button, paste into a text editor, and confirm the pasted value matches
the displayed sequence exactly.

**Acceptance Scenarios**:

1. **Given** a route with two or more stops, **When** the copy button is clicked, **Then** the
   sequence string is placed on the system clipboard.
2. **Given** the copy button was just clicked, **When** the clipboard contents are pasted
   elsewhere, **Then** the pasted value exactly matches the displayed sequence string.
3. **Given** a successful copy, **When** the copy completes, **Then** the button provides brief
   visual feedback (e.g., icon or label change) that confirms the copy succeeded.
4. **Given** a clipboard access request that the browser denies, **When** the copy button is
   clicked, **Then** the existing clipboard contents are left unchanged and a warning message
   is displayed indicating the copy was not successful.

---

### User Story 3 - Restore Route from Pasted Sequence (Priority: P3)

A planner user has a route sequence string (e.g., copied previously or shared by another
user). They paste it into the sequence text area and the planner reconstructs the full route:
all stops load in order with distances, directions, and dates recalculated as if the stops
had been added manually.

**Why this priority**: Round-trip restore turns the sequence into a durable, reusable route
bookmark. Without it, the sequence is a one-way export only.

**Independent Test**: Open `camping/florida-bound-planner.html` over HTTP, paste a known
3-stop sequence string (with valid IDs from the location data) into the sequence area, and
confirm all three stops appear in the route display in the correct order.

**Acceptance Scenarios**:

1. **Given** a valid sequence of location IDs in the text area, **When** the user activates
   the restore action (e.g., a "Load" button or leaving the field), **Then** the planner
   route display updates to show all matched locations in order.
2. **Given** a sequence with one or more unrecognized IDs mixed with valid IDs, **When** restore
   is triggered, **Then** the valid stops load in order and each unrecognized ID is rendered as
   an inline error within the route sequence (displaying the unknown ID in place); the planner
   remains fully usable.
3. **Given** the text area is cleared and left empty, **When** focus leaves the field, **Then**
   no route change occurs and no error is shown.
4. **Given** a restored route, **When** the user adds or removes a stop manually, **Then** the
   sequence text area updates to reflect the new route.

---

### User Story 4 - Named Route Plans Dropdown (Priority: P4)

A planner user wants to quickly reload a frequently used route without re-entering its
sequence. They click the title field, which shows a dropdown list of saved named plans loaded
from the location data file. Selecting a plan name populates the sequence field and
reconstructs the route. The title field is also editable, letting the user type a new name
for a custom route they have just built.

**Why this priority**: Convenience feature that builds on the sequence and restore
capabilities. Standalone value only after P1–P3 are in place.

**Independent Test**: Add at least one entry to the `routes` array of
`florida-bound-locations.json`, open `camping/florida-bound-planner.html` over HTTP, confirm
the saved plan name appears in the title dropdown, select it, and verify the route loads with
the correct stops.

**Acceptance Scenarios**:

1. **Given** one or more named route plans in the `routes` array of the location data file,
   **When** the planner page loads, **Then** the title dropdown lists all saved plan names.
2. **Given** the title dropdown is open, **When** the user selects a saved plan name, **Then**
   the sequence text area fills with that plan's sequence and the route is reconstructed.
3. **Given** the title field is focused, **When** the user types a new name, **Then** the
   typed name is accepted without truncation regardless of length, and at least 30–40
   characters of the title are visible in the field at one time.
4. **Given** no named route plans exist in the `routes` array of the location data file (or the
   array is absent), **When** the page loads, **Then** the title dropdown is empty and the
   title field is still usable as a free-text input.

---

### Edge Cases

- What happens when a pasted sequence contains an ID not found in the current location data?
  (Each unrecognized ID is rendered as an inline error in place within the route sequence,
  showing the unknown ID text. The rest of the route still populates. A UI control to replace
  an error ID with a known location is explicitly out of scope for this feature.)
- What happens when only one location is in the route?
  (The entire sequence input area—text area, copy button, and title field—is hidden entirely.
  This is consistent with the map link being absent at fewer than two stops.)
- What if the same location ID appears more than once in a pasted sequence?
  (Load each occurrence in position; duplicate stops are allowed since the existing planner
  permits them.)
- What if the sequence text area receives whitespace-only input or contains illegal characters?
  (Strip all leading, trailing, and interspersed whitespace and illegal characters from the
  pasted value. The resulting sanitized string is then used to attempt route reconstruction.)
- What if the location data file contains no `routes` array, or the array is empty?
  (Render an empty dropdown. The title field remains a free-text input and a title may still
  be entered manually. No error is shown.)
- What if the copy action is triggered in a browser context that denies clipboard access?
  (Do NOT alter any existing clipboard contents. Display a warning message indicating the
  copy was not successful.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The location data loader MUST include the `id` field for every location it loads
  so each stop in a planner route can be identified by its stable ID.
- **FR-002**: Each planner instance MUST display a route sequence string below the
  "View Route in Google Maps" link when the route contains two or more stops. When the route
  contains fewer than two stops, the entire sequence area—text area, copy button, and title
  field—MUST be hidden entirely.
- **FR-003**: The route sequence string MUST be the location IDs of the current route joined
  in order by a colon (`:`) separator.
- **FR-004**: The sequence string MUST update automatically—without any user action—whenever a
  stop is added to or removed from the route.
- **FR-005**: A copy-to-clipboard button MUST appear immediately to the right of the sequence
  display area and copy the current sequence string to the system clipboard in one click.
- **FR-006**: The copy button MUST provide brief visual confirmation (label or icon change)
  after a successful copy. If the browser denies clipboard access, the button MUST NOT alter
  any existing clipboard contents and MUST display a warning message indicating the copy was
  not successful.
- **FR-007**: The route sequence display area MUST be a multi-line text input (text area) so
  users can paste a sequence string directly into it.
- **FR-008**: Before attempting route reconstruction from a pasted or typed sequence, the
  implementation MUST sanitize the input by stripping all leading, trailing, and interspersed
  whitespace and illegal characters. The sanitized string is then parsed for location IDs.
  When a valid route sequence is entered in the text area (by paste or manual typing), the
  planner MUST reconstruct the route by matching each ID to its location and displaying all
  matched stops in order. The same location ID MAY appear more than once; each occurrence is
  treated as a separate stop in position.
- **FR-009**: When a pasted sequence contains one or more unrecognized IDs, the planner MUST
  load all recognized stops and render each unrecognized ID as an inline error in place within
  the route sequence, displaying the unknown ID text. The planner MUST remain fully usable
  after the partial load. A UI control to replace an error ID with a known location is
  explicitly out of scope for this feature.
- **FR-010**: Each planner instance MUST include a title field alongside the sequence text
  area, visually wide enough to show 30–40 characters at a time.
- **FR-011**: The title field MUST NOT restrict the length of the title; text that exceeds the
  visible width MUST remain accessible as the cursor moves through it.
- **FR-012**: The title field MUST function as an editable dropdown (combobox), combining free
  text entry with a selectable list of saved plan names.
- **FR-013**: Saved route plans presented in the title dropdown MUST be loaded from a `routes`
  array in `camping/florida-bound-locations.json`. The key name `routes` is used in preference
  to `plans` for semantic accuracy; the planner file name is incidental. If the `routes` array
  is absent or empty, the dropdown MUST render empty and the title field MUST remain usable as
  a free-text input.
- **FR-014**: Selecting a saved plan from the dropdown MUST populate the sequence text area
  with that plan's sequence string and trigger route reconstruction.
- **FR-015**: Each planner instance on the page MUST have its own independent sequence text
  area, copy button, and title field.

### Key Entities

- **Route Sequence**: An ordered, colon-separated string of location IDs representing the
  stops in a planner route (e.g., `5c4ce2cb:0450fbdd:5fd7359d`). Generated from the live
  route; also accepted as input to reconstruct a route.
- **Named Route Plan**: A user-defined label paired with a route sequence, stored as an entry
  in the `routes` array in `florida-bound-locations.json`. Attributes: `title` (string),
  `sequence` (route sequence string).
- **Location ID**: A stable, short hex string (`id` field in the location data) that uniquely
  identifies a camping location and does not change when other location fields are edited.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After adding a second stop to any planner route, a correctly formed sequence
  string appears below the map link without page reload or any additional user action.
- **SC-002**: The copy button places an identical copy of the displayed sequence string on the
  clipboard in a single click, confirmed by pasting into a text editor and comparing.
- **SC-003**: Pasting a valid N-stop sequence into the text area reconstructs all N route
  stops in the correct order, with distances and directions recalculated automatically.
- **SC-004**: Named route plans from the `routes` array of the location data file appear in
  the title dropdown on page load, and selecting one loads the associated route with no
  additional steps.
- **SC-005**: A title of 60 characters is accepted and fully navigable in the title field
  without truncation, while the visible field width remains 30–40 characters.
- **SC-006**: Pasting a sequence that includes one unknown ID loads all valid stops and renders
  the unrecognized ID as an inline error in the route sequence (showing the unknown ID text),
  leaving the route in a fully usable state.
- **SC-007**: The planner page layout remains readable and functional at both desktop and
  mobile-width viewports after the new controls are added.

## Assumptions

- The colon (`:`) is used as the canonical separator between location IDs in a sequence
  string. The dash (`-`) noted in the description is treated as an acceptable alternative
  during paste parsing (both are normalized at import) but the generated output always uses
  colons.
- Location `id` values are stable: they are never changed after assignment. Implementation
  may rely on this without a versioning strategy.
- Named route plans are maintained by the site maintainer by editing `florida-bound-locations.json`
  directly under the `routes` array key. The browser page does not write back to the file;
  there is no save-to-server action.
- Multiple planners on the same page each manage their own independent title, sequence, and
  named-plan selection.
- The location data loader change (adding `id` to the loaded object) is backward-compatible;
  no existing planner functionality reads or depends on the absence of an `id` field.

## Clarifications

### Session 2026-03-21

- Q: What happens when a pasted sequence contains an ID not found in the current location data? → A: Present as inline errors in the route (showing the unknown ID); the rest of the route still populates. A "replace" button to swap an error ID with a known location is explicitly out of scope for this feature.
- Q: What happens when only one location is in the route? → A: The route sequence input/display area is hidden entirely when fewer than two stops are present.
- Q: Are duplicate location IDs allowed in a pasted sequence? → A: Yes. The same location ID may appear multiple times; each occurrence is treated as a separate stop in position.
- Q: How should pasted text be sanitized before parsing? → A: Strip all leading, trailing, and interspersed whitespace and illegal characters from the pasted text area value. The resulting sanitized string is then used to attempt route reconstruction.
- Q: What is rendered when the location data file has no `routes` array or the array is empty? → A: Render an empty dropdown. A title may still be entered manually even with no saved routes; no error is shown.
- Q: What should happen when the browser denies clipboard access during a copy attempt? → A: Do NOT alter any existing clipboard contents. Display a warning message indicating the copy was not successful.
- Q: Should the JSON array key for saved route plans be named `routes` or `plans`? → A: `routes`. Semantic accuracy wins; the planner file name (`florida-bound-planner.html`) is incidental and does not dictate the data key name.
