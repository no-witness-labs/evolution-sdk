import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for Native script related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class NativeScriptError extends Data.TaggedError("NativeScriptError")<{
  message?: string
  cause?: unknown
}> {}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Native script encoded type definition (wire format)
 *
 * @since 2.0.0
 * @category model
 */
export type NativeScriptEncoded =
  | { readonly _tag: "ScriptPubKey"; readonly keyHash: string }
  | { readonly _tag: "InvalidBefore"; readonly slot: string }
  | { readonly _tag: "InvalidHereafter"; readonly slot: string }
  | { readonly _tag: "ScriptAll"; readonly scripts: ReadonlyArray<NativeScriptEncoded> }
  | { readonly _tag: "ScriptAny"; readonly scripts: ReadonlyArray<NativeScriptEncoded> }
  | { readonly _tag: "ScriptNOfK"; readonly required: string; readonly scripts: ReadonlyArray<NativeScriptEncoded> }

/**
 * Native script type definition (runtime representation)
 *
 * @since 2.0.0
 * @category model
 */
export type NativeScriptVariants =
  | { readonly _tag: "ScriptPubKey"; readonly keyHash: Uint8Array }
  | { readonly _tag: "InvalidBefore"; readonly slot: bigint }
  | { readonly _tag: "InvalidHereafter"; readonly slot: bigint }
  | { readonly _tag: "ScriptAll"; readonly scripts: ReadonlyArray<NativeScriptVariants> }
  | { readonly _tag: "ScriptAny"; readonly scripts: ReadonlyArray<NativeScriptVariants> }
  | { readonly _tag: "ScriptNOfK"; readonly required: bigint; readonly scripts: ReadonlyArray<NativeScriptVariants> }

// ============================================================================
// Schema Definition
// ============================================================================

/**
 * Internal Union schema for the actual native script variants
 *
 * @since 2.0.0
 * @category schemas
 */
export const NativeScriptVariants: Schema.Schema<NativeScriptVariants, NativeScriptEncoded> = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("ScriptPubKey"),
    keyHash: Hash28.BytesFromHex
  }),
  Schema.Struct({
    _tag: Schema.Literal("InvalidBefore"),
    slot: Schema.BigInt
  }),
  Schema.Struct({
    _tag: Schema.Literal("InvalidHereafter"),
    slot: Schema.BigInt
  }),
  Schema.Struct({
    _tag: Schema.Literal("ScriptAll"),
    scripts: Schema.Array(
      Schema.suspend((): Schema.Schema<NativeScriptVariants, NativeScriptEncoded> => NativeScriptVariants)
    )
  }),
  Schema.Struct({
    _tag: Schema.Literal("ScriptAny"),
    scripts: Schema.Array(
      Schema.suspend((): Schema.Schema<NativeScriptVariants, NativeScriptEncoded> => NativeScriptVariants)
    )
  }),
  Schema.Struct({
    _tag: Schema.Literal("ScriptNOfK"),
    required: Schema.BigInt,
    scripts: Schema.Array(
      Schema.suspend((): Schema.Schema<NativeScriptVariants, NativeScriptEncoded> => NativeScriptVariants)
    )
  })
)

/**
 * TaggedClass schema for native scripts containing the Union
 *
 * @since 2.0.0
 * @category schemas
 */
export class NativeScript extends Schema.TaggedClass<NativeScript>("NativeScript")(
  "NativeScript",
  {
    script: NativeScriptVariants
  },
  {
    identifier: "NativeScript",
    title: "Native Script",
    description: "A native script following Cardano specifications"
  }
) {}

// ============================================================================
// Smart Constructors
// ============================================================================

/**
 * Create a signature script for a specific key hash
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeScriptPubKey = (keyHash: Uint8Array) =>
  new NativeScript({
    script: {
      _tag: "ScriptPubKey",
      keyHash
    }
  })

/**
 * Create a time-based script that is invalid before a slot
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeInvalidBefore = (slot: bigint) =>
  new NativeScript({
    script: {
      _tag: "InvalidBefore",
      slot
    }
  })

/**
 * Create a time-based script that is invalid after a slot
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeInvalidHereafter = (slot: bigint) =>
  new NativeScript({
    script: {
      _tag: "InvalidHereafter",
      slot
    }
  })

/**
 * Create a script that requires all nested scripts
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeScriptAll = (scripts: ReadonlyArray<NativeScriptVariants>) =>
  new NativeScript({
    script: {
      _tag: "ScriptAll",
      scripts
    }
  })

/**
 * Create a script that requires any one nested script
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeScriptAny = (scripts: ReadonlyArray<NativeScriptVariants>) =>
  new NativeScript({
    script: {
      _tag: "ScriptAny",
      scripts
    }
  })

/**
 * Create a script that requires at least N nested scripts
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeScriptNOfK = (required: bigint, scripts: ReadonlyArray<NativeScriptVariants>) =>
  new NativeScript({
    script: {
      _tag: "ScriptNOfK",
      required,
      scripts
    }
  })

// ============================================================================
// JSON Conversion Utilities
// ============================================================================

/**
 * Convert a NativeScript to JSON representation matching cardano-cli format
 *
 * @since 2.0.0
 * @category conversion
 */
export const toJSON = (script: NativeScriptVariants): any => {
  switch (script._tag) {
    case "ScriptPubKey":
      return {
        type: "sig" as const,
        keyHash: Bytes.toHex(script.keyHash)
      }
    case "InvalidBefore":
      return {
        type: "after" as const,
        slot: Number(script.slot)
      }
    case "InvalidHereafter":
      return {
        type: "before" as const,
        slot: Number(script.slot)
      }
    case "ScriptAll":
      return {
        type: "all" as const,
        scripts: script.scripts.map(toJSON)
      }
    case "ScriptAny":
      return {
        type: "any" as const,
        scripts: script.scripts.map(toJSON)
      }
    case "ScriptNOfK":
      return {
        type: "atLeast" as const,
        required: Number(script.required),
        scripts: script.scripts.map(toJSON)
      }
  }
}

// ============================================================================
// CDDL Types and Schemas
// ============================================================================

/**
 * CDDL representation following Cardano specification
 *
 * native_script =
 *   [ script_pubkey      // 0
 *   // script_all         // 1
 *   // script_any         // 2
 *   // script_n_of_k      // 3
 *   // invalid_before     // 4
 *   // invalid_hereafter  // 5
 *   ]
 *
 * @since 2.0.0
 * @category model
 */
export type NativeScriptCDDL =
  | readonly [0n, Uint8Array] // script_pubkey
  | readonly [1n, ReadonlyArray<NativeScriptCDDL>] // script_all
  | readonly [2n, ReadonlyArray<NativeScriptCDDL>] // script_any
  | readonly [3n, bigint, ReadonlyArray<NativeScriptCDDL>] // script_n_of_k
  | readonly [4n, bigint] // invalid_before
  | readonly [5n, bigint] // invalid_hereafter

// Individual CDDL schemas
const ScriptPubKeyCDDL = Schema.Tuple(Schema.Literal(0n), Schema.Uint8ArrayFromSelf)
const ScriptAllCDDL = Schema.Tuple(
  Schema.Literal(1n),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => CDDLSchema))
)
const ScriptAnyCDDL = Schema.Tuple(
  Schema.Literal(2n),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => CDDLSchema))
)
const ScriptNOfKCDDL = Schema.Tuple(
  Schema.Literal(3n),
  Schema.BigIntFromSelf,
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => CDDLSchema))
)
const InvalidBeforeCDDL = Schema.Tuple(Schema.Literal(4n), Schema.BigIntFromSelf)
const InvalidHereafterCDDL = Schema.Tuple(Schema.Literal(5n), Schema.BigIntFromSelf)

export const CDDLSchema: Schema.Schema<NativeScriptCDDL> = Schema.Union(
  ScriptPubKeyCDDL,
  ScriptAllCDDL,
  ScriptAnyCDDL,
  ScriptNOfKCDDL,
  InvalidBeforeCDDL,
  InvalidHereafterCDDL
).annotations({
  identifier: "NativeScriptCDDL"
})

/**
 * Transform between NativeScript and CDDL representation
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL: Schema.Schema<NativeScript, NativeScriptCDDL> = Schema.transformOrFail(
  CDDLSchema,
  Schema.typeSchema(NativeScript),
  {
    strict: true,
    encode: (nativeScript: NativeScript): Eff.Effect<NativeScriptCDDL, ParseResult.ParseIssue> =>
      Eff.gen(function* () {
        const script = nativeScript.script
        switch (script._tag) {
          case "ScriptPubKey":
            return [0n, script.keyHash] as const
          case "ScriptAll": {
            const encodedScripts: Array<NativeScriptCDDL> = []
            for (const nestedScript of script.scripts) {
              const nestedNativeScript = new NativeScript({ script: nestedScript })
              const encoded = yield* ParseResult.encode(FromCDDL)(nestedNativeScript)
              encodedScripts.push(encoded)
            }
            return [1n, encodedScripts] as const
          }
          case "ScriptAny": {
            const encodedScripts: Array<NativeScriptCDDL> = []
            for (const nestedScript of script.scripts) {
              const nestedNativeScript = new NativeScript({ script: nestedScript })
              const encoded = yield* ParseResult.encode(FromCDDL)(nestedNativeScript)
              encodedScripts.push(encoded)
            }
            return [2n, encodedScripts] as const
          }
          case "ScriptNOfK": {
            const encodedScripts: Array<NativeScriptCDDL> = []
            for (const nestedScript of script.scripts) {
              const nestedNativeScript = new NativeScript({ script: nestedScript })
              const encoded = yield* ParseResult.encode(FromCDDL)(nestedNativeScript)
              encodedScripts.push(encoded)
            }
            return [3n, script.required, encodedScripts] as const
          }
          case "InvalidBefore":
            return [4n, script.slot] as const
          case "InvalidHereafter":
            return [5n, script.slot] as const
        }
      }),
    decode: (cddl: NativeScriptCDDL): Eff.Effect<NativeScript, ParseResult.ParseIssue> =>
      Eff.gen(function* () {
        switch (cddl[0]) {
          case 0n: {
            const [, keyHash] = cddl as readonly [0n, Uint8Array]
            return makeScriptPubKey(keyHash)
          }
          case 1n: {
            const [, scripts] = cddl as readonly [1n, ReadonlyArray<NativeScriptCDDL>]
            const decodedScripts: Array<NativeScriptVariants> = []
            for (const scriptCddl of scripts) {
              const decoded = yield* ParseResult.decode(FromCDDL)(scriptCddl)
              decodedScripts.push(decoded.script)
            }
            return makeScriptAll(decodedScripts)
          }
          case 2n: {
            const [, scripts] = cddl as readonly [2n, ReadonlyArray<NativeScriptCDDL>]
            const decodedScripts: Array<NativeScriptVariants> = []
            for (const scriptCddl of scripts) {
              const decoded = yield* ParseResult.decode(FromCDDL)(scriptCddl)
              decodedScripts.push(decoded.script)
            }
            return makeScriptAny(decodedScripts)
          }
          case 3n: {
            const [, required, scripts] = cddl as readonly [3n, bigint, ReadonlyArray<NativeScriptCDDL>]
            const decodedScripts: Array<NativeScriptVariants> = []
            for (const scriptCddl of scripts) {
              const decoded = yield* ParseResult.decode(FromCDDL)(scriptCddl)
              decodedScripts.push(decoded.script)
            }
            return makeScriptNOfK(required, decodedScripts)
          }
          case 4n: {
            const [, slot] = cddl as readonly [4n, bigint]
            return makeInvalidBefore(slot)
          }
          case 5n: {
            const [, slot] = cddl as readonly [5n, bigint]
            return makeInvalidHereafter(slot)
          }
          default:
            return yield* ParseResult.fail(
              new ParseResult.Type(Schema.typeSchema(NativeScript).ast, cddl, `Unknown native script tag: ${cddl[0]}`)
            )
        }
      })
  }
).annotations({
  identifier: "NativeScript.FromCDDL"
})

// ============================================================================
// CBOR Transformations
// ============================================================================

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → NativeScript
  )

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → NativeScript
  )

// ============================================================================
// Validation and Predicates
// ============================================================================

/**
 * Check if the given value is a valid NativeScript
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(NativeScriptVariants)

/**
 * Check if two NativeScript instances are equal
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: NativeScript, b: NativeScript): boolean => {
  // Use CBOR encoding for deep equality comparison
  try {
    const aBytes = toCBORBytes(a)
    const bBytes = toCBORBytes(b)
    return Bytes.equals(aBytes, bBytes)
  } catch {
    return false
  }
}

// ============================================================================
// FastCheck Arbitraries
// ============================================================================

/**
 * FastCheck arbitrary for generating random NativeScript instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<NativeScript> = FastCheck.letrec((tie) => ({
  nativeScript: FastCheck.oneof(
    // ScriptPubKey
    FastCheck.uint8Array({ minLength: 28, maxLength: 28 }).map((keyHash) => makeScriptPubKey(keyHash)),
    // InvalidBefore
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }).map((slot) => makeInvalidBefore(slot)),
    // InvalidHereafter
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }).map((slot) => makeInvalidHereafter(slot)),
    // ScriptAll (limit depth to prevent infinite recursion)
    FastCheck.array(tie("nativeScriptVariant"), { maxLength: 3 }).map((scripts) =>
      makeScriptAll(scripts as ReadonlyArray<NativeScriptVariants>)
    ),
    // ScriptAny (limit depth to prevent infinite recursion)
    FastCheck.array(tie("nativeScriptVariant"), { maxLength: 3 }).map((scripts) =>
      makeScriptAny(scripts as ReadonlyArray<NativeScriptVariants>)
    ),
    // ScriptNOfK (limit depth to prevent infinite recursion)
    FastCheck.tuple(
      FastCheck.bigInt({ min: 0n, max: 10n }),
      FastCheck.array(tie("nativeScriptVariant"), { maxLength: 3 })
    ).map(([required, scripts]) => makeScriptNOfK(required, scripts as ReadonlyArray<NativeScriptVariants>))
  ),
  // IMPORTANT: this generates NativeScriptVariants (plain variant objects), not NativeScript wrappers
  nativeScriptVariant: FastCheck.oneof(
    // ScriptPubKey
    FastCheck.uint8Array({ minLength: 28, maxLength: 28 }).map((keyHash) => ({
      _tag: "ScriptPubKey" as const,
      keyHash
    })),
    // InvalidBefore
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }).map((slot) => ({
      _tag: "InvalidBefore" as const,
      slot
    })),
    // InvalidHereafter
    FastCheck.bigInt({ min: 0n, max: 2n ** 64n - 1n }).map((slot) => ({
      _tag: "InvalidHereafter" as const,
      slot
    })),
    // ScriptAll (limit depth to prevent infinite recursion)
    FastCheck.array(tie("nativeScriptVariant"), { maxLength: 2 }).map((scripts) => ({
      _tag: "ScriptAll" as const,
      scripts: scripts as ReadonlyArray<NativeScriptVariants>
    })),
    // ScriptAny (limit depth to prevent infinite recursion)
    FastCheck.array(tie("nativeScriptVariant"), { maxLength: 2 }).map((scripts) => ({
      _tag: "ScriptAny" as const,
      scripts: scripts as ReadonlyArray<NativeScriptVariants>
    })),
    // ScriptNOfK (limit depth to prevent infinite recursion)
    FastCheck.tuple(
      FastCheck.bigInt({ min: 0n, max: 10n }),
      FastCheck.array(tie("nativeScriptVariant"), { maxLength: 2 })
    ).map(([required, scripts]) => ({
      _tag: "ScriptNOfK" as const,
      required,
      scripts: scripts as ReadonlyArray<NativeScriptVariants>
    }))
  )
})).nativeScript

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse a NativeScript from CBOR bytes
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, NativeScriptError, "NativeScript.fromCBORBytes")

/**
 * Parse a NativeScript from CBOR hex string
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, NativeScriptError, "NativeScript.fromCBORHex")

/**
 * Convert a NativeScript to CBOR bytes
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, NativeScriptError, "NativeScript.toCBORBytes")

/**
 * Convert a NativeScript to CBOR hex string
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, NativeScriptError, "NativeScript.toCBORHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse a NativeScript from CBOR bytes with Effect error handling
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, NativeScriptError)

  /**
   * Parse a NativeScript from CBOR hex string with Effect error handling
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, NativeScriptError)

  /**
   * Convert a NativeScript to CBOR bytes with Effect error handling
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, NativeScriptError)

  /**
   * Convert a NativeScript to CBOR hex string with Effect error handling
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, NativeScriptError)
}
