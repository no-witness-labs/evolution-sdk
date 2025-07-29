---
title: MultiAsset.ts
nav_order: 53
parent: Modules
---

## MultiAsset overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [empty](#empty)
  - [singleton](#singleton)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [MultiAssetError (class)](#multiasseterror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [AssetMap (type alias)](#assetmap-type-alias)
  - [MultiAsset (type alias)](#multiasset-type-alias)
- [predicates](#predicates)
  - [hasAsset](#hasasset)
  - [is](#is)
- [schemas](#schemas)
  - [AssetMapSchema](#assetmapschema)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [MultiAssetCDDLSchema](#multiassetcddlschema)
  - [MultiAssetSchema](#multiassetschema)
- [transformation](#transformation)
  - [addAsset](#addasset)
  - [getAsset](#getasset)
  - [getAssetsByPolicy](#getassetsbypolicy)
  - [getPolicyIds](#getpolicyids)
  - [merge](#merge)
  - [subtract](#subtract)
- [utils](#utils)
  - [Codec](#codec)

---

# constructors

## empty

Create an empty MultiAsset (note: this will fail validation as MultiAsset cannot be empty).
Use this only as a starting point for building a MultiAsset.

**Signature**

```ts
export declare const empty: () => Map<PolicyId.PolicyId, AssetMap>
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

# generators

## generator

Generate a random MultiAsset.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<
  Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
>
```

Added in v2.0.0

# model

## AssetMap (type alias)

Type alias for the inner asset map.

**Signature**

```ts
export type AssetMap = typeof AssetMapSchema.Type
```

Added in v2.0.0

## MultiAsset (type alias)

Type alias for MultiAsset representing a collection of native assets.
Each policy ID maps to a collection of asset names and their amounts.
All amounts must be positive (non-zero).

**Signature**

```ts
export type MultiAsset = typeof MultiAssetSchema.Type
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

## AssetMapSchema

Schema for inner asset map (asset_name => positive_coin).

**Signature**

```ts
export declare const AssetMapSchema: Schema.refine<
  Map<string & Brand<"AssetName">, bigint>,
  Schema.Map$<
    Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "AssetName">,
    Schema.refine<bigint, typeof Schema.BigIntFromSelf>
  >
>
```

Added in v2.0.0

## CBORBytesSchema

CBOR bytes transformation schema for MultiAsset.

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
    Schema.MapFromSelf<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
    >,
    Schema.SchemaClass<
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      never
    >,
    never
  >
>
```

Added in v2.0.0

## CBORHexSchema

CBOR hex transformation schema for MultiAsset.

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
      Schema.MapFromSelf<
        typeof Schema.Uint8ArrayFromSelf,
        Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
      >,
      Schema.SchemaClass<
        Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
        Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
        never
      >,
      never
    >
  >
>
```

Added in v2.0.0

## MultiAssetCDDLSchema

CDDL schema for MultiAsset.
multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}

**Signature**

```ts
export declare const MultiAssetCDDLSchema: Schema.transformOrFail<
  Schema.MapFromSelf<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>
  >,
  Schema.SchemaClass<
    Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
    Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
    never
  >,
  never
>
```

Added in v2.0.0

## MultiAssetSchema

Schema for MultiAsset representing native assets.
multiasset<a0> = {+ policy_id => {+ asset_name => a0}}
case: multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}

**Signature**

```ts
export declare const MultiAssetSchema: Schema.refine<
  Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
  Schema.MapFromSelf<
    Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "PolicyId">,
    Schema.refine<
      Map<string & Brand<"AssetName">, bigint>,
      Schema.Map$<
        Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "AssetName">,
        Schema.refine<bigint, typeof Schema.BigIntFromSelf>
      >
    >
  >
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
) => { _tag: "Some"; value: bigint } | { _tag: "None"; value?: undefined }
```

Added in v2.0.0

## getAssetsByPolicy

Get all assets for a specific policy ID.

**Signature**

```ts
export declare const getAssetsByPolicy: (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId
) => { _tag: "Some"; value: Map<string & Brand<"AssetName">, bigint> } | { _tag: "None"; value?: undefined }
```

Added in v2.0.0

## getPolicyIds

Get all policy IDs in a MultiAsset.

**Signature**

```ts
export declare const getPolicyIds: (multiAsset: MultiAsset) => IterableIterator<string & Brand<"PolicyId">>
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

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>) => any
    cborHex: (input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>) => string
  }
  Decode: {
    cborBytes: (input: any) => Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
    cborHex: (input: string) => Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
  }
  EncodeEffect: {
    cborBytes: (
      input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
    ) => Effect.Effect<any, InstanceType<typeof MultiAssetError>>
    cborHex: (
      input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
    ) => Effect.Effect<string, InstanceType<typeof MultiAssetError>>
  }
  DecodeEffect: {
    cborBytes: (
      input: any
    ) => Effect.Effect<
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      InstanceType<typeof MultiAssetError>
    >
    cborHex: (
      input: string
    ) => Effect.Effect<
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      InstanceType<typeof MultiAssetError>
    >
  }
  EncodeEither: {
    cborBytes: (
      input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
    ) => Either<any, InstanceType<typeof MultiAssetError>>
    cborHex: (
      input: Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>
    ) => Either<string, InstanceType<typeof MultiAssetError>>
  }
  DecodeEither: {
    cborBytes: (
      input: any
    ) => Either<
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      InstanceType<typeof MultiAssetError>
    >
    cborHex: (
      input: string
    ) => Either<
      Map<string & Brand<"PolicyId">, Map<string & Brand<"AssetName">, bigint>>,
      InstanceType<typeof MultiAssetError>
    >
  }
}
```
