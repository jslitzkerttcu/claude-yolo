# Contributing to Claude YOLO Extended

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jslitzkerttcu/claude-yolo.git
   cd claude-yolo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link for local development:
   ```bash
   npm link
   ```

## Development Workflow

### Running the Tool

```bash
# Run in YOLO mode
claude-yolo-extended

# Run in SAFE mode
claude-yolo-extended --safe

# Switch modes
claude-yolo-extended mode yolo
claude-yolo-extended mode safe
```

### Code Quality

Before submitting a PR, ensure:

```bash
# Run linting
npm run lint

# Run tests
npm test

# Check formatting
npm run format:check
```

### Commit Guidelines

- Use conventional commit messages
- Keep commits focused and atomic
- Reference issues when applicable

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## Project Structure

```
claude-yolo/
├── bin/           # CLI entry points
│   ├── claude-yolo.js  # Main wrapper
│   ├── cl.js          # cl command wrapper
│   └── ascii-art.js   # ASCII art and status displays
├── lib/           # Shared modules
│   └── constants.js   # Shared constants and utilities
├── tests/         # Test files
└── package.json
```

## Questions?

Open an issue on GitHub if you have questions or suggestions.
