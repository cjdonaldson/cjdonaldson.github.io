'use strict';

/**
 * location-validate.js
 *
 * Validates a locations JSON file (default: camping/florida-bound-locations.json).
 *
 * Checks per location:
 *   1. coords array present with exactly 2 numeric values
 *   2. Both coord values have exactly 4 decimal places in the raw JSON source
 *   3. id field present and matching /^[0-9a-f]{8}$/
 *   4. id is the first key in the location object
 *   5. id matches the recomputed SHA-256 formula (stale ID detection)
 *
 * Checks globally:
 *   6. No duplicate id values
 *
 * Exits 0 on full pass, non-zero on any failure.
 *
 * Usage: node location-validate.js [path/to/file.json]
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const dataPath = process.argv[2] || path.join(__dirname, 'camping/florida-bound-locations.json');

// ── Read & parse ──────────────────────────────────────────────────────────────

let rawJson;
try {
  rawJson = fs.readFileSync(dataPath, 'utf8');
} catch (e) {
  console.error(`Error reading ${dataPath}: ${e.message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(rawJson);
} catch (e) {
  console.error(`Error parsing JSON: ${e.message}`);
  process.exit(1);
}

// ── Per-location checks ───────────────────────────────────────────────────────

const errors = [];
const locationRecords = []; // { name, id } for uniqueness check

data.states.forEach(state => {
  (state.locations || []).forEach(loc => {
    const name = loc.name || '(unknown)';

    // 1. coords array present with exactly 2 values
    if (!Array.isArray(loc.coords)) {
      errors.push(`${name}: missing coords array`);
      return; // can't continue checking this location
    }
    if (loc.coords.length !== 2) {
      errors.push(`${name}: coords must have exactly 2 values (found ${loc.coords.length})`);
      return;
    }

    // 3. id field present and format
    if (loc.id === undefined || loc.id === null) {
      errors.push(`${name}: missing id field`);
    } else {
      if (!/^[0-9a-f]{8}$/.test(loc.id)) {
        errors.push(`${name}: id "${loc.id}" does not match /^[0-9a-f]{8}$/`);
      } else {
        // 4. id is the first key
        const firstKey = Object.keys(loc)[0];
        if (firstKey !== 'id') {
          errors.push(`${name}: id is not the first key (first key is "${firstKey}")`);
        }

        // 5. stale ID detection — recompute and compare
        const [lat, lng] = loc.coords;
        const coordString = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        const expected = crypto.createHash('sha256').update(coordString).digest('hex').slice(0, 8);
        if (loc.id !== expected) {
          errors.push(
            `${name}: stale id — stored "${loc.id}", expected "${expected}" (coords: ${coordString})`
          );
        }
      }

      locationRecords.push({ name, id: loc.id });
    }
  });
});

// ── Raw source: coord precision check ────────────────────────────────────────
// Find every "coords": [...] block in the raw JSON text and verify each numeric
// value has exactly 4 decimal places.

const coordsRawRegex = /"coords":\s*\[([^\]]+)\]/g;
let m;
while ((m = coordsRawRegex.exec(rawJson)) !== null) {
  const nums = m[1].match(/-?\d+(?:\.\d+)?/g) || [];
  for (const num of nums) {
    const dotIdx = num.indexOf('.');
    const decimalPlaces = dotIdx === -1 ? 0 : num.slice(dotIdx + 1).length;
    if (decimalPlaces !== 4) {
      errors.push(
        `Raw source coord "${num}" does not have exactly 4 decimal places (found ${decimalPlaces})`
      );
    }
  }
}

// ── Global: duplicate id check ────────────────────────────────────────────────

const idSeen = new Map(); // id → first location name
for (const { name, id } of locationRecords) {
  if (idSeen.has(id)) {
    errors.push(`Duplicate id "${id}": found in both "${idSeen.get(id)}" and "${name}"`);
  } else {
    idSeen.set(id, name);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

const locationCount = data.states.reduce(
  (sum, s) => sum + (s.locations ? s.locations.length : 0),
  0
);

if (errors.length === 0) {
  console.log(`✓ location-validate: ${locationCount} locations checked, all IDs valid`);
  process.exit(0);
} else {
  console.error(`✗ location-validate: ${errors.length} error(s) in ${locationCount} locations:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
