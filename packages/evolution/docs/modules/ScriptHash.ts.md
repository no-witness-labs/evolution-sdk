---
title: ScriptHash.ts
nav_order: 94
parent: Modules
---

## ScriptHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ScriptHashError (class)](#scripthasherror-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
  - [ScriptHash (class)](#scripthash-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random ScriptHash instances.
Used for property-based testing to generate valid test data.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ScriptHash>
```

Added in v2.0.0

# constructors

## make

Smart constructor for ScriptHash that validates and applies branding.

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => ScriptHash
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Convert a ScriptHash to raw bytes.

**Signature**

```ts
export declare const toBytes: (scriptHash: ScriptHash) => Uint8Array
```

Added in v2.0.0

## toHex

Convert a ScriptHash to a hex string.

**Signature**

```ts
export declare const toHex: (scriptHash: ScriptHash) => string
```

Added in v2.0.0

# equality

## equals

Check if two ScriptHash instances are equal.

**Signature**

```ts
export declare const equals: (a: ScriptHash, b: ScriptHash) => boolean
```

Added in v2.0.0

# errors

## ScriptHashError (class)

Error class for ScriptHash related operations.

**Signature**

```ts
export declare class ScriptHashError
```

Added in v2.0.0

# parsing

## fromBytes

Parse a ScriptHash from raw bytes.
Expects exactly 28 bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => ScriptHash
```

Added in v2.0.0

## fromHex

Parse a ScriptHash from a hex string.
Expects exactly 56 hex characters (28 bytes).

**Signature**

```ts
export declare const fromHex: (input: string) => ScriptHash
```

Added in v2.0.0

# schemas

## FromBytes

Schema for transforming between Uint8Array and ScriptHash.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof ScriptHash>
```

Added in v2.0.0

## FromHex

Schema for transforming between hex string and ScriptHash.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof ScriptHash>
>
```

Added in v2.0.0

## ScriptHash (class)

Schema for ScriptHash representing a script hash credential.

```
script_hash = hash28
```

Follows CIP-0019 binary representation.

Stores raw 28-byte value for performance.

**Signature**

```ts
export declare class ScriptHash
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
