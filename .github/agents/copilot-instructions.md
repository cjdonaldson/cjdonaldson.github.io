# cjdonaldson.github.io Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-13

## Active Technologies
- HTML5, CSS3, vanilla JavaScript (existing browser-executed static assets) + Browser DOM APIs, existing Florida Bound planner scripts/styles, static JSON fetch for planner data, no new libraries (001-one-line-filter-fields)
- HTML5, CSS3, vanilla JavaScript (ES6+) + None — zero-build; native browser DOM and FormData APIs only (001-location-form-ux)
- JSON (data file), vanilla JavaScript (formula — browser-native only) + `crypto.subtle.digest` (browser) / Node.js `crypto` module (tooling) — zero external libraries (001-add-location-ids)
- HTML5, CSS3, vanilla JavaScript (ES2017 — async/await, TextEncoder) + Web Crypto API (`crypto.subtle.digest('SHA-256', …)`, (001-location-id-form)

- HTML5, CSS3, vanilla JavaScript (ES5-compatible; existing + Browser-native `<input type="date">` and (001-planner-date-stay)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

HTML5, CSS3, vanilla JavaScript (ES5-compatible; existing: Follow standard conventions

## Recent Changes
- 001-location-id-form: Added HTML5, CSS3, vanilla JavaScript (ES2017 — async/await, TextEncoder) + Web Crypto API (`crypto.subtle.digest('SHA-256', …)`,
- 001-add-location-ids: Added JSON (data file), vanilla JavaScript (formula — browser-native only) + `crypto.subtle.digest` (browser) / Node.js `crypto` module (tooling) — zero external libraries
- 001-location-form-ux: Added HTML5, CSS3, vanilla JavaScript (ES6+) + None — zero-build; native browser DOM and FormData APIs only
- 001-one-line-filter-fields: Added HTML5, CSS3, vanilla JavaScript (existing browser-executed static assets) + Browser DOM APIs, existing Florida Bound planner scripts/styles, static JSON fetch for planner data, no new libraries
- 001-planner-date-stay: Added HTML5, CSS3, vanilla JavaScript (ES5-compatible; existing + Browser-native `<input type="date">` and

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
