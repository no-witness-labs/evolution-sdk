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
import { createEncoders } from "./Codec.js"
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
        return yield* ParseResult.decode(Header)({
          _tag: "Header",
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

export const Codec = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options)
    },
    HeaderError
  )
