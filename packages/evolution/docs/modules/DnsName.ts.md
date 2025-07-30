---
title: DnsName.ts
nav_order: 37
parent: Modules
---

## DnsName overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [DnsNameError (class)](#dnsnameerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [DnsName](#dnsname)
  - [DnsName (type alias)](#dnsname-type-alias)
- [utils](#utils)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)

---

# constructors

## make

Create a DnsName from a string.

**Signature**

```ts
export declare const make: (a: string, options?: Schema.MakeOptions) => string & Brand<"DnsName">
```

Added in v2.0.0

# encoding/decoding

## Codec

Codec utilities for DnsName encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string & Brand<"DnsName">) => any; hex: (input: string & Brand<"DnsName">) => string }
  Decode: { bytes: (input: any) => string & Brand<"DnsName">; hex: (input: string) => string & Brand<"DnsName"> }
  EncodeEffect: {
    bytes: (input: string & Brand<"DnsName">) => Effect<any, InstanceType<typeof DnsNameError>>
    hex: (input: string & Brand<"DnsName">) => Effect<string, InstanceType<typeof DnsNameError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"DnsName">, InstanceType<typeof DnsNameError>>
    hex: (input: string) => Effect<string & Brand<"DnsName">, InstanceType<typeof DnsNameError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"DnsName">) => Either<any, InstanceType<typeof DnsNameError>>
    hex: (input: string & Brand<"DnsName">) => Either<string, InstanceType<typeof DnsNameError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"DnsName">, InstanceType<typeof DnsNameError>>
    hex: (input: string) => Either<string & Brand<"DnsName">, InstanceType<typeof DnsNameError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two DnsName instances are equal.

**Signature**

```ts
export declare const equals: (a: DnsName, b: DnsName) => boolean
```

Added in v2.0.0

# errors

## DnsNameError (class)

Error class for DnsName related operations.

**Signature**

```ts
export declare class DnsNameError
```

Added in v2.0.0

# generators

## generator

Generate a random DnsName.

**Signature**

```ts
export declare const generator: Arbitrary<string & Brand<"DnsName">>
```

Added in v2.0.0

# model

## DnsName

Schema for DnsName with DNS-specific validation.
dns_name = text .size (0 .. 128)

**Signature**

```ts
export declare const DnsName: Schema.brand<
  Schema.refine<
    string,
    Schema.transform<
      Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
    >
  >,
  "DnsName"
>
```

Added in v2.0.0

## DnsName (type alias)

Type alias for DnsName.

**Signature**

```ts
export type DnsName = typeof DnsName.Type
```

Added in v2.0.0

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.filter<Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>>,
  Schema.brand<
    Schema.refine<
      string,
      Schema.transform<
        Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
      >
    >,
    "DnsName"
  >
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<
    string,
    Schema.transform<
      Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
    >
  >,
  Schema.brand<
    Schema.refine<
      string,
      Schema.transform<
        Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
      >
    >,
    "DnsName"
  >
>
```
