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

// CLI usage: node location-id-gen.js "lat,lng"
if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node location-id-gen.js "lat,lng"');
    console.error('Example: node location-id-gen.js "27.1392,-82.4526"');
    process.exit(1);
  }
  console.log(generateLocationId(arg));
}
