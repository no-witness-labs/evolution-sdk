import { Data, Effect, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Script from "./Script.js"

/**
 * Error class for ScriptRef related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptRefError extends Data.TaggedError("ScriptRefError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for ScriptRef representing a reference to a script in a transaction output.
 *
 * ```
 * CDDL: script_ref = #6.24(bytes .cbor script)
 * ```
 *
 * This represents the CBOR-encoded script bytes.
 * The script_ref uses CBOR tag 24 to indicate it contains CBOR-encoded script data.
 *
 * @since 2.0.0
 * @category schemas
 */
export class ScriptRef extends Schema.TaggedClass<ScriptRef>()("ScriptRef", {
  bytes: Schema.Uint8ArrayFromHex.pipe(Schema.filter((b) => b.length > 0))
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return toHex(this)
  }
}

/**
 * Schema for transforming from bytes to ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.Uint8ArrayFromSelf, Schema.typeSchema(ScriptRef), {
  strict: true,
  decode: (bytes) => new ScriptRef({ bytes }, { disableValidation: true }),
  encode: (s) => s.bytes
}).annotations({
  identifier: "ScriptRef.FromBytes"
})

/**
 * Schema for transforming from hex to ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes.FromHex, // string -> Uint8Array
  FromBytes // Uint8Array -> ScriptRef
).annotations({
  identifier: "ScriptRef.FromHex"
})

export const CDDLSchema = CBOR.tag(24, Schema.Uint8ArrayFromSelf)

/**
 * CDDL schema for ScriptRef following the Conway specification.
 *
 * ```
 * script_ref = #6.24(bytes .cbor script)
 * ```
 *
 * This transforms between CBOR tag 24 structure and ScriptRef model.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(ScriptRef), {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.succeed({
      _tag: "Tag" as const,
      tag: 24 as const,
      value: toA.bytes // Use the bytes directly
    }),
  decode: (taggedValue) => Effect.succeed(new ScriptRef({ bytes: taggedValue.value }, { disableValidation: true }))
})

/**
 * Smart constructor for ScriptRef.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ScriptRef>) => new ScriptRef(...args)

/**
 * Check if two ScriptRef instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptRef, b: ScriptRef): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * CBOR bytes transformation schema for ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → ScriptRef
  ).annotations({
    identifier: "ScriptRef.FromCBORBytes"
  })

/**
 * CBOR hex transformation schema for ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → ScriptRef
  ).annotations({
    identifier: "ScriptRef.FromCBORHex"
  })

/**
 * FastCheck arbitrary for generating random ScriptRef instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: 1,
  maxLength: 100
}).chain(() =>
  // Generate a valid Script first, then CBOR-encode it and wrap in tag(24) bytes
  Script.arbitrary.map((script) => {
    // Encode Script -> CDDL tuple
    const cddl = E.getOrThrow(ParseResult.encodeEither(Script.FromCDDL)(script))
    // Encode CDDL (CBOR value) -> bytes using canonical options compatible with CML
    const bytes = E.getOrThrow(ParseResult.encodeEither(CBOR.FromBytes(CBOR.CML_DEFAULT_OPTIONS))(cddl))
    return new ScriptRef({ bytes }, { disableValidation: true })
  })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse ScriptRef from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, ScriptRefError, "ScriptRef.fromBytes")

/**
 * Parse ScriptRef from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, ScriptRefError, "ScriptRef.fromHex")

/**
 * Parse ScriptRef from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, ScriptRefError, "ScriptRef.fromCBORBytes")

/**
 * Parse ScriptRef from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, ScriptRefError, "ScriptRef.fromCBORHex")

/**
 * Encode ScriptRef to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, ScriptRefError, "ScriptRef.toBytes")

/**
 * Encode ScriptRef to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, ScriptRefError, "ScriptRef.toHex")

/**
 * Encode ScriptRef to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, ScriptRefError, "ScriptRef.toCBORBytes")

/**
 * Encode ScriptRef to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, ScriptRefError, "ScriptRef.toCBORHex")

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse ScriptRef from bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, ScriptRefError)

  /**
   * Parse ScriptRef from hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, ScriptRefError)

  /**
   * Parse ScriptRef from CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, ScriptRefError)

  /**
   * Parse ScriptRef from CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, ScriptRefError)

  /**
   * Encode ScriptRef to bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, ScriptRefError)

  /**
   * Encode ScriptRef to hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, ScriptRefError)

  /**
   * Encode ScriptRef to CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, ScriptRefError)

  /**
   * Encode ScriptRef to CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, ScriptRefError)
}
