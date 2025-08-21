---
title: NativeScripts.ts
nav_order: 67
parent: Modules
---

## NativeScripts overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [decoding](#decoding)
  - [internalDecodeCDDL](#internaldecodecddl)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [internalEncodeCDDL](#internalencodecddl)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [errors](#errors)
  - [NativeError (class)](#nativeerror-class)
- [model](#model)
  - [Native (type alias)](#native-type-alias)
  - [NativeCDDL (type alias)](#nativecddl-type-alias)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [NativeSchema](#nativeschema)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [Native](#native)
  - [arbitrary](#arbitrary)

---

# constructors

## make

Smart constructor for Native that validates and applies branding.

**Signature**

```ts
export declare const make: (native: Native) => Native
```

Added in v2.0.0

# decoding

## internalDecodeCDDL

Convert a CDDL representation back to a Native.

This function recursively decodes nested CBOR scripts and constructs
the appropriate Native instances.

**Signature**

```ts
export declare const internalDecodeCDDL: (cborTuple: NativeCDDL) => E.Either<Native, ParseIssue>
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## internalEncodeCDDL

Convert a Native to its CDDL representation.

**Signature**

```ts
export declare const internalEncodeCDDL: (native: Native) => E.Either<NativeCDDL, ParseIssue>
```

Added in v2.0.0

## toCBORBytes

Encode Native to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: Native, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode Native to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: Native, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# errors

## NativeError (class)

Error class for Native script related operations.

**Signature**

```ts
export declare class NativeError
```

Added in v2.0.0

# model

## Native (type alias)

Type representing a native script following cardano-cli JSON syntax.

**Signature**

```ts
export type Native =
  | {
      type: "sig"
      keyHash: string
    }
  | {
      type: "before"
      slot: number
    }
  | {
      type: "after"
      slot: number
    }
  | {
      type: "all"
      scripts: ReadonlyArray<Native>
    }
  | {
      type: "any"
      scripts: ReadonlyArray<Native>
    }
  | {
      type: "atLeast"
      required: number
      scripts: ReadonlyArray<Native>
    }
```

Added in v2.0.0

## NativeCDDL (type alias)

CDDL representation of a native script as a union of tuple types.

This type represents the low-level CBOR structure of native scripts,
where each variant is encoded as a tagged tuple.

**Signature**

```ts
export type NativeCDDL =
  | readonly [0n, Uint8Array]
  | readonly [1n, ReadonlyArray<NativeCDDL>]
  | readonly [2n, ReadonlyArray<NativeCDDL>]
  | readonly [3n, bigint, ReadonlyArray<NativeCDDL>]
  | readonly [4n, bigint]
  | readonly [5n, bigint]
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse Native from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => Native
```

Added in v2.0.0

## fromCBORHex

Parse Native from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => Native
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for Native.
Transforms between CBOR bytes and Native using CBOR encoding.

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
    Schema.Union<
      [
        Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Tuple2<Schema.Literal<[1n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
        Schema.Tuple2<Schema.Literal<[2n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
        Schema.Tuple<
          [
            Schema.Literal<[3n]>,
            typeof Schema.BigIntFromSelf,
            Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>
          ]
        >,
        Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
        Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
      ]
    >,
    Schema.SchemaClass<Native, Native, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for Native.
Transforms between CBOR hex string and Native using CBOR encoding.

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
    Schema.transformOrFail<
      Schema.Union<
        [
          Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple2<Schema.Literal<[1n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
          Schema.Tuple2<Schema.Literal<[2n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
          Schema.Tuple<
            [
              Schema.Literal<[3n]>,
              typeof Schema.BigIntFromSelf,
              Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>
            ]
          >,
          Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
          Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
        ]
      >,
      Schema.SchemaClass<Native, Native, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

Schema for NativeCDDL union type.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<Schema.Literal<[1n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
      Schema.Tuple2<Schema.Literal<[2n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
      Schema.Tuple<
        [
          Schema.Literal<[3n]>,
          typeof Schema.BigIntFromSelf,
          Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>
        ]
      >,
      Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
      Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
    ]
  >,
  Schema.SchemaClass<Native, Native, never>,
  never
>
```

Added in v2.0.0

## NativeSchema

Represents a cardano-cli JSON script syntax

Native type follows the standard described in the
link https://github.com/IntersectMBO/cardano-node/blob/1.26.1-with-cardano-cli/doc/reference/simple-scripts.md#json-script-syntax JSON script syntax documentation.

**Signature**

```ts
export declare const NativeSchema: Schema.Schema<Native, Native, never>
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Union<
  [
    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.Tuple2<Schema.Literal<[1n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
    Schema.Tuple2<Schema.Literal<[2n]>, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>>,
    Schema.Tuple<
      [Schema.Literal<[3n]>, typeof Schema.BigIntFromSelf, Schema.Array$<Schema.suspend<NativeCDDL, NativeCDDL, never>>]
    >,
    Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
    Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
  ]
>
```

## Native

**Signature**

```ts
export declare const Native: Schema.Schema<Native, Native, never>
```

## arbitrary

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Native>
```
