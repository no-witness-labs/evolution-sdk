---
title: CBOR.ts
nav_order: 30
parent: Modules
---

## CBOR overview

---

<h2 class="text-delta">Table of contents</h2>

- [constants](#constants)
  - [CANONICAL_OPTIONS](#canonical_options)
  - [CBOR_ADDITIONAL_INFO](#cbor_additional_info)
  - [CBOR_MAJOR_TYPE](#cbor_major_type)
  - [CBOR_SIMPLE](#cbor_simple)
  - [CML_DATA_DEFAULT_OPTIONS](#cml_data_default_options)
  - [CML_DEFAULT_OPTIONS](#cml_default_options)
  - [STRUCT_FRIENDLY_OPTIONS](#struct_friendly_options)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [errors](#errors)
  - [CBORError (class)](#cborerror-class)
- [model](#model)
  - [CBOR (type alias)](#cbor-type-alias)
  - [CodecOptions (type alias)](#codecoptions-type-alias)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CBORSchema](#cborschema)
  - [FromBytes](#frombytes)
  - [Integer](#integer)
- [transformation](#transformation)
  - [match](#match)
- [utils](#utils)
  - [ArraySchema](#arrayschema)
  - [ByteArray](#bytearray)
  - [Either (namespace)](#either-namespace)
  - [Float](#float)
  - [FromHex](#fromhex)
  - [MapSchema](#mapschema)
  - [RecordSchema](#recordschema)
  - [Simple](#simple)
  - [Tag](#tag)
  - [Text](#text)
  - [encodeArrayAsDefinite](#encodearrayasdefinite)
  - [encodeArrayAsIndefinite](#encodearrayasindefinite)
  - [encodeTaggedValue](#encodetaggedvalue)
  - [internalDecodeSync](#internaldecodesync)
  - [internalEncodeSync](#internalencodesync)
  - [isArray](#isarray)
  - [isByteArray](#isbytearray)
  - [isInteger](#isinteger)
  - [isMap](#ismap)
  - [isRecord](#isrecord)
  - [isTag](#istag)
  - [map](#map)
  - [tag](#tag-1)

---

# constants

## CANONICAL_OPTIONS

Canonical CBOR encoding options (RFC 8949 Section 4.2.1)

**Signature**

```ts
export declare const CANONICAL_OPTIONS: CodecOptions
```

Added in v1.0.0

## CBOR_ADDITIONAL_INFO

CBOR additional information constants

**Signature**

```ts
export declare const CBOR_ADDITIONAL_INFO: {
  readonly DIRECT: 24
  readonly UINT16: 25
  readonly UINT32: 26
  readonly UINT64: 27
  readonly INDEFINITE: 31
}
```

Added in v1.0.0

## CBOR_MAJOR_TYPE

CBOR major types as constants

**Signature**

```ts
export declare const CBOR_MAJOR_TYPE: {
  readonly UNSIGNED_INTEGER: 0
  readonly NEGATIVE_INTEGER: 1
  readonly BYTE_STRING: 2
  readonly TEXT_STRING: 3
  readonly ARRAY: 4
  readonly MAP: 5
  readonly TAG: 6
  readonly SIMPLE_FLOAT: 7
}
```

Added in v1.0.0

## CBOR_SIMPLE

Simple value constants for CBOR

**Signature**

```ts
export declare const CBOR_SIMPLE: { readonly FALSE: 20; readonly TRUE: 21; readonly NULL: 22; readonly UNDEFINED: 23 }
```

Added in v1.0.0

## CML_DATA_DEFAULT_OPTIONS

Default CBOR encoding option for Data

**Signature**

```ts
export declare const CML_DATA_DEFAULT_OPTIONS: CodecOptions
```

Added in v1.0.0

## CML_DEFAULT_OPTIONS

Default CBOR encoding options

**Signature**

```ts
export declare const CML_DEFAULT_OPTIONS: CodecOptions
```

Added in v1.0.0

## STRUCT_FRIENDLY_OPTIONS

CBOR encoding options that return objects instead of Maps for Schema.Struct compatibility

**Signature**

```ts
export declare const STRUCT_FRIENDLY_OPTIONS: CodecOptions
```

Added in v2.0.0

# encoding

## toCBORBytes

Convert a CBOR value to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (value: CBOR, options?: CodecOptions) => Uint8Array
```

Added in v1.0.0

## toCBORHex

Convert a CBOR value to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (value: CBOR, options?: CodecOptions) => string
```

Added in v1.0.0

# errors

## CBORError (class)

Error class for CBOR value operations

**Signature**

```ts
export declare class CBORError
```

Added in v1.0.0

# model

## CBOR (type alias)

Type representing a CBOR value with simplified, non-tagged structure

**Signature**

```ts
export type CBOR =
  | bigint // integers (both positive and negative)
  | Uint8Array // byte strings
  | string // text strings
  | ReadonlyArray<CBOR> // arrays
  | ReadonlyMap<CBOR, CBOR> // maps
  | { readonly [key: string | number]: CBOR } // record alternative to maps
  | { _tag: "Tag"; tag: number; value: CBOR } // tagged values
  | boolean // boolean values
  | null // null value
  | undefined // undefined value
  | number
```

Added in v1.0.0

## CodecOptions (type alias)

CBOR codec configuration options

**Signature**

```ts
export type CodecOptions =
  | {
      readonly mode: "canonical"
      readonly mapsAsObjects?: boolean
    }
  | {
      readonly mode: "custom"
      readonly useIndefiniteArrays: boolean
      readonly useIndefiniteMaps: boolean
      readonly useDefiniteForEmpty: boolean
      readonly sortMapKeys: boolean
      readonly useMinimalEncoding: boolean
      readonly mapsAsObjects?: boolean
    }
```

Added in v1.0.0

# parsing

## fromCBORBytes

Parse a CBOR value from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CodecOptions) => CBOR
```

Added in v1.0.0

## fromCBORHex

Parse a CBOR value from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CodecOptions) => CBOR
```

Added in v1.0.0

# schemas

## CBORSchema

CBOR Value discriminated union schema representing all possible CBOR data types
Inspired by OCaml and Rust CBOR implementations

**Signature**

```ts
export declare const CBORSchema: Schema.Schema<CBOR, CBOR, never>
```

Added in v1.0.0

## FromBytes

Create a CBOR bytes schema with custom codec options

**Signature**

```ts
export declare const FromBytes: (
  options: CodecOptions
) => Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, Schema.declare<CBOR, CBOR, readonly [], never>, never>
```

Added in v1.0.0

## Integer

CBOR Value schema definitions for each major type

**Signature**

```ts
export declare const Integer: typeof Schema.BigIntFromSelf
```

Added in v1.0.0

# transformation

## match

Pattern matching utility for CBOR values

**Signature**

```ts
export declare const match: <R>(
  value: CBOR,
  patterns: {
    integer: (value: bigint) => R
    bytes: (value: Uint8Array) => R
    text: (value: string) => R
    array: (value: ReadonlyArray<CBOR>) => R
    map: (value: ReadonlyMap<CBOR, CBOR>) => R
    record: (value: { readonly [key: string]: CBOR }) => R
    tag: (tag: number, value: CBOR) => R
    boolean: (value: boolean) => R
    null: () => R
    undefined: () => R
    float: (value: number) => R
  }
) => R
```

Added in v1.0.0

# utils

## ArraySchema

**Signature**

```ts
export declare const ArraySchema: Schema.Array$<Schema.suspend<CBOR, CBOR, never>>
```

## ByteArray

**Signature**

```ts
export declare const ByteArray: typeof Schema.Uint8ArrayFromSelf
```

## Either (namespace)

## Float

**Signature**

```ts
export declare const Float: typeof Schema.Number
```

## FromHex

**Signature**

```ts
export declare const FromHex: (
  options: CodecOptions
) => Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, Schema.declare<CBOR, CBOR, readonly [], never>, never>
>
```

## MapSchema

**Signature**

```ts
export declare const MapSchema: Schema.ReadonlyMapFromSelf<
  Schema.suspend<CBOR, CBOR, never>,
  Schema.suspend<CBOR, CBOR, never>
>
```

## RecordSchema

**Signature**

```ts
export declare const RecordSchema: Schema.Record$<typeof Schema.String, Schema.suspend<CBOR, CBOR, never>>
```

## Simple

**Signature**

```ts
export declare const Simple: Schema.Union<[typeof Schema.Boolean, typeof Schema.Null, typeof Schema.Undefined]>
```

## Tag

**Signature**

```ts
export declare const Tag: Schema.TaggedStruct<
  "Tag",
  { tag: typeof Schema.Number; value: Schema.suspend<CBOR, CBOR, never> }
>
```

## Text

**Signature**

```ts
export declare const Text: typeof Schema.String
```

## encodeArrayAsDefinite

Encode a CBOR definite-length array from already-encoded item bytes.
This is a low-level function that constructs: definite_array_header + items.

**Signature**

```ts
export declare const encodeArrayAsDefinite: (items: ReadonlyArray<Uint8Array>) => Uint8Array
```

## encodeArrayAsIndefinite

Encode a CBOR indefinite-length array from already-encoded item bytes.
This is a low-level function that constructs: 0x9f + items + 0xff.

**Signature**

```ts
export declare const encodeArrayAsIndefinite: (items: ReadonlyArray<Uint8Array>) => Uint8Array
```

## encodeTaggedValue

Encode a CBOR tagged value from already-encoded value bytes.
This is a low-level function that constructs: tag_header + value_bytes.

**Signature**

```ts
export declare const encodeTaggedValue: (tag: number, valueBytes: Uint8Array) => Uint8Array
```

## internalDecodeSync

**Signature**

```ts
export declare const internalDecodeSync: (data: Uint8Array, options?: CodecOptions) => CBOR
```

## internalEncodeSync

**Signature**

```ts
export declare const internalEncodeSync: (value: CBOR, options?: CodecOptions) => Uint8Array
```

## isArray

**Signature**

```ts
export declare const isArray: (u: unknown, overrideOptions?: ParseOptions | number) => u is readonly CBOR[]
```

## isByteArray

**Signature**

```ts
export declare const isByteArray: (u: unknown, overrideOptions?: ParseOptions | number) => u is any
```

## isInteger

**Signature**

```ts
export declare const isInteger: (u: unknown, overrideOptions?: ParseOptions | number) => u is bigint
```

## isMap

**Signature**

```ts
export declare const isMap: (u: unknown, overrideOptions?: ParseOptions | number) => u is ReadonlyMap<CBOR, CBOR>
```

## isRecord

**Signature**

```ts
export declare const isRecord: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is { readonly [x: string]: CBOR }
```

## isTag

**Signature**

```ts
export declare const isTag: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is { readonly _tag: "Tag"; readonly tag: number; readonly value: CBOR }
```

## map

**Signature**

```ts
export declare const map: <K extends CBOR, V extends CBOR>(
  key: Schema.Schema<K>,
  value: Schema.Schema<V>
) => Schema.ReadonlyMapFromSelf<Schema.Schema<K, K, never>, Schema.Schema<V, V, never>>
```

## tag

**Signature**

```ts
export declare const tag: <T extends number, C extends Schema.Schema<any, any>>(
  tag: T,
  value: C
) => Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[T]>; value: C }>
```
