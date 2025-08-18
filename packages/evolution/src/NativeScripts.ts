import { Data, Either as E, ParseResult, Schema } from "effect"
import type { ParseIssue } from "effect/ParseResult"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"

/**
 * Error class for Native script related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NativeError extends Data.TaggedError("NativeError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Type representing a native script following cardano-cli JSON syntax.
 *
 * @since 2.0.0
 * @category model
 */
export type Native =
  | {
      type: "sig"
      keyHash: string
    }
  | {
      type: "before"
      slot: number
    }
  | {
      type: "after"
      slot: number
    }
  | {
      type: "all"
      scripts: ReadonlyArray<Native>
    }
  | {
      type: "any"
      scripts: ReadonlyArray<Native>
    }
  | {
      type: "atLeast"
      required: number
      scripts: ReadonlyArray<Native>
    }

/**
 * Represents a cardano-cli JSON script syntax
 *
 * Native type follows the standard described in the
 * link https://github.com/IntersectMBO/cardano-node/blob/1.26.1-with-cardano-cli/doc/reference/simple-scripts.md#json-script-syntax JSON script syntax documentation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NativeSchema: Schema.Schema<Native> = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("sig"),
    keyHash: Schema.String
  }),
  Schema.Struct({
    type: Schema.Literal("before"),
    slot: Schema.Number
  }),
  Schema.Struct({
    type: Schema.Literal("after"),
    slot: Schema.Number
  }),
  Schema.Struct({
    type: Schema.Literal("all"),
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<Native> => NativeSchema))
  }),
  Schema.Struct({
    type: Schema.Literal("any"),
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<Native> => NativeSchema))
  }),
  Schema.Struct({
    type: Schema.Literal("atLeast"),
    required: Schema.Number,
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<Native> => NativeSchema))
  })
).annotations({
  identifier: "Native",
  title: "Native Script",
  description: "A native script following cardano-cli JSON syntax"
})

export const Native = NativeSchema

/**
 * Smart constructor for Native that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (native: Native): Native => native

/**
 * CDDL schemas for native scripts.
 *
 * These schemas define the CBOR encoding format for native scripts according to the CDDL specification:
 *
 * - script_pubkey = (0, addr_keyhash)
 * - script_all = (1, [* native_script])
 * - script_any = (2, [* native_script])
 * - script_n_of_k = (3, n : int64, [* native_script])
 * - invalid_before = (4, slot_no)
 * - invalid_hereafter = (5, slot_no)
 * - slot_no = uint .size 8
 *
 * @since 2.0.0
 * @category schemas
 */

const ScriptPubKeyCDDL = Schema.Tuple(Schema.Literal(0n), Schema.Uint8ArrayFromSelf)

const ScriptAllCDDL = Schema.Tuple(
  Schema.Literal(1n),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeCDDL> => Schema.encodedSchema(FromCDDL)))
)

const ScriptAnyCDDL = Schema.Tuple(
  Schema.Literal(2n),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeCDDL> => Schema.encodedSchema(FromCDDL)))
)

const ScriptNOfKCDDL = Schema.Tuple(
  Schema.Literal(3n),
  CBOR.Integer,
  Schema.Array(Schema.suspend((): Schema.Schema<NativeCDDL> => Schema.encodedSchema(FromCDDL)))
)

const InvalidBeforeCDDL = Schema.Tuple(Schema.Literal(4n), CBOR.Integer)

const InvalidHereafterCDDL = Schema.Tuple(Schema.Literal(5n), CBOR.Integer)

/**
 * CDDL representation of a native script as a union of tuple types.
 *
 * This type represents the low-level CBOR structure of native scripts,
 * where each variant is encoded as a tagged tuple.
 *
 * @since 2.0.0
 * @category model
 */
export type NativeCDDL =
  | readonly [0n, Uint8Array]
  | readonly [1n, ReadonlyArray<NativeCDDL>]
  | readonly [2n, ReadonlyArray<NativeCDDL>]
  | readonly [3n, bigint, ReadonlyArray<NativeCDDL>]
  | readonly [4n, bigint]
  | readonly [5n, bigint]

export const CDDLSchema = Schema.Union(
  ScriptPubKeyCDDL,
  ScriptAllCDDL,
  ScriptAnyCDDL,
  ScriptNOfKCDDL,
  InvalidBeforeCDDL,
  InvalidHereafterCDDL
)

/**
 * Schema for NativeCDDL union type.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Native), {
  strict: true,
  encode: (native) => internalEncodeCDDL(native),
  decode: (cborTuple) => internalDecodeCDDL(cborTuple)
})

/**
 * Convert a Native to its CDDL representation.
 *
 * @since 2.0.0
 * @category encoding
 */
export const internalEncodeCDDL = (native: Native): E.Either<NativeCDDL, ParseIssue> =>
  E.gen(function* () {
    switch (native.type) {
      case "sig": {
        // Convert hex string keyHash to bytes for CBOR encoding
        const keyHashBytes = yield* ParseResult.decodeEither(Bytes.FromHex)(native.keyHash)
        return [0n, keyHashBytes] as const
      }
      case "all": {
        const scriptResults: Array<NativeCDDL> = []
        for (const script of native.scripts) {
          const encoded = yield* internalEncodeCDDL(script)
          scriptResults.push(encoded)
        }
        return [1n, scriptResults] as const
      }
      case "any": {
        const scriptResults: Array<NativeCDDL> = []
        for (const script of native.scripts) {
          const encoded = yield* internalEncodeCDDL(script)
          scriptResults.push(encoded)
        }
        return [2n, scriptResults] as const
      }
      case "atLeast": {
        const scriptResults: Array<NativeCDDL> = []
        for (const script of native.scripts) {
          const encoded = yield* internalEncodeCDDL(script)
          scriptResults.push(encoded)
        }
        return [3n, BigInt(native.required), scriptResults] as const
      }
      case "before": {
        return [4n, BigInt(native.slot)] as const
      }
      case "after": {
        return [5n, BigInt(native.slot)] as const
      }
    }
  })

/**
 * Convert a CDDL representation back to a Native.
 *
 * This function recursively decodes nested CBOR scripts and constructs
 * the appropriate Native instances.
 *
 * @since 2.0.0
 * @category decoding
 */
export const internalDecodeCDDL = (cborTuple: NativeCDDL): E.Either<Native, ParseIssue> =>
  E.gen(function* () {
    switch (cborTuple[0]) {
      case 0n: {
        // sig: [0, keyHash_bytes] - convert bytes back to hex string
        const [, keyHashBytes] = cborTuple
        const keyHash = yield* ParseResult.encodeEither(Bytes.FromHex)(keyHashBytes)
        return {
          type: "sig" as const,
          keyHash
        }
      }
      case 1n: {
        // all: [1, [native_script, ...]]
        const [, scriptCBORs] = cborTuple
        const scripts: Array<Native> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return {
          type: "all" as const,
          scripts
        }
      }
      case 2n: {
        // any: [2, [native_script, ...]]
        const [, scriptCBORs] = cborTuple
        const scripts: Array<Native> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return {
          type: "any" as const,
          scripts
        }
      }
      case 3n: {
        // atLeast: [3, required, [native_script, ...]]
        const [, required, scriptCBORs] = cborTuple
        const scripts: Array<Native> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return {
          type: "atLeast" as const,
          required: Number(required),
          scripts
        }
      }
      case 4n: {
        // before: [4, slot]
        const [, slot] = cborTuple
        return {
          type: "before" as const,
          slot: Number(slot)
        }
      }
      case 5n: {
        // after: [5, slot]
        const [, slot] = cborTuple
        return {
          type: "after" as const,
          slot: Number(slot)
        }
      }
      default:
        // This should never happen with proper CBOR validation
        return yield* E.left(new ParseResult.Type(Schema.Literal(0, 1, 2, 3, 4, 5).ast, cborTuple[0]))
    }
  })

/**
 * CBOR bytes transformation schema for Native.
 * Transforms between CBOR bytes and Native using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Native
  ).annotations({
    identifier: "Native.FromCBORBytes",
    title: "Native from CBOR Bytes",
    description: "Transforms CBOR bytes to Native"
  })

/**
 * CBOR hex transformation schema for Native.
 * Transforms between CBOR hex string and Native using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Native
  ).annotations({
    identifier: "Native.FromCBORHex",
    title: "Native from CBOR Hex",
    description: "Transforms CBOR hex string to Native"
  })

/**
 * Root Functions
 * ============================================================================
 */

/**
 * Parse Native from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, NativeError, "NativeScripts.fromCBORBytes")

/**
 * Parse Native from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Native =>
  E.getOrThrow(Either.fromCBORHex(hex, options))

/**
 * Encode Native to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, NativeError, "Native.toCBORBytes")

/**
 * Encode Native to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, NativeError, "Native.toCBORHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse Native from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, NativeError)

  /**
   * Parse Native from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, NativeError)

  /**
   * Encode Native to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, NativeError)

  /**
   * Encode Native to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, NativeError)
}
