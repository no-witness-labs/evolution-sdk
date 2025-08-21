---
title: Withdrawals.ts
nav_order: 124
parent: Modules
---

## Withdrawals overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [empty](#empty)
  - [fromEntries](#fromentries)
  - [singleton](#singleton)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [WithdrawalsError (class)](#withdrawalserror-class)
- [model](#model)
  - [Withdrawals (class)](#withdrawals-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [predicates](#predicates)
  - [has](#has)
  - [isEmpty](#isempty)
  - [isWithdrawals](#iswithdrawals)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)
- [transformation](#transformation)
  - [add](#add)
  - [entries](#entries)
  - [get](#get)
  - [remove](#remove)
  - [size](#size)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# constructors

## empty

Create an empty Withdrawals instance.

**Signature**

```ts
export declare const empty: () => Withdrawals
```

Added in v2.0.0

## fromEntries

Create a Withdrawals instance from an array of [RewardAccount, Coin] pairs.

**Signature**

```ts
export declare const fromEntries: (entries: Array<[RewardAccount.RewardAccount, Coin.Coin]>) => Withdrawals
```

Added in v2.0.0

## singleton

Create a Withdrawals instance with a single withdrawal.

**Signature**

```ts
export declare const singleton: (rewardAccount: RewardAccount.RewardAccount, coin: Coin.Coin) => Withdrawals
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a Withdrawals to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: Withdrawals, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a Withdrawals to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: Withdrawals, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two Withdrawals instances are equal.

**Signature**

```ts
export declare const equals: (self: Withdrawals, that: Withdrawals) => boolean
```

Added in v2.0.0

# errors

## WithdrawalsError (class)

Error class for Withdrawals related operations.

**Signature**

```ts
export declare class WithdrawalsError
```

Added in v2.0.0

# model

## Withdrawals (class)

Schema for Withdrawals representing a map of reward accounts to coin amounts.

```
withdrawals = {+ reward_account => coin}
```

**Signature**

```ts
export declare class Withdrawals
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse a Withdrawals from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => Withdrawals
```

Added in v2.0.0

## fromCBORHex

Parse a Withdrawals from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => Withdrawals
```

Added in v2.0.0

# predicates

## has

Check if Withdrawals contains a specific reward account.

**Signature**

```ts
export declare const has: (withdrawals: Withdrawals, rewardAccount: RewardAccount.RewardAccount) => boolean
```

Added in v2.0.0

## isEmpty

Check if Withdrawals is empty.

**Signature**

```ts
export declare const isEmpty: (withdrawals: Withdrawals) => boolean
```

Added in v2.0.0

## isWithdrawals

Check if the given value is a valid Withdrawals

**Signature**

```ts
export declare const isWithdrawals: (u: unknown, overrideOptions?: ParseOptions | number) => u is Withdrawals
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for Withdrawals.

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
    Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
    Schema.SchemaClass<Withdrawals, Withdrawals, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for Withdrawals.

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
      Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
      Schema.SchemaClass<Withdrawals, Withdrawals, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for Withdrawals.

```
withdrawals = {+ reward_account => coin}
```

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
  Schema.SchemaClass<Withdrawals, Withdrawals, never>,
  never
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for Withdrawals instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Withdrawals>
```

Added in v2.0.0

# transformation

## add

Add a withdrawal to existing Withdrawals.

**Signature**

```ts
export declare const add: (
  withdrawals: Withdrawals,
  rewardAccount: RewardAccount.RewardAccount,
  coin: Coin.Coin
) => Withdrawals
```

Added in v2.0.0

## entries

Get all entries as an array of [reward account, coin] pairs.

**Signature**

```ts
export declare const entries: (withdrawals: Withdrawals) => Array<[RewardAccount.RewardAccount, Coin.Coin]>
```

Added in v2.0.0

## get

Get the coin amount for a specific reward account.

**Signature**

```ts
export declare const get: (
  withdrawals: Withdrawals,
  rewardAccount: RewardAccount.RewardAccount
) => Coin.Coin | undefined
```

Added in v2.0.0

## remove

Remove a withdrawal from existing Withdrawals.

**Signature**

```ts
export declare const remove: (withdrawals: Withdrawals, rewardAccount: RewardAccount.RewardAccount) => Withdrawals
```

Added in v2.0.0

## size

Get the size (number of withdrawals) in Withdrawals.

**Signature**

```ts
export declare const size: (withdrawals: Withdrawals) => number
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
```
