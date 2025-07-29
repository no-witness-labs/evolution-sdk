<div align="c  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  
  [📚 Documentation](TBD) • [🚀 Quick Start](#-quick-start) • [💡 Examples](TBD) • [🤝 Contributing](#-contributing)
</div>r">
  <img src="https://via.placeholder.com/200x200/6366f1/ffffff?text=Evolution" alt="Evolution SDK Logo" width="200" height="200">
  
  # Evolution SDK
  
  **A modern TypeScript SDK for Cardano blockchain development**
  
  [![npm version](https://img.shields.io/npm/v/@evolution-sdk/evolution.svg)](https://www.npmjs.com/package/@evolution-sdk/evolution)
  [![Downloads](https://img.shields.io/npm/dm/@evolution-sdk/evolution.svg)](https://www.npmjs.com/package/@evolution-sdk/evolution)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/no-witness-labs/evolution-sdk/ci.yml?branch=main)](https://github.com/no-witness-labs/evolution-sdk/actions)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
  [![Effect](https://img.shields.io/badge/Effect-3.0+-blueviolet.svg)](https://effect.website/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  
  [� Documentation](https://evolution-sdk.dev) • [�🚀 Quick Start](#-quick-start) • [💡 Examples](./examples) • [🤝 Contributing](#-contributing)
</div>

---

## ✨ Features

- 🚀 **Blazing Fast**: Built with TypeScript and modern tooling for lightning-fast builds and development
- 🔐 **Type-Safe**: Full TypeScript support with comprehensive type definitions for all Cardano primitives
- 🧪 **Effect-First**: Leverages the Effect ecosystem for robust error handling and functional programming
- 🐳 **DevNet Ready**: Built-in Docker support for local Cardano development networks with Kupo & Ogmios
- 📦 **Modular Architecture**: Tree-shakeable exports for optimal bundle size in your applications
- 🔄 **Hot Reload**: Development mode with instant file watching and rebuilding
- 🎯 **Modern**: ESM-first with support for the latest JavaScript features and standards
- 🏗️ **Monorepo Ready**: Structured for easy expansion with additional packages and utilities

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- **Nix** (optional, for reproducible development environment)

### Installation

```bash
# Install the Evolution SDK
pnpm add @evolution-sdk/evolution

# Or use npm
npm install @evolution-sdk/evolution

# Or use yarn
yarn add @evolution-sdk/evolution
```

### Basic Usage

```typescript
import * as Evolution from "@evolution-sdk/evolution"

// Create a new address
const address = Evolution.Address.fromBech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
)

// Work with transactions
const txHash = Evolution.TransactionHash.fromHex("915cb8b7b58c6a4db9ff6c0c4b6e6e9b4c8b5a6f4e6e8a5b2c9d8f7e1a4b3c2d1")

// Start a development network
const devnet = await Evolution.Devnet.Cluster.makeOrThrow({
  clusterName: "my-devnet",
  kupo: { enabled: true },
  ogmios: { enabled: true }
})

await Evolution.Devnet.Cluster.startOrThrow(devnet)
```

## 🏗️ Architecture

Evolution SDK is built as a **single package** with a clean, modular structure that's ready for future expansion:

```
evolution-sdk/
├── 📦 packages/
│   └── evolution/           # Main SDK package
│       ├── src/
│       │   ├── Address.ts   # Address utilities
│       │   ├── Transaction.ts # Transaction building
│       │   ├── Devnet/      # Development network tools
│       │   └── ...
│       └── dist/            # Compiled output
├── 📖 docs/                 # Documentation
├── 🧪 examples/             # Usage examples
├── turbo.json              # Turbo configuration
├── pnpm-workspace.yaml     # Workspace configuration
└── flake.nix               # Nix development environment
```

### Future Package Expansion

The monorepo structure is designed to accommodate additional packages.

## 📦 Package

| Package                                            | Description                                                                  | Version                                                                                                                     | Documentation                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`@evolution-sdk/evolution`](./packages/evolution) | Complete Cardano SDK with address management, transactions, and DevNet tools | [![npm](https://img.shields.io/npm/v/@evolution-sdk/evolution.svg)](https://www.npmjs.com/package/@evolution-sdk/evolution) | [README](./packages/evolution/README.md) |

### Core Features

- **🏠 Address Management**: Create, validate, and convert Cardano addresses
- **💰 Transaction Building**: Construct and serialize transactions with type safety
- **🔧 CBOR Encoding/Decoding**: Handle Cardano's binary data format
- **🌐 Network Utilities**: Tools for different Cardano networks
- **🐳 DevNet Integration**: Local development blockchain with Docker
- **📊 Data Schemas**: Comprehensive Cardano data type definitions

## 🛠️ Development

### Setting Up the Development Environment

```bash
# Clone the repository
git clone https://github.com/no-witness-labs/evolution-sdk.git
cd evolution-sdk

# Enter Nix development shell (optional but recommended)
nix develop

# Install dependencies
pnpm install

# Build all packages
pnpm turbo build

# Start development mode with file watching
pnpm turbo dev

# Run type checking
pnpm turbo type-check
```

### Available Scripts

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `pnpm turbo build`      | Build the package with optimal caching |
| `pnpm turbo dev`        | Start development mode with hot reload |
| `pnpm turbo type-check` | Run TypeScript type checking           |
| `pnpm turbo test`       | Run all tests (when available)         |
| `pnpm turbo lint`       | Run code quality checks                |
| `pnpm turbo clean`      | Clean all build artifacts              |

### Tech Stack

<table>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="40" height="40"/><br><strong>TypeScript</strong></td>
    <td align="center"><img src="https://turbo.build/images/logos/turborepo.svg" width="40" height="40"/><br><strong>Turbo</strong></td>
    <td align="center"><img src="https://effect.website/images/effect-logo.svg" width="40" height="40"/><br><strong>Effect</strong></td>
    <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40"/><br><strong>Docker</strong></td>
    <td align="center"><img src="https://nixos.org/logo/nixos-hires.png" width="40" height="40"/><br><strong>Nix</strong></td>
  </tr>
</table>

## 📚 Documentation

### 🌐 Website

For comprehensive guides, tutorials, and API documentation, visit [TBD](TBD).

### 📖 API Reference

Complete API documentation for all packages is available in each package's README:

- [`@evolution-sdk/evolution`](./packages/evolution/README.md)

### 🎓 Learning Resources

- [Getting Started Guide](TBD)
- [API Examples](TBD)
- [Video Tutorials](TBD)

## 🤝 Community

Join our growing community of Cardano developers:

- 💬 **[Discord](TBD)** - Get help, share projects, and discuss development
- 🐦 **[Twitter](TBD)** - Stay updated with latest announcements
- 🐛 **[GitHub Issues](https://github.com/no-witness-labs/evolution-sdk/issues)** - Report bugs and request features
- 💡 **[GitHub Discussions](https://github.com/no-witness-labs/evolution-sdk/discussions)** - Ask questions and share ideas

## 🎯 Roadmap

- [x] **Core SDK Foundation**
  - [x] TypeScript package setup
  - [x] Modern build configuration
  - [x] Basic Cardano types and utilities
  - [x] Docker DevNet integration

## 🤝 Contributing

We love your input! We want to make contributing to Evolution SDK as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Discussing the current state of the code
- 🚀 Submitting a fix
- 💭 Proposing new features
- 🎉 Becoming a maintainer

### Quick Start for Contributors

```bash
# Fork the repository and clone it
git clone https://github.com/your-username/evolution-sdk.git
cd evolution-sdk

# Create a new branch
git checkout -b feature/amazing-feature

# Install dependencies
pnpm install

# Run development mode
pnpm turbo dev

# Make your changes and test them
pnpm turbo build
pnpm turbo type-check

# Commit and push
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

### Development Workflow

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `pnpm turbo build`      | Build all packages with optimal caching |
| `pnpm turbo dev`        | Start development mode with hot reload  |
| `pnpm turbo type-check` | Run TypeScript type checking            |
| `pnpm turbo test`       | Run all tests (when available)          |
| `pnpm turbo lint`       | Run code quality checks                 |
| `pnpm turbo clean`      | Clean all build artifacts               |

### Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](TBD). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Sponsors

<div align="center">
  <a href="https://github.com/sponsors/no-witness-labs">
    <img src="https://img.shields.io/badge/Sponsor-❤️-red.svg" alt="Sponsor">
  </a>
</div>

## 🙏 Acknowledgments

- 🏗️ **[Turborepo](https://turborepo.org/)** - For the incredible build system
- ⚡ **[Effect](https://effect.website/)** - For functional programming excellence
- 🔷 **[Cardano Foundation](https://cardanofoundation.org/)** - For the amazing blockchain platform
- 🦀 **[Rust](https://www.rust-lang.org/)** & **[WebAssembly](https://webassembly.org/)** communities
- 💜 All our [contributors](https://github.com/no-witness-labs/evolution-sdk/graphs/contributors)

---

<div align="center">
  <p>
    <sub>Built with ❤️ by <a href="https://github.com/no-witness-labs">No Witness Labs</a></sub>
  </p>
  <p>
    <a href="https://github.com/no-witness-labs/evolution-sdk">⭐ Star us on GitHub</a> •
    <a href="TBD">🐦 Follow on Twitter</a> •
    <a href="TBD">💬 Join Discord</a>
  </p>
</div>
