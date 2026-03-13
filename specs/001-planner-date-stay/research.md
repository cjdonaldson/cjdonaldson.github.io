# Research: Florida Bound Planner Date & Stay Driven Schedule

*Phase 0 output for branch `001-planner-date-stay`*

The codebase is a well-understood, self-contained static site with no external
dependencies. All decisions below were resolved by direct inspection of the existing
`florida-bound-grid.js` source.

---

## Decision 1 — Where to store stay values

**Decision**: Add a `stays` array to each planner object (`planner.stays[i]` is the
stay in whole days for route item `i`). The top item (`i === 0`) ignores `stays[0]`.

**Rationale**: Route items are references to shared `locations[]` objects (global
data). Mutating them to attach per-planner state would cause cross-planner
contamination. A parallel `stays[]` array on the planner object keeps route-item
objects read-only and makes removal/reorder trivial: `stays` and `route` are spliced
in lockstep.

**Alternatives considered**:
- Wrapper objects `{ location, stay }` — cleaner conceptually but would require
  touching every `waypoint.name` / `waypoint.coords` reference throughout `grid.js`;
  higher change surface for the same result.
- Storing stay in DOM `data-` attributes — tempting for a purely UI-driven approach,
  but makes `resetRoute` and `removeWaypoint` fragile (DOM must be in sync with
  logic); harder to validate.

---

## Decision 2 — Departure date and derived date storage

**Decision**: Store `planner.departureDate` as an ISO-8601 date string
(`"YYYY-MM-DD"`). Derive downstream dates by adding cumulative stays using a
`Date` object only during computation; store and compare results as ISO strings.

**Rationale**: `<input type="date">` natively reads and writes ISO strings. Keeping
the stored value as the same string avoids conversion bugs. Arithmetic is done with
`new Date(isoString)` and then `date.setDate(date.getDate() + stay)` before
formatting back to ISO — a standard, framework-free pattern with no edge cases for
whole-day arithmetic.

**Alternatives considered**:
- Unix timestamps (ms since epoch) — adds conversion noise; no benefit for
  whole-day precision.
- Storing a `Date` object — objects are mutable and don't serialize cleanly to
  planner state; ISO strings are simpler.

---

## Decision 3 — Minimum-date enforcement on the departure picker

**Decision**: Set the `min` attribute of the departure `<input type="date">` to
today's ISO date string at render time. Re-set `min` each time `updateRouteDisplay`
runs (in case the page stays open past midnight).

**Rationale**: `input[type=date]` with a `min` attribute natively prevents the user
from selecting an earlier date in all modern browsers. No custom validation logic is
needed. Resetting `min` on each render is one line and costs nothing.

**Alternatives considered**:
- `change` event validation with an alert — more visible feedback but also more
  friction; native `min` is sufficient and cleaner.
- A custom date picker — unnecessary complexity for a static page.

---

## Decision 4 — Recomputation strategy (full re-render vs. targeted updates)

**Decision**: Call `updateRouteDisplay(plannerId)` to fully re-render the route list
whenever the departure date or any stay changes. The existing function already rebuilds
the `route-display-{id}` div from scratch.

**Rationale**: `updateRouteDisplay` is already called on every `addWaypoint`,
`removeWaypoint`, and `resetRoute`. Re-using that function for date/stay changes
keeps the code path uniform and avoids a second, parallel re-render path. The route
list is small (unlikely to exceed ~15 stops for a Florida road trip), so full
re-render is instant.

**Alternatives considered**:
- Targeted DOM updates (patch only downstream date labels) — reduces DOM churn
  but adds significant complexity: a separate `recomputeDerivedDates` function that
  walks the DOM and patches only label text. Not justified at this scale; the spec
  does not mention performance sensitivity.

---

## Decision 5 — Stay input validation (non-negative whole days)

**Decision**: Use `<input type="number" min="0" step="1">` with a `value` defaulting
to `0`. Read the value with `parseInt(input.value, 10) || 0` and clamp negatives to
`0` in the `input` event handler before storing to `planner.stays[i]`.

**Rationale**: The `type="number"` attributes prevent non-numeric entry in modern
browsers. The explicit clamp in the event handler is a one-liner defensive guard that
satisfies FR-014 without a separate validation function.

**Alternatives considered**:
- `type="text"` with regex validation — higher implementation cost with no benefit.
- Allowing fractional days — out of scope; spec requires whole calendar days (FR-014).

---

## No unresolved questions

All NEEDS CLARIFICATION items were resolved by direct codebase inspection. Phase 1
design may proceed.
