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
  encode: (toA) => [toA.anchorUrl.href, toA.anchorDataHash] as const,
  decode: ([anchorUrl, anchorDataHash]) => new Anchor({ anchorUrl: Url.make({ href: anchorUrl }), anchorDataHash })
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
  if (!Url.equals(self.anchorUrl, that.anchorUrl)) return false
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
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, AnchorError, "Anchor.fromCBORBytes")

/**
 * Parse an Anchor from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, AnchorError, "Anchor.fromCBORHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert an Anchor to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, AnchorError, "Anchor.toCBORBytes")

/**
 * Convert an Anchor to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, AnchorError, "Anchor.toCBORHex")

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
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, AnchorError)

  /**
   * Parse an Anchor from CBOR hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, AnchorError)

  /**
   * Convert an Anchor to CBOR bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, AnchorError)

  /**
   * Convert an Anchor to CBOR hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, AnchorError)
}
