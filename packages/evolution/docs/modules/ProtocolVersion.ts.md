---
title: ProtocolVersion.ts
nav_order: 73
parent: Modules
---

## ProtocolVersion overview

---

<h2 class="text-delta">Table of contents</h2>

- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ProtocolVersionError (class)](#protocolversionerror-class)
- [model](#model)
  - [ProtocolVersion (class)](#protocolversion-class)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes)
  - [FromCBORHex](#fromcborhex)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [Codec](#codec)

---

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
  Schema.transformOrFail<
    Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
    Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>,
    never
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
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
      Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>,
      never
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
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>,
  Schema.SchemaClass<ProtocolVersion, ProtocolVersion, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { bytes: (input: ProtocolVersion) => any; variableBytes: (input: ProtocolVersion) => string }
  Decode: { bytes: (input: any) => ProtocolVersion; variableBytes: (input: string) => ProtocolVersion }
  EncodeEffect: {
    bytes: (input: ProtocolVersion) => Effect.Effect<any, InstanceType<typeof ProtocolVersionError>>
    variableBytes: (input: ProtocolVersion) => Effect.Effect<string, InstanceType<typeof ProtocolVersionError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect.Effect<ProtocolVersion, InstanceType<typeof ProtocolVersionError>>
    variableBytes: (input: string) => Effect.Effect<ProtocolVersion, InstanceType<typeof ProtocolVersionError>>
  }
  EncodeEither: {
    bytes: (input: ProtocolVersion) => Either<any, InstanceType<typeof ProtocolVersionError>>
    variableBytes: (input: ProtocolVersion) => Either<string, InstanceType<typeof ProtocolVersionError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<ProtocolVersion, InstanceType<typeof ProtocolVersionError>>
    variableBytes: (input: string) => Either<ProtocolVersion, InstanceType<typeof ProtocolVersionError>>
  }
}
```
