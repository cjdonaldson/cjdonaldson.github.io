# Quickstart: Route Plan Sequence

<!-- Formatting rule: remove trailing whitespace from every line. Use blank lines, not Markdown hard-break spaces. -->

**Branch**: `001-route-plan-sequence`
**Date**: 2025-07-18

## What This Feature Adds

After this feature is implemented, the Florida Bound Route Planner page
(`camping/florida-bound-planner.html`) will display a **Route Sequence** area below
the "View Route in Google Maps" link whenever two or more stops are in a route. The area
includes:

- A multi-line text field showing the current route as a colon-separated string of
  location IDs (e.g., `5c4ce2cb:0450fbdd:5fd7359d`).
- A **Copy** button that puts the sequence on the clipboard with one click.
- A **Plan title** field that doubles as a dropdown selector for saved route plans.

Users can paste a previously copied sequence into the text field to reconstruct a route
instantly. Named plans stored in the data file appear in the title dropdown and load with
one click.

---

## Files Changed

| File | Change |
|------|--------|
| `camping/florida-bound-data-loader.js` | Add `id` to flattened location object; add `routeData` + `getRouteData()` |
| `camping/florida-bound-locations.json` | Add top-level `"routes": []` array |
| `camping/florida-bound-grid.js` | Add sequence area HTML, `updateSequenceArea()`, paste handler, copy handler, title combobox |
| `camping/florida-bound-planner.css` | Add styles for `.sequence-area`, `.sequence-textarea`, `.route-title-input`, `.waypoint-error` |

No new files, no new dependencies, no build step.

---

## Local Validation

The page must be served over HTTP to load the JSON data file (browser fetch restrictions).
Use any static file server:

```bash
# From the camping/ directory:
python3 -m http.server 8080

# Then open:
http://localhost:8080/florida-bound-planner.html
```

### Manual test checklist

**P1 — Live sequence display**

1. Open the planner. With only the default start location, confirm the sequence area is
   hidden.
2. Add a second stop. Confirm a sequence string appears below the map link with two IDs
   joined by `:`.
3. Add a third stop. Confirm the sequence string extends.
4. Remove the second stop. Confirm the string shortens to two IDs.

**P2 — Copy to clipboard**

5. With a 2-stop route, click the **Copy** button. Paste into a text editor; confirm the
   pasted text matches the displayed sequence exactly.
6. Confirm the button shows brief visual feedback (text/icon changes for ~1.5 s then resets).

**P3 — Restore from paste**

7. Open the planner. Paste a known sequence (e.g., `5c4ce2cb:0450fbdd:5fd7359d`) into the
   sequence text area. Confirm all three stops appear in the route display in order.
8. Paste a sequence with one unknown ID (e.g., `5c4ce2cb:BADID:5fd7359d`). Confirm the two
   valid stops load and an error row appears at the second position.
9. Clear the textarea and leave focus. Confirm no route change and no error.

**P4 — Named plan dropdown**

10. Add at least one entry to `"routes"` in `florida-bound-locations.json`, reload the page,
    and confirm the plan title appears in the title dropdown.
11. Select the saved plan name. Confirm the sequence field populates and the route loads.

**Layout check**

12. Resize the browser to a narrow mobile width and confirm the sequence area remains
    readable and does not overflow the viewport horizontally.

---

## Adding a Named Route Plan

Edit `camping/florida-bound-locations.json` and add an entry to the `"routes"` array:

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

The `title` field appears in the dropdown on page load. Selecting it populates the sequence
field and reconstructs the route. The page never writes back to the file; all editing is
done in the JSON file directly.

---

## Sequence String Format

- Location IDs are joined by `:` (colon).
- Both `:` and `-` are accepted when pasting; the output always uses `:`.
- ID order matches route stop order.
- Duplicate IDs are allowed; each occurrence becomes a separate stop.
- An ID not found in the location data is shown as an inline error row in the route display,
  not as a blocker. The planner remains fully usable.

---

## Known Constraints

- The planner page does not write saved plans back to the JSON file. New named plans must be
  added to the file manually.
- If a location's `id` field changes in the JSON, any saved sequences that reference the old
  ID will fail to resolve and will render as error rows.
- The title dropdown uses the native browser `<datalist>` element; dropdown option styling
  is controlled by the browser and cannot be customised.
