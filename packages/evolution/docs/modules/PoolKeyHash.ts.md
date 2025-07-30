---
title: PoolKeyHash.ts
nav_order: 67
parent: Modules
---

## PoolKeyHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PoolKeyHashError (class)](#poolkeyhasherror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [PoolKeyHash](#poolkeyhash)
- [utils](#utils)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [PoolKeyHash (type alias)](#poolkeyhash-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for PoolKeyHash encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: {
    bytes: (input: string & Brand<"PoolKeyHash">) => any
    hex: (input: string & Brand<"PoolKeyHash">) => string
  }
  Decode: {
    bytes: (input: any) => string & Brand<"PoolKeyHash">
    hex: (input: string) => string & Brand<"PoolKeyHash">
  }
  EncodeEffect: {
    bytes: (input: string & Brand<"PoolKeyHash">) => Effect<any, InstanceType<typeof PoolKeyHashError>>
    hex: (input: string & Brand<"PoolKeyHash">) => Effect<string, InstanceType<typeof PoolKeyHashError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"PoolKeyHash">, InstanceType<typeof PoolKeyHashError>>
    hex: (input: string) => Effect<string & Brand<"PoolKeyHash">, InstanceType<typeof PoolKeyHashError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"PoolKeyHash">) => Either<any, InstanceType<typeof PoolKeyHashError>>
    hex: (input: string & Brand<"PoolKeyHash">) => Either<string, InstanceType<typeof PoolKeyHashError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"PoolKeyHash">, InstanceType<typeof PoolKeyHashError>>
    hex: (input: string) => Either<string & Brand<"PoolKeyHash">, InstanceType<typeof PoolKeyHashError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two PoolKeyHash instances are equal.

**Signature**

```ts
export declare const equals: (a: PoolKeyHash, b: PoolKeyHash) => boolean
```

Added in v2.0.0

# errors

## PoolKeyHashError (class)

Error class for PoolKeyHash related operations.

**Signature**

```ts
export declare class PoolKeyHashError
```

Added in v2.0.0

# generators

## generator

Generate a random PoolKeyHash.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"PoolKeyHash">>
```

Added in v2.0.0

# schemas

## PoolKeyHash

PoolKeyHash is a 28-byte hash representing a stake pool's verification key.
pool_keyhash = hash28

**Signature**

```ts
export declare const PoolKeyHash: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "PoolKeyHash"
>
```

Added in v2.0.0

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "PoolKeyHash">
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "PoolKeyHash">
>
```

## PoolKeyHash (type alias)

**Signature**

```ts
export type PoolKeyHash = typeof PoolKeyHash.Type
```
