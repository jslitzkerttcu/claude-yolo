# Claude YOLO

A wrapper for the Claude CLI that can run in YOLO mode (bypassing all safety checks) OR Safe mode (standard Claude CLI behavior).

⚠️ **SECURITY WARNING**: YOLO mode bypasses important safety checks! This completely bypasses the "human in the loop" checks, this could delete your data, leak your secrets and even brick your computer. Use at your own risk.

## What's New in This Fork 🎉

This fork adds **SAFE MODE** support! You can now:
- Switch between YOLO and SAFE modes
- Use the handy `cl` bash wrapper for quick mode switching
- Mode preference is saved between sessions

## Installation

```bash
# Install from this fork
npm install -g github:maxparez/claude-yolo

# Or install the original
npm install -g claude-yolo
```

The first time you run `claude-yolo`, you will be presented with a consent prompt explaining the security implications. You must explicitly agree to continue.

<img width="750" alt="image" src="https://github.com/user-attachments/assets/f8e07cf0-6c43-4663-b9e2-f61b1afb4e99" />

Your consent choice is remembered for future runs.

## New Safe Mode Feature 🛡️

### Using command-line flags

```bash
# Run in SAFE mode (normal Claude CLI behavior)
claude-yolo --safe
claude-yolo --no-yolo

# Run in YOLO mode (default)
claude-yolo
```

### Using mode commands

```bash
# Switch to YOLO mode
claude-yolo mode yolo

# Switch to SAFE mode
claude-yolo mode safe

# Check current mode
claude-yolo mode
```

### Using the cl wrapper script

For even easier mode management, use the included `cl` bash wrapper:

```bash
# Copy the cl script to your PATH
cp node_modules/claude-yolo/bin/cl /usr/local/bin/cl
chmod +x /usr/local/bin/cl

# Now you can use:
cl /YON      # Enable YOLO mode
cl /YOFF     # Enable SAFE mode  
cl /STATUS   # Show current mode
cl /HELP     # Show help

# Run Claude in current mode
cl "write a hello world function"
```

Mode preference is saved in `~/.claude_yolo_state` and persists between sessions.

## Visual Mode Indicators

The tool now shows clear visual indicators of which mode you're in:

- **YOLO Mode**: `[YOLO]` prefix in yellow 🔥
- **SAFE Mode**: `[SAFE]` prefix in cyan 🛡️

## Usage

```bash
claude-yolo [options]
```

All arguments and options are passed directly to the Claude CLI.

This wrapper in YOLO mode:
1. Checks for and automatically installs updates to the Claude package
2. Displays "🔥 YOLO MODE ACTIVATED 🔥" warning in yellow text
3. Creates a modified copy of the Claude CLI code to bypass permission checks
   - Replaces all `getIsDocker()` calls with `true`
   - Replaces all `hasInternetAccess()` calls with `false`
   - Adds colorful YOLO-themed loading messages
4. Leaves the original Claude CLI file untouched (won't affect your normal `claude` command)
5. Adds the `--dangerously-skip-permissions` flag to command line arguments
6. Imports the modified copy of the CLI

In SAFE mode, it simply runs the original Claude CLI without modifications.

## New in Version 1.7.0 (This Fork)

- **SAFE Mode Support**: Run Claude with normal safety checks using `--safe` or `--no-yolo`
- **Mode Persistence**: Your mode choice is saved in `~/.claude_yolo_state`
- **Mode Commands**: Use `claude-yolo mode [yolo|safe]` to switch modes
- **Bash Wrapper**: Included `cl` script for easy mode switching
- **Visual Mode Indicators**: Clear `[YOLO]` or `[SAFE]` prefixes

## New in Version 1.6.1

- **Runtime Consent Check**: Now requires explicit user consent on first run
- **Consent Persistence**: Remembers user consent for future runs
- **Fixed Global Installation**: Consent prompt will properly show for both local and global installations

## New in Version 1.6.0

- **Installation Consent Prompt**: Added explicit user consent during installation
- **Enhanced Security Warnings**: Clear explanations of the security implications
- **Installation Abort Option**: Users can cancel installation if they don't agree with the security implications

## New in Version 1.5.0

- **YOLO Mode Warning**: Displays a "🔥 YOLO MODE ACTIVATED 🔥" warning in yellow text
- **Colorful Loading Messages**: Adds fun YOLO-themed loading messages with colorful text
  - "Thinking (safety's off, hold on tight)" in red
  - "Computing (all gas, no brakes, lfg)" in yellow
  - "Clauding (yolo mode engaged)" in magenta
  - "Processing (dangerous mode! I guess you can just do things)" in cyan

## Features

- **Auto-update**: Automatically checks for and installs updates to the Claude package at runtime
- **Non-destructive approach**: Creates a separate modified copy of the CLI file instead of modifying the original
- **Safe for global installations**: Your regular `claude` command will work normally even after installing claude-yolo
- **Debug mode**: Set the `DEBUG=1` environment variable to see detailed logs about the modifications

## Why?

Sometimes you just want to YOLO and skip those pesky permission checks. But sometimes you want the safety checks back! This fork gives you the best of both worlds.

## Debugging

If you encounter any issues, you can run with debug output:

```bash
DEBUG=1 claude-yolo
```

This will show additional information about:
- Claude package update checks
- Current and latest available versions
- When updates are being installed
- Modifications being made to the CLI file

## Auto-Update Feature

Claude YOLO automatically checks for updates to the Claude package each time it runs:

1. When you run `claude-yolo`, it checks for the latest version of `@anthropic-ai/claude-code` on npm
2. If your installed version is outdated, it will:
   - Update your package.json with the latest version
   - Run npm install to get the newest version
   - Notify you that an update was applied
3. This ensures you're always using the latest Claude CLI features

## Important Security Disclaimer

This is an unofficial tool and not supported by Anthropic. Use at your own risk.

**SECURITY WARNING**:
- YOLO mode bypasses safety mechanisms intentionally built into the Claude CLI
- The `--dangerously-skip-permissions` flag was designed for use in container environments
- By using this tool in YOLO mode, you acknowledge that:
  - Important safety checks are being bypassed
  - Claude may access files it normally would not have permission to access
  - You accept full responsibility for any security implications
  
Anthropic designed these safety checks for good reason. Only use YOLO mode if you fully understand and accept these risks. Use SAFE mode when you want the standard Claude CLI protections.