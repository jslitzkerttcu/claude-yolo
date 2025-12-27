/**
 * Shared constants for claude-yolo-extended
 */

import os from 'os';
import path from 'path';

// ANSI color codes for terminal output
export const COLORS = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  GREEN: '\x1b[32m',
  ORANGE: '\x1b[38;5;208m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

// Destructured exports for convenience
export const { RED, YELLOW, CYAN, GREEN, ORANGE, RESET, BOLD } = COLORS;

// Valid mode values
export const VALID_MODES = ['yolo', 'safe'];

// Path to persistent state file
export const STATE_FILE = path.join(os.homedir(), '.claude_yolo_state');

// Valid commands for the cl wrapper
export const VALID_COMMANDS = ['/YON', '/YOFF', '/STATUS', '/HELP', '/H', '/?'];

// Dangerous shell characters for Windows command injection prevention
export const DANGEROUS_CHARS_PATTERN = /[;&|`$><]/;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  NPM_VIEW: 30000,           // 30 seconds for npm view
  NPM_INSTALL: 300000,       // 5 minutes for npm install
  NPM_ROOT: 10000,           // 10 seconds for npm -g root
  DEFAULT: 120000            // 2 minutes default
};

// Maximum directory traversal depth (security limit)
export const MAX_TRAVERSAL_DEPTH = 10;

// Error severity levels
export const ErrorSeverity = {
  FATAL: 'fatal',     // Application must exit
  ERROR: 'error',     // Operation failed but can continue
  WARNING: 'warning', // Non-critical issue
  DEBUG: 'debug'      // Debug info (only shown with DEBUG env)
};

/**
 * Consistent error logging function
 * @param {string} message - Error message
 * @param {string} severity - Error severity level
 * @param {Error} [error] - Optional error object for stack trace
 */
export function logError(message, severity = ErrorSeverity.ERROR, error = null) {
  const prefix = {
    [ErrorSeverity.FATAL]: `${RED}${BOLD}FATAL:${RESET}`,
    [ErrorSeverity.ERROR]: `${RED}Error:${RESET}`,
    [ErrorSeverity.WARNING]: `${YELLOW}Warning:${RESET}`,
    [ErrorSeverity.DEBUG]: `${CYAN}Debug:${RESET}`
  }[severity] || `${RED}Error:${RESET}`;

  // Always log to stderr for errors
  if (severity === ErrorSeverity.DEBUG) {
    if (process.env.DEBUG) {
      console.log(`${prefix} ${message}`);
      if (error?.stack) console.log(error.stack);
    }
  } else {
    console.error(`${prefix} ${message}`);
    if (process.env.DEBUG && error?.stack) {
      console.error(error.stack);
    }
  }
}

/**
 * Handle fatal errors - log and exit
 * @param {string} message - Error message
 * @param {Error} [error] - Optional error object
 * @param {number} [exitCode=1] - Process exit code
 */
export function handleFatalError(message, error = null, exitCode = 1) {
  logError(message, ErrorSeverity.FATAL, error);
  process.exit(exitCode);
}
