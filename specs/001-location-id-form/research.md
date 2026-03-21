# Research: Location ID Generation in Location Form

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Feature**: `001-location-id-form`
**Phase**: 0 — Outline & Research
**Status**: Complete — all unknowns resolved

---

## 1. Web Crypto API: `crypto.subtle.digest` in the Browser

**Decision**: Use `crypto.subtle.digest('SHA-256', data)` (Web Crypto API, built into
all modern browsers) to produce the SHA-256 hash in the browser. No library required.

**Rationale**: The reference implementation (`location-id-gen.js`) uses
`crypto.createHash('sha256')` from Node.js's built-in `crypto` module, which is not
available in the browser. The Web Crypto API is the direct browser equivalent. It is
natively available in all modern browsers on HTTPS and in Firefox on `file://`. It
requires no polyfill and adds zero dependencies.

**Alternatives considered**:
- *Bundling a pure-JS SHA-256 library (e.g., `js-sha256`)* — rejected: adds an
  external dependency, violates the single-file / no-new-dependency constraint, and is
  unnecessary given native API availability.
- *Using `crypto.subtle` via a polyfill for Chrome `file://`* — rejected: the spec
  explicitly chooses to block JSON generation with an error message rather than
  polyfill. Firefox over `file://` is the supported local-use path.

**Browser availability**:
- Firefox (any origin, including `file://`): ✅ available
- Chrome, Safari, Edge (HTTPS): ✅ available
- Chrome over `file://`: ❌ not available — `crypto.subtle` is `undefined` in an
  insecure context. The form must detect this and display an error.

---

## 2. Algorithm Translation: Node.js → Browser

**Decision**: Inline the following async function in the submit handler — no separate
named function required unless it improves readability in the implementation:

```javascript
// coordString = "27.1392,-82.4526"  (each coord at .toFixed(4))
const encoder = new TextEncoder();
const data = encoder.encode(coordString);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hexString = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
const id = hexString.slice(0, 8);
```

**Rationale**: `TextEncoder` converts the UTF-8 string to a `Uint8Array` as required
by `SubtleCrypto.digest`. The digest returns an `ArrayBuffer`; wrapping it in
`Uint8Array` and mapping to hex reproduces the `.digest('hex')` output of the Node.js
version. Slicing the first 8 characters matches `location-id-gen.js`'s `.slice(0, 8)`.

**Verification** (manual cross-check with `node location-id-gen.js`):

| Input coord string | Expected id (from Node.js) |
|--------------------|---------------------------|
| `"27.1392,-82.4526"` | run `node location-id-gen.js "27.1392,-82.4526"` to confirm |
| `"36.1716,-115.1391"` | run `node location-id-gen.js "36.1716,-115.1391"` to confirm |
| `"25.7617,-80.1918"` | run `node location-id-gen.js "25.7617,-80.1918"` to confirm |

These cross-checks are part of the manual acceptance criteria (SC-002).

**Alternatives considered**:
- *Using a `crypto.createHash` polyfill that works in the browser* — rejected: same
  reason as above; native API is sufficient.

---

## 3. Coordinate Normalization: `parseFloat(...).toFixed(4)`

**Decision**: Normalize latitude and longitude to exactly 4 decimal places using
`parseFloat(value).toFixed(4)` before assembling the coordinate string.

**Rationale**: `toFixed(4)` applies standard half-up rounding in JavaScript and
produces a string with exactly 4 decimal digits. This matches the expectation set by
`location-id-gen.js`, which validates its CLI input with `/^-?\d+\.\d{4},-?\d+\.\d{4}$/`
— the script requires the caller to pre-normalize. The form must produce those
normalized strings itself.

**Edge case**: `parseFloat` is needed because the `<input type="number">` value is
already a string; `parseFloat` ensures leading/trailing whitespace or empty-string edge
cases are handled (though the `required` attribute prevents blank submission).

**Alternatives considered**:
- *`Number(value).toFixed(4)`* — functionally equivalent; `parseFloat` chosen for
  clarity of intent when reading raw form strings.
- *Custom rounding function* — rejected: `toFixed(4)` is the explicitly specified
  normalization per the spec clarifications.

---

## 4. Async Handler: Promoting `submit` Listener to `async`

**Decision**: Change `function(e)` to `async function(e)` on the existing
`addEventListener('submit', ...)` callback. Await `crypto.subtle.digest(...)` inline.

**Rationale**: The spec requires `async`/`await` (FR-009). Promoting the handler is a
minimal, non-breaking change — the `e.preventDefault()` call at the top of the handler
still fires synchronously before any `await`, which is the critical requirement for
preventing form submission. Async event handlers that call `preventDefault()` as their
first synchronous statement behave identically to synchronous handlers for this purpose.

**Verification**: `e.preventDefault()` is synchronous and is called before the first
`await`; the browser processes it before yielding. This is standard, well-documented
behavior (MDN: "Calling preventDefault() inside an async function works as long as it
is called before the first await").

**Alternatives considered**:
- *Wrapping `crypto.subtle.digest` in a `.then()` chain inside a synchronous handler*
  — rejected: the spec explicitly requires `async`/`await` syntax (FR-009).
- *Moving hash computation to a top-level async function* — acceptable, but unnecessary
  complexity for a single-file form. Inline await is cleaner.

---

## 5. `crypto.subtle` Unavailability: Error Handling

**Decision**: Check `if (!crypto.subtle)` at the top of the submit handler (after
`e.preventDefault()`). If absent, display a human-readable error in the output area
and return without producing any JSON.

**Rationale**: Chrome restricts `crypto.subtle` to secure contexts (HTTPS or
`localhost`). Opening `location-form.html` directly in Chrome via `file://` leaves
`crypto.subtle` as `undefined`. The spec (FR-010, SC-004) explicitly requires blocking
JSON output and displaying an actionable error message — no partial or ID-less fallback.

**Proposed error message**:
> **ID generation is not supported in this context.**
> Please open this file in Firefox, or serve it over HTTP/HTTPS.

The error is rendered in the existing `#output` area (making the div visible with the
`.show` class) so the maintainer sees it in context without a disruptive `alert()`.

**Alternatives considered**:
- *`window.alert()`* — disruptive; rejected in favor of in-page output area display.
- *Falling back to ID-less JSON* — explicitly rejected by FR-010 and the spec
  clarifications.
- *Detecting via `window.isSecureContext`* — equivalent but less direct than checking
  `crypto.subtle` itself, which is the actual API being used.

---

## 6. JSON Field Order: `id` First

**Decision**: Construct the output object with `id` as the first assigned key, before
`name`, `address`, etc.

**Rationale**: JavaScript objects preserve insertion order for string keys (ES2015+).
`JSON.stringify` serializes keys in insertion order. Assigning `location.id = …`
before all other keys guarantees `id` appears first in the output (FR-004, US-3).

**Implementation note**: The current handler builds `location` as a plain object with
sequential assignments. To make `id` first, either (a) declare
`const location = { id: computedId }` at initialization, or (b) assign
`location.id = computedId` as the very first statement after the object is created and
before any other key is assigned. Both approaches work; option (a) is cleaner.

**Alternatives considered**:
- *Post-processing with `Object.fromEntries`* — unnecessary complexity.
- *Custom serializer for `JSON.stringify`* — unnecessary; insertion order is sufficient.

---

## 7. Normalized Coordinates in JSON Output

**Decision**: Write the 4-decimal normalized float values (via `parseFloat(...).toFixed(4)`)
into the `coords` array in the JSON output, replacing the current `parseFloat(...)` raw
values.

**Rationale**: FR-008 requires the JSON `coords` values to be the same normalized
values used for ID computation — not the raw entered values. This ensures consistency:
a maintainer reading the JSON can always re-derive the `id` from the `coords` without
needing to re-normalize.

**Current code** (to be replaced):
```javascript
location.coords = [
    parseFloat(formData.get('latitude')),
    parseFloat(formData.get('longitude'))
];
```

**Proposed replacement**:
```javascript
const lat = parseFloat(formData.get('latitude')).toFixed(4);
const lng = parseFloat(formData.get('longitude')).toFixed(4);
// coords stored as numbers, not strings
location.coords = [parseFloat(lat), parseFloat(lng)];
```

Note: `toFixed(4)` returns a string; wrapping with `parseFloat` converts back to a
number so `coords` remains an array of numbers in the JSON, not strings.

---

## Summary of Resolved Unknowns

| Item | Resolution |
|------|-----------|
| SHA-256 in browser | `crypto.subtle.digest('SHA-256', TextEncoder.encode(str))` |
| Coordinate normalization | `parseFloat(val).toFixed(4)` → string for hash, `parseFloat(str)` for JSON number |
| Handler async promotion | `async function(e)` — `e.preventDefault()` still synchronous before first `await` |
| `crypto.subtle` unavailable | Check `!crypto.subtle`, render error in `#output`, return — no JSON produced |
| `id` field order | Assign `location.id` before all other keys |
| Normalized coords in JSON | `coords: [parseFloat(lat), parseFloat(lng)]` using `toFixed(4)` normalized values |
