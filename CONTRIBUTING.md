# Contributing to Evolution SDK

We love your input! We want to make contributing to Evolution SDK as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code follows the existing style.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/evolution-sdk.git
cd evolution-sdk

# Enter development environment (optional but recommended)
nix develop

# Install dependencies
pnpm install

# Build the project
pnpm turbo build

# Run type checking
pnpm turbo type-check

# Start development mode
pnpm turbo dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (we use prettier and eslint)
- Write meaningful commit messages
- Keep pull requests focused and small

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/no-witness-labs/evolution-sdk/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

Feature requests are welcome! Please create an issue to discuss the feature before implementing it.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
