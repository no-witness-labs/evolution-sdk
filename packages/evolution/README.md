# Evolution SDK

## Quick Start

````typescript
import * as Evolution from "@evolution-sdk/evolution";

// Create and validate addresses
const address = Evolution.Address.fromBech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
); TypeScript SDK for Cardano blockchain development.

## Installation

```bash
pnpm add @evolution-sdk/evolution

# Or use npm
npm install @evolution-sdk/evolution

# Or use yarn
yarn add @evolution-sdk/evolution
````

## Quick Start

```typescript
import * as Evolution from "@evolution-sdk/evolution"

// Create and validate addresses
const address = Evolution.Address.fromBech32(
  "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a8cpkp0k8cqq0sq2nq"
)

// Work with Plutus Data
const Data = Evolution.Data
const Codec = Data.Codec()

// Create basic data types
const plutusInt = 42n
const plutusBytes = "deadbeef"
const plutusList = [1n, 2n, "cafe"]

// Create a Plutus Map
const plutusMap = Data.map([
  { key: "cafe", value: 42n },
  { key: 99n, value: "deadbeef" }
])

// Create a Constructor (like Haskell data types)
const constructor = Data.constr(0n, [plutusInt, plutusBytes, plutusList])

// Encode to CBOR and decode back
const encoded = Codec.Encode.cborHex(constructor)
const decoded = Codec.Decode.cborHex(encoded)

// Complex nested structures
const complex = Data.constr(0n, [
  [1n, 2n, "cafe"],
  Data.map([
    { key: 42n, value: ["deadbeef"] },
    { key: "deadbeef", value: Data.constr(1n, [-999n]) }
  ]),
  Data.constr(7n, [[], Data.map([])])
])
```

## Features

- **Address Management**: Create, validate, and convert Cardano addresses
- **Transaction Utilities**: Build and serialize transactions
- **CBOR Support**: Encode and decode Cardano binary data
- **Type Safety**: Full TypeScript support with comprehensive types
- **Effect Integration**: Leverages Effect for robust error handling

## API Reference

### Address

```typescript
// Create from Bech32
const address = Evolution.Address.fromBech32("addr1...")

// Create from hex bytes
const address = Evolution.Address.fromBytes(hexBytes)

// Get network ID
const networkId = Evolution.Address.getNetworkId(address)
```

### Transaction

```typescript
// Create transaction hash
const hash = Evolution.TransactionHash.fromHex("915cb8...")

// Create transaction input
const input = Evolution.TransactionInput.make({
  transactionId: hash,
  index: 0
})
```

### DevNet

```typescript
// Start a development network
const devnet = await Evolution.Devnet.Cluster.makeOrThrow({
  clusterName: "my-devnet",
  kupo: { enabled: true },
  ogmios: { enabled: true }
})

await Evolution.Devnet.Cluster.startOrThrow(devnet)
```

## Documentation

For full documentation, visit [evolution-sdk.dev](https://evolution-sdk.dev).

## License

MIT
