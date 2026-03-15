# Quickstart: One-Line Filter Fields

## Goal

Verify the Florida Bound planner keeps `Filter by` and `Max value` on one horizontal row for every planner instance without changing planner behavior.

## Prerequisites

- Repository checked out at `/home/chuck/github/cjdonaldson.github.io`
- A local static server, because the planner data is loaded with `fetch()`

## Start a local server

From the repository root:

```bash
cd /home/chuck/github/cjdonaldson.github.io
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/camping/florida-bound-planner.html
```

## Manual validation steps

### 1. Single planner layout

1. Open the planner page.
2. Confirm the visible planner shows:
   - `Filter by` first
   - `Max value` second
   - both controls on one horizontal row

### 2. Interaction check

1. Change `Filter by` between `Time (hours)` and `Distance (miles)`.
2. Change `Max value`.
3. Confirm the row stays intact and the planner remains usable.

### 3. Multi-planner consistency

1. Click `+ Add Planner` until at least three planners are visible.
2. Confirm every planner instance shows the same one-row filter layout.
3. Remove a planner and confirm the remaining planners still preserve the one-row layout.

### 4. Narrow-width check

1. Resize the browser to a narrow mobile-like width.
2. Confirm `Filter by` and `Max value` remain visually grouped as one row.
3. Confirm unrelated controls such as `Direction` remain outside that row.

### 5. Refresh check

1. Refresh the page.
2. Confirm the planner still renders with the one-row filter layout after reload.

## Expected implementation scope

- `camping/florida-bound-grid.js`: wrap the two existing controls in a shared row container
- `camping/florida-bound-planner.css`: style the row for one-line grouping
- No new libraries, build steps, or behavior changes
