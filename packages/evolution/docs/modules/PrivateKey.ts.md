---
title: PrivateKey.ts
nav_order: 84
parent: Modules
---

## PrivateKey overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [bip32](#bip32)
  - [derive](#derive)
- [bip39](#bip39)
  - [fromMnemonic](#frommnemonic)
  - [generateMnemonic](#generatemnemonic)
  - [validateMnemonic](#validatemnemonic)
- [cardano](#cardano)
  - [CardanoPath](#cardanopath)
- [constructors](#constructors)
  - [make](#make)
- [cryptography](#cryptography)
  - [sign](#sign)
  - [toPublicKey](#topublickey)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBech32](#tobech32)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PrivateKeyError (class)](#privatekeyerror-class)
- [generators](#generators)
  - [generate](#generate)
  - [generateExtended](#generateextended)
- [parsing](#parsing)
  - [fromBech32](#frombech32)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [schemas](#schemas)
  - [PrivateKey (class)](#privatekey-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [utils](#utils)
  - [FromBech32](#frombech32-1)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random PrivateKey instances.
Generates 32-byte private keys.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<PrivateKey>
```

Added in v2.0.0

# bip32

## derive

Derive a child private key using BIP32 path (sync version that throws PrivateKeyError).
All errors are normalized to PrivateKeyError with contextual information.

**Signature**

```ts
export declare const derive: (privateKey: PrivateKey, path: string) => PrivateKey
```

Added in v2.0.0

# bip39

## fromMnemonic

Create a PrivateKey from a mnemonic phrase (sync version that throws PrivateKeyError).
All errors are normalized to PrivateKeyError with contextual information.

**Signature**

```ts
export declare const fromMnemonic: (mnemonic: string, password?: string) => PrivateKey
```

Added in v2.0.0

## generateMnemonic

Generate a new mnemonic phrase using BIP39.

**Signature**

```ts
export declare const generateMnemonic: (strength?: 128 | 160 | 192 | 224 | 256) => string
```

Added in v2.0.0

## validateMnemonic

Validate a mnemonic phrase using BIP39.

**Signature**

```ts
export declare const validateMnemonic: (mnemonic: string) => boolean
```

Added in v2.0.0

# cardano

## CardanoPath

Cardano BIP44 derivation path utilities.

**Signature**

```ts
export declare const CardanoPath: {
  create: (account?: number, role?: 0 | 2, index?: number) => string
  payment: (account?: number, index?: number) => string
  stake: (account?: number, index?: number) => string
}
```

Added in v2.0.0

# constructors

## make

Smart constructor for PrivateKey that validates and applies branding.

**Signature**

```ts
export declare const make: (props: { readonly key: any }, options?: Schema.MakeOptions | undefined) => PrivateKey
```

Added in v2.0.0

# cryptography

## sign

Sign a message using Ed25519 (sync version that throws PrivateKeyError).
All errors are normalized to PrivateKeyError with contextual information.
For extended keys (64 bytes), uses CML-compatible Ed25519-BIP32 signing.
For normal keys (32 bytes), uses standard Ed25519 signing.

**Signature**

```ts
export declare const sign: (privateKey: PrivateKey, message: Uint8Array) => Ed25519Signature.Ed25519Signature
```

Added in v2.0.0

## toPublicKey

Derive the public key (VKey) from a private key.
Compatible with CML privateKey.to_public().

**Signature**

```ts
export declare const toPublicKey: (privateKey: PrivateKey) => VKey.VKey
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBech32

Convert a PrivateKey to a Bech32 string.
Format: ed25519e_sk1...

**Signature**

```ts
export declare const toBech32: (input: PrivateKey) => string
```

Added in v2.0.0

## toBytes

Convert a PrivateKey to raw bytes.

**Signature**

```ts
export declare const toBytes: (input: PrivateKey) => any
```

Added in v2.0.0

## toHex

Convert a PrivateKey to a hex string.

**Signature**

```ts
export declare const toHex: (input: PrivateKey) => string
```

Added in v2.0.0

# equality

## equals

Check if two PrivateKey instances are equal.

**Signature**

```ts
export declare const equals: (a: PrivateKey, b: PrivateKey) => boolean
```

Added in v2.0.0

# errors

## PrivateKeyError (class)

Error class for PrivateKey related operations.

**Signature**

```ts
export declare class PrivateKeyError
```

Added in v2.0.0

# generators

## generate

Generate a random 32-byte Ed25519 private key.
Compatible with CML.PrivateKey.generate_ed25519().

**Signature**

```ts
export declare const generate: () => Uint8Array
```

Added in v2.0.0

## generateExtended

Generate a random 64-byte extended Ed25519 private key.
Compatible with CML.PrivateKey.generate_ed25519extended().

**Signature**

```ts
export declare const generateExtended: () => Uint8Array
```

Added in v2.0.0

# parsing

## fromBech32

Parse a PrivateKey from a Bech32 string.
Expected format: ed25519e_sk1...

**Signature**

```ts
export declare const fromBech32: (input: string) => PrivateKey
```

Added in v2.0.0

## fromBytes

Parse a PrivateKey from raw bytes.
Supports both 32-byte and 64-byte private keys.

**Signature**

```ts
export declare const fromBytes: (input: any) => PrivateKey
```

Added in v2.0.0

## fromHex

Parse a PrivateKey from a hex string.
Supports both 32-byte (64 chars) and 64-byte (128 chars) hex strings.

**Signature**

```ts
export declare const fromHex: (input: string) => PrivateKey
```

Added in v2.0.0

# schemas

## PrivateKey (class)

Schema for PrivateKey representing an Ed25519 private key.
Supports both standard 32-byte and CIP-0003 extended 64-byte formats.
Follows the Conway-era CDDL specification with CIP-0003 compatibility.

**Signature**

```ts
export declare class PrivateKey
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON(): string
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
[Symbol.for("nodejs.util.inspect.custom")](): string
```

# utils

## FromBech32

**Signature**

```ts
export declare const FromBech32: Schema.transformOrFail<typeof Schema.String, typeof PrivateKey, never>
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.Union<[Schema.filter<typeof Schema.Uint8ArrayFromSelf>, Schema.filter<typeof Schema.Uint8ArrayFromSelf>]>,
  typeof PrivateKey
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.Union<[Schema.filter<typeof Schema.Uint8ArrayFromSelf>, Schema.filter<typeof Schema.Uint8ArrayFromSelf>]>,
    typeof PrivateKey
  >
>
```
