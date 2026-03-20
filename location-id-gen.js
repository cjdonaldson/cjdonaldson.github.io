#!/usr/bin/env node
'use strict';

const crypto = require('crypto');

/**
 * Generate a stable 8-character location ID from a coordinate string.
 *
 * @param {string} coordString - Coordinate string in the format "lat,lng"
 *   where each value has exactly 4 decimal places, e.g. "27.1392,-82.4526"
 * @returns {string} First 8 hex characters of SHA-256(coordString)
 */
function generateLocationId(coordString) {
  return crypto.createHash('sha256').update(coordString).digest('hex').slice(0, 8);
}

module.exports = { generateLocationId };

// CLI usage: ./location-id-gen.js "lat,lng"
if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: ./location-id-gen.js "lat,lng"');
    console.error('Example: ./location-id-gen.js "27.1392,-82.4526"');
    process.exit(1);
  }
  if (!/^-?\d+\.\d{4},-?\d+\.\d{4}$/.test(arg)) {
    console.error(`Error: coordinate string must be in the format "lat.dddd,lng.dddd" with exactly 4 decimal places each`);
    console.error(`  got: "${arg}"`);
    console.error(`  example: "27.1392,-82.4520"`);
    process.exit(1);
  }
  console.log(generateLocationId(arg));
}
