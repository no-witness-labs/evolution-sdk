import { Data, Effect, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"

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
  bytes: Schema.Uint8ArrayFromSelf
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
export const FromBytes = Schema.transform(Schema.Uint8ArrayFromSelf, ScriptRef, {
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
export const FromCDDL = Schema.transformOrFail(CBOR.tag(24, Schema.Uint8ArrayFromSelf), ScriptRef, {
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
}).map(
  (bytes) => new ScriptRef({ bytes }, { disableValidation: true }) // Disable validation since we generate random bytes
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
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): ScriptRef =>
  Function.makeDecodeSync(FromCBORBytes(options), ScriptRefError, "ScriptRef.fromCBORBytes")(bytes)

/**
 * Parse ScriptRef from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): ScriptRef =>
  Function.makeDecodeSync(FromCBORHex(options), ScriptRefError, "ScriptRef.fromCBORHex")(hex)

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
export const toCBORBytes = (value: ScriptRef, options?: CBOR.CodecOptions): Uint8Array =>
  Function.makeEncodeSync(FromCBORBytes(options), ScriptRefError, "ScriptRef.toCBORBytes")(value)

/**
 * Encode ScriptRef to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: ScriptRef, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), ScriptRefError, "ScriptRef.toCBORHex")(value)

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
  export const fromCBORBytes = (options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORBytes(options), ScriptRefError)

  /**
   * Parse ScriptRef from CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORHex(options), ScriptRefError)

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
  export const toCBORBytes = (options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORBytes(options), ScriptRefError)

  /**
   * Encode ScriptRef to CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORHex(options), ScriptRefError)
}
