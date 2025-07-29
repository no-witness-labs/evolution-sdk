---
title: Withdrawals.ts
nav_order: 101
parent: Modules
---

## Withdrawals overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [empty](#empty)
  - [fromEntries](#fromentries)
  - [singleton](#singleton)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [WithdrawalsError (class)](#withdrawalserror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [Withdrawals (class)](#withdrawals-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [predicates](#predicates)
  - [has](#has)
  - [isEmpty](#isempty)
  - [isWithdrawals](#iswithdrawals)
- [schemas](#schemas)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [WithdrawalsCDDLSchema](#withdrawalscddlschema)
- [transformation](#transformation)
  - [add](#add)
  - [entries](#entries)
  - [get](#get)
  - [remove](#remove)
  - [size](#size)
- [utils](#utils)
  - [Codec](#codec)

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

# generators

## generator

FastCheck generator for Withdrawals instances.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<Withdrawals>
```

Added in v2.0.0

# model

## Withdrawals (class)

Schema for Withdrawals representing a map of reward accounts to coin amounts.
withdrawals = {+ reward_account => coin}

**Signature**

```ts
export declare class Withdrawals
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

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

## CBORBytesSchema

CBOR bytes transformation schema for Withdrawals.

**Signature**

```ts
export declare const CBORBytesSchema: (
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

## CBORHexSchema

CBOR hex transformation schema for Withdrawals.

**Signature**

```ts
export declare const CBORHexSchema: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
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

## WithdrawalsCDDLSchema

CDDL schema for Withdrawals.
withdrawals = {+ reward_account => coin}

**Signature**

```ts
export declare const WithdrawalsCDDLSchema: Schema.transformOrFail<
  Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
  Schema.SchemaClass<Withdrawals, Withdrawals, never>,
  never
>
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

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (a: Withdrawals, overrideOptions?: ParseOptions) => any
    cborHex: (a: Withdrawals, overrideOptions?: ParseOptions) => string
  }
  Decode: {
    cborBytes: (u: unknown, overrideOptions?: ParseOptions) => Withdrawals
    cborHex: (u: unknown, overrideOptions?: ParseOptions) => Withdrawals
  }
  EncodeEither: {
    cborBytes: (a: Withdrawals, overrideOptions?: ParseOptions) => Either<any, ParseResult.ParseError>
    cborHex: (a: Withdrawals, overrideOptions?: ParseOptions) => Either<string, ParseResult.ParseError>
  }
  DecodeEither: {
    cborBytes: (u: unknown, overrideOptions?: ParseOptions) => Either<Withdrawals, ParseResult.ParseError>
    cborHex: (u: unknown, overrideOptions?: ParseOptions) => Either<Withdrawals, ParseResult.ParseError>
  }
  EncodeEffect: {
    cborBytes: (a: Withdrawals, overrideOptions?: ParseOptions) => Effect.Effect<any, ParseResult.ParseError, never>
    cborHex: (a: Withdrawals, overrideOptions?: ParseOptions) => Effect.Effect<string, ParseResult.ParseError, never>
  }
  DecodeEffect: {
    cborBytes: (u: unknown, overrideOptions?: ParseOptions) => Effect.Effect<Withdrawals, ParseResult.ParseError, never>
    cborHex: (u: unknown, overrideOptions?: ParseOptions) => Effect.Effect<Withdrawals, ParseResult.ParseError, never>
  }
}
```
