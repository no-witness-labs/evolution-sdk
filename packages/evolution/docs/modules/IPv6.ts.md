---
title: IPv6.ts
nav_order: 48
parent: Modules
---

## IPv6 overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [IPv6Error (class)](#ipv6error-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [IPv6](#ipv6)
- [utils](#utils)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [IPv6 (type alias)](#ipv6-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for IPv6 encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string & Brand<"IPv6">) => any; hex: (input: string & Brand<"IPv6">) => string }
  Decode: { bytes: (input: any) => string & Brand<"IPv6">; hex: (input: string) => string & Brand<"IPv6"> }
  EncodeEffect: {
    bytes: (input: string & Brand<"IPv6">) => Effect<any, InstanceType<typeof IPv6Error>>
    hex: (input: string & Brand<"IPv6">) => Effect<string, InstanceType<typeof IPv6Error>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"IPv6">, InstanceType<typeof IPv6Error>>
    hex: (input: string) => Effect<string & Brand<"IPv6">, InstanceType<typeof IPv6Error>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"IPv6">) => Either<any, InstanceType<typeof IPv6Error>>
    hex: (input: string & Brand<"IPv6">) => Either<string, InstanceType<typeof IPv6Error>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"IPv6">, InstanceType<typeof IPv6Error>>
    hex: (input: string) => Either<string & Brand<"IPv6">, InstanceType<typeof IPv6Error>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two IPv6 instances are equal.

**Signature**

```ts
export declare const equals: (a: IPv6, b: IPv6) => boolean
```

Added in v2.0.0

# errors

## IPv6Error (class)

Error class for IPv6 related operations.

**Signature**

```ts
export declare class IPv6Error
```

Added in v2.0.0

# generators

## generator

Generate a random IPv6.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"IPv6">>
```

Added in v2.0.0

# schemas

## IPv6

Schema for IPv6 representing an IPv6 network address.
Stored as 16 bytes in network byte order (big-endian).

**Signature**

```ts
export declare const IPv6: Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "IPv6">
```

Added in v2.0.0

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
    Schema.filter<Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "IPv6">
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.filter<Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "IPv6">
>
```

## IPv6 (type alias)

**Signature**

```ts
export type IPv6 = typeof IPv6.Type
```
