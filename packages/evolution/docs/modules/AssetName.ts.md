---
title: AssetName.ts
nav_order: 5
parent: Modules
---

## AssetName overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [AssetNameError (class)](#assetnameerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [AssetName](#assetname)
- [schemas](#schemas)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
- [utils](#utils)
  - [AssetName (type alias)](#assetname-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for AssetName encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string & Brand<"AssetName">) => any; hex: (input: string & Brand<"AssetName">) => string }
  Decode: { bytes: (input: any) => string & Brand<"AssetName">; hex: (input: string) => string & Brand<"AssetName"> }
  EncodeEffect: {
    bytes: (input: string & Brand<"AssetName">) => Effect<any, InstanceType<typeof AssetNameError>>
    hex: (input: string & Brand<"AssetName">) => Effect<string, InstanceType<typeof AssetNameError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"AssetName">, InstanceType<typeof AssetNameError>>
    hex: (input: string) => Effect<string & Brand<"AssetName">, InstanceType<typeof AssetNameError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"AssetName">) => Either<any, InstanceType<typeof AssetNameError>>
    hex: (input: string & Brand<"AssetName">) => Either<string, InstanceType<typeof AssetNameError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"AssetName">, InstanceType<typeof AssetNameError>>
    hex: (input: string) => Either<string & Brand<"AssetName">, InstanceType<typeof AssetNameError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two AssetName instances are equal.

**Signature**

```ts
export declare const equals: (a: AssetName, b: AssetName) => boolean
```

Added in v2.0.0

# errors

## AssetNameError (class)

Error class for AssetName related operations.

**Signature**

```ts
export declare class AssetNameError
```

Added in v2.0.0

# generators

## generator

Generate a random AssetName.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"AssetName">>
```

Added in v2.0.0

# model

## AssetName

Schema for AssetName representing a native asset identifier.
Asset names are limited to 32 bytes (0-64 hex characters).

**Signature**

```ts
export declare const AssetName: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "AssetName"
>
```

Added in v2.0.0

# schemas

## FromBytes

Schema for encoding/decoding AssetName as bytes.

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "AssetName">
>
```

Added in v2.0.0

## FromHex

Schema for encoding/decoding AssetName as hex strings.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "AssetName">
>
```

Added in v2.0.0

# utils

## AssetName (type alias)

**Signature**

```ts
export type AssetName = typeof AssetName.Type
```
