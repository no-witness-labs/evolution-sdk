---
title: PoolParams.ts
nav_order: 85
parent: Modules
---

## PoolParams overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PoolParamsError (class)](#poolparamserror-class)
- [model](#model)
  - [PoolParams (class)](#poolparams-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [hasMinimumCost](#hasminimumcost)
  - [hasValidMargin](#hasvalidmargin)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromCDDL](#fromcddl)
  - [FromHex](#fromhex-1)
- [transformation](#transformation)
  - [calculatePoolRewards](#calculatepoolrewards)
  - [getEffectiveStake](#geteffectivestake)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random PoolParams instances for testing.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<PoolParams>
```

Added in v2.0.0

# constructors

## make

Create a PoolParams instance with validation.

**Signature**

```ts
export declare const make: (params: {
  operator: PoolKeyHash.PoolKeyHash
  vrfKeyhash: VrfKeyHash.VrfKeyHash
  pledge: Coin.Coin
  cost: Coin.Coin
  margin: UnitInterval.UnitInterval
  rewardAccount: RewardAccount.RewardAccount
  poolOwners: Array<KeyHash.KeyHash>
  relays: Array<Relay.Relay>
  poolMetadata?: PoolMetadata.PoolMetadata
}) => PoolParams
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode PoolParams to CBOR bytes.

**Signature**

```ts
export declare const toBytes: (input: PoolParams, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toHex

Encode PoolParams to CBOR hex string.

**Signature**

```ts
export declare const toHex: (input: PoolParams, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two PoolParams instances are equal.

**Signature**

```ts
export declare const equals: (a: PoolParams, b: PoolParams) => boolean
```

Added in v2.0.0

# errors

## PoolParamsError (class)

Error class for PoolParams related operations.

**Signature**

```ts
export declare class PoolParamsError
```

Added in v2.0.0

# model

## PoolParams (class)

Schema for PoolParams representing stake pool registration parameters.

```
pool_params =
  ( operator       : pool_keyhash
  , vrf_keyhash    : vrf_keyhash
  , pledge         : coin
  , cost           : coin
  , margin         : unit_interval
  , reward_account : reward_account
  , pool_owners    : set<addr_keyhash>
  , relays         : [* relay]
  , pool_metadata  : pool_metadata/ nil
  )
```

**Signature**

```ts
export declare class PoolParams
```

Added in v2.0.0

# parsing

## fromBytes

Parse PoolParams from CBOR bytes.

**Signature**

```ts
export declare const fromBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => PoolParams
```

Added in v2.0.0

## fromHex

Parse PoolParams from CBOR hex string.

**Signature**

```ts
export declare const fromHex: (hex: string, options?: CBOR.CodecOptions) => PoolParams
```

Added in v2.0.0

# predicates

## hasMinimumCost

Check if the pool has the minimum required cost.

**Signature**

```ts
export declare const hasMinimumCost: (params: PoolParams, minPoolCost: Coin.Coin) => boolean
```

Added in v2.0.0

## hasValidMargin

Check if the pool margin is within valid range (0 to 1).

**Signature**

```ts
export declare const hasValidMargin: (params: PoolParams) => boolean
```

Added in v2.0.0

# schemas

## FromBytes

CBOR bytes transformation schema for PoolParams.

**Signature**

```ts
export declare const FromBytes: (
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
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.BigIntFromSelf,
        typeof Schema.BigIntFromSelf,
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[30]>
            value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
          }
        >,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
        Schema.Array$<
          Schema.SchemaClass<
            readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
            readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
            never
          >
        >,
        Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
      ]
    >,
    Schema.SchemaClass<PoolParams, PoolParams, never>,
    never
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for PoolParams.

```
pool_params = [
  operator       : pool_keyhash,
  vrf_keyhash    : vrf_keyhash,
  pledge         : coin,
  cost           : coin,
  margin         : unit_interval,
  reward_account : reward_account,
  pool_owners    : set<addr_keyhash>,
  relays         : [* relay],
  pool_metadata  : pool_metadata / nil
]
```

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.BigIntFromSelf,
      typeof Schema.BigIntFromSelf,
      Schema.TaggedStruct<
        "Tag",
        { tag: Schema.Literal<[30]>; value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf> }
      >,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
      Schema.Array$<
        Schema.SchemaClass<
          readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
          readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
          never
        >
      >,
      Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
    ]
  >,
  Schema.SchemaClass<PoolParams, PoolParams, never>,
  never
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for PoolParams.

**Signature**

```ts
export declare const FromHex: (
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
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.BigIntFromSelf,
          typeof Schema.BigIntFromSelf,
          Schema.TaggedStruct<
            "Tag",
            {
              tag: Schema.Literal<[30]>
              value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
            }
          >,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
          Schema.Array$<
            Schema.SchemaClass<
              readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
              readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
              never
            >
          >,
          Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
        ]
      >,
      Schema.SchemaClass<PoolParams, PoolParams, never>,
      never
    >
  >
>
```

Added in v2.0.0

# transformation

## calculatePoolRewards

Calculate pool operator rewards based on pool parameters.

**Signature**

```ts
export declare const calculatePoolRewards: (
  params: PoolParams,
  totalRewards: Coin.Coin
) => { operatorRewards: Coin.Coin; delegatorRewards: Coin.Coin }
```

Added in v2.0.0

## getEffectiveStake

Get total effective stake for pool rewards calculation.

**Signature**

```ts
export declare const getEffectiveStake: (params: PoolParams, totalStake: Coin.Coin) => Coin.Coin
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple<
  [
    typeof Schema.Uint8ArrayFromSelf,
    typeof Schema.Uint8ArrayFromSelf,
    typeof Schema.BigIntFromSelf,
    typeof Schema.BigIntFromSelf,
    Schema.TaggedStruct<
      "Tag",
      { tag: Schema.Literal<[30]>; value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf> }
    >,
    typeof Schema.Uint8ArrayFromSelf,
    Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
    Schema.Array$<
      Schema.SchemaClass<
        readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
        readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
        never
      >
    >,
    Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
  ]
>
```
