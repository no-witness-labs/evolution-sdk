import { Data, Effect as Eff, FastCheck, Option, ParseResult, Schema } from "effect"

import * as AssetName from "./AssetName.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as MultiAsset from "./MultiAsset.js"
import * as PolicyId from "./PolicyId.js"
import * as PositiveCoin from "./PositiveCoin.js"

/**
 * Error class for Value related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ValueError extends Data.TaggedError("ValueError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Value representing both ADA and native assets.
 *
 * ```
 * value = coin / [coin, multiasset<positive_coin>]
 * ```
 *
 * This can be either:
 * 1. Just a coin amount (lovelace only)
 * 2. A tuple of [coin, multiasset] (lovelace + native assets)
 *
 * @since 2.0.0
 * @category schemas
 */
export class OnlyCoin extends Schema.TaggedClass<OnlyCoin>("OnlyCoin")("OnlyCoin", {
  coin: Coin.Coin
}) {}

export class WithAssets extends Schema.TaggedClass<WithAssets>("WithAssets")("WithAssets", {
  coin: Coin.Coin,
  assets: MultiAsset.MultiAsset
}) {}

export const Value = Schema.Union(OnlyCoin, WithAssets)
export type Value = typeof Value.Type

/**
 * Create a Value containing only ADA.
 *
 * @since 2.0.0
 * @category constructors
 */
export const onlyCoin = (ada: Coin.Coin) => new OnlyCoin({ coin: ada })

/**
 * Create a Value containing ADA and native assets.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withAssets = (ada: Coin.Coin, assets: MultiAsset.MultiAsset) => new WithAssets({ coin: ada, assets })

/**
 * Extract the ADA amount from a Value.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getAda = (value: Value): Coin.Coin => {
  return value.coin
}

/**
 * Extract the MultiAsset from a Value, if it exists.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getAssets = (value: Value): Option.Option<MultiAsset.MultiAsset> => {
  if (value._tag === "OnlyCoin") {
    return Option.none()
  } else {
    return Option.some(value.assets)
  }
}

/**
 * Check if a Value contains only ADA (no native assets).
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAdaOnly = (value: Value): value is OnlyCoin => value._tag === "OnlyCoin"

/**
 * Check if a Value contains native assets.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasAssets = (value: Value): value is WithAssets => value._tag === "WithAssets"

/**
 * Add two Values together.
 * Combines ADA amounts and merges MultiAssets.
 *
 * @since 2.0.0
 * @category transformation
 */
export const add = (a: Value, b: Value): Value => {
  const adaA = getAda(a)
  const adaB = getAda(b)
  const totalAda = Coin.add(adaA, adaB)

  const assetsA = getAssets(a)
  const assetsB = getAssets(b)

  if (Option.isNone(assetsA) && Option.isNone(assetsB)) {
    return onlyCoin(totalAda)
  }

  if (Option.isSome(assetsA) && Option.isNone(assetsB)) {
    return withAssets(totalAda, assetsA.value)
  }

  if (Option.isNone(assetsA) && Option.isSome(assetsB)) {
    return withAssets(totalAda, assetsB.value)
  }

  // Both have assets - merge them properly
  if (Option.isSome(assetsA) && Option.isSome(assetsB)) {
    const mergedAssets = MultiAsset.merge(assetsA.value, assetsB.value)
    return withAssets(totalAda, mergedAssets)
  }

  return onlyCoin(totalAda)
}

/**
 * Subtract Value b from Value a.
 * Subtracts ADA amounts and MultiAssets properly.
 *
 * @since 2.0.0
 * @category transformation
 */
export const subtract = (a: Value, b: Value): Value => {
  const adaA = getAda(a)
  const adaB = getAda(b)
  const resultAda = Coin.subtract(adaA, adaB)

  const assetsA = getAssets(a)
  const assetsB = getAssets(b)

  // Both are ADA-only
  if (Option.isNone(assetsA) && Option.isNone(assetsB)) {
    return onlyCoin(resultAda)
  }

  // a has assets, b doesn't - keep a's assets
  if (Option.isSome(assetsA) && Option.isNone(assetsB)) {
    return withAssets(resultAda, assetsA.value)
  }

  // a doesn't have assets, b does - this would result in negative assets, throw error
  if (Option.isNone(assetsA) && Option.isSome(assetsB)) {
    throw new ValueError({
      message: "Cannot subtract assets from Value with no assets"
    })
  }

  // Both have assets - subtract them properly
  if (Option.isSome(assetsA) && Option.isSome(assetsB)) {
    try {
      const subtractedAssets = MultiAsset.subtract(assetsA.value, assetsB.value)
      return withAssets(resultAda, subtractedAssets)
    } catch {
      // If subtraction results in empty MultiAsset, return ADA-only value
      return onlyCoin(resultAda)
    }
  }

  return onlyCoin(resultAda)
}

/**
 * Check if two Values are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Value, b: Value): boolean => {
  const adaEqual = Coin.equals(getAda(a), getAda(b))

  if (!adaEqual) return false

  const assetsA = getAssets(a)
  const assetsB = getAssets(b)

  if (Option.isNone(assetsA) && Option.isNone(assetsB)) {
    return true
  }

  if (Option.isSome(assetsA) && Option.isSome(assetsB)) {
    return MultiAsset.equals(assetsA.value, assetsB.value)
  }

  return false
}

/**
 * Check if a value is a valid Value.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = (value: unknown): value is Value => Schema.is(Value)(value)

/**
 * Generate a random Value.
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitrary = FastCheck.oneof(
  FastCheck.record({
    _tag: FastCheck.constant("OnlyCoin"),
    coin: Coin.arbitrary
  }),
  FastCheck.record({
    _tag: FastCheck.constant("WithAssets"),
    coin: Coin.arbitrary,
    assets: MultiAsset.arbitrary
  })
)

export const CDDLSchema = Schema.Union(
  CBOR.Integer,
  Schema.Tuple(
    CBOR.Integer,
    Schema.encodedSchema(
      MultiAsset.MultiAssetCDDLSchema // MultiAsset CDDL structure
    )
  )
)

/**
 * CDDL schema for Value as union structure.
 *
 * ```
 * value = coin / [coin, multiasset<positive_coin>]
 * ```
 *
 * This represents either:
 * - A single coin amount (for ADA-only values)
 * - An array with [coin, multiasset] (for values with native assets)
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Value), {
  strict: true,
  encode: (toI) =>
    Eff.gen(function* () {
      // expected encode result
      // readonly [bigint, readonly (readonly [Uint8Array<ArrayBufferLike>, readonly (readonly [Uint8Array<ArrayBufferLike>, bigint])[]])[]]
      if (toI._tag === "OnlyCoin") {
        // This is OnlyCoin, encode just the coin amount
        return toI.coin
      } else {
        // Value with assets (WithAssets)
        // Convert MultiAsset to raw Map data for CBOR encoding
        const outerMap = new Map<Uint8Array, Map<Uint8Array, bigint>>()

        for (const [policyId, assetMap] of toI.assets.entries()) {
          const policyIdBytes = yield* ParseResult.encode(PolicyId.FromBytes)(policyId)
          const innerMap = new Map<Uint8Array, bigint>()

          for (const [assetName, amount] of assetMap.entries()) {
            const assetNameBytes = yield* ParseResult.encode(AssetName.FromBytes)(assetName)
            innerMap.set(assetNameBytes, amount)
          }

          outerMap.set(policyIdBytes, innerMap)
        }

        return [toI.coin, outerMap] as const // Return as tuple
      }
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      if (typeof fromA === "bigint") {
        // ADA-only value - create OnlyCoin instance
        return new OnlyCoin({
          coin: Coin.make(fromA)
        })
      } else {
        // Value with assets [coin, multiasset]
        const [coinAmount, multiAssetCddl] = fromA

        // Convert from CDDL format to MultiAsset manually
        const result = new Map<PolicyId.PolicyId, MultiAsset.AssetMap>()

        for (const [policyIdBytes, assetMapCddl] of multiAssetCddl.entries()) {
          const policyId = yield* ParseResult.decode(PolicyId.FromBytes)(policyIdBytes)

          const assetMap = new Map<AssetName.AssetName, PositiveCoin.PositiveCoin>()
          for (const [assetNameBytes, amount] of assetMapCddl.entries()) {
            const assetName = yield* ParseResult.decode(AssetName.FromBytes)(assetNameBytes)
            const positiveCoin = PositiveCoin.make(amount)
            assetMap.set(assetName, positiveCoin)
          }

          result.set(policyId, assetMap)
        }

        return new WithAssets({
          coin: Coin.make(coinAmount),
          assets: MultiAsset.make(result)
        })
      }
    })
})

/**
 * TypeScript type for the raw CDDL representation.
 * This is what gets encoded/decoded to/from CBOR.
 *
 * @since 2.0.0
 * @category model
 */
export type ValueCDDL = typeof FromCDDL.Type

/**
 * CBOR bytes transformation schema for Value.
 * Transforms between CBOR bytes and Value using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Value
  ).annotations({
    identifier: "Value.FromCBORBytes",
    title: "Value from CBOR Bytes",
    description: "Transforms CBOR bytes to Value"
  })

/**
 * CBOR hex transformation schema for Value.
 * Transforms between CBOR hex string and Value using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Value
  ).annotations({
    identifier: "Value.FromCBORHex",
    title: "Value from CBOR Hex",
    description: "Transforms CBOR hex string to Value"
  })

/**
 * Legacy alias for FromCBORBytes - kept for backwards compatibility.
 *
 * @since 2.0.0
 * @category schemas
 * @deprecated Use FromCBORBytes instead
 */
export const FromBytes = FromCBORBytes

/**
 * Legacy alias for FromCBORHex - kept for backwards compatibility.
 *
 * @since 2.0.0
 * @category schemas
 * @deprecated Use FromCBORHex instead
 */
export const FromHex = FromCBORHex

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse Value from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Value =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse Value from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Value =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode Value to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: Value, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Encode Value to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: Value, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(value, options))

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
   * Parse Value from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Eff.Effect<Value, ValueError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause: unknown) =>
          new ValueError({
            message: "Failed to parse Value from CBOR bytes",
            cause
          })
      )
    )

  /**
   * Parse Value from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Eff.Effect<Value, ValueError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause: unknown) =>
          new ValueError({
            message: "Failed to parse Value from CBOR hex",
            cause
          })
      )
    )

  /**
   * Encode Value to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: Value, options?: CBOR.CodecOptions): Eff.Effect<Uint8Array, ValueError> =>
    Schema.encode(FromCBORBytes(options))(value).pipe(
      Eff.mapError(
        (cause: unknown) =>
          new ValueError({
            message: "Failed to encode Value to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Encode Value to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: Value, options?: CBOR.CodecOptions): Eff.Effect<string, ValueError> =>
    Schema.encode(FromCBORHex(options))(value).pipe(
      Eff.mapError(
        (cause: unknown) =>
          new ValueError({
            message: "Failed to encode Value to CBOR hex",
            cause
          })
      )
    )
}
