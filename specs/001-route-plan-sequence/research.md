# Research: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence`
**Phase**: 0 — Research
**Date**: 2025-07-18

## Resolved Questions

### RQ-1: How to retain `id` in the data loader's flattened objects

**Decision**: Add `id: location.id` to the object literal in `florida-bound-data-loader.js`.

**Rationale**: The loader already reads every other scalar field explicitly. Adding `id` is a
one-line change with no side effects; the field name is stable by spec assumption.

**Alternatives considered**: Spread operator (`...location`); rejected because it would
pull in heavy fields (arrays, nested objects) that the downstream planner does not need and
could break assumptions about the flat shape of each location object.

---

### RQ-2: How to expose named routes from the JSON file to the page

**Decision**: Load the top-level `routes` array from `florida-bound-locations.json` inside
`loadLocationData()` and expose it via a new `getRouteData()` function in the same module.

**Rationale**: The data loader is already the single point of truth for JSON access. Adding
a parallel export keeps all JSON parsing in one file, consistent with the existing pattern.
The `routes` key is absent today; the spec requires adding it.

**Alternatives considered**: Fetching the JSON a second time in `florida-bound-grid.js`;
rejected because it duplicates the fetch and the parsing path.

---

### RQ-3: Title dropdown — `<datalist>` vs. custom JS combobox

**Decision**: Use native HTML5 `<input type="text" list="…"> + <datalist>` for the title
field.

**Rationale**:
- Zero dependencies; no build step required.
- Full free-text entry (spec FR-011) and selectable list of saved plans (spec FR-012) are
  both native behaviours.
- Width of 30–40 visible characters is set with CSS `width: 36ch` (spec FR-010).
- Text that exceeds the visible width scrolls horizontally as the cursor moves — native
  browser behaviour, no extra code needed (spec FR-011).
- Browser support is full for all modern browsers (Chrome 20+, Firefox 4+, Safari 12+).
- The dropdown cannot be styled, but no styling requirement exists in the spec.

**Alternatives considered**:
- Custom JS combobox (div + input + hidden list): rejected — heavier code (~3–5 KB), more
  accessibility work, no spec requirement for custom styling.
- `<select>`: rejected — does not permit free-text entry.

**Access in JS**: `inputEl.value` returns the current text whether typed or selected from
the list. The `input` event fires on both, which is sufficient to detect when a plan name
was selected (compare value against known plan titles).

---

### RQ-4: Clipboard API behaviour over HTTP localhost and GitHub Pages

**Decision**: Use `navigator.clipboard.writeText(text)` as the sole copy mechanism. No
`execCommand` fallback is needed.

**Rationale**:
- On localhost HTTP (`localhost` / `127.0.0.1`) the Clipboard API works because browsers
  treat localhost as a secure context.
- GitHub Pages is HTTPS, so the API always succeeds there.
- The API requires a user gesture (button click), which is exactly how the copy button is
  wired.
- A `.catch()` handler must never modify the clipboard and must display a warning message
  (spec FR-006).

**Error handling pattern**:
```js
async function copySequence(plannerId) {
    const text = document.getElementById(`sequence-text-${plannerId}`).value;
    try {
        await navigator.clipboard.writeText(text);
        // brief success feedback (button text/icon change, ~1.5 s)
    } catch (err) {
        // show a warning; do NOT write to clipboard
        showClipboardWarning(plannerId);
    }
}
```

**Alternatives considered**: `execCommand('copy')` fallback; rejected — deprecated, requires
extra DOM manipulation, and IE 11 is not a target.

---

### RQ-5: Inline error rendering for unrecognised IDs in the route sequence

**Decision**: Render unrecognised IDs as error rows in the existing `route-display-{id}`
div, at the same ordinal positions they occupied in the pasted sequence. The textarea always
holds the raw sanitised sequence string; it does not contain styled error markup.

**Rationale**:
- `<textarea>` is plain text only — it cannot contain HTML spans or styled error nodes.
- The spec says "render each unrecognized ID as an inline error in place within the route
  sequence". "Within the route sequence" refers to the rendered route display, not to the
  textarea value.
- The route display (`div#route-display-{id}`) already renders each stop as a `div.waypoint-item`.
  An error stop is simply a `div.waypoint-item.waypoint-error` with the unknown ID as its
  label, rendered at the correct index in the list.
- This approach requires no new HTML structures and no `contenteditable` complexity.

**Error row HTML pattern**:
```html
<div class="waypoint-item waypoint-error">
  <span class="waypoint-index">3.</span>
  <span class="waypoint-error-id">unknown-id-text</span>
  <span class="waypoint-error-label">⚠ Unknown ID</span>
</div>
```

**Alternatives considered**:
- `contenteditable` div with styled spans alongside a hidden textarea: rejected — adds ~100
  lines of selection/caret management code with no spec benefit.
- Separate error list below the textarea: rejected — "in place" is explicit in the spec.

---

### RQ-6: Sequence sanitisation before parse

**Decision**: Before splitting on `:` or `-`, apply a regex that removes all characters
outside `[a-zA-Z0-9:\-]` and trims leading/trailing whitespace. Then normalise `-`
separators to `:`. Split on `:` to get individual ID tokens.

**Rationale**: The spec requires stripping "all leading, trailing, and interspersed
whitespace and illegal characters" (FR-008). A single regex pass handles all cases cleanly
before the lookup loop.

```js
function sanitiseSequence(raw) {
    return raw
        .trim()
        .replace(/[^a-zA-Z0-9:\-]/g, '')  // strip illegal chars
        .replace(/-/g, ':')                // normalise dash separator
        .replace(/:{2,}/g, ':')            // collapse consecutive colons
        .replace(/^:|:$/g, '');            // strip leading/trailing colons
}
```

**Alternatives considered**: Manual character-by-character scan; rejected — regex is
shorter, well-understood, and directly testable.

---

### RQ-7: Sequence area visibility rule (show/hide)

**Decision**: The entire sequence area (textarea, copy button, title field) is rendered
into the DOM on planner creation but hidden with CSS (`display: none`). `updateRouteDisplay`
toggles visibility based on `planner.route.length >= 2`. The toggle is done by removing or
adding a CSS class, not by rebuilding the DOM.

**Rationale**: The spec (FR-002, User Story 1 scenario 4) requires the entire area to be
hidden when fewer than two stops are in the route. A CSS toggle is simpler and faster than
destroying and recreating the elements on every route change.

**Alternatives considered**: Conditional HTML generation inside `updateRouteDisplay`;
rejected because it would require re-wiring all the event listeners on every render.

---

### RQ-8: Per-planner independence of sequence area

**Decision**: All sequence area elements use the planner's numeric `id` as a suffix
(`sequence-area-{id}`, `sequence-text-{id}`, `sequence-copy-btn-{id}`,
`route-title-input-{id}`, `route-titles-{id}`). Each planner's `renderPlanner()` call
creates its own set of elements and wires its own event listeners.

**Rationale**: The spec requires each planner on the page to have its own independent
sequence and title controls (FR-015). Prefixing with planner ID is the same pattern already
used for every other planner-scoped element.

**Alternatives considered**: None; this is consistent with existing code patterns.
