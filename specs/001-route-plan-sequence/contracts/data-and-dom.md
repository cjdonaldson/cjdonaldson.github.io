# Contracts: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence`
**Phase**: 1 — Design
**Date**: 2025-07-18

This file documents the data contracts that cross a boundary — specifically the JSON data
file read by the planner page and the public JS function interfaces within the module.

---

## 1. JSON Data File Contract

**File**: `camping/florida-bound-locations.json`
**Consumer**: `florida-bound-data-loader.js` (via `fetch`)

### 1.1 Existing top-level structure (unchanged)

```json
{
  "routes": [ ... ],
  "states": [ ... ]
}
```

The `routes` key is **new** (added by this feature). It MUST appear before `states` at the
top level. If absent, the data loader treats it as an empty array.

### 1.2 `routes` array schema (new)

Each entry represents one named route plan saved by the site maintainer.

```jsonc
// routes[n]
{
  "title":    string,   // required — human-readable plan name, no length limit
  "sequence": string    // required — colon-separated location IDs, e.g. "5c4ce2cb:0450fbdd"
}
```

**Constraints**:
- `title` must be a non-empty string.
- `sequence` must be a string of one or more hex IDs joined by `:`. Each ID must match an
  `id` field in a `states[].locations[]` entry to resolve to a stop; unmatched IDs are
  rendered as inline errors but are not a validation error at the data level.
- The array may be empty (`[]`) or absent. Both are valid; both result in an empty title
  dropdown.

### 1.3 `states[].locations[].id` field (existing, now required by loader)

```jsonc
// states[n].locations[m]
{
  "id": string,   // 8-char hex string, stable, required by loader
  ...
}
```

Previously the loader silently ignored this field. After this change the loader reads it and
includes it in the flattened `locationData` object. All existing location entries already
have an `id` field; no data migration is needed.

---

## 2. JavaScript Module Contract

**File**: `camping/florida-bound-data-loader.js`

### 2.1 `loadLocationData()` (existing, signature unchanged)

```ts
async function loadLocationData(): Promise<LocationObject[]>
```

Fetches `florida-bound-locations.json`, flattens `states[].locations[]` into a flat array,
and stores it in the module-scoped `locationData`. Also populates `routeData` (new).

Returns the populated `locationData` array.

**Changed behaviour**: The returned objects now include an `id` field.

### 2.2 `getLocationData()` (existing, unchanged)

```ts
function getLocationData(): LocationObject[]
```

Returns the module-scoped `locationData` array after `loadLocationData()` has resolved.

### 2.3 `getRouteData()` (new)

```ts
function getRouteData(): NamedRoutePlan[]
```

Returns the module-scoped `routeData` array (the parsed `routes` key from the JSON file).
Returns `[]` if the JSON has no `routes` key or if `loadLocationData()` has not yet been
called.

---

## 3. LocationObject shape (flattened, as returned by `getLocationData()`)

```ts
interface LocationObject {
    id:           string;           // NEW — 8-char hex, e.g. "5c4ce2cb"
    name:         string;
    zip:          string;
    url:          string | undefined;
    coords:       [number, number]; // [lat, lng]
    defaultStart: boolean;
    city:         string | undefined;
    state:        string | undefined;
    address:      string | undefined;
    bookingUrl:   string | undefined;
    phone:        string | undefined;
}
```

---

## 4. NamedRoutePlan shape (as returned by `getRouteData()`)

```ts
interface NamedRoutePlan {
    title:    string;   // plan name
    sequence: string;   // colon-separated IDs
}
```

---

## 5. Sequence string format

The canonical sequence string is defined as:

```
sequence := id (':' id)*
id        := [0-9a-fA-F]{8}      // 8-char hex (all current IDs follow this pattern)
```

- Separator is always `:` in generated output.
- During paste/input parsing, `-` is also accepted as a separator and normalised to `:`.
- Whitespace and characters outside `[a-zA-Z0-9:\-]` are stripped before parsing.
- Duplicate IDs are permitted; each occurrence maps to a separate stop.
- The empty string produces no route change.

---

## 6. DOM interface contract (sequence area)

The following HTML structure is injected by `renderPlanner()` and must be stable for event
wiring. IDs use `{id}` as the planner's numeric identifier.

```html
<div id="sequence-area-{id}" class="sequence-area" style="display:none">

  <div class="sequence-title-row">
    <label for="route-title-input-{id}">Plan title:</label>
    <input type="text"
           id="route-title-input-{id}"
           list="route-titles-{id}"
           class="route-title-input"
           autocomplete="off">
    <datalist id="route-titles-{id}"></datalist>
  </div>

  <div class="sequence-row">
    <label for="sequence-text-{id}">Route sequence:</label>
    <textarea id="sequence-text-{id}"
              class="sequence-textarea"
              rows="2"
              spellcheck="false"></textarea>
    <button id="sequence-copy-btn-{id}"
            class="sequence-copy-btn"
            type="button">📋 Copy</button>
  </div>

  <div id="sequence-copy-warning-{id}"
       class="sequence-copy-warning"
       style="display:none">
    ⚠ Could not copy to clipboard.
  </div>

</div>
```

**Notes**:
- The wrapper `div#sequence-area-{id}` is toggled between `display:none` and `display:block`
  (or `display:flex` if row layout is used) by `updateSequenceArea()`.
- The `<datalist>` options are populated from `getRouteData()` titles once on page load.
- The `<textarea>` receives its value from `updateSequenceArea()` on every route change.
- The `<textarea>` also fires on `input` and `change` for paste/type-in reconstruction.
