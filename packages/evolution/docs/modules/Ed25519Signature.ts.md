---
title: Ed25519Signature.ts
nav_order: 40
parent: Modules
---

## Ed25519Signature overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [Ed25519SignatureError (class)](#ed25519signatureerror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [Ed25519Signature](#ed25519signature)
- [utils](#utils)
  - [Ed25519Signature (type alias)](#ed25519signature-type-alias)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)

---

# encoding/decoding

## Codec

Codec utilities for Ed25519Signature encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: {
    bytes: (input: string & Brand<"Ed25519Signature">) => any
    hex: (input: string & Brand<"Ed25519Signature">) => string
  }
  Decode: {
    bytes: (input: any) => string & Brand<"Ed25519Signature">
    hex: (input: string) => string & Brand<"Ed25519Signature">
  }
  EncodeEffect: {
    bytes: (input: string & Brand<"Ed25519Signature">) => Effect<any, InstanceType<typeof Ed25519SignatureError>>
    hex: (input: string & Brand<"Ed25519Signature">) => Effect<string, InstanceType<typeof Ed25519SignatureError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"Ed25519Signature">, InstanceType<typeof Ed25519SignatureError>>
    hex: (input: string) => Effect<string & Brand<"Ed25519Signature">, InstanceType<typeof Ed25519SignatureError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"Ed25519Signature">) => Either<any, InstanceType<typeof Ed25519SignatureError>>
    hex: (input: string & Brand<"Ed25519Signature">) => Either<string, InstanceType<typeof Ed25519SignatureError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"Ed25519Signature">, InstanceType<typeof Ed25519SignatureError>>
    hex: (input: string) => Either<string & Brand<"Ed25519Signature">, InstanceType<typeof Ed25519SignatureError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two Ed25519Signature instances are equal.

**Signature**

```ts
export declare const equals: (a: Ed25519Signature, b: Ed25519Signature) => boolean
```

Added in v2.0.0

# errors

## Ed25519SignatureError (class)

Error class for Ed25519Signature related operations.

**Signature**

```ts
export declare class Ed25519SignatureError
```

Added in v2.0.0

# generators

## generator

Generate a random Ed25519Signature.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"Ed25519Signature">>
```

Added in v2.0.0

# schemas

## Ed25519Signature

Schema for Ed25519Signature representing an Ed25519 signature.
ed25519_signature = bytes .size 64
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare const Ed25519Signature: Schema.brand<
  Schema.filter<Schema.refine<string, typeof Schema.String>>,
  "Ed25519Signature"
>
```

Added in v2.0.0

# utils

## Ed25519Signature (type alias)

**Signature**

```ts
export type Ed25519Signature = typeof Ed25519Signature.Type
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
    Schema.filter<Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "Ed25519Signature">
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.filter<Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "Ed25519Signature">
>
```
