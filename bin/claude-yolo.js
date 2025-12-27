#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

// Promisified exec for async operations
const execAsync = promisify(exec);

/**
 * Run a command with spawn (for interactive/inherited stdio)
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {object} options - Spawn options
 * @returns {Promise<number>} Exit code
 */
function spawnAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true, ...options });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

/**
 * Execute command with timeout (async version)
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<string>} Command output
 */
async function execWithTimeout(command, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const { stdout } = await execAsync(command, { signal: controller.signal });
    return stdout.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}
import { showYoloActivated, showSafeActivated, showModeStatus, YOLO_ART } from './ascii-art.js';
import {
  RED,
  YELLOW,
  CYAN,
  GREEN,
  RESET,
  BOLD,
  STATE_FILE,
  UPDATE_CHECK_FILE,
  UPDATE_CHECK_INTERVAL,
  VALID_MODES,
  TIMEOUTS,
  MAX_TRAVERSAL_DEPTH,
  logError,
  handleFatalError,
  ErrorSeverity
} from '../lib/constants.js';

// Cached mode value to avoid repeated disk reads
let cachedMode = null;

/**
 * Get current mode from state file (with caching)
 * @returns {string} Current mode ('YOLO' or 'SAFE')
 */
function getMode() {
  if (cachedMode !== null) {
    return cachedMode;
  }
  try {
    cachedMode = fs.readFileSync(STATE_FILE, 'utf8').trim();
    return cachedMode;
  } catch {
    cachedMode = 'YOLO'; // Default mode
    return cachedMode;
  }
}

/**
 * Set mode in state file (updates cache)
 * @param {string} mode - Mode to set ('YOLO' or 'SAFE')
 */
function setMode(mode) {
  fs.writeFileSync(STATE_FILE, mode);
  cachedMode = mode;
}

/**
 * Debug logging - only logs if DEBUG=true or DEBUG=1
 * @param {string} message - Message to log
 */
const debug = (message) => {
  const debugVal = process.env.DEBUG;
  if (debugVal === 'true' || debugVal === '1') {
    console.log(message);
  }
};

/**
 * Compare semantic versions
 * @param {string} a - First version string
 * @param {string} b - Second version string
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  if (!a || !b) return 0;
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Ask user for consent to use YOLO mode
 * @returns {Promise<boolean>} True if user consented
 */
function askForConsent() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n${BOLD}${YELLOW}🔥 CLAUDE-YOLO-EXTENDED CONSENT REQUIRED 🔥${RESET}\n`);
    console.log(`${CYAN}----------------------------------------${RESET}`);
    console.log(`${BOLD}What is claude-yolo-extended?${RESET}`);
    console.log(`This package creates a wrapper around the official Claude CLI tool that:`);
    console.log(
      `  1. ${RED}BYPASSES safety checks${RESET} by automatically adding the --dangerously-skip-permissions flag`
    );
    console.log(`  2. Automatically updates to the latest Claude CLI version`);
    console.log(`  3. Adds colorful YOLO-themed loading messages`);
    console.log(`  4. ${GREEN}NOW SUPPORTS SAFE MODE${RESET} with --safe flag\n`);

    console.log(`${BOLD}${RED}⚠️ IMPORTANT SECURITY WARNING ⚠️${RESET}`);
    console.log(
      `The ${BOLD}--dangerously-skip-permissions${RESET} flag was designed for use in containers`
    );
    console.log(`and bypasses important safety checks. This includes ignoring file access`);
    console.log(`permissions that protect your system and privacy.\n`);

    console.log(`${BOLD}By using claude-yolo-extended in YOLO mode:${RESET}`);
    console.log(`  • You acknowledge these safety checks are being bypassed`);
    console.log(`  • You understand this may allow Claude CLI to access sensitive files`);
    console.log(`  • You accept full responsibility for any security implications\n`);

    console.log(`${CYAN}----------------------------------------${RESET}\n`);

    rl.question(
      `${YELLOW}Do you consent to using claude-yolo-extended with these modifications? (yes/no): ${RESET}`,
      (answer) => {
        rl.close();
        const lowerAnswer = answer.toLowerCase().trim();
        if (lowerAnswer === 'yes' || lowerAnswer === 'y') {
          console.log(`\n${YELLOW}🔥 YOLO MODE APPROVED 🔥${RESET}`);
          resolve(true);
        } else {
          console.log(`\n${CYAN}Aborted. YOLO mode not activated.${RESET}`);
          console.log(`If you want the official Claude CLI with normal safety features, run:`);
          console.log(`claude`);
          resolve(false);
        }
      }
    );
  });
}

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find node_modules directory by walking up from current file
// Cross-platform root detection (works on both Unix '/' and Windows 'C:\')
const isAtRoot = (dir) => path.parse(dir).root === dir;

let nodeModulesDir = path.resolve(__dirname, '..');
let traversalDepth = 0;
while (
  !fs.existsSync(path.join(nodeModulesDir, 'node_modules')) &&
  !isAtRoot(nodeModulesDir) &&
  traversalDepth < MAX_TRAVERSAL_DEPTH
) {
  nodeModulesDir = path.resolve(nodeModulesDir, '..');
  traversalDepth++;
}

// Path to check package info
const packageJsonPath = path.join(nodeModulesDir, 'package.json');

/**
 * Check if an update check is needed based on rate limiting
 * @returns {boolean} True if update check should be performed
 */
function shouldCheckForUpdates() {
  try {
    if (!fs.existsSync(UPDATE_CHECK_FILE)) {
      return true;
    }
    const lastCheck = parseInt(fs.readFileSync(UPDATE_CHECK_FILE, 'utf8').trim(), 10);
    const timeSinceLastCheck = Date.now() - lastCheck;
    return timeSinceLastCheck >= UPDATE_CHECK_INTERVAL;
  } catch {
    return true; // Check if file is corrupted or unreadable
  }
}

/**
 * Update the last check timestamp
 */
function updateLastCheckTimestamp() {
  try {
    fs.writeFileSync(UPDATE_CHECK_FILE, Date.now().toString());
  } catch (err) {
    debug(`Could not update last check timestamp: ${err.message}`);
  }
}

// Check for updates to Claude package (with rate limiting)
async function checkForUpdates() {
  // Rate limiting: only check once per 24 hours
  if (!shouldCheckForUpdates()) {
    debug('Skipping update check (checked within last 24 hours)');
    return;
  }

  try {
    debug('Checking for Claude package updates...');

    // Get the latest version available on npm (async with timeout)
    const latestVersionCmd = 'npm view @anthropic-ai/claude-code version';
    const latestVersion = await execWithTimeout(latestVersionCmd, TIMEOUTS.NPM_VIEW);

    // Update the timestamp after successful version check
    updateLastCheckTimestamp();
    debug(`Latest Claude version on npm: ${latestVersion}`);

    // Get our current installed version
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const currentVersion = dependencies['@anthropic-ai/claude-code'];

    debug(`Claude version from package.json: ${currentVersion}`);

    // Get the global Claude version if available
    let globalVersion;
    if (globalClaudeDir) {
      try {
        const globalPackageJsonPath = path.join(globalClaudeDir, 'package.json');
        if (fs.existsSync(globalPackageJsonPath)) {
          const globalPackageJson = JSON.parse(fs.readFileSync(globalPackageJsonPath, 'utf8'));
          globalVersion = globalPackageJson.version;
          debug(`Global Claude version: ${globalVersion}`);

          // If global version is latest, inform user
          if (globalVersion === latestVersion) {
            debug(`Global Claude installation is already the latest version`);
          } else if (globalVersion && latestVersion) {
            debug(
              `Global Claude installation (${globalVersion}) differs from latest (${latestVersion})`
            );
          }
        }
      } catch (err) {
        debug(`Error getting global Claude version: ${err.message}`);
      }
    }

    // If using a specific version (not "latest"), and it's out of date, update
    // Use semantic version comparison to correctly handle cases like 2.0.10 > 2.0.9
    if (currentVersion !== 'latest' && compareVersions(currentVersion, latestVersion) < 0) {
      console.log(
        `Updating Claude package from ${currentVersion || 'unknown'} to ${latestVersion}...`
      );

      // Update package.json
      packageJson.dependencies['@anthropic-ai/claude-code'] = latestVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Run npm install (async with inherited stdio)
      console.log('Running npm install to update dependencies...');
      await spawnAsync('npm', ['install'], { stdio: 'inherit', cwd: nodeModulesDir });
      console.log('Update complete!');
    } else if (currentVersion === 'latest') {
      // If using "latest", just make sure we have the latest version installed
      debug(
        "Using 'latest' tag in package.json, running npm install to ensure we have the newest version"
      );
      await spawnAsync('npm', ['install'], { stdio: 'inherit', cwd: nodeModulesDir });
    }
  } catch (error) {
    logError(`Failed to check for updates: ${error.message}`, ErrorSeverity.WARNING, error);
  }
}

// Try to find global installation of Claude CLI first (async)
let globalClaudeDir;
try {
  const globalNodeModules = await execWithTimeout('npm -g root', TIMEOUTS.NPM_ROOT);
  debug(`Global node_modules: ${globalNodeModules}`);
  const potentialGlobalDir = path.join(globalNodeModules, '@anthropic-ai', 'claude-code');

  if (fs.existsSync(potentialGlobalDir)) {
    globalClaudeDir = potentialGlobalDir;
    debug(`Found global Claude installation at: ${globalClaudeDir}`);
  }
} catch (error) {
  logError(
    `Could not find global Claude installation: ${error.message}`,
    ErrorSeverity.DEBUG,
    error
  );
}

// Path to the local Claude CLI installation
const localClaudeDir = path.join(nodeModulesDir, 'node_modules', '@anthropic-ai', 'claude-code');

// Prioritize global installation, fall back to local
const claudeDir = globalClaudeDir || localClaudeDir;
debug(`Using Claude installation from: ${claudeDir}`);
debug(`Using ${claudeDir === globalClaudeDir ? 'GLOBAL' : 'LOCAL'} Claude installation`);

// Check for both .js and .mjs versions of the CLI
const mjsPath = path.join(claudeDir, 'cli.mjs');
const jsPath = path.join(claudeDir, 'cli.js');
let originalCliPath;
let yoloCliPath;

if (fs.existsSync(jsPath)) {
  originalCliPath = jsPath;
  yoloCliPath = path.join(claudeDir, 'cli-yolo.js');
  debug(`Found Claude CLI at ${originalCliPath} (js version)`);
} else if (fs.existsSync(mjsPath)) {
  originalCliPath = mjsPath;
  yoloCliPath = path.join(claudeDir, 'cli-yolo.mjs');
  debug(`Found Claude CLI at ${originalCliPath} (mjs version)`);
} else {
  handleFatalError(
    `Claude CLI not found in ${claudeDir}. Make sure @anthropic-ai/claude-code is installed.`
  );
}
const consentFlagPath = path.join(claudeDir, '.claude-yolo-extended-consent');

/**
 * Clean up modified YOLO CLI files
 * Called when switching to SAFE mode or uninstalling
 */
function cleanupYoloFiles() {
  const filesToClean = [
    path.join(claudeDir, 'cli-yolo.js'),
    path.join(claudeDir, 'cli-yolo.mjs'),
    consentFlagPath
  ];

  let cleaned = 0;
  for (const file of filesToClean) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        debug(`Cleaned up: ${file}`);
        cleaned++;
      }
    } catch (err) {
      logError(`Could not remove ${file}: ${err.message}`, ErrorSeverity.WARNING, err);
    }
  }

  if (cleaned > 0) {
    console.log(`${CYAN}Cleaned up ${cleaned} YOLO file(s)${RESET}`);
  }

  return cleaned;
}

/**
 * Handle mode commands (yolo/safe/status)
 * @param {string[]} args - Command line arguments
 * @returns {boolean} True if a mode command was handled, false otherwise
 */
function handleModeCommands(args) {
  if (args[0] !== 'mode') {
    return false;
  }

  const requestedMode = args[1]?.toLowerCase();

  if (requestedMode === 'yolo') {
    showYoloActivated();
    setMode('YOLO');
    console.log(`${YELLOW}✓ YOLO mode activated${RESET}`);
    return true;
  }

  if (requestedMode === 'safe') {
    showSafeActivated();
    setMode('SAFE');
    cleanupYoloFiles();
    console.log(`${CYAN}✓ SAFE mode activated${RESET}`);
    return true;
  }

  if (requestedMode && !VALID_MODES.includes(requestedMode)) {
    logError(`Invalid mode '${args[1]}'`);
    console.log(`Valid modes: ${VALID_MODES.join(', ')}`);
    console.log(`Usage: claude-yolo-extended mode [yolo|safe]`);
    process.exit(1);
  }

  // No mode specified, show current status
  const currentMode = getMode();
  showModeStatus(currentMode);
  return true;
}

/**
 * Run Claude in SAFE mode (original CLI without modifications)
 */
async function runSafeMode() {
  // Remove our flags before passing to original CLI
  process.argv = process.argv.filter((arg) => arg !== '--safe' && arg !== '--no-yolo');

  console.log(`${CYAN}[SAFE] Running Claude in SAFE mode${RESET}`);

  await checkForUpdates();

  if (!fs.existsSync(originalCliPath)) {
    handleFatalError(
      `${originalCliPath} not found. Make sure @anthropic-ai/claude-code is installed.`
    );
  }

  const cliUrl = pathToFileURL(originalCliPath).href;
  await import(cliUrl);
}

/**
 * Ensure user consent for YOLO mode
 * Consent is tracked separately from the modified CLI file
 * @returns {Promise<boolean>} True if consent was given or already exists
 */
async function ensureConsent() {
  // Only check the consent flag file (not the yoloCliPath)
  // This allows regenerating the CLI without re-asking for consent
  const consentNeeded = !fs.existsSync(consentFlagPath);

  if (!consentNeeded) {
    return true;
  }

  const consent = await askForConsent();
  if (!consent) {
    return false;
  }

  try {
    fs.writeFileSync(consentFlagPath, 'consent-given');
    debug('Created consent flag file');
  } catch (err) {
    logError(`Could not create consent flag file: ${err.message}`, ErrorSeverity.WARNING, err);
  }

  return true;
}

// Combined regex patterns for YOLO modifications
// Note: These patterns are specific to method calls and unlikely to match in comments/strings.
// Full AST parsing would be overkill for this use case.
const YOLO_REPLACEMENTS = [
  // getIsDocker() -> true (matches identifier.getIsDocker())
  {
    pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\.getIsDocker\(\)/g,
    replacement: 'true',
    desc: 'getIsDocker()'
  },
  // hasInternetAccess() -> false
  {
    pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\.hasInternetAccess\(\)/g,
    replacement: 'false',
    desc: 'hasInternetAccess()'
  },
  // process.getuid() === 0 -> false (various forms, order matters - optional chaining first)
  {
    pattern: /\bprocess\.getuid\?\.\(\)\s*===\s*0/g,
    replacement: 'false',
    desc: 'process.getuid?.() === 0'
  },
  {
    pattern: /\bprocess\.getuid\(\)\s*===\s*0/g,
    replacement: 'false',
    desc: 'process.getuid() === 0'
  },
  {
    pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\.getuid\(\)\s*===\s*0/g,
    replacement: 'false',
    desc: 'getuid() === 0'
  },
  // process.geteuid() === 0 -> false
  {
    pattern: /\bprocess\.geteuid\?\.\(\)\s*===\s*0/g,
    replacement: 'false',
    desc: 'process.geteuid?.() === 0'
  },
  {
    pattern: /\bprocess\.geteuid\(\)\s*===\s*0/g,
    replacement: 'false',
    desc: 'process.geteuid() === 0'
  }
];

/**
 * Modify CLI file content for YOLO mode
 * Applies various patches to bypass safety checks
 * @returns {string} Modified CLI content
 */
function modifyCliFile() {
  let cliContent = fs.readFileSync(originalCliPath, 'utf8');

  // Fix punycode import (deprecated in Node.js 21+)
  // Apply the fix if the file contains "punycode" without trailing slash
  // This prevents the deprecation warning regardless of installation location
  if (cliContent.includes('"punycode"') && !cliContent.includes('"punycode/"')) {
    cliContent = cliContent.replace(/"punycode"/g, '"punycode/"');
    debug('Fixed punycode import for Node.js compatibility');
  }

  // Apply all YOLO replacements
  let replacementCount = 0;
  for (const { pattern, replacement } of YOLO_REPLACEMENTS) {
    const matches = cliContent.match(pattern);
    if (matches) {
      replacementCount += matches.length;
      cliContent = cliContent.replace(pattern, replacement);
    }
  }
  debug(`Applied ${replacementCount} YOLO modifications`);

  return cliContent;
}

/**
 * Add YOLO-themed loading messages
 * @param {string} cliContent - CLI file content
 * @returns {string} Modified content with YOLO messages
 */
function addYoloLoadingMessages(cliContent) {
  const originalArray =
    '["Accomplishing","Actioning","Actualizing","Baking","Brewing","Calculating","Cerebrating","Churning","Clauding","Coalescing","Cogitating","Computing","Conjuring","Considering","Cooking","Crafting","Creating","Crunching","Deliberating","Determining","Doing","Effecting","Finagling","Forging","Forming","Generating","Hatching","Herding","Honking","Hustling","Ideating","Inferring","Manifesting","Marinating","Moseying","Mulling","Mustering","Musing","Noodling","Percolating","Pondering","Processing","Puttering","Reticulating","Ruminating","Schlepping","Shucking","Simmering","Smooshing","Spinning","Stewing","Synthesizing","Thinking","Transmuting","Vibing","Working"]';
  const yoloSuffixes = [
    ` ${RED}(safety's off, hold on tight)${RESET}`,
    ` ${YELLOW}(all gas, no brakes, lfg)${RESET}`,
    ` ${BOLD}\x1b[35m(yolo mode engaged)${RESET}`,
    ` ${CYAN}(dangerous mode! I guess you can just do things)${RESET}`
  ];

  const addSuffixes = (arrayStr) => {
    try {
      const array = JSON.parse(arrayStr);
      const yoloArray = array.map((word) => {
        const randomSuffix = yoloSuffixes[Math.floor(Math.random() * yoloSuffixes.length)];
        return word + randomSuffix;
      });
      return JSON.stringify(yoloArray);
    } catch (e) {
      logError(`Could not modify loading messages: ${e.message}`, ErrorSeverity.DEBUG, e);
      return arrayStr;
    }
  };

  const modified = cliContent.replace(originalArray, addSuffixes(originalArray));
  debug('Replaced loading messages with YOLO versions');
  return modified;
}

/**
 * Run Claude in YOLO mode (with safety bypasses)
 */
async function runYoloMode() {
  console.log(`${YELLOW}[YOLO] Running Claude in YOLO mode${RESET}`);

  if (process.getuid && process.getuid() === 0) {
    console.log(
      `${YELLOW}⚠️  Running as root - YOLO bypass will be applied via code modification${RESET}`
    );
  }

  await checkForUpdates();

  if (!fs.existsSync(originalCliPath)) {
    handleFatalError(
      `${originalCliPath} not found. Make sure @anthropic-ai/claude-code is installed.`
    );
  }

  const hasConsent = await ensureConsent();
  if (!hasConsent) {
    process.exit(1);
  }

  // Modify CLI content
  let cliContent = modifyCliFile();

  // Add YOLO art and message
  console.log(YOLO_ART);
  console.log(`${YELLOW}🔥 YOLO MODE ACTIVATED 🔥${RESET}`);

  // Add YOLO loading messages
  cliContent = addYoloLoadingMessages(cliContent);

  // Write the modified content
  fs.writeFileSync(yoloCliPath, cliContent);
  debug(`Created modified CLI at ${yoloCliPath}`);

  // Verify the file was written correctly
  try {
    const writtenContent = fs.readFileSync(yoloCliPath, 'utf8');
    if (writtenContent.length !== cliContent.length) {
      handleFatalError('Modified CLI file verification failed: content mismatch');
    }
    debug('File verification passed');
  } catch (err) {
    handleFatalError(`Could not verify modified CLI file: ${err.message}`, err);
  }

  debug(
    'Modifications complete. The --dangerously-skip-permissions flag should now work everywhere.'
  );

  // Add the --dangerously-skip-permissions flag
  process.argv.splice(2, 0, '--dangerously-skip-permissions');
  debug('Added --dangerously-skip-permissions flag to command line arguments');

  // Import and run the modified CLI
  const yoloCliUrl = pathToFileURL(yoloCliPath).href;
  await import(yoloCliUrl);
}

/**
 * Main application entry point
 */
async function run() {
  const args = process.argv.slice(2);

  // Handle mode commands first
  if (handleModeCommands(args)) {
    return;
  }

  // Check for safe mode flags
  const safeMode =
    process.argv.includes('--safe') || process.argv.includes('--no-yolo') || getMode() === 'SAFE';

  if (safeMode) {
    await runSafeMode();
  } else {
    await runYoloMode();
  }
}

// Run the main function
run().catch((err) => {
  handleFatalError(`Unexpected error: ${err.message}`, err);
});
