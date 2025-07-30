<div align="center">
  <img src="https://via.placeholder.com/200x200/6366f1/ffffff?text=Evolution" alt="Evolution SDK Logo" width="200" height="200">
  
  # Evolution SDK
  
  **TypeScript-first Cardano development with static type inference**
  
  Build robust Cardano applications with modern TypeScript, functional programming, and comprehensive type safety.
  
  [![Build Status](https://img.shields.io/github/actions/workflow/status/no-witness-labs/evolution-sdk/ci.yml?branch=main)](https://github.com/no-witness-labs/evolution-sdk/actions)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
  [![Effect](https://img.shields.io/badge/Effect-3.0+-blueviolet.svg)](https://effect.website/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  
  [📚 Documentation](https://no-witness-labs.github.io/evolution-sdk) • [🚀 Quick Start](#-quick-start) • [💡 Examples](./examples) • [🤝 Contributing](#-contributing)
</div>

---

## What is Evolution SDK?

Evolution SDK is a **TypeScript-first** Cardano development framework. Define your data schemas and build transactions with full type safety. You'll get back strongly typed, validated results with comprehensive error handling.

```typescript
import { Address, Transaction, Coin, Devnet } from "@evolution-sdk/evolution"

// Define and validate a Cardano address
const address = Address.Codec.Decode.bech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
)

// Convert between formats with type safety
const addressHex = Address.Codec.Encode.hex(address)
const addressBytes = Address.Codec.Encode.bytes(address)

// Work with CBOR data confidently using Codec
const transaction = Transaction.Codec.Decode.hex("84a3008282...")
const coin = Coin.Codec.Decode.bytes(coinBytes)

// Effect-powered error handling
const addressEffect = Address.Codec.DecodeEffect.bech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
)

// Start a local development network instantly
const devnet = await Devnet.Cluster.start({ 
  kupo: { enabled: true }, 
  ogmios: { enabled: true }
})
```

## ✨ Features

• **Zero runtime errors** - Comprehensive TypeScript types for all Cardano primitives
• **Effect-powered** - Built on Effect for robust error handling and async operations  
• **Blazing fast** - Modern tooling with hot reload and optimized builds
• **DevNet ready** - Local blockchain development with Docker integration
• **Modular design** - Tree-shakeable exports for minimal bundle size
• **CBOR first-class** - Native support for Cardano's binary format
• **Battle-tested** - Production-ready with comprehensive test coverage

---

## 🚀 Installation

```bash
npm install @evolution-sdk/evolution
```

## 🏁 Quick Start

```typescript
import { Address, TransactionHash, Devnet } from "@evolution-sdk/evolution"

// Create and validate addresses
const address = Address.Codec.Decode.bech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
)

// Handle transactions with type safety
const txHash = TransactionHash.Codec.Decode.hex("915cb8b7b58c6a4db9ff6c0c4b6e6e9b4c8b5a6f4e6e8a5b2c9d8f7e1a4b3c2d1")

// Start a development network
const devnet = await Devnet.Cluster.makeOrThrow({
  clusterName: "my-devnet",
  kupo: { enabled: true },
  ogmios: { enabled: true }
})

await Devnet.Cluster.startOrThrow(devnet)
```

### Type Inference

Evolution SDK provides comprehensive type inference for all Cardano primitives:

```typescript
import { Address, CBOR, Effect } from "@evolution-sdk/evolution"

// Type-safe CBOR operations
const encoded = CBOR.Codec.Encode.bytes(myData) // Uint8Array
const decoded = CBOR.Codec.Decode.bytes(encoded) // Decoded data

// Effect-powered error handling
const result = await Effect.runPromise(
  Address.Codec.DecodeEffect.bech32(bech32String)
)
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

| Package                                            | Description                                                                  | Status                                                                                                                     | Documentation                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`@evolution-sdk/evolution`](./packages/evolution) | Complete Cardano SDK with address management, transactions, and DevNet tools | 🚧 In Development | [README](./packages/evolution/README.md) |

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
    <td align="center"><img src="https://avatars.githubusercontent.com/u/14985020?s=200&v=4" width="40" height="40"/><br><strong>Turbo</strong></td>
    <td align="center"><img src="https://avatars.githubusercontent.com/u/77678942?s=200&v=4" width="40" height="40"/><br><strong>Effect</strong></td>
    <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40"/><br><strong>Docker</strong></td>
    <td align="center"><img src="https://avatars.githubusercontent.com/u/487568?s=200&v=4" width="40" height="40"/><br><strong>Nix</strong></td>
  </tr>
</table>

## 📚 Documentation

### 🌐 Website
For comprehensive guides, tutorials, and interactive examples, visit our [official documentation](https://no-witness-labs.github.io/evolution-sdk).

### 📖 API Reference
Complete API documentation with type definitions and examples is available in our [API reference](https://no-witness-labs.github.io/evolution-sdk/api).

### 🎓 Learning Resources

- **[Getting Started Guide](https://no-witness-labs.github.io/evolution-sdk/getting-started)** - Your first steps with Evolution SDK
- **[Examples Repository](./examples)** - Real-world usage examples and patterns
- **[Video Tutorials](https://no-witness-labs.github.io/evolution-sdk/videos)** - Visual guides for complex topics
- **[Migration Guide](https://no-witness-labs.github.io/evolution-sdk/migration)** - Upgrading from other Cardano libraries

### 🎥 Introduction Video
Get started with Evolution SDK by watching our introductory video:
[**Introduction to Evolution SDK →**](https://youtu.be/EvolutionSDK)

## 🤝 Community & Support

Join our thriving community of Cardano developers:

- 💬 **[Discord](https://discord.gg/RcW9xqFC)** - Get help, share projects, and discuss development
- **[X](https://x.com/nowitnesslabs)** - Latest announcements and ecosystem updates  
- 🐛 **[GitHub Issues](https://github.com/no-witness-labs/evolution-sdk/issues)** - Bug reports and feature requests
- 💡 **[GitHub Discussions](https://github.com/no-witness-labs/evolution-sdk/discussions)** - Questions, ideas, and community showcases

### Getting Help

- **Found a bug?** Open an issue with a minimal reproduction
- **Need help?** Ask in our Discord community
- **Have an idea?** Start a discussion on GitHub
- **Want to contribute?** Check our [contribution guide](#-contributing)

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] **Core SDK Foundation**
  - [x] TypeScript package setup with strict typing
  - [x] Modern build configuration with Turbo
  - [x] Comprehensive Cardano primitive types (78 modules)
  - [x] Codec pattern for all data operations
  - [x] Effect integration for error handling
  - [x] Docker DevNet integration
  - [x] ESM module format with tree-shaking
  - [x] Complete type definitions and IntelliSense

### ✅ Phase 2: Core Features (Completed)
- [x] **Address Management** (10 modules)
  - [x] `Address` - Core address utilities with bech32/hex encoding
  - [x] `BaseAddress`, `ByronAddress`, `EnterpriseAddress` - All address types
  - [x] `PaymentAddress`, `PointerAddress`, `RewardAddress` - Specialized addresses
  - [x] `AddressDetails`, `AddressTag`, `StakeReference` - Address metadata
- [x] **Transaction Handling** (7 modules)
  - [x] `Transaction`, `TransactionBody`, `TransactionHash` - Core transaction
  - [x] `TransactionInput`, `TransactionOutput`, `TransactionIndex` - I/O handling
  - [x] `TransactionMetadatumLabels` - Metadata support
- [x] **Cryptography & Security** (9 modules)
  - [x] `Ed25519Signature`, `KesSignature`, `VrfCert` - Digital signatures
  - [x] `Hash28`, `KeyHash`, `VrfKeyHash` - Hash utilities
  - [x] `VKey`, `KESVkey`, `VrfVkey` - Verification keys
- [x] **Value & Assets** (7 modules)
  - [x] `Coin`, `PositiveCoin`, `Value` - ADA and multi-asset handling
  - [x] `MultiAsset`, `AssetName`, `PolicyId` - Asset management
  - [x] `Mint` - Minting operations
- [x] **Scripts & Certificates** (7 modules)
  - [x] `Certificate`, `NativeScripts`, `NativeScriptJSON` - Script support
  - [x] `ScriptDataHash`, `ScriptHash`, `ScriptRef` - Script utilities
- [x] **Governance & Staking** (12 modules)
  - [x] `DRep`, `DRepCredential`, `VotingProcedures` - Governance
  - [x] `ProposalProcedures`, `CommitteeColdCredential`, `CommitteeHotCredential` - Committee
  - [x] `PoolKeyHash`, `PoolMetadata`, `PoolParams` - Pool management
  - [x] `Withdrawals`, `Credential` - Staking operations
- [x] **Network & Communication** (11 modules)
  - [x] `Network`, `NetworkId`, `Relay` - Network utilities
  - [x] `IPv4`, `IPv6`, `Port`, `DnsName`, `Url` - Network addressing
  - [x] `SingleHostAddr`, `SingleHostName`, `MultiHostName` - Host management
- [x] **Data Types & Primitives** (15 modules)
  - [x] `Bytes`, `BoundedBytes` + 8 fixed-size byte arrays
  - [x] `Text`, `Text128`, `BigInt`, `Natural` - Text and numeric types
  - [x] `NonZeroInt64`, `Numeric`, `UnitInterval` - Specialized numbers
- [x] **Blockchain Primitives** (12 modules)
  - [x] `Block`, `BlockBodyHash`, `BlockHeaderHash` - Block structure
  - [x] `Header`, `HeaderBody`, `EpochNo` - Block components
  - [x] `AuxiliaryDataHash`, `OperationalCert`, `ProtocolVersion` - Protocol
  - [x] `Pointer`, `Anchor`, `RewardAccount` - Blockchain references
- [x] **Core Utilities** (8 modules)
  - [x] `CBOR`, `Codec`, `Combinator` - Core encoding/decoding
  - [x] `Data`, `DataJson`, `DatumOption` - Data handling
  - [x] `Bech32`, `FormatError` - Utilities and error handling
- [x] **Development Tools** (2 modules)
  - [x] `Devnet`, `DevnetDefault` - Local development network

### 🚧 Phase 3: Transaction Building & Providers (In Progress)
- [ ] **Transaction Builder Components**
  - [ ] Transaction builder with fluent API
  - [ ] UTXO selection algorithms
  - [ ] Fee calculation utilities
  - [ ] Balance and change computation
  - [ ] Multi-asset transaction support
  - [ ] Script witness attachment
- [ ] **Provider Integrations**
  - [ ] `Maestro` - Maestro API provider
  - [ ] `Blockfrost` - Blockfrost API provider  
  - [ ] `Koios` - Koios API provider
  - [ ] `KupoOgmios` - Kupo/Ogmios provider
  - [ ] `UtxoRpc` - UTXO RPC provider
  - [ ] Provider abstraction layer
  - [ ] Failover and load balancing
- [ ] **Wallet Integration**
  - [ ] Hardware wallet support (Ledger, Trezor)
  - [ ] Browser wallet integration (Nami, Eternl, Flint)
  - [ ] Multi-signature wallet support
  - [ ] Wallet connector abstraction layer
  - [ ] CIP-30 standard implementation
- [ ] **Smart Contract Support**
  - [ ] UPLC evaluation from Aiken
  - [ ] UPLC evaluation from Helios
  - [ ] UPLC evaluation from Plu-ts
  - [ ] UPLC evaluation from Scalus
  - [ ] Script validation utilities
  - [ ] Datum and redeemer handling
  - [ ] Script cost estimation
- [ ] **Effect 4.0 Migration**
  - [ ] Upgrade to Effect 4.0 when released
  - [ ] Leverage new Effect features and performance improvements
  - [ ] Update all Codec and Error handling patterns
  - [ ] Maintain backward compatibility where possible

### 🔮 Phase 4: Advanced Features (Planned)
- [x] **Enhanced DevNet** (Completed)
  - [x] Custom network configuration
  - [x] Automated testing framework
  - [x] Transaction simulation
  - [x] Performance monitoring
- [ ] **Hydra Integration**
  - [ ] Hydra Head management
  - [ ] State channel operations
  - [ ] Off-chain transaction handling
  - [ ] Hydra Head lifecycle management
  - [ ] Layer 2 scaling utilities
- [ ] **DeFi Primitives**
  - [ ] DEX integration utilities
  - [ ] Liquidity pool management
  - [ ] Yield farming helpers
  - [ ] NFT marketplace tools
- [ ] **Developer Experience**
  - [ ] CLI tool for project scaffolding
  - [ ] VS Code extension
  - [ ] Interactive tutorials
  - [ ] Schema types from Plutus blueprint types

### 📊 Current Focus
We're currently prioritizing **transaction building components** and **provider integrations** (Maestro, Blockfrost, Koios, Kupo/Ogmios, UTXO RPC) to provide developers with the essential infrastructure needed for building production Cardano applications.

## 🤝 Contributing

We love your input! We want to make contributing to Evolution SDK as easy and transparent as possible.

### Quick Start for Contributors

1. **Fork and clone** the repository
   ```bash
   git clone https://github.com/your-username/evolution-sdk.git
   cd evolution-sdk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development**
   ```bash
   pnpm turbo dev
   ```

4. **Make your changes** and test them
   ```bash
   pnpm turbo build
   pnpm turbo type-check
   ```

5. **Create a pull request**

### Development Workflow

| Command | Description |
|---------|-------------|
| `pnpm turbo build` | Build all packages with optimal caching |
| `pnpm turbo dev` | Start development mode with hot reload |
| `pnpm turbo type-check` | Run TypeScript type checking |
| `pnpm turbo test` | Run all tests |
| `pnpm turbo lint` | Run code quality checks |
| `pnpm turbo clean` | Clean all build artifacts |

### What We're Looking For

- 🐛 **Bug fixes** - Help us squash those pesky issues
- ✨ **New features** - Extend Evolution SDK's capabilities  
- 📚 **Documentation** - Improve guides, examples, and API docs
- 🧪 **Tests** - Increase our test coverage
- 🎨 **Examples** - Show off creative use cases
- 🚀 **Performance** - Make Evolution SDK even faster

### Contribution Guidelines

- **Follow TypeScript best practices** - Use strict typing and modern patterns
- **Add tests** for new features and bug fixes
- **Update documentation** when adding new APIs
- **Keep changes focused** - One feature/fix per pull request
- **Follow conventional commits** - Use clear, descriptive commit messages

Read our full [Contribution Guide](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🌟 Support Evolution SDK

<a href="https://github.com/sponsors/no-witness-labs">
  <img src="https://img.shields.io/badge/Sponsor-❤️-red.svg" alt="Sponsor">
</a>

**Help us build the future of Cardano development**

Your sponsorship helps us maintain Evolution SDK, create educational content, and support the community.

</div>

## 🙏 Acknowledgments

Evolution SDK builds on the incredible work of:

- 🏗️ **[Turborepo](https://turborepo.org/)** - For the incredible build system
- ⚡ **[Effect](https://effect.website/)** - For functional programming excellence  
-  **Our [contributors](https://github.com/no-witness-labs/evolution-sdk/graphs/contributors)** - Building the future together

---

<div align="center">
  <p>
    <sub>Built with ❤️ by <a href="https://github.com/no-witness-labs">No Witness Labs</a></sub>
  </p>
  <p>
    <a href="https://github.com/no-witness-labs/evolution-sdk">⭐ Star us on GitHub</a> •
    <a href="https://x.com/nowitnesslabs">Follow on X</a> •
    <a href="https://discord.gg/RcW9xqFC">💬 Join Discord</a>
  </p>
  
  **[📚 Read the docs](https://no-witness-labs.github.io/evolution-sdk)** to get started building with Evolution SDK
</div>
