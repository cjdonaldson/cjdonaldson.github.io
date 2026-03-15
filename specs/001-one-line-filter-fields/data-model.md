# Data Model: One-Line Filter Fields

## Overview

This feature does not introduce new persisted data. It clarifies the UI-facing entities involved in rendering and maintaining the one-line filter row inside each Florida Bound planner instance.

## Entities

### 1. Planner Instance

**Description**: A single route-planner panel rendered on `camping/florida-bound-planner.html`.

**Relevant fields**:
- `id` (number): unique planner identifier used to build DOM IDs.
- `route` (array): existing ordered route entries for that planner.
- `filterType` (derived from `#filter-type-{id}`): active filter mode; existing values are `time` or `distance`.
- `filterValue` (derived from `#filter-value-{id}`): numeric maximum value used by existing filtering logic.
- `selectedDirections` (derived from `#filter-direction-{id}` checkboxes): existing direction filter state.

**Validation rules**:
- `id` must remain unique across visible planners.
- `filterType` must continue to use the existing supported options.
- `filterValue` must remain numeric and respect the current input minimum of `1`.
- Each planner instance must render exactly one filter row containing the two related controls in the required order.

**Relationships**:
- One Planner Instance owns one Filter Field Row.
- One Planner Instance owns one Direction control group and one waypoint selector.

### 2. Filter Field Row

**Description**: The visual grouping of the existing `Filter by` and `Max value` controls for a single planner instance.

**Fields / members**:
- `filterTypeLabel`: label associated with `filter-type-{id}`.
- `filterTypeControl`: select element with ID `filter-type-{id}`.
- `filterValueLabel`: label associated with `filter-value-{id}`.
- `filterValueControl`: number input with ID `filter-value-{id}`.
- `layoutClass`: shared row class used to keep the controls on one line.

**Validation rules**:
- Control order must remain `Filter by` first, `Max value` second.
- Both controls must render on the same visual row for each planner instance.
- The row must remain inside the planner instance and above the direction controls.
- Existing control IDs must remain unchanged so event listeners and logic keep working.

**Relationships**:
- Belongs to exactly one Planner Instance.
- Must not absorb unrelated controls such as direction checkboxes or add-stop inputs.

## State Transitions

### Planner Instance lifecycle
1. **Created**: Planner data is added to the in-memory planner collection.
2. **Rendered**: `renderPlanner()` creates the planner DOM, including the Filter Field Row.
3. **Updated**: Changing filter type, filter value, or direction updates waypoint options while the row layout remains intact.
4. **Removed**: Deleting a planner removes that planner's DOM and its filter row without affecting the remaining planners.

### Filter Field Row lifecycle
1. **Initial render**: Row is generated with labels and controls in the required order.
2. **Interactive use**: Users change select/input values; presentation remains one-line.
3. **Re-render/new planner**: Additional planner instances create equivalent rows using the same structure and class.

## Non-Goals

- No new planner data fields are introduced.
- No filtering algorithms or direction-matching behavior change.
- No persistence, API surface, or storage schema changes are needed.
