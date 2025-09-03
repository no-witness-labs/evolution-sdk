import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
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
 * Smart constructor for creating ProtocolVersion instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ProtocolVersion>) => new ProtocolVersion(...args)

/**
 * Check if two ProtocolVersion instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ProtocolVersion, b: ProtocolVersion): boolean => a.major === b.major && a.minor === b.minor

/**
 * FastCheck arbitrary for generating random ProtocolVersion instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.tuple(Numeric.Uint32Arbitrary, Numeric.Uint32Arbitrary).map(([major, minor]) =>
  make({ major, minor })
)

export const CDDLSchema = Schema.Tuple(
  CBOR.Integer, // major_version as bigint
  CBOR.Integer // minor_version as bigint
)

/**
 * CDDL schema for ProtocolVersion.
 * protocol_version = [major_version : uint32, minor_version : uint32]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(CDDLSchema, Schema.typeSchema(ProtocolVersion), {
  strict: true,
  encode: (toA) => [toA.major, toA.minor] as const,
  decode: ([major, minor]) =>
    new ProtocolVersion(
      {
        major,
        minor
      },
      {
        disableValidation: true
      }
    )
}).annotations({
  identifier: "ProtocolVersion.FromCDDL",
  description: "Transforms CBOR structure to ProtocolVersion"
})

/**
 * CBOR bytes transformation schema for ProtocolVersion.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → ProtocolVersion
  ).annotations({
    identifier: "ProtocolVersion.FromCBORBytes",
    description: "Transforms CBOR bytes to ProtocolVersion"
  })

/**
 * CBOR hex transformation schema for ProtocolVersion.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → ProtocolVersion
  ).annotations({
    identifier: "ProtocolVersion.FromCBORHex",
    description: "Transforms CBOR hex string to ProtocolVersion"
  })

/**
 * Either namespace for ProtocolVersion operations that can fail
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Convert CBOR bytes to ProtocolVersion using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, ProtocolVersionError)

  /**
   * Convert CBOR hex string to ProtocolVersion using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, ProtocolVersionError)

  /**
   * Convert ProtocolVersion to CBOR bytes using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, ProtocolVersionError)

  /**
   * Convert ProtocolVersion to CBOR hex string using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, ProtocolVersionError)
}

/**
 * Convert CBOR bytes to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  ProtocolVersionError,
  "ProtocolVersion.fromCBORBytes"
)

/**
 * Convert CBOR hex string to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, ProtocolVersionError, "ProtocolVersion.fromCBORHex")

/**
 * Convert ProtocolVersion to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, ProtocolVersionError, "ProtocolVersion.toCBORBytes")

/**
 * Convert ProtocolVersion to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, ProtocolVersionError, "ProtocolVersion.toCBORHex")
