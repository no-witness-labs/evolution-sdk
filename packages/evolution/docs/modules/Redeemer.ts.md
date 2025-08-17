---
title: Redeemer.ts
nav_order: 88
parent: Modules
---

## Redeemer overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [cert](#cert)
  - [mint](#mint)
  - [reward](#reward)
  - [spend](#spend)
- [errors](#errors)
  - [RedeemerError (class)](#redeemererror-class)
- [generators](#generators)
  - [arbitrary](#arbitrary)
  - [arbitraryExUnits](#arbitraryexunits)
  - [arbitraryRedeemerTag](#arbitraryredeemertag)
- [model](#model)
  - [ExUnits](#exunits)
  - [Redeemer (class)](#redeemer-class)
  - [RedeemerTag](#redeemertag)
- [predicates](#predicates)
  - [isCert](#iscert)
  - [isMint](#ismint)
  - [isReward](#isreward)
  - [isSpend](#isspend)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes)
  - [FromCBORHex](#fromcborhex)
  - [FromCDDL](#fromcddl)
- [transformation](#transformation)
  - [fromCBORBytes](#fromcborbytes-1)
  - [fromCBORHex](#fromcborhex-1)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [utilities](#utilities)
  - [integerToTag](#integertotag)
  - [tagToInteger](#tagtointeger)
- [utils](#utils)
  - [ExUnits (type alias)](#exunits-type-alias)
  - [RedeemerTag (type alias)](#redeemertag-type-alias)

---

# constructors

## cert

Create a cert redeemer for certificate validation.

**Signature**

```ts
export declare const cert: (index: bigint, data: PlutusData.Data, exUnits: ExUnits) => Redeemer
```

Added in v2.0.0

## mint

Create a mint redeemer for minting/burning tokens.

**Signature**

```ts
export declare const mint: (index: bigint, data: PlutusData.Data, exUnits: ExUnits) => Redeemer
```

Added in v2.0.0

## reward

Create a reward redeemer for withdrawal validation.

**Signature**

```ts
export declare const reward: (index: bigint, data: PlutusData.Data, exUnits: ExUnits) => Redeemer
```

Added in v2.0.0

## spend

Create a spend redeemer for spending UTxO inputs.

**Signature**

```ts
export declare const spend: (index: bigint, data: PlutusData.Data, exUnits: ExUnits) => Redeemer
```

Added in v2.0.0

# errors

## RedeemerError (class)

Error class for Redeemer related operations.

**Signature**

```ts
export declare class RedeemerError
```

Added in v2.0.0

# generators

## arbitrary

FastCheck arbitrary for generating random Redeemer instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Redeemer>
```

Added in v2.0.0

## arbitraryExUnits

FastCheck arbitrary for generating random ExUnits values.

**Signature**

```ts
export declare const arbitraryExUnits: FastCheck.Arbitrary<readonly [bigint, bigint]>
```

Added in v2.0.0

## arbitraryRedeemerTag

FastCheck arbitrary for generating random RedeemerTag values.

**Signature**

```ts
export declare const arbitraryRedeemerTag: FastCheck.Arbitrary<"spend" | "mint" | "cert" | "reward">
```

Added in v2.0.0

# model

## ExUnits

Execution units for Plutus script execution.

CDDL: ex_units = [mem: uint64, steps: uint64]

**Signature**

```ts
export declare const ExUnits: Schema.Tuple2<
  Schema.refine<bigint, typeof Schema.BigIntFromSelf>,
  Schema.refine<bigint, typeof Schema.BigIntFromSelf>
>
```

Added in v2.0.0

## Redeemer (class)

Redeemer for Plutus script execution based on Conway CDDL specification.

CDDL: redeemer = [ tag, index, data, ex_units ]
Where:

- tag: redeemer_tag (0=spend, 1=mint, 2=cert, 3=reward)
- index: uint64 (index into the respective input/output/certificate/reward array)
- data: plutus_data (the actual redeemer data passed to the script)
- ex_units: [mem: uint64, steps: uint64] (execution unit limits)

**Signature**

```ts
export declare class Redeemer
```

Added in v2.0.0

## RedeemerTag

Redeemer tag enum for different script execution contexts.

CDDL: redeemer_tag = 0 ; spend | 1 ; mint | 2 ; cert | 3 ; reward

**Signature**

```ts
export declare const RedeemerTag: Schema.Literal<["spend", "mint", "cert", "reward"]>
```

Added in v2.0.0

# predicates

## isCert

Check if a redeemer is for certificates.

**Signature**

```ts
export declare const isCert: (redeemer: Redeemer) => boolean
```

Added in v2.0.0

## isMint

Check if a redeemer is for minting/burning.

**Signature**

```ts
export declare const isMint: (redeemer: Redeemer) => boolean
```

Added in v2.0.0

## isReward

Check if a redeemer is for withdrawals.

**Signature**

```ts
export declare const isReward: (redeemer: Redeemer) => boolean
```

Added in v2.0.0

## isSpend

Check if a redeemer is for spending inputs.

**Signature**

```ts
export declare const isSpend: (redeemer: Redeemer) => boolean
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for Redeemer as tuple structure.

CDDL: redeemer = [ tag, index, data, ex_units ]

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple<
  [
    Schema.SchemaClass<bigint, bigint, never>,
    Schema.SchemaClass<bigint, bigint, never>,
    Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
    Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
  ]
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for Redeemer using CDDL.
Transforms between CBOR bytes and Redeemer using CDDL encoding.

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
    Schema.Tuple<
      [
        Schema.SchemaClass<bigint, bigint, never>,
        Schema.SchemaClass<bigint, bigint, never>,
        Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
        Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
      ]
    >,
    Schema.SchemaClass<Redeemer, Redeemer, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for Redeemer using CDDL.
Transforms between CBOR hex string and Redeemer using CDDL encoding.

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
      Schema.Tuple<
        [
          Schema.SchemaClass<bigint, bigint, never>,
          Schema.SchemaClass<bigint, bigint, never>,
          Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
          Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
        ]
      >,
      Schema.SchemaClass<Redeemer, Redeemer, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL transformation schema for Redeemer.

Transforms between CBOR tuple representation and Redeemer class instance.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      Schema.SchemaClass<bigint, bigint, never>,
      Schema.SchemaClass<bigint, bigint, never>,
      Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
      Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
    ]
  >,
  Schema.SchemaClass<Redeemer, Redeemer, never>,
  never
>
```

Added in v2.0.0

# transformation

## fromCBORBytes

Decode Redeemer from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => Redeemer
```

Added in v2.0.0

## fromCBORHex

Decode Redeemer from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => Redeemer
```

Added in v2.0.0

## toCBORBytes

Encode Redeemer to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (redeemer: Redeemer, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode Redeemer to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (redeemer: Redeemer, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# utilities

## integerToTag

Helper function to convert CBOR integer to RedeemerTag string.

**Signature**

```ts
export declare const integerToTag: (value: bigint) => RedeemerTag
```

Added in v2.0.0

## tagToInteger

Helper function to convert RedeemerTag string to CBOR integer.

**Signature**

```ts
export declare const tagToInteger: (tag: RedeemerTag) => bigint
```

Added in v2.0.0

# utils

## ExUnits (type alias)

**Signature**

```ts
export type ExUnits = typeof ExUnits.Type
```

## RedeemerTag (type alias)

**Signature**

```ts
export type RedeemerTag = typeof RedeemerTag.Type
```
