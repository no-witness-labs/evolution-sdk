---
title: ProtocolVersion.ts
nav_order: 92
parent: Modules
---

## ProtocolVersion overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [conversion](#conversion)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ProtocolVersionError (class)](#protocolversionerror-class)
- [model](#model)
  - [ProtocolVersion (class)](#protocolversion-class)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# constructors

## make

Smart constructor for creating ProtocolVersion instances

**Signature**

```ts
export declare const make: (
  props: { readonly major: bigint; readonly minor: bigint },
  options?: Schema.MakeOptions | undefined
) => ProtocolVersion
```

Added in v2.0.0

# conversion

## fromCBORBytes

Convert CBOR bytes to ProtocolVersion (unsafe)

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => ProtocolVersion
```

Added in v2.0.0

## fromCBORHex

Convert CBOR hex string to ProtocolVersion (unsafe)

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => ProtocolVersion
```

Added in v2.0.0

## toCBORBytes

Convert ProtocolVersion to CBOR bytes (unsafe)

**Signature**

```ts
export declare const toCBORBytes: (input: ProtocolVersion, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert ProtocolVersion to CBOR hex string (unsafe)

**Signature**

```ts
export declare const toCBORHex: (input: ProtocolVersion, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# either

## Either (namespace)

Either namespace for ProtocolVersion operations that can fail

Added in v2.0.0

# equality

## equals

Check if two ProtocolVersion instances are equal.

**Signature**

```ts
export declare const equals: (a: ProtocolVersion, b: ProtocolVersion) => boolean
```

Added in v2.0.0

# errors

## ProtocolVersionError (class)

Error class for ProtocolVersion related operations.

**Signature**

```ts
export declare class ProtocolVersionError
```

Added in v2.0.0

# model

## ProtocolVersion (class)

ProtocolVersion class based on Conway CDDL specification

CDDL: protocol_version = [major_version : uint32, minor_version : uint32]

**Signature**

```ts
export declare class ProtocolVersion
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for ProtocolVersion.

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
    Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
    Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for ProtocolVersion.

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
      Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
      Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for ProtocolVersion.
protocol_version = [major_version : uint32, minor_version : uint32]

**Signature**

```ts
export declare const FromCDDL: Schema.transform<
  Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
  Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for generating random ProtocolVersion instances

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ProtocolVersion>
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
```
