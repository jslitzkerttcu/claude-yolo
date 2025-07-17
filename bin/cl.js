#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// State file path
const stateFile = path.join(os.homedir(), '.claude_yolo_state');

// Function to get current mode
function getMode() {
  try {
    return fs.readFileSync(stateFile, 'utf8').trim();
  } catch {
    return 'YOLO'; // Default to YOLO mode (matches claude-yolo-extended behavior)
  }
}

// Function to set mode
function setMode(mode) {
  fs.writeFileSync(stateFile, mode);
}

// Get command line arguments
const args = process.argv.slice(2);

// Handle special commands
if (args.length > 0) {
  const command = args[0].toUpperCase();
  
  switch (command) {
    case '/YON':
      console.log(`${YELLOW}${BOLD}🔥 ACTIVATING YOLO MODE 🔥${RESET}`);
      console.log(`${RED}⚠️  WARNING: All safety checks will be DISABLED!${RESET}`);
      console.log(`${RED}⚠️  Claude can access ANY file without asking!${RESET}`);
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
      console.log(`${CYAN}${BOLD}🛡️  ACTIVATING SAFE MODE 🛡️${RESET}`);
      console.log(`${GREEN}✓ Safety checks will be enabled${RESET}`);
      console.log(`${GREEN}✓ Claude will ask for permissions${RESET}`);
      setMode('SAFE');
      console.log(`${CYAN}✓ YOLO mode is now OFF (Safe mode ON)${RESET}`);
      
      // Auto-start with remaining args
      if (args.length > 1) {
        runClaude(args.slice(1));
      } else {
        runClaude([]);
      }
      break;
      
    case '/STATUS':
      const mode = getMode();
      console.log(`${BOLD}Claude CLI Status:${RESET}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (mode === 'YOLO') {
        console.log(`Mode: ${YELLOW}${BOLD}YOLO${RESET} 🔥`);
        console.log(`Safety: ${RED}DISABLED${RESET}`);
        console.log(`Permissions: ${RED}BYPASSED${RESET}`);
      } else {
        console.log(`Mode: ${CYAN}${BOLD}SAFE${RESET} 🛡️`);
        console.log(`Safety: ${GREEN}ENABLED${RESET}`);
        console.log(`Permissions: ${GREEN}REQUIRED${RESET}`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      break;
      
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

function runClaude(claudeArgs) {
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
  const child = spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (err) => {
    console.error(`${RED}Error: Failed to start ${command}${RESET}`);
    console.error(err.message);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}