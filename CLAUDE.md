# Claude YOLO Extended - AI Assistant Guide

> For full documentation, see [README.md](README.md). For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick Reference

**What it does:** Wrapper for Claude CLI with YOLO mode (bypasses safety) and SAFE mode (standard behavior).

### Essential Commands
```bash
# Run Claude
claude-yolo-extended          # YOLO mode (default)
claude-yolo-extended --safe   # SAFE mode

# Using cl wrapper (passes all args to Claude)
cl                    # Run in current mode
cl /YON               # Enable YOLO mode
cl /YOFF              # Enable SAFE mode
cl --chrome           # Pass flags to Claude
cl mcp list           # Pass subcommands to Claude
```

### Development
```bash
npm install           # Install dependencies
npm link              # Link for local testing
npm run lint          # Check code quality
npm test              # Run tests
```

### Publishing (Manual - MFA required)
```bash
npm version patch|minor|major
npm publish --otp=CODE
git push origin main --tags
```

## Key Files
| File | Purpose |
|------|---------|
| `bin/claude-yolo.js` | Main wrapper script |
| `bin/cl.js` | Cross-platform cl command |
| `bin/cl.ps1` | PowerShell wrapper |
| `lib/constants.js` | Shared constants |

## Project URLs
- **npm:** https://www.npmjs.com/package/claude-yolo-extended
- **GitHub:** https://github.com/jslitzkerttcu/claude-yolo
- **Issues:** https://github.com/jslitzkerttcu/claude-yolo/issues

## AI_HANDOFF.md Protocol
1. **Transient State Only:** Session handoff, not a project log
2. **No Documentation:** Use README.md for architecture/code docs
3. **Clean Up:** Remove completed tasks, don't mark as [x]
4. **Size Limit:** Keep under 50 lines
