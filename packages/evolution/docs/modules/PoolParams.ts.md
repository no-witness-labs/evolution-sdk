---
title: PoolParams.ts
nav_order: 69
parent: Modules
---

## PoolParams overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PoolParamsError (class)](#poolparamserror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [PoolParams (class)](#poolparams-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [predicates](#predicates)
  - [hasMinimumCost](#hasminimumcost)
  - [hasValidMargin](#hasvalidmargin)
- [schemas](#schemas)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [PoolParamsCDDLSchema](#poolparamscddlschema)
- [transformation](#transformation)
  - [calculatePoolRewards](#calculatepoolrewards)
  - [getEffectiveStake](#geteffectivestake)
- [utils](#utils)
  - [Codec](#codec)

---

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

# generators

## generator

Generate a random PoolParams.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<PoolParams>
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

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

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

## CBORBytesSchema

CBOR bytes transformation schema for PoolParams.

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
    Schema.Tuple<
      [
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.BigIntFromSelf,
        typeof Schema.BigIntFromSelf,
        Schema.SchemaClass<
          { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
          { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
          never
        >,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
        Schema.Array$<
          Schema.SchemaClass<
            readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
            readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
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

## CBORHexSchema

CBOR hex transformation schema for PoolParams.

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
      Schema.Tuple<
        [
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.BigIntFromSelf,
          typeof Schema.BigIntFromSelf,
          Schema.SchemaClass<
            { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
            { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
            never
          >,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
          Schema.Array$<
            Schema.SchemaClass<
              readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
              readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
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

## PoolParamsCDDLSchema

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
export declare const PoolParamsCDDLSchema: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.BigIntFromSelf,
      typeof Schema.BigIntFromSelf,
      Schema.SchemaClass<
        { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
        { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
        never
      >,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
      Schema.Array$<
        Schema.SchemaClass<
          readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
          readonly [1n, bigint | null, string] | readonly [0n, bigint | null, any, any] | readonly [2n, string],
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

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: PoolParams) => any; cborHex: (input: PoolParams) => string }
  Decode: { cborBytes: (input: any) => PoolParams; cborHex: (input: string) => PoolParams }
  EncodeEffect: {
    cborBytes: (input: PoolParams) => Effect.Effect<any, InstanceType<typeof PoolParamsError>>
    cborHex: (input: PoolParams) => Effect.Effect<string, InstanceType<typeof PoolParamsError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<PoolParams, InstanceType<typeof PoolParamsError>>
    cborHex: (input: string) => Effect.Effect<PoolParams, InstanceType<typeof PoolParamsError>>
  }
  EncodeEither: {
    cborBytes: (input: PoolParams) => Either<any, InstanceType<typeof PoolParamsError>>
    cborHex: (input: PoolParams) => Either<string, InstanceType<typeof PoolParamsError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<PoolParams, InstanceType<typeof PoolParamsError>>
    cborHex: (input: string) => Either<PoolParams, InstanceType<typeof PoolParamsError>>
  }
}
```
