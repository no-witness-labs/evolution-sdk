import { Data, Effect, ParseResult, Schema } from "effect"
import type { ParseIssue } from "effect/ParseResult"

import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import { Bytes } from "./index.js"
import * as KeyHash from "./KeyHash.js"
import * as NativeScriptJSON from "./NativeScriptJSON.js"
import * as Numeric from "./Numeric.js"

export class NativeScriptError extends Data.TaggedError("NativeScriptError")<{
  message?: string
  cause?: unknown
}> {}

// CDDL specs for native scripts
// native_script =
//   [  script_pubkey
//   // script_all
//   // script_any
//   // script_n_of_k
//   // invalid_before
//   // invalid_hereafter
//   ]

// script_pubkey = (0, addr_keyhash)
// addr_keyhash = hash28
// script_all = (1, [* native_script])
// script_any = (2, [* native_script])
// script_n_of_k = (3, n : int64, [* native_script])
// invalid_before = (4, slot_no)
// invalid_hereafter = (5, slot_no)
// slot_no = uint .size 8

/**
 * Schema for slot numbers used in time-based native script constraints.
 *
 * @since 2.0.0
 * @category schemas
 */
export const SlotNumber = Numeric.Uint8Schema

export type SlotNumber = typeof SlotNumber.Type

// /**
//  * @since 2.0.0
//  * @category model
//  */
export type NativeScript = ScriptPubKey | ScriptAll | ScriptAny | ScriptNOfK | InvalidBefore | InvalidHereafter

export type NativeScriptEncoded =
  | ScriptPubKeyEncoded
  | ScriptAllEncoded
  | ScriptAnyEncoded
  | ScriptNOfKEncoded
  | InvalidBeforeEncoded
  | InvalidHereafterEncoded

export interface ScriptPubKeyEncoded {
  readonly _tag: "ScriptPubKey"
  readonly keyHash: typeof KeyHash.KeyHash.Encoded
}
export interface ScriptAllEncoded {
  readonly _tag: "ScriptAll"
  readonly scripts: ReadonlyArray<NativeScriptEncoded>
}
export interface ScriptAnyEncoded {
  readonly _tag: "ScriptAny"
  readonly scripts: ReadonlyArray<NativeScriptEncoded>
}
export interface ScriptNOfKEncoded {
  readonly _tag: "ScriptNOfK"
  readonly n: bigint
  readonly scripts: ReadonlyArray<NativeScriptEncoded>
}

export interface InvalidBeforeEncoded {
  readonly _tag: "InvalidBefore"
  readonly slot: number
}

export interface InvalidHereafterEncoded {
  readonly _tag: "InvalidHereafter"
  readonly slot: number
}

export class ScriptPubKey extends Schema.TaggedClass<ScriptPubKey>("ScriptPubKey")("ScriptPubKey", {
  keyHash: KeyHash.KeyHash
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      keyHash: this.keyHash
    }
  }
}

export class ScriptAll extends Schema.TaggedClass<ScriptAll>("ScriptAll")("ScriptAll", {
  scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeScript, NativeScriptEncoded> => NativeScript))
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      scripts: this.scripts.map((script) => script)
    }
  }
}

export class ScriptAny extends Schema.TaggedClass<ScriptAny>("ScriptAny")("ScriptAny", {
  scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeScript, NativeScriptEncoded> => NativeScript))
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      scripts: this.scripts.map((script) => script)
    }
  }
}

export class ScriptNOfK extends Schema.TaggedClass<ScriptNOfK>("ScriptNOfK")("ScriptNOfK", {
  n: Numeric.Int64,
  scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeScript, NativeScriptEncoded> => NativeScript))
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      n: this.n,
      scripts: this.scripts.map((script) => script)
    }
  }
}

export class InvalidBefore extends Schema.TaggedClass<InvalidBefore>("InvalidBefore")("InvalidBefore", {
  slot: SlotNumber
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      slot: this.slot
    }
  }
}

export class InvalidHereafter extends Schema.TaggedClass<InvalidHereafter>("InvalidHereafter")("InvalidHereafter", {
  slot: SlotNumber
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: this._tag,
      slot: this.slot
    }
  }
}

export const NativeScript = Schema.Union(
  ScriptPubKey,
  ScriptAll,
  ScriptAny,
  ScriptNOfK,
  InvalidBefore,
  InvalidHereafter
)

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

const ScriptPubKeyCDDL = Schema.Tuple(Schema.Literal(0), Schema.Uint8ArrayFromSelf)

const ScriptAllCDDL = Schema.Tuple(
  Schema.Literal(1),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => Schema.encodedSchema(NativeScriptCDDL)))
)

const ScriptAnyCDDL = Schema.Tuple(
  Schema.Literal(2),
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => Schema.encodedSchema(NativeScriptCDDL)))
)

const ScriptNOfKCDDL = Schema.Tuple(
  Schema.Literal(3),
  Schema.BigIntFromSelf,
  Schema.Array(Schema.suspend((): Schema.Schema<NativeScriptCDDL> => Schema.encodedSchema(NativeScriptCDDL)))
)

const InvalidBeforeCDDL = Schema.Tuple(Schema.Literal(4), Schema.BigIntFromSelf)

const InvalidHereafterCDDL = Schema.Tuple(Schema.Literal(5), Schema.BigIntFromSelf)

/**
 * CDDL representation of a native script as a union of tuple types.
 *
 * This type represents the low-level CBOR structure of native scripts,
 * where each variant is encoded as a tagged tuple.
 *
 * @since 2.0.0
 * @category model
 */
export type NativeScriptCDDL =
  | readonly [0, Uint8Array]
  | readonly [1, ReadonlyArray<NativeScriptCDDL>]
  | readonly [2, ReadonlyArray<NativeScriptCDDL>]
  | readonly [3, bigint, ReadonlyArray<NativeScriptCDDL>]
  | readonly [4, bigint]
  | readonly [5, bigint]

/**
 * Schema for NativeScriptCDDL union type.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NativeScriptCDDL = Schema.transformOrFail(
  Schema.Union(ScriptPubKeyCDDL, ScriptAllCDDL, ScriptAnyCDDL, ScriptNOfKCDDL, InvalidBeforeCDDL, InvalidHereafterCDDL),
  Schema.typeSchema(NativeScript),
  {
    strict: true,
    encode: (nativeScript) => internalEncodeCDDL(nativeScript),
    decode: (cborTuple) => internalDecodeCDDL(cborTuple)
  }
)

/**
 * Convert a NativeScript to its CDDL representation.
 *
 * @since 2.0.0
 * @category encoding
 */
export const internalEncodeCDDL = (nativeScript: NativeScript): Effect.Effect<NativeScriptCDDL, ParseIssue> =>
  Effect.gen(function* () {
    switch (nativeScript._tag) {
      case "ScriptPubKey": {
        return [0, yield* ParseResult.encode(KeyHash.FromBytes)(nativeScript.keyHash)]
      }
      case "ScriptAll": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalEncodeCDDL)
        return [1, scripts] as const
      }
      case "ScriptAny": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalEncodeCDDL)
        return [2, scripts] as const
      }
      case "ScriptNOfK": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalEncodeCDDL)
        return [3, nativeScript.n, scripts] as const
      }
      case "InvalidBefore": {
        return [4, BigInt(nativeScript.slot)] as const
      }
      case "InvalidHereafter": {
        return [5, BigInt(nativeScript.slot)] as const
      }
    }
  })

/**
 * Convert a CDDL representation back to a NativeScript.
 *
 * This function recursively decodes nested CBOR scripts and constructs
 * the appropriate NativeScript instances.
 *
 * @since 2.0.0
 * @category decoding
 */
export const internalDecodeCDDL = (cborTuple: NativeScriptCDDL): Effect.Effect<NativeScript, ParseIssue> =>
  Effect.gen(function* () {
    switch (cborTuple[0]) {
      case 0: {
        // ScriptPubKey: [0, keyHash_bytes]
        const [, keyHashBytes] = cborTuple
        const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(keyHashBytes)
        return new ScriptPubKey({ keyHash })
      }
      case 1: {
        // ScriptAll: [1, [native_script, ...]]
        const [, scriptCBORs] = cborTuple
        const scripts: Array<NativeScript> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return new ScriptAll({ scripts })
      }
      case 2: {
        // ScriptAny: [2, [native_script, ...]]
        const [, scriptCBORs] = cborTuple
        const scripts: Array<NativeScript> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return new ScriptAny({ scripts })
      }
      case 3: {
        // ScriptNOfK: [3, n, [native_script, ...]]
        const [, n, scriptCBORs] = cborTuple
        const scripts: Array<NativeScript> = []
        for (const scriptCBOR of scriptCBORs) {
          const script = yield* internalDecodeCDDL(scriptCBOR)
          scripts.push(script)
        }
        return new ScriptNOfK({
          n: Numeric.Int64.make(n),
          scripts
        })
      }
      case 4: {
        // InvalidBefore: [4, slot]
        const [, slot] = cborTuple
        return new InvalidBefore({
          slot: Number(slot)
        })
      }
      case 5: {
        // InvalidHereafter: [5, slot]
        const [, slot] = cborTuple
        return new InvalidHereafter({
          slot: Number(slot)
        })
      }
      default:
        // This should never happen with proper CBOR validation
        throw new Error(`Invalid native script tag: ${cborTuple[0]}`)
    }
  })

export const FromBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    NativeScriptCDDL // CBOR → NativeScript
  )

export const FromHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → NativeScript
  )

/**
 * Schema transformer for converting between NativeJSON and NativeScript.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NativeJSON = Schema.transformOrFail(NativeScriptJSON.NativeJSONSchema, NativeScript, {
  strict: true,
  encode: (_, __, ___, toI) => internalNativeToJson(toI),
  decode: (fromA) => internalJSONToNative(fromA)
})

/**
 * Convert a NativeJSON to a NativeScript.
 *
 * @since 2.0.0
 * @category conversion
 */
export const internalJSONToNative = (
  nativeJSON: NativeScriptJSON.NativeJSON
): Effect.Effect<NativeScript, ParseResult.ParseIssue> =>
  Effect.gen(function* () {
    switch (nativeJSON.type) {
      case "sig": {
        const keyHash = yield* ParseResult.decode(KeyHash.FromHex)(nativeJSON.keyHash)
        return new ScriptPubKey({ keyHash })
      }
      case "before": {
        return new InvalidBefore({ slot: nativeJSON.slot })
      }
      case "after": {
        return new InvalidHereafter({ slot: nativeJSON.slot })
      }
      case "all": {
        const scripts = yield* Effect.forEach(nativeJSON.scripts, internalJSONToNative)
        return new ScriptAll({ scripts })
      }
      case "any": {
        const scripts = yield* Effect.forEach(nativeJSON.scripts, internalJSONToNative)
        return new ScriptAny({ scripts })
      }
      case "atLeast": {
        const scripts = yield* Effect.forEach(nativeJSON.scripts, internalJSONToNative)
        return new ScriptNOfK({
          n: Numeric.Int64.make(BigInt(nativeJSON.required)),
          scripts
        })
      }
    }
  })

/**
 * Convert a NativeScript to a NativeJSON.
 *
 * @since 2.0.0
 * @category conversion
 */
export const internalNativeToJson = (
  nativeScript: NativeScript
): Effect.Effect<NativeScriptJSON.NativeJSON, ParseResult.ParseIssue> =>
  Effect.gen(function* () {
    switch (nativeScript._tag) {
      case "ScriptPubKey": {
        return {
          type: "sig" as const,
          keyHash: yield* ParseResult.encode(KeyHash.FromHex)(nativeScript.keyHash)
        }
      }
      case "ScriptAll": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalNativeToJson)
        return {
          type: "all" as const,
          scripts
        }
      }
      case "ScriptAny": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalNativeToJson)
        return {
          type: "any" as const,
          scripts
        }
      }
      case "ScriptNOfK": {
        const scripts = yield* Effect.forEach(nativeScript.scripts, internalNativeToJson)
        return {
          type: "atLeast" as const,
          required: Number(nativeScript.n),
          scripts
        }
      }
      case "InvalidBefore": {
        return {
          type: "before" as const,
          slot: nativeScript.slot
        }
      }
      case "InvalidHereafter": {
        return {
          type: "after" as const,
          slot: nativeScript.slot
        }
      }
      default:
        throw new Error(
          `Exhaustive check failed: Unhandled case '${(nativeScript as unknown as { _tag: string })._tag}' encountered.`
        )
    }
  })

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options),
      nativeJSON: NativeJSON
    },
    NativeScriptError
  )
