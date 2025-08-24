---
title: Natural.ts
nav_order: 69
parent: Modules
---

## Natural overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toNumber](#tonumber)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [NaturalError (class)](#naturalerror-class)
- [model](#model)
  - [Natural (type alias)](#natural-type-alias)
- [parsing](#parsing)
  - [fromNumber](#fromnumber)
- [predicates](#predicates)
  - [isNatural](#isnatural)
- [schemas](#schemas)
  - [Natural](#natural)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random Natural instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<number>
```

Added in v2.0.0

# constructors

## make

Smart constructor for Natural that validates and applies branding.

**Signature**

```ts
export declare const make: (a: number, options?: Schema.MakeOptions) => number
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toNumber

Encode Natural to number.

**Signature**

```ts
export declare const toNumber: (natural: Natural) => number
```

Added in v2.0.0

# equality

## equals

Check if two Natural instances are equal.

**Signature**

```ts
export declare const equals: (a: Natural, b: Natural) => boolean
```

Added in v2.0.0

# errors

## NaturalError (class)

Error class for Natural related operations.

**Signature**

```ts
export declare class NaturalError
```

Added in v2.0.0

# model

## Natural (type alias)

Type alias for Natural representing positive integers.

**Signature**

```ts
export type Natural = typeof Natural.Type
```

Added in v2.0.0

# parsing

## fromNumber

Parse Natural from number.

**Signature**

```ts
export declare const fromNumber: (num: number) => Natural
```

Added in v2.0.0

# predicates

## isNatural

Check if the given value is a valid Natural

**Signature**

```ts
export declare const isNatural: (u: unknown, overrideOptions?: ParseOptions | number) => u is number
```

Added in v2.0.0

# schemas

## Natural

Natural number schema for positive integers.
Used for validating non-negative integers greater than 0.

**Signature**

```ts
export declare const Natural: Schema.refine<number, typeof Schema.Number>
```

Added in v2.0.0
