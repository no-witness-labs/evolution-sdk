import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as ScriptHash from "./ScriptHash.js"

/**
 * Error class for Constitution related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ConstitutionError extends Data.TaggedError("ConstitutionError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Constitution per CDDL:
 * constitution = [anchor, script_hash/ nil]
 *
 * @since 2.0.0
 * @category schemas
 */
export class Constitution extends Schema.Class<Constitution>("Constitution")({
  anchor: Anchor.Anchor,
  scriptHash: Schema.NullOr(ScriptHash.ScriptHash)
}) {}

/**
 * CDDL tuple schema for Constitution
 */
export const CDDLSchema = Schema.Tuple(
  Anchor.CDDLSchema, // anchor
  Schema.NullOr(CBOR.ByteArray) // script_hash / nil
)

/**
 * Transform between CDDL tuple and typed Constitution
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Constitution), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const anchor = yield* ParseResult.encode(Anchor.FromCDDL)(toA.anchor)
      const scriptHash = toA.scriptHash ? yield* ParseResult.encode(ScriptHash.FromBytes)(toA.scriptHash) : null
      return [anchor, scriptHash] as const
    }),
  decode: ([anchorTuple, scriptHashBytes]) =>
    Eff.gen(function* () {
      const anchor = yield* ParseResult.decode(Anchor.FromCDDL)(anchorTuple)
      const scriptHash = scriptHashBytes ? yield* ParseResult.decode(ScriptHash.FromBytes)(scriptHashBytes) : null
      return new Constitution({ anchor, scriptHash })
    })
})

// Encoding/decoding helpers (bytes/hex) for convenience
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL)
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCBORBytes(options))

/**
 * Equality for Constitution
 */
export const equals = (a: Constitution, b: Constitution): boolean => {
  if (!Anchor.equals(a.anchor, b.anchor)) return false
  if (a.scriptHash === null || b.scriptHash === null) return a.scriptHash === b.scriptHash
  return ScriptHash.equals(a.scriptHash, b.scriptHash)
}

/**
 * Arbitrary for Constitution
 */
export const arbitrary: FastCheck.Arbitrary<Constitution> = FastCheck.tuple(
  Anchor.arbitrary,
  FastCheck.option(ScriptHash.arbitrary, { nil: null })
).map(([anchor, scriptHash]) => new Constitution({ anchor, scriptHash }, { disableValidation: true }))

// Parsing & encoding helpers with sync error handling
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, ConstitutionError, "Constitution.fromCBORBytes")
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, ConstitutionError, "Constitution.fromCBORHex")
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, ConstitutionError, "Constitution.toCBORBytes")
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, ConstitutionError, "Constitution.toCBORHex")
