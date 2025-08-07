import { Data, Effect as Eff, FastCheck, ParseResult, pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as Url from "./Url.js"

/**
 * Error class for Anchor related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AnchorError extends Data.TaggedError("AnchorError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Anchor representing an anchor with URL and data hash.
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 *
 * @since 2.0.0
 * @category schemas
 */
export class Anchor extends Schema.Class<Anchor>("Anchor")({
  anchorUrl: Url.Url,
  anchorDataHash: Bytes32.HexSchema
}) {}

export const CDDLSchema = Schema.Tuple(
  CBOR.Text, // anchor_url: url
  CBOR.ByteArray // anchor_data_hash: Bytes32
)

/**
 * CDDL schema for Anchor as tuple structure.
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Anchor), {
  strict: true,
  encode: (toA) =>
    pipe(
      ParseResult.encode(Bytes32.FromBytes)(toA.anchorDataHash),
      Eff.map((anchorDataHash) => [toA.anchorUrl, anchorDataHash] as const)
    ),
  decode: ([anchorUrl, anchorDataHash]) =>
    pipe(
      ParseResult.decode(Bytes32.FromBytes)(anchorDataHash),
      Eff.map(
        (anchorDataHash) =>
          new Anchor({
            anchorUrl: Url.make(anchorUrl),
            anchorDataHash
          })
      )
    )
})

/**
 * CBOR bytes transformation schema for Anchor.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Anchor
  )

/**
 * CBOR hex transformation schema for Anchor.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Anchor
  )

/**
 * Create an Anchor from a URL string and hash string.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (anchorUrl: string, anchorDataHash: string): Anchor =>
  new Anchor({
    anchorUrl: Url.make(anchorUrl),
    anchorDataHash
  })

/**
 * Check if two Anchor instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: Anchor, that: Anchor): boolean => {
  if (self.anchorUrl !== that.anchorUrl) return false
  if (self.anchorDataHash.length !== that.anchorDataHash.length) return false
  for (let i = 0; i < self.anchorDataHash.length; i++) {
    if (self.anchorDataHash[i] !== that.anchorDataHash[i]) return false
  }
  return true
}

/**
 * FastCheck arbitrary for Anchor instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.record({
  anchorUrl: Url.arbitrary,
  anchorDataHash: FastCheck.hexaString({
    minLength: Bytes32.HEX_LENGTH,
    maxLength: Bytes32.HEX_LENGTH
  })
}).map(
  ({ anchorDataHash, anchorUrl }) =>
    new Anchor({
      anchorUrl,
      anchorDataHash
    })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse an Anchor from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Anchor =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse an Anchor from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Anchor =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert an Anchor to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: Anchor, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Convert an Anchor to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: Anchor, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(value, options))

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 * Returns Effect<Success, Error> for composable error handling.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse an Anchor from CBOR bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(bytes),
      (error) => new AnchorError({ message: "Failed to decode Anchor from CBOR bytes", cause: error })
    )

  /**
   * Parse an Anchor from CBOR hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(hex),
      (error) => new AnchorError({ message: "Failed to decode Anchor from CBOR hex", cause: error })
    )

  /**
   * Convert an Anchor to CBOR bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: Anchor, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(value),
      (error) => new AnchorError({ message: "Failed to encode Anchor to CBOR bytes", cause: error })
    )

  /**
   * Convert an Anchor to CBOR hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: Anchor, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(value),
      (error) => new AnchorError({ message: "Failed to encode Anchor to CBOR hex", cause: error })
    )
}
