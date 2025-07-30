---
title: Header.ts
nav_order: 45
parent: Modules
---

## Header overview

Header module based on Conway CDDL specification

CDDL: header = [header_body, body_signature : kes_signature]

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [HeaderError (class)](#headererror-class)
- [model](#model)
  - [Header (class)](#header-class)
- [predicates](#predicates)
  - [isHeader](#isheader)
- [schemas](#schemas)
  - [FromBytes](#FromBytes)
  - [FromHex](#FromHex)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [Codec](#codec)

---

# equality

## equals

Check if two Header instances are equal.

**Signature**

```ts
export declare const equals: (a: Header, b: Header) => boolean
```

Added in v2.0.0

# errors

## HeaderError (class)

Error class for Header operations

**Signature**

```ts
export declare class HeaderError
```

Added in v2.0.0

# model

## Header (class)

Header implementation using HeaderBody and KesSignature

CDDL: header = [header_body, body_signature : kes_signature]

**Signature**

```ts
export declare class Header
```

Added in v2.0.0

# predicates

## isHeader

Predicate to check if a value is a Header instance.

**Signature**

```ts
export declare const isHeader: (value: unknown) => value is Header
```

Added in v2.0.0

# schemas

## FromBytes

CBOR bytes transformation schema for Header.

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
    Schema.Tuple2<
      Schema.SchemaClass<
        readonly [
          bigint,
          bigint,
          any,
          any,
          any,
          readonly [any, any],
          bigint,
          any,
          readonly [any, bigint, bigint, any],
          readonly [bigint, bigint]
        ],
        readonly [
          bigint,
          bigint,
          any,
          any,
          any,
          readonly [any, any],
          bigint,
          any,
          readonly [any, bigint, bigint, any],
          readonly [bigint, bigint]
        ],
        never
      >,
      typeof Schema.Uint8ArrayFromSelf
    >,
    Schema.SchemaClass<Header, Header, never>,
    never
  >
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for Header.

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
      Schema.Tuple2<
        Schema.SchemaClass<
          readonly [
            bigint,
            bigint,
            any,
            any,
            any,
            readonly [any, any],
            bigint,
            any,
            readonly [any, bigint, bigint, any],
            readonly [bigint, bigint]
          ],
          readonly [
            bigint,
            bigint,
            any,
            any,
            any,
            readonly [any, any],
            bigint,
            any,
            readonly [any, bigint, bigint, any],
            readonly [bigint, bigint]
          ],
          never
        >,
        typeof Schema.Uint8ArrayFromSelf
      >,
      Schema.SchemaClass<Header, Header, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for Header.
header = [header_body, body_signature : kes_signature]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<
    Schema.SchemaClass<
      readonly [
        bigint,
        bigint,
        any,
        any,
        any,
        readonly [any, any],
        bigint,
        any,
        readonly [any, bigint, bigint, any],
        readonly [bigint, bigint]
      ],
      readonly [
        bigint,
        bigint,
        any,
        any,
        any,
        readonly [any, any],
        bigint,
        any,
        readonly [any, bigint, bigint, any],
        readonly [bigint, bigint]
      ],
      never
    >,
    typeof Schema.Uint8ArrayFromSelf
  >,
  Schema.SchemaClass<Header, Header, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: Header) => any; cborHex: (input: Header) => string }
  Decode: { cborBytes: (input: any) => Header; cborHex: (input: string) => Header }
  EncodeEffect: {
    cborBytes: (input: Header) => Effect.Effect<any, InstanceType<typeof HeaderError>>
    cborHex: (input: Header) => Effect.Effect<string, InstanceType<typeof HeaderError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<Header, InstanceType<typeof HeaderError>>
    cborHex: (input: string) => Effect.Effect<Header, InstanceType<typeof HeaderError>>
  }
  EncodeEither: {
    cborBytes: (input: Header) => Either<any, InstanceType<typeof HeaderError>>
    cborHex: (input: Header) => Either<string, InstanceType<typeof HeaderError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<Header, InstanceType<typeof HeaderError>>
    cborHex: (input: string) => Either<Header, InstanceType<typeof HeaderError>>
  }
}
```
