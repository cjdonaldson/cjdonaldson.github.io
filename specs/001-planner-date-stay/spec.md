# Feature Specification: Florida Bound Planner Date & Stay Fields

**Feature Branch**: `[001-planner-date-stay]`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Add dates and stay duration to items added in `@camping/florida-bound-planner.html`, distinguishing the beginning location from later stops and making downstream arrival dates derived rather than independently editable."

## Clarifications

### Session 2026-03-13

- Q: What should a newly added downstream stop use as its initial stay duration? → A: `0 days`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set the trip departure date (Priority: P1)

As a traveler using the Florida Bound planner, I want to set a departure date on the beginning location so the rest of the route can inherit a usable reservation-planning schedule.

**Why this priority**: Without a starting date, the planner cannot produce meaningful arrival timing for later stops, so the date/stay enhancement has no practical value.

**Independent Test**: Open `camping/florida-bound-planner.html`, confirm the first route item shows the location name and a departure date control below it, verify that it does not show arrival or stay inputs, and confirm the control does not allow a date earlier than today.

**Acceptance Scenarios**:

1. **Given** a new planner with only the initial location shown, **When** the page loads, **Then** the first item displays a departure date field below the location name and does not display separate arrival or stay fields.
2. **Given** the initial item is visible, **When** the user attempts to pick a date earlier than today, **Then** the planner prevents that selection.
3. **Given** the user selects a valid departure date on the initial item, **When** the selection is applied, **Then** that date becomes the effective arrival date used for calculating the next item that is added to the route.

---

### User Story 2 - Add stops with derived arrivals and editable stays (Priority: P2)

As a traveler building a multi-stop route, I want each added stop to show its arrival date automatically and let me enter only the stay duration I control, so I can plan reservations quickly without manually recalculating dates.

**Why this priority**: This is the core planning behavior that turns the route planner into a schedule-aware reservation aid while keeping the interface minimal.

**Independent Test**: Open `camping/florida-bound-planner.html`, set the initial departure date, add one or more stops, and confirm that each non-initial stop shows arrival and stay values below the location name, with the arrival populated automatically from the preceding stop.

**Acceptance Scenarios**:

1. **Given** the initial item has a departure date, **When** the user adds the first downstream stop, **Then** that stop's arrival date is automatically set to the initial item's departure date and its stay duration initializes to `0 days`.
2. **Given** a downstream stop already has an arrival date and stay duration, **When** the user adds the next stop, **Then** the new stop's arrival date equals the prior stop's arrival date plus the prior stop's stay duration and the new stop's stay duration defaults to `0 days`.
3. **Given** a downstream stop is displayed, **When** the user reviews its fields, **Then** the stop shows arrival and stay below the location name and does not expose a directly editable arrival field that would break the derived-date rule.
4. **Given** a downstream stop's stay duration is editable, **When** the user enters a value, **Then** the planner accepts only non-negative whole numbers.

---

### User Story 3 - Recalculate the schedule by changing only the allowed inputs (Priority: P3)

As a traveler refining the plan, I want later arrival dates to update automatically when I change the trip start date or a stay duration, so the schedule stays internally consistent for booking by website or phone.

**Why this priority**: Schedule consistency is essential once multiple stops exist; manual per-stop date edits would create ambiguity and planning errors.

**Independent Test**: Build a route with at least three locations, change the initial departure date and then change a middle stop's stay duration, and confirm that all downstream arrival dates update while no downstream arrival field becomes directly editable.

**Acceptance Scenarios**:

1. **Given** a route with multiple stops, **When** the user changes the initial departure date, **Then** every downstream arrival date recalculates from that new starting point.
2. **Given** a route with at least three locations, **When** the user changes the stay duration of a middle stop, **Then** that stop keeps its existing arrival date and every later stop updates to reflect the new cumulative schedule.
3. **Given** a route with derived arrival dates, **When** the user wants to change a later arrival date, **Then** the planner requires the user to change the initial departure date or one of the preceding stay durations instead of editing that later arrival directly.
4. **Given** a stop is removed or the route is reset, **When** the route list changes, **Then** the remaining stops recalculate from the nearest preceding retained item and the single-item reset state returns to showing only the initial departure date field.

### Edge Cases

- If the user sets the initial departure date and leaves a downstream stop at a stay duration of `0`, the following stop uses the same calendar date as that stop's arrival-derived departure.
- If the user adds multiple stops before entering stay durations for earlier downstream stops, each new downstream stop starts with a stay duration of `0 days`, and each later stop still resolves from the current preceding values rather than becoming blank or contradictory.
- If the user removes a stop from the middle of the route, every later stop recalculates using the new immediately preceding stop as the date source.
- If the user resets the route to the starting location only, all downstream arrival and stay values are cleared with the removed stops.
- If the current date changes between sessions, the next time the page is loaded the initial date picker still prevents choosing dates prior to the new "today" date.
- If the unlabeled presentation causes users to misread which value is arrival versus stay during visual review, labeled presentation becomes a follow-up usability adjustment rather than permitting ambiguous behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `camping/florida-bound-planner.html` MUST present date-aware route planning behavior for the Florida Bound planner without requiring users to calculate reservation timing manually.
- **FR-002**: The planner MUST treat the initial route item as the beginning location and display only a departure date field for that item below the location name.
- **FR-003**: The initial route item MUST NOT display an arrival date field or a stay-duration field.
- **FR-004**: The initial route item's departure date MUST serve as the effective arrival date input for the first downstream stop.
- **FR-005**: Each downstream route item MUST display its timing information below the location name.
- **FR-006**: Each downstream route item MUST show an arrival date value and a stay-duration value as the minimal baseline fields for this feature.
- **FR-007**: The planner MUST calculate each downstream route item's arrival date from the immediately preceding route item's arrival basis plus that preceding item's stay duration.
- **FR-008**: For the first downstream stop, the immediately preceding arrival basis MUST be the initial route item's departure date.
- **FR-009**: Downstream arrival dates MUST be derived values and MUST NOT be independently editable by the user.
- **FR-010**: Users MUST be able to influence downstream arrival dates only by changing the initial departure date and/or one or more preceding stay durations.
- **FR-011**: When the initial departure date changes, the planner MUST recalculate all downstream arrival dates using the updated starting point.
- **FR-012**: When any downstream stay duration changes, the planner MUST recalculate that stop's implied departure and all later stops' arrival dates.
- **FR-013**: The planner MUST continue to support adding stops using the existing route-building flow.
- **FR-014**: When a new downstream stop is added, its arrival date MUST be populated automatically from the then-current cumulative schedule rather than requiring manual entry.
- **FR-015**: When a new downstream stop is added, its initial stay duration MUST default to `0 days` until the user changes it.
- **FR-016**: The planner MUST accept stay durations only as non-negative whole numbers.
- **FR-017**: The planner MUST prevent selection of a user-editable date earlier than today.
- **FR-018**: For the initial release of this feature, the timing values MUST be shown without visible field labels unless validation demonstrates that the unlabeled layout is not understandable.
- **FR-019**: For downstream stops, the planner MUST avoid adding a separate departure input as long as arrival plus stay remain clear and unambiguous to users.
- **FR-020**: When a stop is removed, all later stops MUST recalculate their arrival dates from the updated sequence.
- **FR-021**: When the route is reset to the starting location only, the planner MUST return to a single-item state with only the initial departure date visible.

### Key Entities *(include if feature involves data)*

- **Planner Route Item**: A displayed location in the route sequence, consisting of the location identity plus schedule-related values that depend on its position in the route.
- **Initial Route Item**: The first route item, representing the trip's starting location; it owns the user-editable departure date and has no arrival or stay field.
- **Downstream Route Item**: Any route item after the first one; it shows a derived arrival date and an editable stay duration.
- **Stay Duration**: A non-negative whole-number count of days spent at a downstream route item before the next item's arrival is derived.
- **Derived Arrival Date**: The calculated calendar date assigned to a downstream route item based on the route sequence, the initial departure date, and all preceding stay durations.

### Assumptions

- Date progression is based on whole calendar days; travel time between locations does not add extra days in this feature.
- Each newly added downstream stop begins with a stay duration of `0 days` unless and until the user edits it.
- A stay duration of `0` means the next stop may arrive on the same calendar date as the prior stop's implied departure.
- The current planner already establishes a default starting location, and this feature adds schedule fields to that existing route structure rather than changing how the starting location is chosen.
- Unlabeled timing values are acceptable for the first release only if manual visual review shows users can distinguish them without confusion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual review, 100% of new planner sessions show exactly one user-editable date field on the initial route item and no arrival or stay fields on that item.
- **SC-002**: In manual review of routes containing at least three locations, every downstream stop's displayed arrival date matches the cumulative result of the initial departure date plus preceding stay durations.
- **SC-003**: In manual validation, changing the initial departure date or any stay duration updates all affected downstream arrival dates before the user performs another route-building action.
- **SC-004**: In manual validation, 100% of attempts to enter a past date or a negative or fractional stay value are prevented or rejected before the route is treated as valid.
- **SC-005**: During a usability check with representative route examples, a reviewer can identify the departure timing for the initial item and the arrival/stay timing for each later stop in 30 seconds or less without needing separate notes or manual date math.
