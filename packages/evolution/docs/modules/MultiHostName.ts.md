---
title: MultiHostName.ts
nav_order: 54
parent: Modules
---

## MultiHostName overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [MultiHostNameError (class)](#multihostnameerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [MultiHostName (class)](#multihostname-class)
- [schemas](#schemas)
  - [FromBytes](#FromBytes)
  - [FromHex](#FromHex)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [Codec](#codec)

---

# constructors

## make

Create a MultiHostName instance.

**Signature**

```ts
export declare const make: (dnsName: DnsName.DnsName) => MultiHostName
```

Added in v2.0.0

# equality

## equals

Check if two MultiHostName instances are equal.

**Signature**

```ts
export declare const equals: (self: MultiHostName, that: MultiHostName) => boolean
```

Added in v2.0.0

# errors

## MultiHostNameError (class)

Error class for MultiHostName related operations.

**Signature**

```ts
export declare class MultiHostNameError
```

Added in v2.0.0

# generators

## generator

FastCheck generator for MultiHostName instances.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<MultiHostName>
```

Added in v2.0.0

# model

## MultiHostName (class)

Schema for MultiHostName representing a multiple host name record.
multi_host_name = (2, dns_name)

**Signature**

```ts
export declare class MultiHostName
```

Added in v2.0.0

# schemas

## FromBytes

CBOR bytes transformation schema for MultiHostName.

**Signature**

```ts
export declare const FromBytes: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.transformOrFail<
    Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
    Schema.SchemaClass<MultiHostName, MultiHostName, never>,
    never
  >
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for MultiHostName.

**Signature**

```ts
export declare const FromHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
      Schema.SchemaClass<MultiHostName, MultiHostName, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for MultiHostName.
multi_host_name = (2, dns_name)

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
  Schema.SchemaClass<MultiHostName, MultiHostName, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: MultiHostName) => any; cborHex: (input: MultiHostName) => string }
  Decode: { cborBytes: (input: any) => MultiHostName; cborHex: (input: string) => MultiHostName }
  EncodeEffect: {
    cborBytes: (input: MultiHostName) => Effect.Effect<any, InstanceType<typeof MultiHostNameError>>
    cborHex: (input: MultiHostName) => Effect.Effect<string, InstanceType<typeof MultiHostNameError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<MultiHostName, InstanceType<typeof MultiHostNameError>>
    cborHex: (input: string) => Effect.Effect<MultiHostName, InstanceType<typeof MultiHostNameError>>
  }
  EncodeEither: {
    cborBytes: (input: MultiHostName) => Either<any, InstanceType<typeof MultiHostNameError>>
    cborHex: (input: MultiHostName) => Either<string, InstanceType<typeof MultiHostNameError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<MultiHostName, InstanceType<typeof MultiHostNameError>>
    cborHex: (input: string) => Either<MultiHostName, InstanceType<typeof MultiHostNameError>>
  }
}
```
