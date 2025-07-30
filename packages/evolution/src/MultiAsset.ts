import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as AssetName from "./AssetName.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as PolicyId from "./PolicyId.js"
import * as PositiveCoin from "./PositiveCoin.js"

/**
 * Error class for MultiAsset related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MultiAssetError extends Data.TaggedError("MultiAssetError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for inner asset map (asset_name => positive_coin).
 *
 * @since 2.0.0
 * @category schemas
 */
export const AssetMapSchema = Schema.Map({
  key: AssetName.AssetName,
  value: PositiveCoin.PositiveCoinSchema
})
  .pipe(Schema.filter((map) => map.size > 0))
  .annotations({
    message: () => "Asset map cannot be empty",
    identifier: "AssetMap"
  })

/**
 * Type alias for the inner asset map.
 *
 * @since 2.0.0
 * @category model
 */
export type AssetMap = typeof AssetMapSchema.Type

/**
 * Schema for MultiAsset representing native assets.
 *
 * ```
 * multiasset<a0> = {+ policy_id => {+ asset_name => a0}}
 * case: multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const MultiAssetSchema = Schema.MapFromSelf({
  key: PolicyId.PolicyId,
  value: AssetMapSchema
})
  .pipe(Schema.filter((map) => map.size > 0))
  .annotations({
    message: () => "MultiAsset cannot be empty",
    identifier: "MultiAsset"
  })

/**
 * Type alias for MultiAsset representing a collection of native assets.
 * Each policy ID maps to a collection of asset names and their amounts.
 * All amounts must be positive (non-zero).
 *
 * @since 2.0.0
 * @category model
 */
export type MultiAsset = typeof MultiAssetSchema.Type

/**
 * Create an empty MultiAsset (note: this will fail validation as MultiAsset cannot be empty).
 * Use this only as a starting point for building a MultiAsset.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): Map<PolicyId.PolicyId, AssetMap> => new Map()

/**
 * Create a MultiAsset from a single asset.
 *
 * @since 2.0.0
 * @category constructors
 */
export const singleton = (
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: PositiveCoin.PositiveCoin
): MultiAsset => {
  const assetMap = new Map([[assetName, amount]])
  return new Map([[policyId, assetMap]])
}

/**
 * Add an asset to a MultiAsset, combining amounts if the asset already exists.
 *
 * @since 2.0.0
 * @category transformation
 */
export const addAsset = (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: PositiveCoin.PositiveCoin
): MultiAsset => {
  const existingAssetMap = multiAsset.get(policyId)

  if (existingAssetMap !== undefined) {
    const existingAmount = existingAssetMap.get(assetName)
    const newAmount = existingAmount !== undefined ? PositiveCoin.add(existingAmount, amount) : amount

    const updatedAssetMap = new Map(existingAssetMap)
    updatedAssetMap.set(assetName, newAmount)

    const result = new Map(multiAsset)
    result.set(policyId, updatedAssetMap)
    return result
  } else {
    const newAssetMap = new Map([[assetName, amount]])
    const result = new Map(multiAsset)
    result.set(policyId, newAssetMap)
    return result
  }
}

/**
 * Get the amount of a specific asset from a MultiAsset.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getAsset = (multiAsset: MultiAsset, policyId: PolicyId.PolicyId, assetName: AssetName.AssetName) => {
  const assetMap = multiAsset.get(policyId)
  if (assetMap !== undefined) {
    const amount = assetMap.get(assetName)
    return amount !== undefined ? { _tag: "Some" as const, value: amount } : { _tag: "None" as const }
  }
  return { _tag: "None" as const }
}

/**
 * Check if a MultiAsset contains a specific asset.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasAsset = (
  multiAsset: MultiAsset,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName
): boolean => {
  const result = getAsset(multiAsset, policyId, assetName)
  return result._tag === "Some"
}

/**
 * Get all policy IDs in a MultiAsset.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getPolicyIds = (multiAsset: MultiAsset) => multiAsset.keys()

/**
 * Get all assets for a specific policy ID.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getAssetsByPolicy = (multiAsset: MultiAsset, policyId: PolicyId.PolicyId) => {
  const assetMap = multiAsset.get(policyId)
  return assetMap !== undefined ? { _tag: "Some" as const, value: assetMap } : { _tag: "None" as const }
}

/**
 * Check if two MultiAsset instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: MultiAsset, b: MultiAsset): boolean =>
  a.size === b.size &&
  Array.from(a.keys()).every((policyId) => {
    const aAssets = a.get(policyId)
    const bAssets = b.get(policyId)

    if ((aAssets === undefined) !== (bAssets === undefined)) return false
    if (aAssets === undefined) return true
    if (bAssets === undefined) return false

    return (
      aAssets.size === bAssets.size &&
      Array.from(aAssets.keys()).every((assetName) => {
        const aAmount = aAssets.get(assetName)
        const bAmount = bAssets.get(assetName)
        return aAmount === bAmount
      })
    )
  })

/**
 * Check if a value is a valid MultiAsset.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = (value: unknown): value is MultiAsset => Schema.is(MultiAssetSchema)(value)

/**
 * Generate a random MultiAsset.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.array(
  FastCheck.tuple(
    PolicyId.generator,
    FastCheck.array(FastCheck.tuple(AssetName.generator, PositiveCoin.generator), { minLength: 1, maxLength: 5 }).map(
      (assets) => new Map(assets)
    )
  ),
  { minLength: 1, maxLength: 3 }
).map((policies) => new Map(policies))

/**
 * CDDL schema for MultiAsset.
 *
 * ```
 * multiasset<positive_coin> = {+ policy_id => {+ asset_name => positive_coin}}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const MultiAssetCDDLSchema = Schema.transformOrFail(
  Schema.MapFromSelf({
    key: CBOR.ByteArray,
    value: Schema.MapFromSelf({
      key: CBOR.ByteArray,
      value: CBOR.Integer
    })
  }),
  Schema.typeSchema(MultiAssetSchema),
  {
    strict: true,
    encode: (toI, _, __, toA) =>
      Effect.gen(function* () {
        // Convert MultiAsset to raw Map data for CBOR encoding
        const outerMap = new Map<Uint8Array, Map<Uint8Array, bigint>>()

        for (const [policyId, assetMap] of toA.entries()) {
          const policyIdBytes = yield* ParseResult.encode(PolicyId.FromBytes)(policyId)
          const innerMap = new Map<Uint8Array, bigint>()

          for (const [assetName, amount] of assetMap.entries()) {
            const assetNameBytes = yield* ParseResult.encode(AssetName.FromBytes)(assetName)
            innerMap.set(assetNameBytes, amount)
          }

          outerMap.set(policyIdBytes, innerMap)
        }

        return outerMap
      }),

    decode: (fromA) =>
      Effect.gen(function* () {
        const result = new Map<PolicyId.PolicyId, AssetMap>()

        for (const [policyIdBytes, assetMapCddl] of fromA.entries()) {
          const policyId = yield* ParseResult.decode(PolicyId.FromBytes)(policyIdBytes)

          const assetMap = new Map<AssetName.AssetName, PositiveCoin.PositiveCoin>()
          for (const [assetNameBytes, amount] of assetMapCddl.entries()) {
            const assetName = yield* ParseResult.decode(AssetName.FromBytes)(assetNameBytes)
            const positiveCoin = PositiveCoin.make(amount)
            assetMap.set(assetName, positiveCoin)
          }

          result.set(policyId, assetMap)
        }

        return result
      })
  }
)

/**
 * CBOR bytes transformation schema for MultiAsset.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    MultiAssetCDDLSchema // CBOR → MultiAsset
  )

/**
 * CBOR hex transformation schema for MultiAsset.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → MultiAsset
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options)
    },
    MultiAssetError
  )

/**
 * Merge two MultiAsset instances, combining amounts for assets that exist in both.
 *
 * @since 2.0.0
 * @category transformation
 */
export const merge = (a: MultiAsset, b: MultiAsset): MultiAsset => {
  let result = a

  for (const [policyId, assetMap] of b.entries()) {
    for (const [assetName, amount] of assetMap.entries()) {
      result = addAsset(result, policyId, assetName, amount)
    }
  }

  return result
}

/**
 * Subtract MultiAsset b from MultiAsset a.
 * Returns a new MultiAsset with amounts reduced by the amounts in b.
 * If any asset would result in zero or negative amount, it's removed from the result.
 * If the result would be empty, an error is thrown since MultiAsset cannot be empty.
 *
 * @since 2.0.0
 * @category transformation
 */
export const subtract = (a: MultiAsset, b: MultiAsset): MultiAsset => {
  const result = new Map<PolicyId.PolicyId, AssetMap>()

  // Start with all assets from a
  for (const [policyId, assetMapA] of a.entries()) {
    const assetMapB = b.get(policyId)

    if (assetMapB === undefined) {
      // No assets to subtract for this policy, keep all
      result.set(policyId, assetMapA)
    } else {
      // Subtract assets for this policy
      const newAssetMap = new Map<AssetName.AssetName, PositiveCoin.PositiveCoin>()

      for (const [assetName, amountA] of assetMapA.entries()) {
        const amountB = assetMapB.get(assetName)

        if (amountB === undefined) {
          // No amount to subtract, keep the original
          newAssetMap.set(assetName, amountA)
        } else {
          // Subtract amounts
          const diff = amountA - amountB
          if (diff > 0n) {
            // Only keep positive amounts
            newAssetMap.set(assetName, PositiveCoin.make(diff))
          }
          // If diff <= 0, the asset is removed (not added to newAssetMap)
        }
      }

      // Only add the policy if it has remaining assets
      if (newAssetMap.size > 0) {
        result.set(policyId, newAssetMap)
      }
    }
  }

  // Check if result is empty
  if (result.size === 0) {
    throw new MultiAssetError({
      message: "Subtraction would result in empty MultiAsset"
    })
  }

  return result
}
