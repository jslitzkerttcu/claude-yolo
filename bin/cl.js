#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';
import { showYoloActivated, showSafeActivated, showModeStatus } from './ascii-art.js';

import {
  YELLOW,
  CYAN,
  RESET,
  BOLD,
  DANGEROUS_CHARS_PATTERN,
  STATE_FILE,
  logError,
  handleFatalError
} from '../lib/constants.js';

/**
 * Get current mode from state file
 * @returns {string} Current mode ('YOLO' or 'SAFE')
 */
function getMode() {
  try {
    return fs.readFileSync(STATE_FILE, 'utf8').trim();
  } catch {
    return 'YOLO'; // Default to YOLO mode (matches claude-yolo-extended behavior)
  }
}

/**
 * Set mode in state file
 * @param {string} mode - Mode to set ('YOLO' or 'SAFE')
 */
function setMode(mode) {
  fs.writeFileSync(STATE_FILE, mode);
}

/**
 * Validate command-line arguments for shell injection (Windows only)
 * @param {string[]} args - Arguments to validate
 * @returns {boolean} True if all arguments are safe
 */
function validateArgs(args) {
  const isWindows = process.platform === 'win32';
  if (!isWindows) return true; // Non-Windows uses shell:false

  for (const arg of args) {
    if (DANGEROUS_CHARS_PATTERN.test(arg)) {
      logError(`Invalid characters in argument: ${arg}`);
      console.error('Arguments cannot contain: ; & | ` $ > <');
      return false;
    }
  }
  return true;
}

// Get command line arguments
const args = process.argv.slice(2);

// Handle special commands
if (args.length > 0) {
  const command = args[0].toUpperCase();

  switch (command) {
    case '/YON':
      showYoloActivated();
      setMode('YOLO');
      console.log(`${YELLOW}✓ YOLO mode is now ON${RESET}`);

      // Auto-start with remaining args
      if (args.length > 1) {
        runClaude(args.slice(1));
      } else {
        runClaude([]);
      }
      break;

    case '/YOFF':
      showSafeActivated();
      setMode('SAFE');
      console.log(`${CYAN}✓ YOLO mode is now OFF (Safe mode ON)${RESET}`);

      // Auto-start with remaining args
      if (args.length > 1) {
        runClaude(args.slice(1));
      } else {
        runClaude([]);
      }
      break;

    case '/STATUS': {
      const mode = getMode();
      showModeStatus(mode);
      break;
    }

    case '/HELP':
    case '/H':
    case '/?':
      console.log(`${BOLD}Claude CLI Wrapper - Help${RESET}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`${CYAN}cl /YON${RESET}     - Enable YOLO mode (bypass safety)`);
      console.log(`${CYAN}cl /YOFF${RESET}    - Disable YOLO mode (safe mode)`);
      console.log(`${CYAN}cl /STATUS${RESET}  - Show current mode`);
      console.log(`${CYAN}cl /HELP${RESET}    - Show this help`);
      console.log(`${CYAN}cl [args]${RESET}   - Run claude with current mode`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log(`${BOLD}Examples:${RESET}`);
      console.log('  cl /YON                    # Enable YOLO mode');
      console.log('  cl /YOFF                   # Enable SAFE mode');
      console.log('  cl "write a function"      # Run Claude in current mode');
      console.log('');
      console.log(`${BOLD}Mode Persistence:${RESET}`);
      console.log('Your mode choice is saved in ~/.claude_yolo_state');
      console.log('and persists between terminal sessions.');
      break;

    default:
      // Run Claude with provided arguments
      runClaude(args);
  }
} else {
  // No arguments, just run Claude
  runClaude([]);
}

/**
 * Run Claude CLI with the given arguments in current mode
 * @param {string[]} claudeArgs - Arguments to pass to Claude
 */
function runClaude(claudeArgs) {
  // Validate arguments before running (security check for Windows shell)
  if (!validateArgs(claudeArgs)) {
    process.exit(1);
  }

  const mode = getMode();

  // Show current mode
  if (mode === 'YOLO') {
    console.log(`${YELLOW}[YOLO]${RESET} Running Claude in YOLO mode...`);
  } else {
    console.log(`${CYAN}[SAFE]${RESET} Running Claude in SAFE mode...`);
  }

  // Determine which command to run
  const command = 'claude-yolo-extended';
  const commandArgs = mode === 'SAFE' ? ['--safe', ...claudeArgs] : claudeArgs;

  // Spawn the process
  // Note: shell:false is safer (prevents command injection) but requires
  // the command to be in PATH. On Windows, we need shell:true for .cmd files.
  const isWindows = process.platform === 'win32';
  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: isWindows // Only use shell on Windows where it's required for PATH resolution
  });

  child.on('error', (err) => {
    handleFatalError(`Failed to start ${command}: ${err.message}`, err);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      // Process was killed by signal - exit with 128 + signal number (Unix convention)
      // Common signals: SIGTERM=15, SIGKILL=9, SIGINT=2
      const signalCodes = { SIGTERM: 15, SIGKILL: 9, SIGINT: 2, SIGHUP: 1 };
      const signalNum = signalCodes[signal] || 1;
      process.exit(128 + signalNum);
    }
    process.exit(code ?? 0);
  });
}
