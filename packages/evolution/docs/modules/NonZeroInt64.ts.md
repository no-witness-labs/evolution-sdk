---
title: NonZeroInt64.ts
nav_order: 70
parent: Modules
---

## NonZeroInt64 overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constants](#constants)
  - [NEG_INT64_MIN](#neg_int64_min)
- [constructors](#constructors)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBigInt](#tobigint)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [NonZeroInt64Error (class)](#nonzeroint64error-class)
- [model](#model)
  - [NonZeroInt64 (type alias)](#nonzeroint64-type-alias)
- [ordering](#ordering)
  - [compare](#compare)
- [parsing](#parsing)
  - [fromBigInt](#frombigint)
- [predicates](#predicates)
  - [is](#is)
  - [isNegative](#isnegative)
  - [isPositive](#ispositive)
- [schemas](#schemas)
  - [NegInt64Schema](#negint64schema)
  - [NonZeroInt64](#nonzeroint64)
  - [PosInt64Schema](#posint64schema)
- [transformation](#transformation)
  - [abs](#abs)
  - [negate](#negate)
- [utils](#utils)
  - [NEG_INT64_MAX](#neg_int64_max)
  - [POS_INT64_MAX](#pos_int64_max)
  - [POS_INT64_MIN](#pos_int64_min)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random NonZeroInt64 instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<bigint>
```

Added in v2.0.0

# constants

## NEG_INT64_MIN

Constants for NonZeroInt64 validation.
negInt64 = -9223372036854775808 .. -1
posInt64 = 1 .. 9223372036854775807
nonZeroInt64 = negInt64/ posInt64

**Signature**

```ts
export declare const NEG_INT64_MIN: -9223372036854775808n
```

Added in v2.0.0

# constructors

## make

Smart constructor for creating NonZeroInt64 values.

**Signature**

```ts
export declare const make: (i: bigint, overrideOptions?: ParseOptions) => bigint & Brand<"NonZeroInt64">
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBigInt

Encode NonZeroInt64 to bigint.

**Signature**

```ts
export declare const toBigInt: (value: NonZeroInt64) => bigint
```

Added in v2.0.0

# equality

## equals

Check if two NonZeroInt64 values are equal.

**Signature**

```ts
export declare const equals: (a: NonZeroInt64, b: NonZeroInt64) => boolean
```

Added in v2.0.0

# errors

## NonZeroInt64Error (class)

Error class for NonZeroInt64 related operations.

**Signature**

```ts
export declare class NonZeroInt64Error
```

Added in v2.0.0

# model

## NonZeroInt64 (type alias)

Type alias for NonZeroInt64 representing non-zero signed 64-bit integers.
Used in minting operations where zero amounts are not allowed.

**Signature**

```ts
export type NonZeroInt64 = typeof NonZeroInt64.Type
```

Added in v2.0.0

# ordering

## compare

Compare two NonZeroInt64 values.

**Signature**

```ts
export declare const compare: (a: NonZeroInt64, b: NonZeroInt64) => -1 | 0 | 1
```

Added in v2.0.0

# parsing

## fromBigInt

Parse NonZeroInt64 from bigint.

**Signature**

```ts
export declare const fromBigInt: (value: bigint) => NonZeroInt64
```

Added in v2.0.0

# predicates

## is

Check if a value is a valid NonZeroInt64.

**Signature**

```ts
export declare const is: (u: unknown, overrideOptions?: ParseOptions | number) => u is bigint & Brand<"NonZeroInt64">
```

Added in v2.0.0

## isNegative

Check if a NonZeroInt64 is negative.

**Signature**

```ts
export declare const isNegative: (value: NonZeroInt64) => boolean
```

Added in v2.0.0

## isPositive

Check if a NonZeroInt64 is positive.

**Signature**

```ts
export declare const isPositive: (value: NonZeroInt64) => boolean
```

Added in v2.0.0

# schemas

## NegInt64Schema

Schema for validating negative 64-bit integers (-9223372036854775808 to -1).

**Signature**

```ts
export declare const NegInt64Schema: Schema.refine<bigint, typeof Schema.BigIntFromSelf>
```

Added in v2.0.0

## NonZeroInt64

Schema for NonZeroInt64 representing non-zero 64-bit signed integers.
nonZeroInt64 = negInt64/ posInt64

**Signature**

```ts
export declare const NonZeroInt64: Schema.brand<
  Schema.Union<
    [Schema.refine<bigint, typeof Schema.BigIntFromSelf>, Schema.refine<bigint, typeof Schema.BigIntFromSelf>]
  >,
  "NonZeroInt64"
>
```

Added in v2.0.0

## PosInt64Schema

Schema for validating positive 64-bit integers (1 to 9223372036854775807).

**Signature**

```ts
export declare const PosInt64Schema: Schema.refine<bigint, typeof Schema.BigIntFromSelf>
```

Added in v2.0.0

# transformation

## abs

Get the absolute value of a NonZeroInt64.

**Signature**

```ts
export declare const abs: (value: NonZeroInt64) => NonZeroInt64
```

Added in v2.0.0

## negate

Negate a NonZeroInt64.

**Signature**

```ts
export declare const negate: (value: NonZeroInt64) => NonZeroInt64
```

Added in v2.0.0

# utils

## NEG_INT64_MAX

**Signature**

```ts
export declare const NEG_INT64_MAX: -1n
```

## POS_INT64_MAX

**Signature**

```ts
export declare const POS_INT64_MAX: 9223372036854775807n
```

## POS_INT64_MIN

**Signature**

```ts
export declare const POS_INT64_MIN: 1n
```
