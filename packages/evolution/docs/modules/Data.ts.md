---
title: Data.ts
nav_order: 32
parent: Modules
---

## Data overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [bytearray](#bytearray)
  - [constr](#constr)
  - [int](#int)
  - [list](#list)
  - [map](#map)
- [errors](#errors)
  - [DataError (class)](#dataerror-class)
- [generators](#generators)
  - [genConstr](#genconstr)
  - [genPlutusBigInt](#genplutusbigint)
  - [genPlutusBytes](#genplutusbytes)
  - [genPlutusData](#genplutusdata)
  - [genPlutusList](#genplutuslist)
  - [genPlutusMap](#genplutusmap)
  - [generator](#generator)
- [model](#model)
  - [Data (type alias)](#data-type-alias)
  - [FromCBORBytes](#fromcborbytes)
  - [List (type alias)](#list-type-alias)
  - [MapList (type alias)](#maplist-type-alias)
- [predicates](#predicates)
  - [isBytes](#isbytes)
  - [isConstr](#isconstr)
  - [isInt](#isint)
  - [isList](#islist)
  - [isMap](#ismap)
- [schemas](#schemas)
  - [BytesSchema](#bytesschema)
  - [Constr (class)](#constr-class)
  - [DataSchema](#dataschema)
  - [IntSchema](#intschema)
  - [ListSchema](#listschema)
  - [MapSchema](#mapschema)
- [transformation](#transformation)
  - [cborValueToPlutusData](#cborvaluetoplutusdata)
  - [plutusDataToCBORValue](#plutusdatatocborvalue)
- [utilities](#utilities)
  - [matchConstr](#matchconstr)
  - [matchData](#matchdata)
- [utils](#utils)
  - [ByteArray (type alias)](#bytearray-type-alias)
  - [Codec](#codec)
  - [FromCBORHex](#fromcborhex)
  - [Int (type alias)](#int-type-alias)

---

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
export declare const constr: (index: bigint, data: Array<Data>) => Constr
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
export declare const map: (entries: Array<{ key: Data; value: Data }>) => MapList
```

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

## genConstr

Creates an arbitrary that generates Constr values

**Signature**

```ts
export declare const genConstr: (depth: number) => FastCheck.Arbitrary<Constr>
```

Added in v2.0.0

## genPlutusBigInt

Creates an arbitrary that generates PlutusBigInt values

**Signature**

```ts
export declare const genPlutusBigInt: () => FastCheck.Arbitrary<Int>
```

Added in v2.0.0

## genPlutusBytes

Creates an arbitrary that generates PlutusBytes values

**Signature**

```ts
export declare const genPlutusBytes: () => FastCheck.Arbitrary<ByteArray>
```

Added in v2.0.0

## genPlutusData

Creates an arbitrary that generates PlutusData values with controlled depth

**Signature**

```ts
export declare const genPlutusData: (depth?: number) => FastCheck.Arbitrary<Data>
```

Added in v2.0.0

## genPlutusList

Creates an arbitrary that generates PlutusList values

**Signature**

```ts
export declare const genPlutusList: (depth: number) => FastCheck.Arbitrary<List>
```

Added in v2.0.0

## genPlutusMap

Creates an arbitrary that generates PlutusMap values with unique keys
Following a similar distribution pattern:

- 60% PlutusBigInt keys
- 30% PlutusBytes keys
- 10% Complex keys

**Signature**

```ts
export declare const genPlutusMap: (depth: number) => FastCheck.Arbitrary<MapList>
```

Added in v2.0.0

## generator

FastCheck generators for PlutusData types

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<Data>
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
export type Data = Constr | MapList | List | Int | ByteArray
```

Added in v2.0.0

## FromCBORBytes

CBOR value representation for PlutusData
This represents the intermediate CBOR structure that corresponds to PlutusData

**Signature**

```ts
export declare const FromCBORBytes: (
  options?: CBOR.CodecOptions
) => Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, Schema.Schema<Data, Data, never>, never>
```

Added in v2.0.0

## List (type alias)

PlutusList type for plutus data lists

**Signature**

```ts
export type List = ReadonlyArray<Data>
```

Added in v2.0.0

## MapList (type alias)

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
export type MapList = Map<Data, Data>
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
export declare const isMap: (u: unknown, overrideOptions?: ParseOptions | number) => u is Map<Data, Data>
```

Added in v2.0.0

# schemas

## BytesSchema

Schema for PlutusBytes data type

**Signature**

```ts
export declare const BytesSchema: Schema.refine<string, typeof Schema.String>
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

## plutusDataToCBORValue

Convert PlutusData to CBORValue

**Signature**

```ts
export declare const plutusDataToCBORValue: (data: Data) => CBOR.CBOR
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
export type ByteArray = typeof BytesSchema.Type
```

## Codec

**Signature**

```ts
export declare function Codec<A, B extends Data>(params: {
  schema: Schema.Schema<A, B>
  options?: CBOR.CodecOptions
}): ReturnType<
  typeof _Codec.createEncoders<
    {
      toData: Schema.Schema<A, B>
      cborHex: Schema.Schema<A, string>
      cborBytes: Schema.Schema<A, Uint8Array>
    },
    typeof DataError
  >
>
export declare function Codec(params?: { options?: CBOR.CodecOptions }): ReturnType<
  typeof _Codec.createEncoders<
    {
      cborHex: Schema.Schema<Data, string>
      cborBytes: Schema.Schema<Data, Uint8Array>
    },
    typeof DataError
  >
>
```

## FromCBORHex

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, Schema.Schema<Data, Data, never>, never>
>
```

## Int (type alias)

**Signature**

```ts
export type Int = typeof IntSchema.Type
```
