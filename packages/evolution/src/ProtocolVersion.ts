import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
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
export const make = (props: {
  major: number
  minor: number
}): ProtocolVersion => new ProtocolVersion({
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
export const arbitrary = FastCheck.tuple(
  Numeric.Uint32Generator,
  Numeric.Uint32Generator
).map(([major, minor]) => make({ major, minor }))

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
 * Effect namespace for ProtocolVersion operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Convert CBOR bytes to ProtocolVersion using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(bytes),
      (cause) => new ProtocolVersionError({ message: "Failed to decode from CBOR bytes", cause })
    )

  /**
   * Convert CBOR hex string to ProtocolVersion using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(hex),
      (cause) => new ProtocolVersionError({ message: "Failed to decode from CBOR hex", cause })
    )

  /**
   * Convert ProtocolVersion to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (version: ProtocolVersion, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(version),
      (cause) => new ProtocolVersionError({ message: "Failed to encode to CBOR bytes", cause })
    )

  /**
   * Convert ProtocolVersion to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (version: ProtocolVersion, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(version),
      (cause) => new ProtocolVersionError({ message: "Failed to encode to CBOR hex", cause })
    )
}

/**
 * Convert CBOR bytes to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): ProtocolVersion =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Convert CBOR hex string to ProtocolVersion (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): ProtocolVersion =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Convert ProtocolVersion to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (version: ProtocolVersion, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(version, options))

/**
 * Convert ProtocolVersion to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (version: ProtocolVersion, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(version, options))
