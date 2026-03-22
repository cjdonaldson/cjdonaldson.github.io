# Data Model: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence`
**Phase**: 1 — Design
**Date**: 2025-07-18

## Entities

### 1. `Location` (existing — one field added)

Source: `states[].locations[]` in `florida-bound-locations.json`
Loaded by: `florida-bound-data-loader.js` → `locationData[]`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (hex, 8 chars) | yes | **NEW** — was stripped by loader; now retained |
| `name` | string | yes | Display name |
| `zip` | string | yes (loader filter) | Postal code |
| `coords` | [number, number] | yes | `[lat, lng]` |
| `url` | string | no | Website URL |
| `city` | string | no | |
| `state` | string | no | Two-letter state code |
| `address` | string | no | Street address |
| `bookingUrl` | string | no | |
| `phone` | string | no | |
| `defaultStart` | boolean | no | True for the default start location |

**Change**: `id` field added to the flattened object in `loadLocationData()`.

```js
// florida-bound-data-loader.js — changed line
locationData.push({
    id: location.id,          // ← NEW
    name: location.name,
    // ... all existing fields unchanged
});
```

---

### 2. `NamedRoutePlan` (new)

Source: `routes[]` (top-level) in `florida-bound-locations.json`
Loaded by: `florida-bound-data-loader.js` → `routeData[]` (new)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Human-readable plan name; no length restriction |
| `sequence` | string | yes | Colon-separated location IDs (e.g., `5c4ce2cb:0450fbdd:5fd7359d`) |

**JSON example** (to be added to `florida-bound-locations.json`):
```json
{
  "routes": [
    {
      "title": "Florida Snowbird Run",
      "sequence": "5c4ce2cb:0450fbdd:5fd7359d"
    }
  ],
  "states": [ ... ]
}
```

**Loader additions** (new module-level state + function):
```js
let routeData = [];

// Inside loadLocationData(), after populating locationData:
routeData = (data.routes || []);

// New export:
function getRouteData() {
    return routeData;
}
```

---

### 3. `Planner` (existing — no new persistent fields)

Runtime object in `planners[]` array in `florida-bound-grid.js`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Incrementing planner ID |
| `route` | Location[] | Ordered array of stops; each stop now has `.id` |
| `departureDate` | string (ISO) | Departure date |
| `stays` | number[] | Per-stop nights |

No new persistent fields. The sequence string and title are derived from `route` on every
render; they are not stored on the planner object.

---

### 4. `RouteSequence` (derived, ephemeral)

Not stored. Computed from `planner.route` on every `updateRouteDisplay()` call.

| Derived Value | Source | Formula |
|---------------|--------|---------|
| sequence string | `planner.route` | `route.map(loc => loc.id).join(':')` |
| stop count | `planner.route.length` | determines visibility of sequence area |
| sequence area visible | stop count | visible when `route.length >= 2` |

---

## State Transitions

### Sequence area visibility

```
route.length < 2  →  sequence area hidden (display: none)
route.length >= 2 →  sequence area visible
```

Triggered by every call to `updateRouteDisplay(plannerId)`.

### Route reconstruction from paste

```
User pastes text into textarea
    ↓
input / change event fires
    ↓
sanitiseSequence(raw)      -- strip whitespace, illegal chars, normalise dash → colon
    ↓
split on ':'               -- produces token array
    ↓
for each token:
    lookup in locationData by id
        found   → push Location object to new route array
        not found → push { errorId: token } sentinel object
    ↓
planner.route = new route array (replaces existing route)
planner.stays = array of 0s matching new route length
    ↓
updateRouteDisplay(plannerId)
    ↓
route display renders waypoint rows for Location objects
               and error rows for { errorId } sentinels
```

### Named plan selection

```
User selects option from title datalist  (or types matching title)
    ↓
input event fires on title input
    ↓
compare input.value against routeData[].title
    found   → populate textarea with plan.sequence
              → trigger route reconstruction (same path as paste)
    not found → no route change (free-text title entry, no side effect)
```

---

## Validation Rules

| Rule | Source | Behaviour on violation |
|------|--------|----------------------|
| Location must have `coords` and `zip` to be loaded | existing loader filter | location skipped silently |
| Location `id` must be a non-empty string | assumed; no new validation | if absent, stop renders with `undefined` as ID |
| Sequence token not found in `locationData` | lookup miss | rendered as error row in route display |
| Empty or whitespace-only textarea | sanitiseSequence returns `""` | no route reconstruction; no error shown |
| `routes` array absent from JSON | `data.routes \|\| []` guard | routeData is empty; dropdown is empty; no error |

---

## DOM Element Map (new elements per planner)

| Element ID | Tag | Purpose |
|------------|-----|---------|
| `sequence-area-{id}` | `div` | Wrapper; toggled hidden/visible |
| `sequence-text-{id}` | `textarea` | Shows current sequence; accepts paste input |
| `sequence-copy-btn-{id}` | `button` | Copies sequence to clipboard |
| `route-title-input-{id}` | `input[type=text]` | Editable plan title (combobox) |
| `route-titles-{id}` | `datalist` | Options populated from `routeData[]` |
| `sequence-copy-warning-{id}` | `span` | Inline clipboard error message (hidden by default) |

All IDs use the planner's numeric `id` as suffix, consistent with all existing planner elements.
