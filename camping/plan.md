# Plan: Reference Unreferenced Files in camping/

## Problem
Many files in `camping/` are not linked from any HTML page. The goal is to surface them via the site, primarily through `index.html` and/or `florida-bound.html`.

## Unreferenced Files (14 total)

### Markdown docs
| File | Suggested home |
|------|---------------|
| `camping-ideas.md` | index.html → new "Notes & Ideas" section |
| `camping-internet.md` | index.html → new "RV Resources" section |
| `camping_nashua_nh.md` | index.html → Trip Itineraries (new entry) |
| `camping_Nokomis.md` | index.html → Trip Itineraries (new entry) |
| `camping_race-1776_marine_corp-prince_william_forest_park.md` | index.html → Trip Itineraries → Races sub-section |
| `camping_race-marine_corp_marathon-arlington.md` | index.html → Trip Itineraries → Races sub-section |
| `camping_race_valley_10_miler_run-wyoming.md` | index.html → Trip Itineraries → Races sub-section |
| `camping-stone_mountain_camping_ga.md` | index.html → Trip Itineraries (new entry) |
| `reservations.md` | index.html → Quick Links |
| `rv-maintenance.md` | index.html → Quick Links or Camping-Setup.html |
| `upgrades.md` | index.html → Quick Links or Camping-Setup.html |
| `windshield-chip-crack-repair.md` | index.html → Quick Links or Camping-Setup.html |

### PDF / binary docs
| File | Suggested home |
|------|---------------|
| `air_360.pdf` (831 KB) | index.html or Camping-Setup.html → "Winegard Air 360 Manual" |
| `Winegard - TV-FM Antenna...pdf` (787 KB) | Same section — different file size, likely different version |

## Approach

1. **Decide markdown rendering** — `.md` files show as raw text in browsers. Options:
   - Convert to HTML
   - Add a JS markdown renderer (e.g. marked.js)
   - Link as-is (plain text, acceptable for reference docs)

2. **Audit PDFs** — `air_360.pdf` (831 KB) and the long-named Winegard PDF (787 KB) are different sizes. Link both or only the newer one?

3. **Update `index.html`** with grouped links:
   - Trip Itineraries → Nashua NH, Nokomis, Stone Mountain GA + Races sub-section
   - Quick Links → reservations, rv-maintenance, upgrades, windshield repair
   - New "RV Resources" section → camping-internet, Winegard PDF(s)
   - New "Notes & Ideas" → camping-ideas

4. **`camping/docs/`** — created as a home for future converted/HTML versions of docs.
