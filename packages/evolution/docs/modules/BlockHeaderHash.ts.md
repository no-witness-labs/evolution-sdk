---
title: BlockHeaderHash.ts
nav_order: 12
parent: Modules
---

## BlockHeaderHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [BlockHeaderHashError (class)](#blockheaderhasherror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [BlockHeaderHash](#blockheaderhash)
- [utils](#utils)
  - [BlockHeaderHash (type alias)](#blockheaderhash-type-alias)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)

---

# encoding/decoding

## Codec

Codec utilities for BlockHeaderHash encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: {
    bytes: (input: string & Brand<"BlockHeaderHash">) => any
    hex: (input: string & Brand<"BlockHeaderHash">) => string
  }
  Decode: {
    bytes: (input: any) => string & Brand<"BlockHeaderHash">
    hex: (input: string) => string & Brand<"BlockHeaderHash">
  }
  EncodeEffect: {
    bytes: (input: string & Brand<"BlockHeaderHash">) => Effect<any, InstanceType<typeof BlockHeaderHashError>>
    hex: (input: string & Brand<"BlockHeaderHash">) => Effect<string, InstanceType<typeof BlockHeaderHashError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"BlockHeaderHash">, InstanceType<typeof BlockHeaderHashError>>
    hex: (input: string) => Effect<string & Brand<"BlockHeaderHash">, InstanceType<typeof BlockHeaderHashError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"BlockHeaderHash">) => Either<any, InstanceType<typeof BlockHeaderHashError>>
    hex: (input: string & Brand<"BlockHeaderHash">) => Either<string, InstanceType<typeof BlockHeaderHashError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"BlockHeaderHash">, InstanceType<typeof BlockHeaderHashError>>
    hex: (input: string) => Either<string & Brand<"BlockHeaderHash">, InstanceType<typeof BlockHeaderHashError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two BlockHeaderHash instances are equal.

**Signature**

```ts
export declare const equals: (a: BlockHeaderHash, b: BlockHeaderHash) => boolean
```

Added in v2.0.0

# errors

## BlockHeaderHashError (class)

Error class for BlockHeaderHash related operations.

**Signature**

```ts
export declare class BlockHeaderHashError
```

Added in v2.0.0

# generators

## generator

Generate a random BlockHeaderHash.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"BlockHeaderHash">>
```

Added in v2.0.0

# schemas

## BlockHeaderHash

Schema for BlockHeaderHash representing a block header hash.
block_header_hash = Bytes32
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare const BlockHeaderHash: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "BlockHeaderHash"
>
```

Added in v2.0.0

# utils

## BlockHeaderHash (type alias)

**Signature**

```ts
export type BlockHeaderHash = typeof BlockHeaderHash.Type
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "BlockHeaderHash">
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "BlockHeaderHash">
>
```
