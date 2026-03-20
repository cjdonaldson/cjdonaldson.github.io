#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { generateLocationId } = require('./location-id-gen.js');

const dataPath = process.argv[2];
if (!dataPath) {
  console.error('Usage: ./location-id-add.js <path/to/locations.json>');
  process.exit(1);
}

const rawJson = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawJson);

let added = 0;
let skipped = 0;
const invalidCoords = [];

data.states.forEach(state => {
  const locs = state.locations || [];
  for (let i = 0; i < locs.length; i++) {
    const loc = locs[i];
    const name = loc.name || '(unknown)';

    // Skip if already has id (idempotent)
    if (loc.id !== undefined) {
      skipped++;
      continue;
    }

    // Validate coords: must be an array of exactly 2 numbers
    if (!Array.isArray(loc.coords) || loc.coords.length !== 2) {
      invalidCoords.push(`${name}: missing or invalid coords (not a 2-element array)`);
      continue;
    }

    const [lat, lng] = loc.coords;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      invalidCoords.push(`${name}: coord values are not numbers`);
      continue;
    }

    // Compute ID using toFixed(4) to ensure consistent 4-decimal-place string
    const coordString = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const id = generateLocationId(coordString);

    // Replace location with id as the first key
    locs[i] = { id, ...loc };
    added++;

    console.log(`  added id "${id}" → ${name} (${coordString})`);
  }
});

if (invalidCoords.length > 0) {
  console.warn('\nSkipped (invalid/missing coords):');
  invalidCoords.forEach(msg => console.warn(`  - ${msg}`));
}

console.log(
  `\nSummary: ${added} IDs added, ${skipped} already had IDs, ${invalidCoords.length} skipped (invalid coords)`
);

// Serialize to JSON with 2-space indentation
let output = JSON.stringify(data, null, 2);

// Post-process: compact multi-line coords arrays back to a single line and
// normalize each coord value to exactly 4 decimal places (JSON.stringify drops
// trailing zeros, e.g. -77.5850 → -77.585).
output = output.replace(
  /"coords":\s*\[\s*\n\s*(-?\d+(?:\.\d+)?),\s*\n\s*(-?\d+(?:\.\d+)?)\s*\n\s*\]/g,
  (_, lat, lng) => `"coords": [${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}]`
);

fs.writeFileSync(dataPath, output + '\n', 'utf8');
console.log(`\nWritten: ${dataPath}`);
