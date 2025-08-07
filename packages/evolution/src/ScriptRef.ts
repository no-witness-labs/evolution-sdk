import { Data, Effect, FastCheck, ParseResult, pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import { createEncoders } from "./Codec.js"

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
 * This is a branded hex string that represents the CBOR-encoded script bytes.
 * The script_ref uses CBOR tag 24 to indicate it contains CBOR-encoded script data.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ScriptRef = pipe(Bytes.HexSchema, Schema.brand("ScriptRef")).annotations({
  identifier: "ScriptRef"
})

export type ScriptRef = typeof ScriptRef.Type

/**
 * Schema for transforming from bytes to ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(
  Bytes.FromBytes, // Uint8Array -> hex string
  ScriptRef // hex string -> ScriptRef
).annotations({
  identifier: "ScriptRef.Bytes"
})

/**
 * Schema for transforming from hex to ScriptRef.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes.HexSchema, // string -> hex string
  ScriptRef // hex string -> ScriptRef
).annotations({
  identifier: "ScriptRef.Hex"
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
export const FromCDDL = Schema.transformOrFail(CBOR.Tag, ScriptRef, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Effect.gen(function* () {
      // Convert ScriptRef (hex string) to bytes for CBOR tag
      const bytes = yield* ParseResult.decode(Bytes.FromHex)(toA)
      return new CBOR.Tag({
        tag: 24, // tag 24 for CBOR script reference
        value: bytes
      })
    }),

  decode: (taggedValue, _, ast) =>
    Effect.gen(function* () {
      if (taggedValue.tag !== 24) {
        return yield* Effect.fail(
          new ParseResult.Type(ast, taggedValue, `Expected tag 24 for ScriptRef, got tag ${taggedValue.tag}`)
        )
      }

      if (!(taggedValue.value instanceof Uint8Array)) {
        return yield* Effect.fail(
          new ParseResult.Type(
            ast,
            taggedValue,
            `Expected Uint8Array for ScriptRef value, got ${typeof taggedValue.value}`
          )
        )
      }

      // Convert bytes to hex string for ScriptRef
      const hex = yield* ParseResult.encode(Bytes.FromHex)(taggedValue.value)
      return ScriptRef.make(hex)
    })
})

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
    identifier: "ScriptRef.CBORBytes"
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
    identifier: "ScriptRef.CBORHex"
  })

/**
 * Check if two ScriptRef instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptRef, b: ScriptRef): boolean => a === b

/**
 * Generate a random ScriptRef.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: 1,
  maxLength: 100
}).map((bytes) => Codec().Decode.bytes(bytes))

/**
 * Extended Codec with CBOR support for ScriptRef.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  createEncoders(
    {
      bytes: FromBytes,
      hex: FromHex,
      cborBytes: FromCBORBytes(options),
      cborHex: FromCBORHex(options)
    },
    ScriptRefError
  )
