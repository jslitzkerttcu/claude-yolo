#!/usr/bin/env node

/**
 * Preuninstall script for claude-yolo-extended
 * Cleans up modified CLI files before package removal
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Cleaning up claude-yolo-extended files...');

// Find the Claude installation directories
const locations = [];

// Check local installation
try {
  const localDir = path.join(__dirname, 'node_modules', '@anthropic-ai', 'claude-code');
  if (fs.existsSync(localDir)) {
    locations.push(localDir);
  }
} catch (e) {
  // Ignore errors
}

// Check global installation
try {
  const globalRoot = execSync('npm -g root', { timeout: 10000 }).toString().trim();
  const globalDir = path.join(globalRoot, '@anthropic-ai', 'claude-code');
  if (fs.existsSync(globalDir)) {
    locations.push(globalDir);
  }
} catch (e) {
  // Ignore errors
}

// Files to clean up in each location
const filesToClean = [
  'cli-yolo.js',
  'cli-yolo.mjs',
  '.claude-yolo-extended-consent'
];

let totalCleaned = 0;

for (const location of locations) {
  for (const file of filesToClean) {
    const filePath = path.join(location, file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  Removed: ${filePath}`);
        totalCleaned++;
      }
    } catch (err) {
      console.error(`  Could not remove ${filePath}: ${err.message}`);
    }
  }
}

if (totalCleaned > 0) {
  console.log(`Cleanup complete: removed ${totalCleaned} file(s)`);
} else {
  console.log('No files needed cleanup');
}
