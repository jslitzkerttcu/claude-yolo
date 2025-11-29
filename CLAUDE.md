# Claude YOLO Extended - Project Information

This document contains important information about the Claude YOLO Extended project for AI assistants.

## Project Overview

Claude YOLO Extended is a wrapper for the Claude CLI that provides:
- **YOLO Mode**: Bypasses safety checks (use with caution)
- **SAFE Mode**: Standard Claude CLI behavior with all safety checks
- **Cross-Platform Support**: Works on Windows, Ubuntu, and other Unix systems
- **Auto-Update**: Automatically updates to the latest Claude CLI version

## Installation Methods

### From npm (Recommended for users)
```bash
npm install -g claude-yolo-extended
```

### From source (For development)
```bash
git clone https://github.com/jslitzkerttcu/claude-yolo.git
cd claude-yolo
npm install
npm link
```

## Key Commands

- `claude-yolo-extended` - Run in current mode (default: YOLO)
- `claude-yolo-extended --safe` - Run in SAFE mode
- `claude-yolo-extended mode yolo` - Switch to YOLO mode
- `claude-yolo-extended mode safe` - Switch to SAFE mode
- `cl /YON` - Enable YOLO mode and start Claude
- `cl /YOFF` - Enable SAFE mode and start Claude

## Development Workflow

### Making Changes

1. Make code changes
2. Test locally with `npm link`
3. Run `claude-yolo-extended --help` to verify

### Publishing Updates

1. Update version: `npm version patch|minor|major`
2. Publish: `npm publish`
3. Push to GitHub: `git push origin main --tags`

### Version Strategy

- **patch**: Bug fixes (1.8.0 -> 1.8.1)
- **minor**: New features (1.8.0 -> 1.9.0)
- **major**: Breaking changes (1.8.0 -> 2.0.0)

## Important Files

- `bin/claude-yolo.js` - Main wrapper script
- `bin/cl` - Bash convenience wrapper
- `bin/cl.ps1` - PowerShell convenience wrapper
- `package.json` - Project configuration
- `.npmignore` - Files excluded from npm package

## Security Considerations

- YOLO mode bypasses important safety checks
- The tool modifies Claude CLI behavior at runtime
- Consent is required on first run
- Mode preference is stored in `~/.claude_yolo_state`

## Project URLs

- **npm Package**: https://www.npmjs.com/package/claude-yolo-extended
- **GitHub Repository**: https://github.com/jslitzkerttcu/claude-yolo
- **Issues**: https://github.com/jslitzkerttcu/claude-yolo/issues

## AI_HANDOFF.md Protocol
(These rules govern the 'AI_HANDOFF.md' file found in the root)
1. **Transient State Only:** This file is a specific 'mutex' token for the next session. It is NOT a project history log.
2. **No Documentation:** Do not write architectural decisions or code snippets here. Use README.md for that.
3. **Clean Up:** When updating this file, REMOVE completed tasks. Do not mark them as [x] and leave them. The file should only ever contain the *current* state and *immediate* next steps.
4. **Size Limit:** Keep this file short (under 50 lines).
