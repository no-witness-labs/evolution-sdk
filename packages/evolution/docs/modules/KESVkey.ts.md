---
title: KESVkey.ts
nav_order: 50
parent: Modules
---

## KESVkey overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [KESVkeyError (class)](#kesvkeyerror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [KESVkey](#kesvkey)
- [utils](#utils)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [KESVkey (type alias)](#kesvkey-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for KESVkey encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string & Brand<"KESVkey">) => any; hex: (input: string & Brand<"KESVkey">) => string }
  Decode: { bytes: (input: any) => string & Brand<"KESVkey">; hex: (input: string) => string & Brand<"KESVkey"> }
  EncodeEffect: {
    bytes: (input: string & Brand<"KESVkey">) => Effect<any, InstanceType<typeof KESVkeyError>>
    hex: (input: string & Brand<"KESVkey">) => Effect<string, InstanceType<typeof KESVkeyError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"KESVkey">, InstanceType<typeof KESVkeyError>>
    hex: (input: string) => Effect<string & Brand<"KESVkey">, InstanceType<typeof KESVkeyError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"KESVkey">) => Either<any, InstanceType<typeof KESVkeyError>>
    hex: (input: string & Brand<"KESVkey">) => Either<string, InstanceType<typeof KESVkeyError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"KESVkey">, InstanceType<typeof KESVkeyError>>
    hex: (input: string) => Either<string & Brand<"KESVkey">, InstanceType<typeof KESVkeyError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two KESVkey instances are equal.

**Signature**

```ts
export declare const equals: (a: KESVkey, b: KESVkey) => boolean
```

Added in v2.0.0

# errors

## KESVkeyError (class)

Error class for KESVkey related operations.

**Signature**

```ts
export declare class KESVkeyError
```

Added in v2.0.0

# generators

## generator

Generate a random KESVkey.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"KESVkey">>
```

Added in v2.0.0

# schemas

## KESVkey

Schema for KESVkey representing a KES verification key.
kes_vkey = bytes .size 32
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare const KESVkey: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "KESVkey"
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
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "KESVkey">
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "KESVkey">
>
```

## KESVkey (type alias)

**Signature**

```ts
export type KESVkey = typeof KESVkey.Type
```
