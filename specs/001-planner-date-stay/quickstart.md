# Quickstart: Manual Verification Guide

*Phase 1 output for branch `001-planner-date-stay`*

Use this guide to manually verify the date/stay feature after implementation.
No build step or server is required — open the file directly in a browser.

---

## Setup

1. Open `camping/florida-bound-planner.html` in any modern browser (Chrome, Firefox,
   Safari, Edge).
2. Click **+ Add Planner** to create a planner instance.

---

## Scenario 1 — Top item shows only the departure-date field

**Steps**:
1. After clicking "+ Add Planner", look at the first (only) route item.

**Expect**:
- An editable date input labeled (or positioned) below the location name.
- No stay field anywhere in the single-item view.
- The date picker does not allow selecting a date earlier than today.

---

## Scenario 2 — First downstream stop gets a derived date, not an editable date

**Steps**:
1. Set the departure date to a date 3 days from now (e.g., `2026-03-16`).
2. Select a destination from the "Add stop" dropdown and click **Add Stop**.

**Expect**:
- The new stop shows a read-only date label equal to the departure date (`2026-03-16`).
- The new stop shows an editable stay field (default `0`).
- There is no date picker on the downstream stop.

---

## Scenario 3 — Stay changes cascade to later derived dates

**Steps**:
1. With at least two downstream stops visible, set the stay on stop 2 to `3`.

**Expect**:
- Stop 2 keeps its current derived date (unchanged).
- Stop 3's derived date advances by 3 days from stop 2's derived date.
- Any stops after stop 3 also advance accordingly.
- Stop 1 (top item) is unaffected.

---

## Scenario 4 — Changing departure date recomputes all downstream dates

**Steps**:
1. With multiple downstream stops showing derived dates, change the departure date
   on the top item to a date 7 days from now.

**Expect**:
- Every downstream stop's derived date shifts by the same amount.
- Stay values are unchanged.

---

## Scenario 5 — Removing a middle stop recomputes remaining downstream dates

**Steps**:
1. Build a route: top + three downstream stops, with stays of `2`, `3`, `1`.
2. Remove the second downstream stop (the one with stay `3`).

**Expect**:
- The remaining downstream stops recompute from the departure date + retained stays.
- No stale dates remain.

---

## Scenario 6 — Reset returns to single-item state

**Steps**:
1. With multiple stops, click **Reset Route**.

**Expect**:
- Only the top item is shown.
- No stay fields.
- The departure-date field is cleared (or returned to empty / default).

---

## Scenario 7 — Past date blocked on departure picker

**Steps**:
1. On the top item's date picker, try to select yesterday's date.

**Expect**:
- The browser's date picker prevents selecting any date before today.

---

## Pass Criteria

All seven scenarios pass with no console errors and no visual regressions to the
existing distance/direction/stop controls.
