---
title: BigInt.ts
nav_order: 10
parent: Modules
---

## BigInt overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [bigNInt](#bignint)
  - [bigUInt](#biguint)
  - [int](#int)
- [errors](#errors)
  - [BigIntError (class)](#biginterror-class)
- [model](#model)
  - [BigInt (type alias)](#bigint-type-alias)
  - [BigNInt (type alias)](#bignint-type-alias)
  - [BigUInt (type alias)](#biguint-type-alias)
- [schemas](#schemas)
  - [BigIntSchema](#bigintschema)
  - [BigNIntSchema](#bignintschema)
  - [BigUIntSchema](#biguintschema)
- [utilities](#utilities)
  - [match](#match)

---

# constructors

## bigNInt

Creates a big negative integer from bytes

**Signature**

```ts
export declare const bigNInt: (bytes: Uint8Array) => BigInt
```

Added in v2.0.0

## bigUInt

Creates a big unsigned integer from bytes

**Signature**

```ts
export declare const bigUInt: (bytes: Uint8Array) => BigInt
```

Added in v2.0.0

## int

Creates an integer value

**Signature**

```ts
export declare const int: (value: number) => BigInt
```

Added in v2.0.0

# errors

## BigIntError (class)

Error class for BigInt related operations.

**Signature**

```ts
export declare class BigIntError
```

Added in v2.0.0

# model

## BigInt (type alias)

Type alias for BigInt.

**Signature**

```ts
export type BigInt = typeof BigIntSchema.Type
```

Added in v2.0.0

## BigNInt (type alias)

Type alias for BigNInt.

**Signature**

```ts
export type BigNInt = typeof BigNIntSchema.Type
```

Added in v2.0.0

## BigUInt (type alias)

Type alias for BigUInt.

**Signature**

```ts
export type BigUInt = typeof BigUIntSchema.Type
```

Added in v2.0.0

# schemas

## BigIntSchema

BigInt schema based on Conway CDDL specification

CDDL: big_int = int/ big_uint/ big_nint

**Signature**

```ts
export declare const BigIntSchema: Schema.Union<
  [
    Schema.TaggedStruct<"Int", { value: typeof Schema.Number }>,
    Schema.TaggedStruct<"BigUInt", { bytes: typeof Schema.Uint8ArrayFromSelf }>,
    Schema.TaggedStruct<"BigNInt", { bytes: typeof Schema.Uint8ArrayFromSelf }>
  ]
>
```

Added in v2.0.0

## BigNIntSchema

BigNInt schema based on Conway CDDL specification

CDDL: big_nint = #6.3(bounded_bytes)

**Signature**

```ts
export declare const BigNIntSchema: Schema.TaggedStruct<"BigNInt", { bytes: typeof Schema.Uint8ArrayFromSelf }>
```

Added in v2.0.0

## BigUIntSchema

BigUInt schema based on Conway CDDL specification

CDDL: big_uint = #6.2(bounded_bytes)

**Signature**

```ts
export declare const BigUIntSchema: Schema.TaggedStruct<"BigUInt", { bytes: typeof Schema.Uint8ArrayFromSelf }>
```

Added in v2.0.0

# utilities

## match

Pattern matching helper for BigInt types

**Signature**

```ts
export declare const match: <T>(
  bigInt: BigInt,
  cases: { Int: (value: number) => T; BigUInt: (bytes: Uint8Array) => T; BigNInt: (bytes: Uint8Array) => T }
) => T
```

Added in v2.0.0
