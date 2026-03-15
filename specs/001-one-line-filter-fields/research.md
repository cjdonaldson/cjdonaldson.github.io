# Research: One-Line Filter Fields

## Decision 1: Use a dedicated flex row for the two existing filter controls

**Decision**: Render the existing `Filter by` label/select pair and `Max value` label/input pair inside one dedicated row container, then style that container with lightweight flexbox.

**Rationale**:
- The current planner UI is rendered dynamically from `camping/florida-bound-grid.js`, so the most direct way to guarantee consistent layout across all planner instances is to group the related controls in the generated markup.
- `camping/florida-bound-planner.css` already uses flexbox successfully for other planner controls such as `.filter-direction-container`, so the change matches current implementation patterns.
- A wrapper class keeps the feature narrowly scoped to presentation and avoids touching filter logic, element IDs, or planner behavior.

**Alternatives considered**:
- Applying `display: inline-block` to the existing controls without grouping them: rejected because it is more fragile and makes grouping dependent on surrounding markup.
- Using CSS grid for the row: rejected because flexbox is simpler for a short horizontal control group and already used in the same stylesheet.
- Reordering controls with JavaScript after render: rejected because the markup already renders in the right order and no runtime DOM reshuffling is needed.

## Decision 2: Keep the implementation static-site friendly and dependency-free

**Decision**: Implement the feature with plain HTML/CSS/JavaScript only, using the existing page, render script, and stylesheet.

**Rationale**:
- The repository constitution requires the lightest viable static-site approach.
- The request is a layout-only refinement, so new tooling, libraries, or preprocessing would be unnecessary complexity.
- Reusing the existing Florida Bound planner assets keeps the change publication-ready and easy to maintain.

**Alternatives considered**:
- Adding a UI framework or CSS utility library: rejected as disproportionate to a two-field layout change.
- Introducing a build step for CSS organization: rejected because the repo is maintained as inspectable static assets.

## Decision 3: Preserve one-row grouping at narrow widths without mixing in unrelated controls

**Decision**: Keep the filter controls together in a no-wrap row and rely on the page's existing horizontal overflow behavior if space becomes tight.

**Rationale**:
- The feature goal is to keep the two related controls visually grouped as one row.
- The planner stylesheet already allows horizontal overflow at the page level, which is preferable to letting unrelated controls interleave or the row split unpredictably.
- Short labels plus controlled gaps provide readable grouping without adding responsive complexity that could alter existing planner layout.

**Alternatives considered**:
- Letting the row wrap on small widths: rejected because it could split the paired controls onto separate lines and undermine the requested behavior.
- Moving one control below the other at mobile widths: rejected because it directly conflicts with the feature request.

## Decision 4: Treat this as an internal UI change, with a lightweight UI contract only

**Decision**: No API or data contract changes are required, but the design should document a UI contract for the planner filter row so implementation stays aligned.

**Rationale**:
- The page has no new endpoint, storage, or external service integration for this feature.
- Existing element IDs and event hooks should remain unchanged so the planner logic keeps working as-is.
- A small contract document is still useful because this is a user-facing planner page with a concrete required control order and placement.

**Alternatives considered**:
- Skipping contracts entirely: rejected because a UI-facing application still benefits from a concise contract for implementation and review.
- Defining a formal API schema: rejected because there is no new network or programmatic interface.

## Decision 5: Validate manually through the existing planner page

**Decision**: Use manual browser validation on the existing Florida Bound planner page, served over a local static server so JSON fetches continue to work.

**Rationale**:
- The planner loads data with `fetch('florida-bound-locations.json')`, so validation should run over HTTP rather than relying on direct `file://` access.
- The repository's working practices call for opening affected pages, verifying key assets load, and checking that the presentation remains understandable.
- The feature success criteria are visual and interaction-focused, making manual review the appropriate validation method.

**Alternatives considered**:
- Adding automated UI tests: rejected for now because the repo does not already use a browser test harness and the requested scope is intentionally small.
- Validating only the first planner instance: rejected because the spec explicitly requires consistent behavior across multiple planner instances.
