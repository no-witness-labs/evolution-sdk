import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

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
export const make = (props: { major: number; minor: number }): ProtocolVersion =>
  new ProtocolVersion({
    major: Numeric.Uint32Make(props.major),
    minor: Numeric.Uint32Make(props.minor)
  })

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
export const arbitrary = FastCheck.tuple(Numeric.Uint32Generator, Numeric.Uint32Generator).map(([major, minor]) =>
  make({ major, minor })
)

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
    encode: (toA) => Eff.succeed([BigInt(toA.major), BigInt(toA.minor)] as const),
    decode: ([major, minor]) =>
      ParseResult.decode(ProtocolVersion)({
        _tag: "ProtocolVersion",
        major: Number(major),
        minor: Number(minor)
      })
  }
).annotations({
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
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORBytes(options), ProtocolVersionError)(bytes)

  /**
   * Convert CBOR hex string to ProtocolVersion using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORHex(options), ProtocolVersionError)(hex)

  /**
   * Convert ProtocolVersion to CBOR bytes using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (value: ProtocolVersion, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORBytes(options), ProtocolVersionError)(value)

  /**
   * Convert ProtocolVersion to CBOR hex string using Either
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (value: ProtocolVersion, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORHex(options), ProtocolVersionError)(value)
}

/**
 * Convert CBOR bytes to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): ProtocolVersion =>
  Function.makeDecodeSync(FromCBORBytes(options), ProtocolVersionError, "ProtocolVersion.fromCBORBytes")(bytes)

/**
 * Convert CBOR hex string to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): ProtocolVersion =>
  Function.makeDecodeSync(FromCBORHex(options), ProtocolVersionError, "ProtocolVersion.fromCBORHex")(hex)

/**
 * Convert ProtocolVersion to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (value: ProtocolVersion, options?: CBOR.CodecOptions): Uint8Array =>
  Function.makeEncodeSync(FromCBORBytes(options), ProtocolVersionError, "ProtocolVersion.toCBORBytes")(value)

/**
 * Convert ProtocolVersion to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (value: ProtocolVersion, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), ProtocolVersionError, "ProtocolVersion.toCBORHex")(value)
