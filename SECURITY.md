# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.9.x   | :white_check_mark: |
| < 1.9   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it by opening an issue on GitHub or by emailing the maintainer directly.

**Please do not publicly disclose the vulnerability until it has been addressed.**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Considerations

This package modifies the Claude CLI to bypass safety checks when running in YOLO mode. By design, this introduces security risks that users should be aware of:

1. **File Access**: In YOLO mode, Claude CLI can access any file without permission prompts
2. **Command Execution**: Safety prompts for potentially dangerous operations are bypassed
3. **Root Detection**: Root user checks are bypassed to allow running as root

### Recommendations

- Only use YOLO mode in trusted, isolated environments
- Never use YOLO mode with sensitive data or in production
- Use SAFE mode for normal development work
- Review Claude's actions carefully when in YOLO mode
