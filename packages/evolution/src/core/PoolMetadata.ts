import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Url from "./Url.js"

/**
 * Error class for PoolMetadata related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PoolMetadataError extends Data.TaggedError("PoolMetadataError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for PoolMetadata representing pool metadata information.
 * pool_metadata = [url, bytes]
 *
 * @since 2.0.0
 * @category model
 */
export class PoolMetadata extends Schema.TaggedClass<PoolMetadata>()("PoolMetadata", {
  url: Url.Url,
  hash: Schema.Uint8ArrayFromSelf
}) {}

/**
 * CDDL schema for PoolMetadata as defined in the specification:
 * pool_metadata = [url, bytes]
 *
 * Transforms between CBOR tuple structure and PoolMetadata model.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(
  Schema.Tuple(
    CBOR.Text, // url as CBOR text string
    CBOR.ByteArray // hash as CBOR byte string
  ),
  Schema.typeSchema(PoolMetadata),
  {
    strict: true,
    encode: (poolMetadata) => [poolMetadata.url.href, poolMetadata.hash] as const,
    decode: ([urlText, hash]) => {
      const url = Url.Url.make({
        href: urlText
      })
      return new PoolMetadata({ url, hash })
    }
  }
).annotations({
  identifier: "PoolMetadata.FromCDDL",
  description: "Transforms CBOR structure to PoolMetadata"
})

/**
 * Smart constructor for creating PoolMetadata instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (props: { url: Url.Url; hash: Uint8Array }): PoolMetadata => new PoolMetadata(props)

/**
 * Check if two PoolMetadata instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PoolMetadata, b: PoolMetadata): boolean =>
  a.url === b.url && a.hash.every((byte, index) => byte === b.hash[index])

/**
 * FastCheck arbitrary for generating random PoolMetadata instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.record({
  url: Url.arbitrary,
  hash: FastCheck.uint8Array({ minLength: 32, maxLength: 32 })
}).map(make)

/**
 * CBOR bytes transformation schema for PoolMetadata.
 * Transforms between Uint8Array and PoolMetadata using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → PoolMetadata
  ).annotations({
    identifier: "PoolMetadata.FromCBORBytes",
    description: "Transforms CBOR bytes to PoolMetadata"
  })

/**
 * CBOR hex transformation schema for PoolMetadata.
 * Transforms between hex string and PoolMetadata using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → PoolMetadata
  ).annotations({
    identifier: "PoolMetadata.FromCBORHex",
    description: "Transforms CBOR hex string to PoolMetadata"
  })

/**
 * Effect namespace for PoolMetadata operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Convert CBOR bytes to PoolMetadata using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, PoolMetadataError)

  /**
   * Convert CBOR hex string to PoolMetadata using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, PoolMetadataError)

  /**
   * Convert PoolMetadata to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, PoolMetadataError)

  /**
   * Convert PoolMetadata to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, PoolMetadataError)
}

/**
 * Convert CBOR bytes to PoolMetadata (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, PoolMetadataError, "PoolMetadata.fromCBORBytes")

/**
 * Convert CBOR hex string to PoolMetadata (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, PoolMetadataError, "PoolMetadata.fromCBORHex")

/**
 * Convert PoolMetadata to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, PoolMetadataError, "PoolMetadata.toCBORBytes")

/**
 * Convert PoolMetadata to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, PoolMetadataError, "PoolMetadata.toCBORHex")
