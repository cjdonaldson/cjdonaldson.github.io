# UI Contract: Florida Bound Planner Filter Row

## Scope

This contract applies to the filter controls rendered for each planner instance on `camping/florida-bound-planner.html`.

## Required UI Surface

For every rendered planner instance:

1. The planner must contain one dedicated filter row that groups the existing `Filter by` and `Max value` controls.
2. The filter row must appear before the `Direction` controls.
3. The control order must be:
   1. `Filter by` label
   2. `Filter by` select
   3. `Max value` label
   4. `Max value` numeric input

## DOM Constraints

- The select element ID must remain `filter-type-{id}`.
- The numeric input ID must remain `filter-value-{id}`.
- Associated labels must continue to reference those IDs with `for` attributes.
- The shared row wrapper may be new, but it must not change the existing control IDs used by planner logic.
- The standalone `<label>Direction:</label>` element and the `<div id="filter-direction-{id}">` div must remain outside the filter row wrapper.

## Behavioral Constraints

- Changing either control must continue to trigger the existing waypoint option refresh behavior.
- Adding a planner must produce a new filter row with the same structure and order.
- Removing a planner must leave the remaining planners with the same filter row structure.
- The change must not alter filtering semantics, available filter options, or default filter value behavior.

## Presentation Constraints

- The two controls must render as one horizontal row within each planner instance.
- The row must keep the controls visually grouped together and separate from unrelated controls.
- Narrow-width behavior (375px viewport) must prefer preserving the row grouping over splitting the two controls across different lines.

## Validation

Manual review passes when:

- A single planner shows the controls on one row in the required order.
- Multiple planner instances all show the same row structure.
- Changing values, adding planners, removing planners, and refreshing the page do not break the one-row layout.
