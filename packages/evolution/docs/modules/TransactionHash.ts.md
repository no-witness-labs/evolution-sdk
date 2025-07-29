---
title: TransactionHash.ts
nav_order: 87
parent: Modules
---

## TransactionHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [TransactionHashError (class)](#transactionhasherror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [BytesSchema](#bytesschema)
  - [HexSchema](#hexschema)
  - [TransactionHash](#transactionhash)
- [utils](#utils)
  - [TransactionHash (type alias)](#transactionhash-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for TransactionHash encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: {
    bytes: (input: string & Brand<"TransactionHash">) => any
    hex: (input: string & Brand<"TransactionHash">) => string
  }
  Decode: {
    bytes: (input: any) => string & Brand<"TransactionHash">
    hex: (input: string) => string & Brand<"TransactionHash">
  }
  EncodeEffect: {
    bytes: (input: string & Brand<"TransactionHash">) => Effect<any, InstanceType<typeof TransactionHashError>>
    hex: (input: string & Brand<"TransactionHash">) => Effect<string, InstanceType<typeof TransactionHashError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"TransactionHash">, InstanceType<typeof TransactionHashError>>
    hex: (input: string) => Effect<string & Brand<"TransactionHash">, InstanceType<typeof TransactionHashError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"TransactionHash">) => Either<any, InstanceType<typeof TransactionHashError>>
    hex: (input: string & Brand<"TransactionHash">) => Either<string, InstanceType<typeof TransactionHashError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"TransactionHash">, InstanceType<typeof TransactionHashError>>
    hex: (input: string) => Either<string & Brand<"TransactionHash">, InstanceType<typeof TransactionHashError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two TransactionHash instances are equal.

**Signature**

```ts
export declare const equals: (a: TransactionHash, b: TransactionHash) => boolean
```

Added in v2.0.0

# errors

## TransactionHashError (class)

Error class for TransactionHash related operations.

**Signature**

```ts
export declare class TransactionHashError
```

Added in v2.0.0

# generators

## generator

Generate a random TransactionHash.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"TransactionHash">>
```

Added in v2.0.0

# schemas

## BytesSchema

Schema for transforming between Uint8Array and TransactionHash.

**Signature**

```ts
export declare const BytesSchema: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "TransactionHash">
>
```

Added in v2.0.0

## HexSchema

Schema for transforming between hex string and TransactionHash.

**Signature**

```ts
export declare const HexSchema: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "TransactionHash">
>
```

Added in v2.0.0

## TransactionHash

Schema for TransactionHash.
transaction_hash = Bytes32

**Signature**

```ts
export declare const TransactionHash: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "TransactionHash"
>
```

Added in v2.0.0

# utils

## TransactionHash (type alias)

**Signature**

```ts
export type TransactionHash = typeof TransactionHash.Type
```
