---
title: PoolMetadata.ts
nav_order: 80
parent: Modules
---

## PoolMetadata overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [conversion](#conversion)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PoolMetadataError (class)](#poolmetadataerror-class)
- [model](#model)
  - [PoolMetadata (class)](#poolmetadata-class)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)

---

# constructors

## make

Smart constructor for creating PoolMetadata instances

**Signature**

```ts
export declare const make: (props: { url: Url.Url; hash: Uint8Array }) => PoolMetadata
```

Added in v2.0.0

# conversion

## fromCBORBytes

Convert CBOR bytes to PoolMetadata (unsafe)

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => PoolMetadata
```

Added in v2.0.0

## fromCBORHex

Convert CBOR hex string to PoolMetadata (unsafe)

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => PoolMetadata
```

Added in v2.0.0

## toCBORBytes

Convert PoolMetadata to CBOR bytes (unsafe)

**Signature**

```ts
export declare const toCBORBytes: (input: PoolMetadata, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert PoolMetadata to CBOR hex string (unsafe)

**Signature**

```ts
export declare const toCBORHex: (input: PoolMetadata, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# effect

## Either (namespace)

Effect namespace for PoolMetadata operations that can fail

Added in v2.0.0

# equality

## equals

Check if two PoolMetadata instances are equal.

**Signature**

```ts
export declare const equals: (a: PoolMetadata, b: PoolMetadata) => boolean
```

Added in v2.0.0

# errors

## PoolMetadataError (class)

Error class for PoolMetadata related operations.

**Signature**

```ts
export declare class PoolMetadataError
```

Added in v2.0.0

# model

## PoolMetadata (class)

Schema for PoolMetadata representing pool metadata information.
pool_metadata = [url, bytes]

**Signature**

```ts
export declare class PoolMetadata
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for PoolMetadata.
Transforms between Uint8Array and PoolMetadata using CBOR encoding.

**Signature**

```ts
export declare const FromCBORBytes: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.transform<
    Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
    Schema.SchemaClass<PoolMetadata, PoolMetadata, never>
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for PoolMetadata.
Transforms between hex string and PoolMetadata using CBOR encoding.

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transform<
      Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
      Schema.SchemaClass<PoolMetadata, PoolMetadata, never>
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for PoolMetadata as defined in the specification:
pool_metadata = [url, bytes]

Transforms between CBOR tuple structure and PoolMetadata model.

**Signature**

```ts
export declare const FromCDDL: Schema.transform<
  Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
  Schema.SchemaClass<PoolMetadata, PoolMetadata, never>
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for generating random PoolMetadata instances

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<PoolMetadata>
```

Added in v2.0.0
