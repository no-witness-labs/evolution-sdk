import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
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
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    CBOR.Text, // url as CBOR text string
    CBOR.ByteArray // hash as CBOR byte string
  ),
  Schema.typeSchema(PoolMetadata),
  {
    strict: true,
    encode: (poolMetadata) => Eff.succeed([poolMetadata.url, poolMetadata.hash] as const),
    decode: ([urlText, hash]) =>
      Eff.gen(function* () {
        const url = yield* ParseResult.decode(Url.Url)(urlText)
        return new PoolMetadata({ url, hash })
      })
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
export namespace Effect {
  /**
   * Convert CBOR bytes to PoolMetadata using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(bytes),
      (cause) => new PoolMetadataError({ message: "Failed to decode from CBOR bytes", cause })
    )

  /**
   * Convert CBOR hex string to PoolMetadata using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(hex),
      (cause) => new PoolMetadataError({ message: "Failed to decode from CBOR hex", cause })
    )

  /**
   * Convert PoolMetadata to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (metadata: PoolMetadata, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(metadata),
      (cause) => new PoolMetadataError({ message: "Failed to encode to CBOR bytes", cause })
    )

  /**
   * Convert PoolMetadata to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (metadata: PoolMetadata, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(metadata),
      (cause) => new PoolMetadataError({ message: "Failed to encode to CBOR hex", cause })
    )
}

/**
 * Convert CBOR bytes to PoolMetadata (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): PoolMetadata =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Convert CBOR hex string to PoolMetadata (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): PoolMetadata =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Convert PoolMetadata to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (metadata: PoolMetadata, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(metadata, options))

/**
 * Convert PoolMetadata to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (metadata: PoolMetadata, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(metadata, options))
