---
title: Numeric.ts
nav_order: 61
parent: Modules
---

## Numeric overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [INT16_MAX](#int16_max)
  - [INT16_MIN](#int16_min)
  - [INT32_MAX](#int32_max)
  - [INT32_MIN](#int32_min)
  - [INT64_MAX](#int64_max)
  - [INT64_MIN](#int64_min)
  - [INT8_MAX](#int8_max)
  - [INT8_MIN](#int8_min)
  - [Int16](#int16)
  - [Int16 (type alias)](#int16-type-alias)
  - [Int16Generator](#int16generator)
  - [Int32](#int32)
  - [Int32 (type alias)](#int32-type-alias)
  - [Int32Generator](#int32generator)
  - [Int64](#int64)
  - [Int64 (type alias)](#int64-type-alias)
  - [Int64Generator](#int64generator)
  - [Int8](#int8)
  - [Int8 (type alias)](#int8-type-alias)
  - [Int8Generator](#int8generator)
  - [UINT16_MAX](#uint16_max)
  - [UINT16_MIN](#uint16_min)
  - [UINT32_MAX](#uint32_max)
  - [UINT32_MIN](#uint32_min)
  - [UINT64_MAX](#uint64_max)
  - [UINT64_MIN](#uint64_min)
  - [UINT8_MAX](#uint8_max)
  - [UINT8_MIN](#uint8_min)
  - [Uint16 (type alias)](#uint16-type-alias)
  - [Uint16Generator](#uint16generator)
  - [Uint16Schema](#uint16schema)
  - [Uint32 (type alias)](#uint32-type-alias)
  - [Uint32Generator](#uint32generator)
  - [Uint32Schema](#uint32schema)
  - [Uint64 (type alias)](#uint64-type-alias)
  - [Uint64Generator](#uint64generator)
  - [Uint64Schema](#uint64schema)
  - [Uint8 (type alias)](#uint8-type-alias)
  - [Uint8Generator](#uint8generator)
  - [Uint8Schema](#uint8schema)

---

# utils

## INT16_MAX

**Signature**

```ts
export declare const INT16_MAX: 32767
```

## INT16_MIN

**Signature**

```ts
export declare const INT16_MIN: -32768
```

## INT32_MAX

**Signature**

```ts
export declare const INT32_MAX: 2147483647
```

## INT32_MIN

**Signature**

```ts
export declare const INT32_MIN: -2147483648
```

## INT64_MAX

**Signature**

```ts
export declare const INT64_MAX: 9223372036854775807n
```

## INT64_MIN

**Signature**

```ts
export declare const INT64_MIN: -9223372036854775808n
```

## INT8_MAX

**Signature**

```ts
export declare const INT8_MAX: 127
```

## INT8_MIN

**Signature**

```ts
export declare const INT8_MIN: -128
```

## Int16

**Signature**

```ts
export declare const Int16: Schema.refine<number, typeof Schema.Number>
```

## Int16 (type alias)

**Signature**

```ts
export type Int16 = typeof Int16.Type
```

## Int16Generator

**Signature**

```ts
export declare const Int16Generator: FastCheck.Arbitrary<number>
```

## Int32

**Signature**

```ts
export declare const Int32: Schema.refine<number, typeof Schema.Number>
```

## Int32 (type alias)

**Signature**

```ts
export type Int32 = typeof Int32.Type
```

## Int32Generator

**Signature**

```ts
export declare const Int32Generator: FastCheck.Arbitrary<number>
```

## Int64

**Signature**

```ts
export declare const Int64: Schema.refine<bigint, typeof Schema.BigIntFromSelf>
```

## Int64 (type alias)

**Signature**

```ts
export type Int64 = typeof Int64.Type
```

## Int64Generator

**Signature**

```ts
export declare const Int64Generator: FastCheck.Arbitrary<bigint>
```

## Int8

**Signature**

```ts
export declare const Int8: Schema.refine<number, typeof Schema.Number>
```

## Int8 (type alias)

**Signature**

```ts
export type Int8 = typeof Int8.Type
```

## Int8Generator

**Signature**

```ts
export declare const Int8Generator: FastCheck.Arbitrary<number>
```

## UINT16_MAX

**Signature**

```ts
export declare const UINT16_MAX: 65535
```

## UINT16_MIN

**Signature**

```ts
export declare const UINT16_MIN: 0
```

## UINT32_MAX

**Signature**

```ts
export declare const UINT32_MAX: 4294967295
```

## UINT32_MIN

**Signature**

```ts
export declare const UINT32_MIN: 0
```

## UINT64_MAX

**Signature**

```ts
export declare const UINT64_MAX: 18446744073709551615n
```

## UINT64_MIN

**Signature**

```ts
export declare const UINT64_MIN: 0n
```

## UINT8_MAX

**Signature**

```ts
export declare const UINT8_MAX: 255
```

## UINT8_MIN

**Signature**

```ts
export declare const UINT8_MIN: 0
```

## Uint16 (type alias)

**Signature**

```ts
export type Uint16 = typeof Uint16Schema.Type
```

## Uint16Generator

**Signature**

```ts
export declare const Uint16Generator: FastCheck.Arbitrary<number>
```

## Uint16Schema

**Signature**

```ts
export declare const Uint16Schema: Schema.refine<number, typeof Schema.Number>
```

## Uint32 (type alias)

**Signature**

```ts
export type Uint32 = typeof Uint32Schema.Type
```

## Uint32Generator

**Signature**

```ts
export declare const Uint32Generator: FastCheck.Arbitrary<number>
```

## Uint32Schema

**Signature**

```ts
export declare const Uint32Schema: Schema.refine<number, typeof Schema.Number>
```

## Uint64 (type alias)

**Signature**

```ts
export type Uint64 = typeof Uint64Schema.Type
```

## Uint64Generator

**Signature**

```ts
export declare const Uint64Generator: FastCheck.Arbitrary<bigint>
```

## Uint64Schema

**Signature**

```ts
export declare const Uint64Schema: Schema.refine<bigint, typeof Schema.BigIntFromSelf>
```

## Uint8 (type alias)

**Signature**

```ts
export type Uint8 = typeof Uint8Schema.Type
```

## Uint8Generator

**Signature**

```ts
export declare const Uint8Generator: FastCheck.Arbitrary<number>
```

## Uint8Schema

**Signature**

```ts
export declare const Uint8Schema: Schema.refine<number, typeof Schema.Number>
```
