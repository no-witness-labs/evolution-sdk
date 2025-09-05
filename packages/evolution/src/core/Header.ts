/**
 * Header module based on Conway CDDL specification
 *
 * CDDL: header = [header_body, body_signature : kes_signature]
 *
 * @since 2.0.0
 */
import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as HeaderBody from "./HeaderBody.js"
import * as KesSignature from "./KesSignature.js"

/**
 * Error class for Header operations
 *
 * @since 2.0.0
 * @category errors
 */
export class HeaderError extends Data.TaggedError("HeaderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Header implementation using HeaderBody and KesSignature
 *
 * CDDL: header = [header_body, body_signature : kes_signature]
 *
 * @since 2.0.0
 * @category model
 */
export class Header extends Schema.TaggedClass<Header>()("Header", {
  headerBody: HeaderBody.HeaderBody,
  bodySignature: KesSignature.KesSignature
}) {}

/**
 * Check if two Header instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Header, b: Header): boolean =>
  HeaderBody.equals(a.headerBody, b.headerBody) && KesSignature.equals(a.bodySignature, b.bodySignature)

/**
 * Predicate to check if a value is a Header instance.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isHeader = (value: unknown): value is Header => value instanceof Header

/**
 * CDDL schema for Header.
 * header = [header_body, body_signature : kes_signature]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    Schema.encodedSchema(HeaderBody.FromCDDL), // header_body using HeaderBody CDDL schema
    CBOR.ByteArray // body_signature as bytes
  ),
  Schema.typeSchema(Header),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const headerBodyCddl = yield* ParseResult.encode(HeaderBody.FromCDDL)(toA.headerBody)
        const bodySignatureBytes = yield* ParseResult.encode(KesSignature.FromBytes)(toA.bodySignature)
        return [headerBodyCddl, bodySignatureBytes] as const
      }),
    decode: ([headerBodyCddl, bodySignatureBytes]) =>
      Effect.gen(function* () {
        const headerBody = yield* ParseResult.decode(HeaderBody.FromCDDL)(headerBodyCddl)
        const bodySignature = yield* ParseResult.decode(KesSignature.FromBytes)(bodySignatureBytes)
        return new Header({
          headerBody,
          bodySignature
        })
      })
  }
)

/**
 * CBOR bytes transformation schema for Header.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Header
  )

/**
 * CBOR hex transformation schema for Header.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → Header
  )

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse a Header from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, HeaderError, "Header.fromCBORBytes")

/**
 * Parse a Header from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, HeaderError, "Header.fromCBORHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Header to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, HeaderError, "Header.toCBORBytes")

/**
 * Convert a Header to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, HeaderError, "Header.toCBORHex")

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse a Header from CBOR bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, HeaderError)

  /**
   * Parse a Header from CBOR hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, HeaderError)

  /**
   * Convert a Header to CBOR bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, HeaderError)

  /**
   * Convert a Header to CBOR hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, HeaderError)
}
