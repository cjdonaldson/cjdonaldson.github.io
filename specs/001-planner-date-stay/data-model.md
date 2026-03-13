# Data Model: Florida Bound Planner Date & Stay Driven Schedule

*Phase 1 output for branch `001-planner-date-stay`*

---

## Entities

### Planner (in-memory object, one per route planner on the page)

| Field           | Type             | Source / Notes                                              |
|-----------------|------------------|-------------------------------------------------------------|
| `id`            | integer          | Auto-incremented counter; existing field                    |
| `route`         | `Location[]`     | Ordered array of location objects; existing field           |
| `departureDate` | string (ISO date) | `"YYYY-MM-DD"`; `""` when not yet set by user; **new**     |
| `stays`         | `integer[]`      | `stays[i]` = nights at `route[i]`; `stays[0]` unused (top item has no stay); defaults to `0` for each downstream item; **new** |

`route` and `stays` are always the same length; they are spliced in lockstep when a
stop is added or removed.

---

### Location (read-only global data, unchanged)

Existing structure from `locations[]` in `florida-bound-data-loader.js`. Not mutated
by this feature.

| Field        | Type    | Notes                        |
|--------------|---------|------------------------------|
| `name`       | string  | Display name                 |
| `coords`     | [lat, lon] | For distance/bearing math  |
| `city`       | string  | Optional                     |
| `state`      | string  | Optional                     |
| `url`        | string  | Optional                     |
| `bookingUrl` | string  | Optional                     |
| `phone`      | string  | Optional                     |
| `address`    | string  | Optional                     |
| `zip`        | string  | Optional                     |

---

### Route Item (UI concept, not a separate JS object)

A route item is a rendered `<div class="waypoint-item">` corresponding to
`route[i]`. Its scheduling fields depend on position:

| Position    | Scheduling UI                                                    |
|-------------|------------------------------------------------------------------|
| `i === 0`   | `<input type="date" min="[today]">` bound to `planner.departureDate` |
| `i > 0`     | Read-only date label showing derived date + `<input type="number" min="0" step="1">` bound to `planner.stays[i]` |

---

## Derived Date Computation

```
function computeDerivedDates(planner):
  if planner.departureDate is empty → return []
  dates[0] = planner.departureDate          // top item (not displayed as derived)
  for i = 1 to route.length - 1:
    dates[i] = dates[i-1] + planner.stays[i-1] days
  return dates
```

`dates[1]` equals `planner.departureDate` (stay at top item = 0 by design; the top
item has no stay field).

---

## State Transitions

| Trigger                          | State change                                          | Re-render scope              |
|----------------------------------|-------------------------------------------------------|------------------------------|
| Page load / `addPlanner()`       | New planner with `departureDate: ""`, `stays: [0]`    | Full planner render          |
| User sets departure date         | `planner.departureDate = value`                       | Full `updateRouteDisplay`    |
| User adds a stop                 | `route.push(location)`, `stays.push(0)`               | Full `updateRouteDisplay`    |
| User changes a downstream stay   | `planner.stays[i] = value`                            | Full `updateRouteDisplay`    |
| User removes a stop at index `i` | `route.splice(i, 1)`, `stays.splice(i, 1)`            | Full `updateRouteDisplay`    |
| User resets route                | `route = [startLocation]`, `stays = [0]`, `departureDate = ""` | Full `updateRouteDisplay` |

---

## Validation Rules

| Rule    | Entity            | Constraint                                          | Enforcement                       |
|---------|-------------------|-----------------------------------------------------|-----------------------------------|
| FR-004  | Departure date    | Cannot be earlier than today                        | `min` attribute set to today's ISO date |
| FR-011  | Stay value        | Must be a non-negative whole number (0 is allowed)  | `type="number" min="0" step="1"` + clamp in event handler |
| FR-006  | Downstream date   | Read-only; not directly editable                    | Rendered as `<span>`, no input    |
| FR-003  | Top item          | No stay field shown                                 | Conditional render by index       |
