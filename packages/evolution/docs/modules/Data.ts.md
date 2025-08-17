---
title: Data.ts
nav_order: 37
parent: Modules
---

## Data overview

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [Codec](#codec)
  - [withSchema](#withschema)
- [constants](#constants)
  - [DEFAULT_CBOR_OPTIONS](#default_cbor_options)
- [constructors](#constructors)
  - [bytearray](#bytearray)
  - [constr](#constr)
  - [int](#int)
  - [list](#list)
  - [map](#map)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [errors](#errors)
  - [DataError (class)](#dataerror-class)
- [generators](#generators)
  - [arbitrary](#arbitrary)
  - [arbitraryConstr](#arbitraryconstr)
  - [arbitraryPlutusBigInt](#arbitraryplutusbigint)
  - [arbitraryPlutusBytes](#arbitraryplutusbytes)
  - [arbitraryPlutusData](#arbitraryplutusdata)
  - [arbitraryPlutusList](#arbitraryplutuslist)
  - [arbitraryPlutusMap](#arbitraryplutusmap)
- [model](#model)
  - [Data (type alias)](#data-type-alias)
  - [List (type alias)](#list-type-alias)
  - [Map (type alias)](#map-type-alias)
- [predicates](#predicates)
  - [isBytes](#isbytes)
  - [isConstr](#isconstr)
  - [isInt](#isint)
  - [isList](#islist)
  - [isMap](#ismap)
- [schemas](#schemas)
  - [ByteArray](#bytearray-1)
  - [Constr (class)](#constr-class)
  - [DataSchema](#dataschema)
  - [FromCBORBytes](#fromcborbytes)
  - [FromCBORHex](#fromcborhex)
  - [FromCDDL](#fromcddl)
  - [IntSchema](#intschema)
  - [ListSchema](#listschema)
  - [MapSchema](#mapschema)
- [transformation](#transformation)
  - [cborValueToPlutusData](#cborvaluetoplutusdata)
  - [fromCBORBytes](#fromcborbytes-1)
  - [fromCBORHex](#fromcborhex-1)
  - [fromData](#fromdata)
  - [plutusDataToCBORValue](#plutusdatatocborvalue)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
  - [toData](#todata)
- [utilities](#utilities)
  - [matchConstr](#matchconstr)
  - [matchData](#matchdata)
- [utils](#utils)
  - [ByteArray (type alias)](#bytearray-type-alias)
  - [CDDLSchema](#cddlschema)
  - [Int (type alias)](#int-type-alias)

---

# combinators

## Codec

Create a codec for a schema that transforms from a custom type to Data and provides CBOR encoding
This is an alias for withSchema for backward compatibility

**Signature**

```ts
export declare const Codec: <A, I extends Data>(config: {
  schema: Schema.Schema<A, I>
  options?: CBOR.CodecOptions
}) => {
  toData: (value: A) => Data
  fromData: (data: Data) => A
  toCBORHex: (value: A) => string
  toCBORBytes: (value: A) => Uint8Array
  fromCBORHex: (hex: string) => A
  fromCBORBytes: (bytes: Uint8Array) => A
}
```

Added in v2.0.0

## withSchema

Create a schema that transforms from a custom type to Data and provides CBOR encoding

**Signature**

```ts
export declare const withSchema: <A, I extends Data>(
  schema: Schema.Schema<A, I>,
  options?: CBOR.CodecOptions
) => {
  toData: (value: A) => Data
  fromData: (data: Data) => A
  toCBORHex: (value: A) => string
  toCBORBytes: (value: A) => Uint8Array
  fromCBORHex: (hex: string) => A
  fromCBORBytes: (bytes: Uint8Array) => A
}
```

Added in v2.0.0

# constants

## DEFAULT_CBOR_OPTIONS

Default CBOR options for Data encoding/decoding

**Signature**

```ts
export declare const DEFAULT_CBOR_OPTIONS: CBOR.CodecOptions
```

Added in v2.0.0

# constructors

## bytearray

Creates Plutus bounded bytes from hex string

**Signature**

```ts
export declare const bytearray: (bytes: string) => ByteArray
```

Added in v2.0.0

## constr

Creates a constructor with the specified index and data

**Signature**

```ts
export declare const constr: (index: bigint, fields: Array<Data>) => Constr
```

Added in v2.0.0

## int

Creates Plutus big integer

**Signature**

```ts
export declare const int: (integer: bigint) => Int
```

Added in v2.0.0

## list

Creates a Plutus list from items

**Signature**

```ts
export declare const list: (list: Array<Data>) => List
```

Added in v2.0.0

## map

Creates a Plutus map from key-value pairs

**Signature**

```ts
export declare const map: (entries: Array<[key: Data, value: Data]>) => globalThis.Map<Data, Data>
```

Added in v2.0.0

# either

## Either (namespace)

Either-based variants for functions that can fail.

Added in v2.0.0

# errors

## DataError (class)

Error class for Data related operations.

**Signature**

```ts
export declare class DataError
```

Added in v2.0.0

# generators

## arbitrary

FastCheck arbitrary for PlutusData types

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Data>
```

Added in v2.0.0

## arbitraryConstr

Creates an arbitrary that generates Constr values

**Signature**

```ts
export declare const arbitraryConstr: (depth: number) => FastCheck.Arbitrary<Constr>
```

Added in v2.0.0

## arbitraryPlutusBigInt

Creates an arbitrary that generates PlutusBigInt values

**Signature**

```ts
export declare const arbitraryPlutusBigInt: () => FastCheck.Arbitrary<Int>
```

Added in v2.0.0

## arbitraryPlutusBytes

Creates an arbitrary that generates PlutusBytes values

**Signature**

```ts
export declare const arbitraryPlutusBytes: () => FastCheck.Arbitrary<ByteArray>
```

Added in v2.0.0

## arbitraryPlutusData

Creates an arbitrary that generates PlutusData values with controlled depth

**Signature**

```ts
export declare const arbitraryPlutusData: (depth?: number) => FastCheck.Arbitrary<Data>
```

Added in v2.0.0

## arbitraryPlutusList

Creates an arbitrary that generates PlutusList values

**Signature**

```ts
export declare const arbitraryPlutusList: (depth: number) => FastCheck.Arbitrary<List>
```

Added in v2.0.0

## arbitraryPlutusMap

Creates an arbitrary that generates PlutusMap values with unique keys
Following a similar distribution pattern:

- 60% PlutusBigInt keys
- 30% PlutusBytes keys
- 10% Complex keys

**Signature**

```ts
export declare const arbitraryPlutusMap: (depth: number) => FastCheck.Arbitrary<Map>
```

Added in v2.0.0

# model

## Data (type alias)

PlutusData type definition based on Conway CDDL specification

```
CDDL: plutus_data =
  constr<plutus_data>
  / {* plutus_data => plutus_data}
  / [* plutus_data]
  / big_int
  / bounded_bytes

constr<a0> =
  #6.121([* a0])
  / #6.122([* a0])
  / #6.123([* a0])
  / #6.124([* a0])
  / #6.125([* a0])
  / #6.126([* a0])
  / #6.127([* a0])
  / #6.102([uint, [* a0]])
```

Constructor Index Limits:

- Tags 121-127: Direct encoding for constructor indices 0-6
- Tag 102: General constructor encoding for any uint value
- Maximum constructor index: 2^64 - 1 (18,446,744,073,709,551,615)
  as per CBOR RFC 8949 specification for unsigned integers

**Signature**

```ts
export type Data = Constr | Map | List | Int | ByteArray
```

Added in v2.0.0

## List (type alias)

PlutusList type for plutus data lists

**Signature**

```ts
export type List = ReadonlyArray<Data>
```

Added in v2.0.0

## Map (type alias)

Constr type for constructor alternatives based on Conway CDDL specification

```
CDDL: constr<a0> =
  #6.121([* a0])    // index 0
  / #6.122([* a0])  // index 1
  / #6.123([* a0])  // index 2
  / #6.124([* a0])  // index 3
  / #6.125([* a0])  // index 4
  / #6.126([* a0])  // index 5
  / #6.127([* a0])  // index 6
  / #6.102([uint, [* a0]])  // general constructor with custom index
```

Constructor Index Range:

- Minimum: 0
- Maximum: 2^64 - 1 (18,446,744,073,709,551,615)
  as per CBOR RFC 8949 specification for unsigned integers

**Signature**

```ts
export type Map = globalThis.Map<Data, Data>
```

Added in v2.0.0

# predicates

## isBytes

Type guard to check if a value is a PlutusBytes

**Signature**

```ts
export declare const isBytes: (u: unknown, overrideOptions?: ParseOptions | number) => u is string
```

Added in v2.0.0

## isConstr

Type guard to check if a value is a Constr

**Signature**

```ts
export declare const isConstr: (data: unknown) => data is Constr
```

Added in v2.0.0

## isInt

Type guard to check if a value is a PlutusBigInt

**Signature**

```ts
export declare const isInt: (u: unknown, overrideOptions?: ParseOptions | number) => u is bigint
```

Added in v2.0.0

## isList

Type guard to check if a value is a PlutusList

**Signature**

```ts
export declare const isList: (u: unknown, overrideOptions?: ParseOptions | number) => u is readonly Data[]
```

Added in v2.0.0

## isMap

Type guard to check if a value is a PlutusMap

**Signature**

```ts
export declare const isMap: (u: unknown, overrideOptions?: ParseOptions | number) => u is globalThis.Map<Data, Data>
```

Added in v2.0.0

# schemas

## ByteArray

Schema for PlutusBytes data type

**Signature**

```ts
export declare const ByteArray: Schema.refine<string, typeof Schema.String>
```

Added in v2.0.0

## Constr (class)

Schema for Constr data type

**Signature**

```ts
export declare class Constr
```

Added in v2.0.0

## DataSchema

Combined schema for PlutusData type

**Signature**

```ts
export declare const DataSchema: Schema.Schema<Data, Data, never>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for PlutusData using CDDL.
Transforms between CBOR bytes and Data using CDDL encoding.

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
  Schema.transformOrFail<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>, Schema.Schema<Data, Data, never>, never>
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for PlutusData using CDDL.
Transforms between CBOR hex string and Data using CDDL encoding.

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
    Schema.transformOrFail<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>, Schema.Schema<Data, Data, never>, never>
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for PlutusData following the Conway specification.

```
plutus_data =
  constr<plutus_data>
  / {* plutus_data => plutus_data}
  / [* plutus_data]
  / big_int
  / bounded_bytes

constr<a0> =
  #6.121([* a0])    // index 0
  / #6.122([* a0])  // index 1
  / #6.123([* a0])  // index 2
  / #6.124([* a0])  // index 3
  / #6.125([* a0])  // index 4
  / #6.126([* a0])  // index 5
  / #6.127([* a0])  // index 6
  / #6.102([uint, [* a0]])  // general constructor

big_int = int / big_uint / big_nint
big_uint = #6.2(bounded_bytes)
big_nint = #6.3(bounded_bytes)
```

This transforms between CBOR values and PlutusData using the existing
plutusDataToCBORValue and cborValueToPlutusData functions.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
  Schema.Schema<Data, Data, never>,
  never
>
```

Added in v2.0.0

## IntSchema

Schema for PlutusBigInt data type

Matches the CDDL specification for big_int:

```
big_int = int / big_uint / big_nint
big_uint = #6.2(bounded_bytes)
big_nint = #6.3(bounded_bytes)
```

Where:

- `int` covers integers that fit in CBOR major types 0 and 1 (0 to 2^64-1 for positive, -(2^64-1) to -1 for negative)
- `big_uint` (tag 2) covers positive integers larger than 2^64-1
- `big_nint` (tag 3) covers negative integers smaller than -(2^64-1)

Note: JavaScript's Number.MAX_SAFE_INTEGER (2^53-1) is much smaller than CBOR's 64-bit limit.

**Signature**

```ts
export declare const IntSchema: Schema.SchemaClass<bigint, bigint, never>
```

Added in v2.0.0

## ListSchema

Schema for PlutusList data type

**Signature**

```ts
export declare const ListSchema: Schema.Array$<Schema.suspend<Data, Data, never>>
```

Added in v2.0.0

## MapSchema

Schema for PlutusMap data type

**Signature**

```ts
export declare const MapSchema: Schema.MapFromSelf<Schema.suspend<Data, Data, never>, Schema.suspend<Data, Data, never>>
```

Added in v2.0.0

# transformation

## cborValueToPlutusData

Convert CBORValue to PlutusData

**Signature**

```ts
export declare const cborValueToPlutusData: (cborValue: CBOR.CBOR) => Data
```

Added in v2.0.0

## fromCBORBytes

Decode PlutusData from CBOR bytes

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => Data
```

Added in v2.0.0

## fromCBORHex

Decode PlutusData from CBOR hex string

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => Data
```

Added in v2.0.0

## fromData

Transform Data back from a schema

**Signature**

```ts
export declare const fromData: <A>(schema: Schema.Schema<A, Data>) => (data: Data) => A
```

Added in v2.0.0

## plutusDataToCBORValue

Convert PlutusData to CBORValue

**Signature**

```ts
export declare const plutusDataToCBORValue: (data: Data) => CBOR.CBOR
```

Added in v2.0.0

## toCBORBytes

Encode PlutusData to CBOR bytes

**Signature**

```ts
export declare const toCBORBytes: (data: Data, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode PlutusData to CBOR hex string

**Signature**

```ts
export declare const toCBORHex: (data: Data, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

## toData

Transform data to Data using a schema

**Signature**

```ts
export declare const toData: <A>(schema: Schema.Schema<A, Data>) => (data: A) => Data
```

Added in v2.0.0

# utilities

## matchConstr

Pattern matching helper for Constr types

**Signature**

```ts
export declare const matchConstr: <T>(
  constr: Constr,
  cases: { [key: number]: (fields: ReadonlyArray<Data>) => T; _: (index: number, fields: ReadonlyArray<Data>) => T }
) => T
```

Added in v2.0.0

## matchData

Pattern matching helper for PlutusData types

**Signature**

```ts
export declare const matchData: <T>(
  data: Data,
  cases: {
    Map: (entries: ReadonlyArray<[Data, Data]>) => T
    List: (items: ReadonlyArray<Data>) => T
    Int: (value: bigint) => T
    Bytes: (bytes: string) => T
    Constr: (constr: Constr) => T
  }
) => T
```

Added in v2.0.0

# utils

## ByteArray (type alias)

**Signature**

```ts
export type ByteArray = typeof ByteArray.Type
```

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>
```

## Int (type alias)

**Signature**

```ts
export type Int = typeof IntSchema.Type
```
