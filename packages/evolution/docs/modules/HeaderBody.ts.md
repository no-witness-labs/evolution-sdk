---
title: HeaderBody.ts
nav_order: 46
parent: Modules
---

## HeaderBody overview

---

<h2 class="text-delta">Table of contents</h2>

- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [HeaderBodyError (class)](#headerbodyerror-class)
- [model](#model)
  - [HeaderBody (class)](#headerbody-class)
- [predicates](#predicates)
  - [isHeaderBody](#isheaderbody)
- [schemas](#schemas)
  - [FromBytes](#FromBytes)
  - [FromHex](#FromHex)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [Codec](#codec)

---

# equality

## equals

Check if two HeaderBody instances are equal.

**Signature**

```ts
export declare const equals: (a: HeaderBody, b: HeaderBody) => boolean
```

Added in v2.0.0

# errors

## HeaderBodyError (class)

Error class for HeaderBody related operations.

**Signature**

```ts
export declare class HeaderBodyError
```

Added in v2.0.0

# model

## HeaderBody (class)

Schema for HeaderBody representing a block header body.
header_body = [
block_number : uint64,
slot : uint64,
prev_hash : block_header_hash / null,
issuer_vkey : vkey,
vrf_vkey : vrf_vkey,
vrf_result : vrf_cert,
block_body_size : uint32,
block_body_hash : block_body_hash,
operational_cert : operational_cert,
protocol_version : protocol_version
]

**Signature**

```ts
export declare class HeaderBody
```

Added in v2.0.0

# predicates

## isHeaderBody

Check if the given value is a valid HeaderBody.

**Signature**

```ts
export declare const isHeaderBody: (u: unknown, overrideOptions?: ParseOptions | number) => u is HeaderBody
```

Added in v2.0.0

# schemas

## FromBytes

CBOR bytes transformation schema for HeaderBody.

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
    Schema.Tuple<
      [
        typeof Schema.BigIntFromSelf,
        typeof Schema.BigIntFromSelf,
        Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.SchemaClass<readonly [any, any], readonly [any, any], never>,
        typeof Schema.BigIntFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.SchemaClass<readonly [any, bigint, bigint, any], readonly [any, bigint, bigint, any], never>,
        Schema.SchemaClass<readonly [bigint, bigint], readonly [bigint, bigint], never>
      ]
    >,
    Schema.SchemaClass<HeaderBody, HeaderBody, never>,
    never
  >
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for HeaderBody.

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
      Schema.Tuple<
        [
          typeof Schema.BigIntFromSelf,
          typeof Schema.BigIntFromSelf,
          Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.SchemaClass<readonly [any, any], readonly [any, any], never>,
          typeof Schema.BigIntFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.SchemaClass<readonly [any, bigint, bigint, any], readonly [any, bigint, bigint, any], never>,
          Schema.SchemaClass<readonly [bigint, bigint], readonly [bigint, bigint], never>
        ]
      >,
      Schema.SchemaClass<HeaderBody, HeaderBody, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for HeaderBody.
header_body = [
block_number : uint64,
slot : uint64,
prev_hash : block_header_hash / null,
issuer_vkey : vkey,
vrf_vkey : vrf_vkey,
vrf_result : vrf_cert,
block_body_size : uint32,
block_body_hash : block_body_hash,
operational_cert : operational_cert,
protocol_version : protocol_version
]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.BigIntFromSelf,
      typeof Schema.BigIntFromSelf,
      Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.SchemaClass<readonly [any, any], readonly [any, any], never>,
      typeof Schema.BigIntFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.SchemaClass<readonly [any, bigint, bigint, any], readonly [any, bigint, bigint, any], never>,
      Schema.SchemaClass<readonly [bigint, bigint], readonly [bigint, bigint], never>
    ]
  >,
  Schema.SchemaClass<HeaderBody, HeaderBody, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: HeaderBody) => any; cborHex: (input: HeaderBody) => string }
  Decode: { cborBytes: (input: any) => HeaderBody; cborHex: (input: string) => HeaderBody }
  EncodeEffect: {
    cborBytes: (input: HeaderBody) => Effect.Effect<any, InstanceType<typeof HeaderBodyError>>
    cborHex: (input: HeaderBody) => Effect.Effect<string, InstanceType<typeof HeaderBodyError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<HeaderBody, InstanceType<typeof HeaderBodyError>>
    cborHex: (input: string) => Effect.Effect<HeaderBody, InstanceType<typeof HeaderBodyError>>
  }
  EncodeEither: {
    cborBytes: (input: HeaderBody) => Either<any, InstanceType<typeof HeaderBodyError>>
    cborHex: (input: HeaderBody) => Either<string, InstanceType<typeof HeaderBodyError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<HeaderBody, InstanceType<typeof HeaderBodyError>>
    cborHex: (input: string) => Either<HeaderBody, InstanceType<typeof HeaderBodyError>>
  }
}
```
