---
title: TransactionIndex.ts
nav_order: 108
parent: Modules
---

## TransactionIndex overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [TransactionIndexError (class)](#transactionindexerror-class)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [TransactionIndex](#transactionindex)
- [utils](#utils)
  - [TransactionIndex (type alias)](#transactionindex-type-alias)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random TransactionIndex instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<bigint>
```

Added in v2.0.0

# constructors

## make

Smart constructor for TransactionIndex that validates and applies branding.

**Signature**

```ts
export declare const make: (a: bigint, options?: Schema.MakeOptions) => bigint
```

Added in v2.0.0

# equality

## equals

Check if two TransactionIndex instances are equal.

**Signature**

```ts
export declare const equals: (a: TransactionIndex, b: TransactionIndex) => boolean
```

Added in v2.0.0

# errors

## TransactionIndexError (class)

Error class for TransactionIndex related operations.

**Signature**

```ts
export declare class TransactionIndexError
```

Added in v2.0.0

# predicates

## is

Check if a value is a valid TransactionIndex.

**Signature**

```ts
export declare const is: (u: unknown, overrideOptions?: ParseOptions | number) => u is bigint
```

Added in v2.0.0

# schemas

## TransactionIndex

Schema for TransactionIndex representing a transaction index within a block.
CDDL: transaction_index = uint .size 2

**Signature**

```ts
export declare const TransactionIndex: Schema.refine<bigint, typeof Schema.BigIntFromSelf>
```

Added in v2.0.0

# utils

## TransactionIndex (type alias)

**Signature**

```ts
export type TransactionIndex = typeof TransactionIndex.Type
```
