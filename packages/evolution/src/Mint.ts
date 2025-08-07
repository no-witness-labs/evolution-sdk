import { Data, Effect as Eff, Equal, FastCheck, ParseResult, Schema } from "effect"

import * as AssetName from "./AssetName.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as NonZeroInt64 from "./NonZeroInt64.js"
import * as PolicyId from "./PolicyId.js"

/**
 * Error class for Mint related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MintError extends Data.TaggedError("MintError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for inner asset map
 * ```
 * (asset_name => nonZeroInt64).
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const AssetMap = Schema.MapFromSelf({
  key: AssetName.AssetName,
  value: NonZeroInt64.NonZeroInt64
}).annotations({
  identifier: "AssetMap"
})

export type AssetMap = typeof AssetMap.Type

/**
 * Schema for Mint representing token minting/burning operations.
 * ```
 * mint = multiasset<nonZeroInt64>
 *
 * The structure is: policy_id => { asset_name => nonZeroInt64 }
 * - Positive values represent minting
 * - Negative values represent burning
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const Mint = Schema.MapFromSelf({
  key: PolicyId.PolicyId,
  value: AssetMap
})
  .pipe(Schema.brand("Mint"))
  .annotations({
    identifier: "Mint",
    title: "Token Mint Operations",
    description: "A collection of token minting/burning operations grouped by policy ID"
  })

/**
 * Type alias for Mint representing a collection of minting/burning operations.
 * Each policy ID maps to a collection of asset names and their amounts.
 * Positive amounts indicate minting, negative amounts indicate burning.
 *
 * @since 2.0.0
 * @category model
 */
export type Mint = typeof Mint.Type

/**
 * Check if a value is a valid Mint.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Mint)

/**
 * Create empty Mint.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): Mint => new Map<PolicyId.PolicyId, AssetMap>() as Mint

/**
 * Create Mint from a single policy and asset entry.
 *
 * @since 2.0.0
 * @category constructors
 */
export const singleton = (
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: NonZeroInt64.NonZeroInt64
): Mint => {
  const assetMap = new Map([[assetName, amount]])
  return new Map([[policyId, assetMap]]) as Mint
}

/**
 * Create Mint from entries array.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromEntries = (
  entries: Array<[PolicyId.PolicyId, Array<[AssetName.AssetName, NonZeroInt64.NonZeroInt64]>]>
): Mint => {
  return new Map(entries.map(([policyId, assetEntries]) => [policyId, new Map(assetEntries)])) as Mint
}

/**
 * Add or update an asset in the Mint.
 *
 * @since 2.0.0
 * @category transformation
 */
export const insert = (
  mint: Mint,
  policyId: PolicyId.PolicyId,
  assetName: AssetName.AssetName,
  amount: NonZeroInt64.NonZeroInt64
): Mint => {
  // Get existing asset map or create empty one
  const existingAssetMap = mint.get(policyId)
  const assetMap =
    existingAssetMap !== undefined ? new Map(existingAssetMap).set(assetName, amount) : new Map([[assetName, amount]])

  const result = new Map(mint)
  result.set(policyId, assetMap)
  return result as Mint
}

/**
 * Remove an asset from the Mint.
 *
 * @since 2.0.0
 * @category transformation
 */
export const removePolicy = (mint: Mint, policyId: PolicyId.PolicyId): Mint => {
  const result = new Map(mint)
  result.delete(policyId)
  return result as Mint
}

export const removeAsset = (mint: Mint, policyId: PolicyId.PolicyId, assetName: AssetName.AssetName): Mint => {
  const assets = mint.get(policyId)
  if (assets === undefined) {
    return mint // No assets for this policy, nothing to remove
  }
  const updatedAssets = new Map(assets)
  updatedAssets.delete(assetName)

  if (updatedAssets.size === 0) {
    // If no assets left, remove the policyId entry
    const result = new Map(mint)
    result.delete(policyId)
    return result as Mint
  }

  const result = new Map(mint)
  result.set(policyId, updatedAssets)
  return result as Mint
}

/**
 * Get the amount for a specific policy and asset.
 *
 * @since 2.0.0
 * @category transformation
 */
export const get = (mint: Mint, policyId: PolicyId.PolicyId, assetName: AssetName.AssetName) => {
  const assets = mint.get(policyId)
  if (assets === undefined) {
    return undefined
  }
  const amount = assets.get(assetName)
  if (amount === undefined) {
    return undefined
  }
  return amount
}

/**
 * Check if Mint contains a specific policy and asset.
 *
 * @since 2.0.0
 * @category predicates
 */
export const has = (mint: Mint, policyId: PolicyId.PolicyId, assetName: AssetName.AssetName): boolean =>
  get(mint, policyId, assetName) !== undefined

/**
 * Check if Mint is empty.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isEmpty = (mint: Mint): boolean => mint.size === 0

/**
 * Get the number of policies in the Mint.
 *
 * @since 2.0.0
 * @category transformation
 */
export const policyCount = (mint: Mint): number => mint.size

/**
 * Check if two Mint instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: Mint, that: Mint): boolean => Equal.equals(self, that)

export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.ByteArray, // Policy ID as Uint8Array (28 bytes)
  value: Schema.MapFromSelf({
    key: CBOR.ByteArray, // Asset name as Uint8Array (variable length)
    value: CBOR.Integer // Amount as number (will be converted to NonZeroInt64)
  })
})

/**
 * CDDL schema for Mint as map structure.
 * ```
 * mint = {* policy_id => {* asset_name => nonZeroInt64}}
 * ```
 *
 * Where:
 * - policy_id: 28-byte Uint8Array (from CBOR byte string)
 * - asset_name: variable-length Uint8Array (from CBOR byte string, can be empty)
 * - nonZeroInt64: signed 64-bit integer (positive = mint, negative = burn, cannot be zero)
 *
 * @since 2.0.0
 * @category schemas
 */
export const MintCDDLSchema = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Mint), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      // Convert Mint to raw Map data for CBOR encoding
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
      const mint = empty()

      for (const [policyIdBytes, assetMapCddl] of fromA.entries()) {
        const policyId = yield* ParseResult.decode(PolicyId.FromBytes)(policyIdBytes)

        const assetMap = new Map<AssetName.AssetName, NonZeroInt64.NonZeroInt64>()
        for (const [assetNameBytes, amount] of assetMapCddl.entries()) {
          const assetName = yield* ParseResult.decode(AssetName.FromBytes)(assetNameBytes)
          const nonZeroAmount = yield* ParseResult.decode(NonZeroInt64.NonZeroInt64)(amount)

          assetMap.set(assetName, nonZeroAmount)
        }

        mint.set(policyId, assetMap)
      }

      return mint
    })
})

/**
 * CBOR bytes transformation schema for Mint.
 * Transforms between CBOR bytes and Mint using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    MintCDDLSchema // CBOR → Mint
  ).annotations({
    identifier: "Mint.FromCBORBytes",
    title: "Mint from CBOR Bytes",
    description: "Transforms CBOR bytes to Mint"
  })

/**
 * CBOR hex transformation schema for Mint.
 * Transforms between CBOR hex string and Mint using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Mint
  ).annotations({
    identifier: "Mint.FromCBORHex",
    title: "Mint from CBOR Hex",
    description: "Transforms CBOR hex string to Mint"
  })

/**
 * FastCheck arbitrary for generating random Mint instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.array(
  FastCheck.tuple(
    PolicyId.arbitrary,
    FastCheck.array(FastCheck.tuple(AssetName.arbitrary, NonZeroInt64.arbitrary.map(NonZeroInt64.make)), {
      minLength: 1,
      maxLength: 5
    })
  ),
  { minLength: 0, maxLength: 5 }
).map((entries) => fromEntries(entries))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Mint from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Mint =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse Mint from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Mint =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode Mint to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (mint: Mint, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(mint, options))

/**
 * Encode Mint to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (mint: Mint, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(mint, options))

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
   * Parse Mint from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Eff.Effect<Mint, MintError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new MintError({
            message: "Failed to parse Mint from CBOR bytes",
            cause
          })
      )
    )

  /**
   * Parse Mint from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Eff.Effect<Mint, MintError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new MintError({
            message: "Failed to parse Mint from CBOR hex",
            cause
          })
      )
    )

  /**
   * Encode Mint to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (mint: Mint, options?: CBOR.CodecOptions): Eff.Effect<Uint8Array, MintError> =>
    Schema.encode(FromCBORBytes(options))(mint).pipe(
      Eff.mapError(
        (cause) =>
          new MintError({
            message: "Failed to encode Mint to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Encode Mint to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (mint: Mint, options?: CBOR.CodecOptions): Eff.Effect<string, MintError> =>
    Schema.encode(FromCBORHex(options))(mint).pipe(
      Eff.mapError(
        (cause) =>
          new MintError({
            message: "Failed to encode Mint to CBOR hex",
            cause
          })
      )
    )
}
