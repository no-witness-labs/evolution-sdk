import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
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
 * ```
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class Anchor extends Schema.Class<Anchor>("Anchor")({
  anchorUrl: Url.Url,
  anchorDataHash: Bytes32.BytesSchema
}) {}

export const CDDLSchema = Schema.Tuple(
  CBOR.Text, // anchor_url: url
  CBOR.ByteArray // anchor_data_hash: Bytes32
)

/**
 * CDDL schema for Anchor as tuple structure.
 * ```
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(CDDLSchema, Schema.typeSchema(Anchor), {
  strict: true,
  encode: (toA) => [toA.anchorUrl, toA.anchorDataHash] as const,
  decode: ([anchorUrl, anchorDataHash]) =>
    new Anchor({ anchorUrl: Url.make(anchorUrl), anchorDataHash }, { disableValidation: true }) // Disable validation since we already check types
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
export const make = (...args: ConstructorParameters<typeof Anchor>) => new Anchor(...args)

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
  anchorDataHash: FastCheck.uint8Array({ minLength: 32, maxLength: 32 })
}).map(({ anchorDataHash, anchorUrl }) => new Anchor({ anchorUrl, anchorDataHash }, { disableValidation: true })) // Disable validation since we already check length in FastCheck

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
  Function.makeDecodeSync(FromCBORBytes(options), AnchorError, "Anchor.fromCBORBytes")(bytes)

/**
 * Parse an Anchor from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Anchor =>
  Function.makeDecodeSync(FromCBORHex(options), AnchorError, "Anchor.fromCBORHex")(hex)

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
  Function.makeEncodeSync(FromCBORBytes(options), AnchorError, "Anchor.toCBORBytes")(value)

/**
 * Convert an Anchor to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: Anchor, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), AnchorError, "Anchor.toCBORHex")(value)

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse an Anchor from CBOR bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeDecodeEither(FromCBORBytes(options), AnchorError)(bytes)

  /**
   * Parse an Anchor from CBOR hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeDecodeEither(FromCBORHex(options), AnchorError)(hex)

  /**
   * Convert an Anchor to CBOR bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: Anchor, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeEncodeEither(FromCBORBytes(options), AnchorError)(value)

  /**
   * Convert an Anchor to CBOR hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: Anchor, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeEncodeEither(FromCBORHex(options), AnchorError)(value)
}
