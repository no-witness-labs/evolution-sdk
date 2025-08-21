---
title: MultiAsset.ts
nav_order: 64
parent: Modules
---

## MultiAsset overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [empty](#empty)
  - [make](#make)
  - [singleton](#singleton)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [MultiAssetError (class)](#multiasseterror-class)
- [model](#model)
  - [AssetMap (type alias)](#assetmap-type-alias)
  - [MultiAsset (interface)](#multiasset-interface)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [predicates](#predicates)
  - [hasAsset](#hasasset)
  - [is](#is)
- [schemas](#schemas)
  - [AssetMap](#assetmap)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [MultiAsset](#multiasset)
- [transformation](#transformation)
  - [addAsset](#addasset)
  - [getAsset](#getasset)
  - [getAssetsByPolicy](#getassetsbypolicy)
  - [getPolicyIds](#getpolicyids)
  - [merge](#merge)
  - [subtract](#subtract)

---

# arbitrary

## arbitrary

Change generator to arbitrary and rename CBOR schemas.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<MultiAsset>
```

Added in v2.0.0

# constructors

## empty

Create an empty Map for building MultiAssets (note: empty maps will fail validation).
Use this only as a starting point for building a MultiAsset with add operations.

**Signature**

```ts
export declare const empty: () => Map<PolicyId.PolicyId, AssetMap>
```

Added in v2.0.0

## make

Smart constructor for MultiAsset that validates and applies branding.

**Signature**

```ts
export declare const make: (
  i: ReadonlyMap<
    { readonly hash: any; readonly _tag: "PolicyId" },
    ReadonlyMap<{ readonly _tag: "AssetName"; readonly bytes: any }, bigint>
  >,
  overrideOptions?: ParseOptions
) => Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">
```

Added in v2.0.0

## singleton

Create a MultiAsset from a single asset.

**Signature**

```ts
export declare const singleton: (
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: PositiveCoin.PositiveCoin
) => MultiAsset
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode MultiAsset to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (
  input: Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
  options?: CBOR.CodecOptions
) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode MultiAsset to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (
  input: Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
  options?: CBOR.CodecOptions
) => string
```

Added in v2.0.0

# equality

## equals

Check if two MultiAsset instances are equal.

**Signature**

```ts
export declare const equals: (a: MultiAsset, b: MultiAsset) => boolean
```

Added in v2.0.0

# errors

## MultiAssetError (class)

Error class for MultiAsset related operations.

**Signature**

```ts
export declare class MultiAssetError
```

Added in v2.0.0

# model

## AssetMap (type alias)

Type alias for the inner asset map.

**Signature**

```ts
export type AssetMap = typeof AssetMap.Type
```

Added in v2.0.0

## MultiAsset (interface)

Type alias for MultiAsset representing a collection of native assets.
Each policy ID maps to a collection of asset names and their amounts.
All amounts must be positive (non-zero).

**Signature**

```ts
export interface MultiAsset extends Schema.Schema.Type<typeof MultiAsset> {}
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse MultiAsset from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (
  bytes: Uint8Array,
  options?: CBOR.CodecOptions
) => Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">
```

Added in v2.0.0

## fromCBORHex

Parse MultiAsset from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (
  hex: string,
  options?: CBOR.CodecOptions
) => Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">
```

Added in v2.0.0

# predicates

## hasAsset

Check if a MultiAsset contains a specific asset.

**Signature**

```ts
export declare const hasAsset: (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName
) => boolean
```

Added in v2.0.0

## is

Check if a value is a valid MultiAsset.

**Signature**

```ts
export declare const is: (value: unknown) => value is MultiAsset
```

Added in v2.0.0

# schemas

## AssetMap

Schema for inner asset map (asset_name => positive_coin).

**Signature**

```ts
export declare const AssetMap: Schema.refine<
  Map<AssetName.AssetName, bigint>,
  Schema.MapFromSelf<typeof AssetName.AssetName, Schema.refine<bigint, typeof Schema.BigIntFromSelf>>
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for MultiAsset.
Transforms between CBOR bytes and MultiAsset using CBOR encoding.

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
    Schema.MapFromSelf<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
    >,
    Schema.SchemaClass<
      Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
      Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
      never
    >,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for MultiAsset.
Transforms between CBOR hex string and MultiAsset using CBOR encoding.

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
      Schema.MapFromSelf<
        typeof Schema.Uint8ArrayFromSelf,
        Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
      >,
      Schema.SchemaClass<
        Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
        Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
        never
      >,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for MultiAsset.

```
multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}
```

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.MapFromSelf<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
  >,
  Schema.SchemaClass<
    Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
    Map<PolicyId.PolicyId, Map<AssetName.AssetName, bigint>> & Brand<"MultiAsset">,
    never
  >,
  never
>
```

Added in v2.0.0

## MultiAsset

Schema for MultiAsset representing native assets.

```
multiasset<a0> = {+ policy_id => {+ asset_name => a0}}
case: multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}
```

**Signature**

```ts
export declare const MultiAsset: Schema.brand<
  Schema.filter<
    Schema.MapFromSelf<
      typeof PolicyId.PolicyId,
      Schema.refine<
        Map<AssetName.AssetName, bigint>,
        Schema.MapFromSelf<typeof AssetName.AssetName, Schema.refine<bigint, typeof Schema.BigIntFromSelf>>
      >
    >
  >,
  "MultiAsset"
>
```

Added in v2.0.0

# transformation

## addAsset

Add an asset to a MultiAsset, combining amounts if the asset already exists.

**Signature**

```ts
export declare const addAsset: (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: PositiveCoin.PositiveCoin
) => MultiAsset
```

Added in v2.0.0

## getAsset

Get the amount of a specific asset from a MultiAsset.

**Signature**

```ts
export declare const getAsset: (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName
) => bigint | undefined
```

Added in v2.0.0

## getAssetsByPolicy

Get all assets for a specific policy ID.

**Signature**

```ts
export declare const getAssetsByPolicy: (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId
) => [AssetName.AssetName, bigint][]
```

Added in v2.0.0

## getPolicyIds

Get all policy IDs in a MultiAsset.

**Signature**

```ts
export declare const getPolicyIds: (multiAsset: MultiAsset) => Array<PolicyId.PolicyId>
```

Added in v2.0.0

## merge

Merge two MultiAsset instances, combining amounts for assets that exist in both.

**Signature**

```ts
export declare const merge: (a: MultiAsset, b: MultiAsset) => MultiAsset
```

Added in v2.0.0

## subtract

Subtract MultiAsset b from MultiAsset a.
Returns a new MultiAsset with amounts reduced by the amounts in b.
If any asset would result in zero or negative amount, it's removed from the result.
If the result would be empty, an error is thrown since MultiAsset cannot be empty.

**Signature**

```ts
export declare const subtract: (a: MultiAsset, b: MultiAsset) => MultiAsset
```

Added in v2.0.0
