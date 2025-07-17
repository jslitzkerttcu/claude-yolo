# Claude YOLO Extended

A wrapper for the Claude CLI that can run in YOLO mode (bypassing all safety checks) OR Safe mode (standard Claude CLI behavior).

⚠️ **SECURITY WARNING**: YOLO mode bypasses important safety checks! This completely bypasses the "human in the loop" checks, this could delete your data, leak your secrets and even brick your computer. Use at your own risk.

## Features

- **Cross-Platform**: Works on Windows, Ubuntu, and other Unix-like systems
- **Dual Mode Support**: Switch between YOLO and SAFE modes
- **Mode Persistence**: Your mode choice is saved between sessions
- **Auto-start**: Claude starts automatically after mode switch
- **Root User Support**: YOLO mode works even as root user
- **Visual Mode Indicators**: Clear `[YOLO]` or `[SAFE]` prefixes
- **Auto-update**: Automatically checks for and installs updates to the Claude package

## Installation

### Option 1: Install from npm (Recommended)

```bash
# Install globally from npm
npm install -g claude-yolo-extended
```

### Option 2: Install from source

```bash
# Clone the repository
git clone https://github.com/jslitzkerttcu/claude-yolo.git
cd claude-yolo

# Install dependencies
npm install

# Link globally to use the command anywhere
npm link
```

The first time you run `claude-yolo-extended`, you will be presented with a consent prompt explaining the security implications. You must explicitly agree to continue.

<img width="750" alt="image" src="https://github.com/user-attachments/assets/f8e07cf0-6c43-4663-b9e2-f61b1afb4e99" />

Your consent choice is remembered for future runs.

## New Safe Mode Feature 🛡️

### Using command-line flags

```bash
# Run in SAFE mode (normal Claude CLI behavior)
claude-yolo-extended --safe
claude-yolo-extended --no-yolo

# Run in YOLO mode (default)
claude-yolo-extended
```

### Using mode commands

```bash
# Switch to YOLO mode
claude-yolo-extended mode yolo

# Switch to SAFE mode
claude-yolo-extended mode safe

# Check current mode
claude-yolo-extended mode
```

### Using the cl wrapper script (Recommended!)

For even easier mode management, use the included `cl` wrapper script (works on both Windows and Unix systems):

```bash
# After npm link, the cl wrapper is available globally
# Or copy manually to your PATH
cp node_modules/claude-yolo-extended/bin/cl /usr/local/bin/cl
chmod +x /usr/local/bin/cl

# Now you can use:
cl /YON      # Switch to YOLO mode AND start Claude
cl /YOFF     # Switch to SAFE mode AND start Claude
cl /STATUS   # Show current mode (without starting Claude)
cl /HELP     # Show help

# Run Claude in current mode
cl "write a hello world function"

# Switch mode and run with command
cl /YON "create a web server"
```

Mode preference is saved in `~/.claude_yolo_state` and persists between sessions.

## Visual Mode Indicators

The tool now shows clear visual indicators of which mode you're in:

- **YOLO Mode**: `[YOLO]` prefix in yellow 🔥
- **SAFE Mode**: `[SAFE]` prefix in cyan 🛡️

## Root User Support

Unlike the standard Claude CLI, this fork allows YOLO mode to run even as root user:

- Standard Claude CLI blocks `--dangerously-skip-permissions` when running as root
- This fork bypasses that check in YOLO mode
- You'll see a warning when running as root, but it will work
- SAFE mode respects all original Claude CLI security features

## Usage

```bash
claude-yolo-extended [options]
```

All arguments and options are passed directly to the Claude CLI.

This wrapper in YOLO mode:
1. Checks for and automatically installs updates to the Claude package
2. Displays "🔥 YOLO MODE ACTIVATED 🔥" warning in yellow text
3. Creates a modified copy of the Claude CLI code to bypass permission checks
   - Replaces all `getIsDocker()` calls with `true`
   - Replaces all `hasInternetAccess()` calls with `false`
   - Bypasses root user checks (process.getuid() === 0)
   - Adds colorful YOLO-themed loading messages
4. Leaves the original Claude CLI file untouched (won't affect your normal `claude` command)
5. Adds the `--dangerously-skip-permissions` flag to command line arguments
6. Imports the modified copy of the CLI

In SAFE mode, it simply runs the original Claude CLI without modifications.


## How It Works

- **YOLO Mode**: Creates a modified copy of the Claude CLI that bypasses permission checks
- **SAFE Mode**: Runs the original Claude CLI without modifications
- **Non-destructive**: Your regular `claude` command remains untouched
- **Debug mode**: Set `DEBUG=1` to see detailed logs

## Why?

Sometimes you just want to YOLO and skip those pesky permission checks. But sometimes you want the safety checks back! This tool gives you the best of both worlds.

## Debugging

If you encounter any issues, you can run with debug output:

```bash
DEBUG=1 claude-yolo-extended
```

This will show additional information about:
- Claude package update checks
- Current and latest available versions
- When updates are being installed
- Modifications being made to the CLI file
- Root bypass operations

## Auto-Update Feature

Claude YOLO automatically checks for updates to the Claude package each time it runs:

1. When you run `claude-yolo-extended`, it checks for the latest version of `@anthropic-ai/claude-code` on npm
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
- This fork additionally bypasses root user restrictions in YOLO mode
- By using this tool in YOLO mode, you acknowledge that:
  - Important safety checks are being bypassed
  - Claude may access files it normally would not have permission to access
  - Running as root with bypassed permissions is extremely dangerous
  - You accept full responsibility for any security implications
  
Anthropic designed these safety checks for good reason. Only use YOLO mode if you fully understand and accept these risks. Use SAFE mode when you want the standard Claude CLI protections.

## Development & Contributing

### Making Changes

1. Clone the repository:
   ```bash
   git clone https://github.com/jslitzkerttcu/claude-yolo.git
   cd claude-yolo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link locally for testing:
   ```bash
   npm link
   ```

4. Test your changes:
   ```bash
   claude-yolo-extended --help
   ```

### Publishing Updates

1. Make your changes and test thoroughly

2. Update the version number:
   ```bash
   # For bug fixes (1.8.0 -> 1.8.1)
   npm version patch
   
   # For new features (1.8.0 -> 1.9.0)
   npm version minor
   
   # For breaking changes (1.8.0 -> 2.0.0)
   npm version major
   ```

3. Publish to npm:
   ```bash
   npm publish
   ```

4. Push changes to GitHub:
   ```bash
   git push origin main --tags
   ```

### Version Guidelines

- **Patch** (x.x.1): Bug fixes, typo corrections, small tweaks
- **Minor** (x.1.0): New features, improvements that don't break existing functionality
- **Major** (2.0.0): Breaking changes, major rewrites, incompatible API changes