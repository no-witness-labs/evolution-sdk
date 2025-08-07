import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

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
export const AssetMap = Schema.MapFromSelf({
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
export type AssetMap = typeof AssetMap.Type

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
export const MultiAsset = Schema.MapFromSelf({
  key: PolicyId.PolicyId,
  value: AssetMap
})
  .pipe(Schema.filter((map) => map.size > 0))
  .pipe(Schema.brand("MultiAsset"))
  .annotations({
    message: () => "MultiAsset cannot be empty",
    identifier: "MultiAsset",
    title: "Multi-Asset Collection",
    description: "A collection of native assets grouped by policy ID with positive amounts"
  })

/**
 * Type alias for MultiAsset representing a collection of native assets.
 * Each policy ID maps to a collection of asset names and their amounts.
 * All amounts must be positive (non-zero).
 *
 * @since 2.0.0
 * @category model
 */
export interface MultiAsset extends Schema.Schema.Type<typeof MultiAsset> {}

/**
 * Smart constructor for MultiAsset that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Schema.decodeSync(MultiAsset)

/**
 * Create an empty Map for building MultiAssets (note: empty maps will fail validation).
 * Use this only as a starting point for building a MultiAsset with add operations.
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
  return make(new Map([[policyId, assetMap]]))
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
    return make(result)
  } else {
    const newAssetMap = new Map([[assetName, amount]])
    const result = new Map(multiAsset)
    result.set(policyId, newAssetMap)
    return make(result)
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
    return amount !== undefined ? amount : undefined
  }
  return undefined
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
  return result !== undefined
}

/**
 * Get all policy IDs in a MultiAsset.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getPolicyIds = (multiAsset: MultiAsset): Array<PolicyId.PolicyId> => Array.from(multiAsset.keys())

/**
 * Get all assets for a specific policy ID.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getAssetsByPolicy = (multiAsset: MultiAsset, policyId: PolicyId.PolicyId) => {
  const assetMap = multiAsset.get(policyId)
  return assetMap !== undefined ? Array.from(assetMap.entries()) : []
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
export const is = (value: unknown): value is MultiAsset => Schema.is(MultiAsset)(value)

/**
 * Change generator to arbitrary and rename CBOR schemas.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.array(
  FastCheck.tuple(
    PolicyId.arbitrary,
    FastCheck.array(FastCheck.tuple(AssetName.arbitrary, PositiveCoin.arbitrary), { minLength: 1, maxLength: 5 }).map(
      (tokens) => new Map(tokens)
    )
  ),
  { minLength: 1, maxLength: 5 }
).map((entries) => make(new Map(entries)))

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
  Schema.typeSchema(MultiAsset),
  {
    strict: true,
    encode: (toI, _, __, toA) =>
      Eff.gen(function* () {
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
      Eff.gen(function* () {
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

        return yield* ParseResult.decode(MultiAsset)(result)
      })
  }
)

/**
 * CBOR bytes transformation schema for MultiAsset.
 * Transforms between CBOR bytes and MultiAsset using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    MultiAssetCDDLSchema // CBOR → MultiAsset
  ).annotations({
    identifier: "MultiAsset.FromCBORBytes",
    title: "MultiAsset from CBOR Bytes",
    description: "Transforms CBOR bytes to MultiAsset"
  })

/**
 * CBOR hex transformation schema for MultiAsset.
 * Transforms between CBOR hex string and MultiAsset using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → MultiAsset
  ).annotations({
    identifier: "MultiAsset.FromCBORHex",
    title: "MultiAsset from CBOR Hex",
    description: "Transforms CBOR hex string to MultiAsset"
  })

/**
 * Root Functions
 * ============================================================================
 */

/**
 * Parse MultiAsset from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): MultiAsset =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse MultiAsset from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): MultiAsset =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode MultiAsset to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (multiAsset: MultiAsset, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(multiAsset, options))

/**
 * Encode MultiAsset to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (multiAsset: MultiAsset, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(multiAsset, options))

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

  return make(result)
}

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse MultiAsset from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options?: CBOR.CodecOptions
  ): Eff.Effect<MultiAsset, MultiAssetError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new MultiAssetError({
            message: "Failed to parse MultiAsset from CBOR bytes",
            cause
          })
      )
    )

  /**
   * Parse MultiAsset from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Eff.Effect<MultiAsset, MultiAssetError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new MultiAssetError({
            message: "Failed to parse MultiAsset from CBOR hex",
            cause
          })
      )
    )

  /**
   * Encode MultiAsset to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    multiAsset: MultiAsset,
    options?: CBOR.CodecOptions
  ): Eff.Effect<Uint8Array, MultiAssetError> =>
    Schema.encode(FromCBORBytes(options))(multiAsset).pipe(
      Eff.mapError(
        (cause) =>
          new MultiAssetError({
            message: "Failed to encode MultiAsset to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Encode MultiAsset to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (multiAsset: MultiAsset, options?: CBOR.CodecOptions): Eff.Effect<string, MultiAssetError> =>
    Schema.encode(FromCBORHex(options))(multiAsset).pipe(
      Eff.mapError(
        (cause) =>
          new MultiAssetError({
            message: "Failed to encode MultiAsset to CBOR hex",
            cause
          })
      )
    )
}

// ============================================================================
