# Feature Specification: Florida Bound Planner Date & Stay Driven Schedule

**Feature Branch**: `[001-planner-date-stay]`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Correct `@camping/florida-bound-planner.html` so the top item is a departure-date-only itinerary anchor, downstream item dates are derived, and downstream timing is edited through stay fields rather than direct date edits."

## Clarifications

### Session 2026-03-13

- Q: What schedule rule applies to the top location? → A: The top location is departure-date only, anchors the itinerary, and never shows or edits stay.
- Q: Which timing control is editable for downstream locations? → A: Downstream locations show a read-only derived date and an editable stay field; their dates are not directly editable.
- Q: How are downstream dates recalculated? → A: The first downstream date equals the top departure date, and each later downstream date equals the prior downstream date plus that prior downstream location's stay.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set the departure-date anchor (Priority: P1)

As a traveler using the Florida Bound planner, I want to set a departure date on the top location so the rest of the itinerary is anchored from a clear starting date.

**Why this priority**: Without a departure-date anchor on the top location, downstream derived dates cannot be calculated consistently.

**Independent Test**: Open `camping/florida-bound-planner.html`, confirm the first route item shows a single editable departure-date control below the location name, verify that it does not show a stay field, and confirm the control does not allow a date earlier than today.

**Acceptance Scenarios**:

1. **Given** a new planner with only the top location shown, **When** the page loads, **Then** the top item displays one editable departure-date field below the location name and no stay field.
2. **Given** the top item is visible, **When** the user attempts to pick a departure date earlier than today, **Then** the planner prevents that selection.
3. **Given** the user selects a valid departure date on the top item, **When** the first downstream stop is later added, **Then** that departure date becomes the derived date for the first downstream stop.

---

### User Story 2 - Add stops with derived dates and editable stays (Priority: P2)

As a traveler building a multi-stop route, I want each added downstream stop to show a derived date and an editable stay field so I can control the itinerary by adjusting stays instead of editing downstream dates.

**Why this priority**: This is the core behavior that restores the derived-date itinerary model while keeping the top location as the explicit departure anchor.

**Independent Test**: Open `camping/florida-bound-planner.html`, set the top departure date, add one or more downstream stops, and confirm that each downstream stop shows a read-only derived date plus an editable stay field.

**Acceptance Scenarios**:

1. **Given** the top item has a departure date, **When** the user adds the first downstream stop, **Then** that stop shows a derived date equal to the top departure date, the date is not directly editable, and the stop exposes an editable stay field.
2. **Given** a downstream stop has a derived date and a stay value, **When** the user adds the next downstream stop, **Then** the new stop's derived date equals the previous downstream stop's derived date plus that previous downstream stop's stay.
3. **Given** a downstream stop is displayed, **When** the user reviews its timing controls, **Then** the stop shows a read-only derived date and an editable stay field, with no direct date-edit control for that downstream stop.
4. **Given** a downstream stop has a stay value of `0`, **When** another downstream stop exists after it, **Then** the later stop may display the same derived date as that stop without being treated as invalid.

---

### User Story 3 - Recalculate later dates by editing departure date or stay (Priority: P3)

As a traveler refining the plan, I want changing the top departure date or a downstream stay to recalculate later downstream dates automatically so the itinerary remains internally consistent.

**Why this priority**: Once multiple stops exist, users need predictable recalculation that preserves the derived-date model and avoids manual downstream date maintenance.

**Independent Test**: Build a route with at least three locations, change the top departure date and then change a middle downstream stay, and confirm that affected later derived dates update automatically while downstream dates remain read-only.

**Acceptance Scenarios**:

1. **Given** a route with multiple downstream stops, **When** the user changes the top departure date, **Then** every downstream derived date recomputes from the new departure date while preserving the configured downstream stay values.
2. **Given** a route with at least three locations, **When** the user changes the stay on a middle downstream stop, **Then** that stop keeps its current derived date, every later downstream derived date recomputes from the updated stay, and earlier stops remain unchanged.
3. **Given** a downstream stop is shown in the itinerary, **When** the user tries to edit that stop's displayed date directly, **Then** the planner does not offer direct date editing for that downstream stop.
4. **Given** a route with multiple stops, **When** the user removes a middle stop or resets the route, **Then** any remaining downstream dates are recomputed from the retained itinerary order and stay values, and a full reset returns the planner to a single-item state with only the top departure-date field visible.

### Edge Cases

- If the user leaves one or more downstream stay values at `0`, adjacent downstream stops may share the same derived date.
- If the user adds multiple downstream stops before changing any stay values, each new downstream stop inherits the same derived date until a prior downstream stay introduces a later date.
- If the user changes a downstream stay, only later downstream derived dates are recomputed; the edited stop's own derived date remains anchored by prior items.
- If the user removes a stop from the middle of the route, the planner recomputes remaining downstream dates from the top departure date and the retained downstream stays rather than preserving stale explicit dates.
- If the user resets the route to the starting location only, all downstream derived dates and downstream stay fields are cleared with the removed stops.
- If the current date changes between sessions, the next time the page loads the top departure-date picker still prevents choosing dates prior to the new "today" date.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `camping/florida-bound-planner.html` MUST present itinerary scheduling behavior for the Florida Bound planner without requiring users to calculate downstream dates manually.
- **FR-002**: The planner MUST treat the initial route item as the top location and display a single editable departure-date field for that item below the location name.
- **FR-003**: The top location MUST anchor the itinerary and MUST NOT display or edit a stay field.
- **FR-004**: The planner MUST prevent selection of a top departure date earlier than today.
- **FR-005**: Each downstream route item MUST display a derived date below the location name.
- **FR-006**: Each downstream route item's displayed date MUST be read-only and MUST NOT be directly editable.
- **FR-007**: Each downstream route item MUST display an editable stay field used to determine the date of the next downstream route item.
- **FR-008**: The planner MUST NOT expose a downstream date picker or any other direct date-editing control for downstream route items.
- **FR-009**: The first downstream route item's derived date MUST equal the top item's departure date.
- **FR-010**: For each downstream route item after the first, the planner MUST derive its date from the immediately preceding downstream route item's derived date plus that preceding downstream route item's stay value.
- **FR-011**: The planner MUST allow a downstream stay value of `0`, which may cause adjacent downstream route items to share the same derived date.
- **FR-012**: When the top departure date changes, the planner MUST recompute all downstream derived dates using the updated top departure date and the current downstream stay values.
- **FR-013**: When a downstream stay value changes, the planner MUST recompute only that stop's later downstream derived dates; earlier items and the edited stop's own derived date MUST remain unchanged.
- **FR-014**: The planner MUST restrict downstream stay input to non-negative whole calendar days.
- **FR-015**: The planner MUST continue to support adding stops using the existing route-building flow.
- **FR-016**: When a stop is removed, the planner MUST recompute any remaining downstream derived dates from the top departure date and the retained downstream stay values.
- **FR-017**: When the route is reset to the starting location only, the planner MUST return to a single-item state with only the top departure-date field visible.

### Key Entities *(include if feature involves data)*

- **Planner Route Item**: A displayed location in the route sequence, consisting of the location identity plus schedule fields that depend on whether the item is the top location or a downstream location.
- **Top Route Item**: The first route item, representing the trip's starting location; it owns the editable departure date and never has a stay field.
- **Downstream Route Item**: Any route item after the first one; it shows a read-only derived date and an editable stay value that influences the next downstream route item's date.
- **Departure Date**: The editable date on the top route item that anchors the itinerary.
- **Derived Date**: The read-only calendar date shown on a downstream route item, computed from the departure date plus cumulative prior downstream stays.
- **Stay Value**: A non-negative whole-day duration entered on a downstream route item and used to calculate the next downstream route item's derived date.

### Assumptions

- Date progression is based on whole calendar days; travel time between locations does not add extra days in this feature.
- The first downstream route item's derived date is the same calendar date as the top departure date because the top item has no stay field.
- Downstream stay values may be `0`, which intentionally allows adjacent downstream locations to share the same derived date.
- The current planner already establishes a default starting location, and this feature adds departure-date and downstream-stay behavior to that existing route structure rather than changing how the starting location is chosen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual review, 100% of new planner sessions show exactly one user-editable departure-date field on the top route item and no stay field on that top item.
- **SC-002**: In manual review of routes containing at least three locations, 100% of downstream route items show a read-only derived date and an editable stay field, with no user-editable downstream date control.
- **SC-003**: In manual validation, every downstream derived date matches the top departure date plus the cumulative prior downstream stay values.
- **SC-004**: In manual validation, changing the top departure date or any downstream stay updates every affected later downstream date before the user performs another route-building action.
- **SC-005**: In manual validation, 100% of attempts to choose a past top departure date, enter a negative downstream stay, or directly edit a downstream date are prevented or unavailable before the itinerary is treated as valid.
