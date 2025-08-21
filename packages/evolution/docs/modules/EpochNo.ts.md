---
title: EpochNo.ts
nav_order: 49
parent: Modules
---

## EpochNo overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [EpochNoError (class)](#epochnoerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [EpochNo (type alias)](#epochno-type-alias)
- [ordering](#ordering)
  - [compare](#compare)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [EpochNoSchema](#epochnoschema)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [FromCDDL](#fromcddl)
  - [arbitrary](#arbitrary)

---

# constructors

## make

Smart constructor for creating EpochNo values.

**Signature**

```ts
export declare const make: (a: bigint, options?: Schema.MakeOptions) => bigint & Brand<"EpochNo">
```

Added in v2.0.0

# equality

## equals

Check if two EpochNo instances are equal.

**Signature**

```ts
export declare const equals: (a: EpochNo, b: EpochNo) => boolean
```

Added in v2.0.0

# errors

## EpochNoError (class)

Error class for EpochNo related operations.

**Signature**

```ts
export declare class EpochNoError
```

Added in v2.0.0

# generators

## generator

Generate a random EpochNo.

**Signature**

```ts
export declare const generator: Arbitrary<bigint>
```

Added in v2.0.0

# model

## EpochNo (type alias)

Type alias for EpochNo representing blockchain epoch numbers.

**Signature**

```ts
export type EpochNo = typeof EpochNoSchema.Type
```

Added in v2.0.0

# ordering

## compare

Compare two EpochNo values.

**Signature**

```ts
export declare const compare: (a: EpochNo, b: EpochNo) => -1 | 0 | 1
```

Added in v2.0.0

# predicates

## is

Check if a value is a valid EpochNo.

**Signature**

```ts
export declare const is: (u: unknown, overrideOptions?: ParseOptions | number) => u is bigint & Brand<"EpochNo">
```

Added in v2.0.0

# schemas

## EpochNoSchema

Schema for validating epoch numbers (0-255).

**Signature**

```ts
export declare const EpochNoSchema: Schema.brand<Schema.refine<bigint, typeof Schema.BigIntFromSelf>, "EpochNo">
```

Added in v2.0.0

# utils

## CDDLSchema

CDDL schema bridge for epoch_no = uint .size 8

**Signature**

```ts
export declare const CDDLSchema: typeof Schema.BigIntFromSelf
```

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  typeof Schema.BigIntFromSelf,
  Schema.brand<Schema.refine<bigint, typeof Schema.BigIntFromSelf>, "EpochNo">,
  never
>
```

## arbitrary

**Signature**

```ts
export declare const arbitrary: Arbitrary<bigint>
```
