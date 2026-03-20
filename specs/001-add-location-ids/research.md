# Research: Add Stable Location IDs

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Phase**: 0 — Outline & Research
**Feature**: `001-add-location-ids`
**Status**: Complete — no open unknowns

---

## R-001 · ID Generation Algorithm

**Decision**: SHA-256 of `"<lat>,<lng>"`, first 8 hex characters, using
browser-native `crypto.subtle.digest` (or Node.js `crypto.createHash` for
tooling use).

**Rationale**: The spec defines this formula exactly (FR-004, FR-007). No
research was needed to choose the algorithm; verification confirmed the approach
is sound:

- `crypto.subtle` is available in every modern browser and in Node.js ≥ 15
  without any imports or build steps.
- SHA-256 distributes uniformly; 8 hex chars give a 32-bit keyspace
  (~4 billion combinations) against 23 locations — negligible collision
  probability for valid, distinct coordinate pairs.
- The formula is fully reproducible from a browser console as required by
  FR-007.

**Alternatives considered**: UUID v4 (rejected — not deterministic), UUID v5
(rejected — adds library dependency), sequential integers (rejected — not stable
across reordering), base-62 slug of name (rejected — unstable when names change).

---

## R-002 · Coordinate Precision: 4 Decimal Places Required

**Decision**: All coordinate values in `camping/florida-bound-locations.json` MUST be written
with exactly 4 decimal places. The ID formula uses `toFixed(4)` on the parsed number, ensuring
the hash input string is always identical to what is written in the JSON source. A coordinate
with fewer or more than 4 decimal places is a data error.

**Rationale**: Standardising on 4 decimal places eliminates any mismatch between the raw JSON
text and the formula input string. `toFixed(4)` is consistent across all JavaScript runtimes
(browser and Node.js), so the formula is portable and unambiguous. Three locations in the file
already carry coordinates with trailing zeros written as 4 decimal places; these values are
correct as-is and must not be altered:

| Location | State | `coords` (as stored) | Formula input string |
|----------|-------|----------------------|----------------------|
| Cattail Creek Campground | VA | `[36.5964, -77.5850]` | `"36.5964,-77.5850"` |
| Spacious Skies Sandy Run | NC | `[34.8396, -78.9830]` | `"34.8396,-78.9830"` |
| Country Oaks Campground & RV | GA | `[30.7997, -81.6890]` | `"30.7997,-81.6890"` |

**Alternatives considered**: Using raw template-literal interpolation `${lat},${lng}` (rejected —
JavaScript drops trailing zeros, creating a mismatch between the JSON text and the formula input
and making the rule harder to reason about for maintainers).

---

## R-003 · Key Insertion Order in JSON

**Decision**: Use hand-editing (or a format-preserving script) to insert `id`
as the first key. Rely on standard JSON key-insertion-order preservation in
modern JavaScript engines.

**Rationale**: FR-002 requires `id` to be the first key. Modern JSON engines
(V8, SpiderMonkey, JavaScriptCore) and Node.js `JSON.stringify` preserve string
key insertion order per ECMAScript specification. GitHub Pages serves the file
statically; no JSON re-serialization occurs at runtime. Hand-editing is the
lightest viable approach and keeps the change fully auditable as a diff.

**Alternatives considered**: A Node.js reformatter script (viable but adds a
tooling step for a one-time change); `jq` with `--sort-keys` (rejected — sorts
alphabetically, moves `id` after `hours` and `name`).

---

## R-004 · Hamburg Coordinate Collision — RESOLVED ✅

**Finding**: An earlier run of the formula revealed that **Cabela's Hamburg**
and **Camping World Hamburg** shared identical coordinates `[40.5514, -75.9386]`
in the JSON, producing the same `id` `8614fd14`. This violates FR-005 and
matches the exact collision edge case identified in the spec.

**Resolution**: The maintainer corrected the coordinates before plan completion:

| Location | Old coords | Corrected coords | New `id` |
|---|---|---|---|
| Cabela's Hamburg | `[40.5514, -75.9386]` | `[40.5577, -76.0019]` | `d1bac0ce` |
| Camping World Hamburg | `[40.5514, -75.9386]` | `[40.5607, -75.9961]` | `9bb9e11b` |

All 23 location IDs are now unique.

---

## Pre-Computed ID Table (all 23 locations, collision-free)

| id | Name | State | Coords (as stored) | Formula input |
|----|------|-------|--------------------|--------------|
| `5c4ce2cb` | Royal Coachman | FL | `[27.1392, -82.4526]` | `"27.1392,-82.4526"` |
| `0450fbdd` | Papa Lew's | FL | `[28.3345, -82.2292]` | `"28.3345,-82.2292"` |
| `5fd7359d` | Flywheeler Park | FL | `[27.7536, -81.7787]` | `"27.7536,-81.7787"` |
| `7e1e55c0` | Camping World Roanoke | VA | `[37.3226, -79.9745]` | `"37.3226,-79.9745"` |
| `a1122425` | Smith Mountain Campground | VA | `[36.9039, -79.6389]` | `"36.9039,-79.6389"` |
| `cf0b163f` | Indian Heritage RV Park | VA | `[36.6914, -79.8725]` | `"36.6914,-79.8725"` |
| `1a3f891d` | Hidden Acres Family Campground | VA | `[38.0331, -77.3869]` | `"38.0331,-77.3869"` |
| `7d5692f4` | South 40 Campground | VA | `[37.2095, -77.3975]` | `"37.2095,-77.3975"` |
| `37ffd3de` | Shenandoah River State Park | VA | `[38.8489, -78.3104]` | `"38.8489,-78.3104"` |
| `1092cc3b` | Cattail Creek Campground | VA | `[36.5964, -77.5850]` | `"36.5964,-77.5850"` |
| `bf531552` | Spacious Skies Sandy Run | NC | `[34.8396, -78.9830]` | `"34.8396,-78.9830"` |
| `926cae37` | Florence RV Park | SC | `[34.1625, -79.7089]` | `"34.1625,-79.7089"` |
| `cce6e85c` | Spacious Skies Campgrounds Savannah | GA | `[32.0359, -81.1564]` | `"32.0359,-81.1564"` |
| `1f25e7ca` | Country Oaks Campground & RV | GA | `[30.7997, -81.6890]` | `"30.7997,-81.6890"` |
| `1d3b7719` | Eagle's Roost RV Resort | GA | `[30.6793, -83.0918]` | `"30.6793,-83.0918"` |
| `674cc343` | Deep Bend Landing | GA | `[31.4753, -81.9831]` | `"31.4753,-81.9831"` |
| `c8474e10` | Lake Harmony RV Park | GA | `[31.5853, -81.4494]` | `"31.5853,-81.4494"` |
| `8b6ab13e` | Okefenokee RV Park | GA | `[30.8515, -82.0191]` | `"30.8515,-82.0191"` |
| `90817842` | Jenny Ridge RV Park | GA | `[30.8145, -81.9987]` | `"30.8145,-81.9987"` |
| `62369192` | McIntosh Lake RV Park | GA | `[31.8646, -81.5028]` | `"31.8646,-81.5028"` |
| `413a7acf` | Riegelsville | PA | `[40.5936, -75.1886]` | `"40.5936,-75.1886"` |
| `d1bac0ce` | Cabela's Hamburg | PA | `[40.5577, -76.0019]` | `"40.5577,-76.0019"` |
| `9bb9e11b` | Camping World Hamburg | PA | `[40.5607, -75.9961]` | `"40.5607,-75.9961"` |
