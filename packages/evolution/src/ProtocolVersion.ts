import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for ProtocolVersion related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ProtocolVersionError extends Data.TaggedError("ProtocolVersionError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * ProtocolVersion class based on Conway CDDL specification
 *
 * CDDL: protocol_version = [major_version : uint32, minor_version : uint32]
 *
 * @since 2.0.0
 * @category model
 */
export class ProtocolVersion extends Schema.TaggedClass<ProtocolVersion>()("ProtocolVersion", {
  major: Numeric.Uint32Schema,
  minor: Numeric.Uint32Schema
}) {}

/**
 * Check if two ProtocolVersion instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ProtocolVersion, b: ProtocolVersion): boolean => a.major === b.major && a.minor === b.minor

/**
 * CDDL schema for ProtocolVersion.
 * protocol_version = [major_version : uint32, minor_version : uint32]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(CBOR.Integer, CBOR.Integer),
  Schema.typeSchema(ProtocolVersion),
  {
    strict: true,
    encode: (toA) => Effect.succeed([BigInt(toA.major), BigInt(toA.minor)] as const),
    decode: ([major, minor]) =>
      ParseResult.decode(ProtocolVersion)({
        _tag: "ProtocolVersion",
        major: Number(major),
        minor: Number(minor)
      })
  }
)

/**
 * CBOR bytes transformation schema for ProtocolVersion.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → ProtocolVersion
  )

/**
 * CBOR hex transformation schema for ProtocolVersion.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → ProtocolVersion
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      bytes: FromCBORBytes(options),
      variableBytes: FromCBORHex(options)
    },
    ProtocolVersionError
  )
