#!/usr/bin/env node

/**
 * Preuninstall script for claude-yolo-extended
 * Cleans up modified CLI files before package removal
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Cleaning up claude-yolo-extended files...');

// Files to clean up in each location
const filesToClean = [
  'cli-yolo.js',
  'cli-yolo.mjs',
  '.claude-yolo-extended-consent'
];

async function cleanup() {
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

  // Check global installation (async)
  try {
    const { stdout } = await execAsync('npm -g root');
    const globalRoot = stdout.trim();
    const globalDir = path.join(globalRoot, '@anthropic-ai', 'claude-code');
    if (fs.existsSync(globalDir)) {
      locations.push(globalDir);
    }
  } catch (e) {
    // Ignore errors
  }

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
}

cleanup().catch(err => {
  console.error(`Cleanup failed: ${err.message}`);
});
