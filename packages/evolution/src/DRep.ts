import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as KeyHash from "./KeyHash.js"
import * as ScriptHash from "./ScriptHash.js"

/**
 * Error class for DRep related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class DRepError extends Data.TaggedError("DRepError")<{
  message?: string
  reason?: "InvalidStructure" | "UnsupportedType"
}> {}

/**
 * Union schema for DRep representing different DRep types.
 *
 * drep = [0, addr_keyhash] / [1, script_hash] / [2] / [3]
 *
 * @since 2.0.0
 * @category schemas
 */
export const DRep = Schema.Union(
  Schema.TaggedStruct("KeyHashDRep", {
    keyHash: KeyHash.KeyHash
  }),
  Schema.TaggedStruct("ScriptHashDRep", {
    scriptHash: ScriptHash.ScriptHash
  }),
  Schema.TaggedStruct("AlwaysAbstainDRep", {}),
  Schema.TaggedStruct("AlwaysNoConfidenceDRep", {})
)

/**
 * Type alias for DRep.
 *
 * @since 2.0.0
 * @category model
 */
export type DRep = typeof DRep.Type

/**
 * CDDL schema for DRep with proper transformation.
 * drep = [0, addr_keyhash] / [1, script_hash] / [2] / [3]
 *
 * @since 2.0.0
 * @category schemas
 */
export const DRepCDDLSchema = Schema.transformOrFail(
  Schema.Union(
    Schema.Tuple(Schema.Literal(0), Schema.Uint8ArrayFromSelf),
    Schema.Tuple(Schema.Literal(1), Schema.Uint8ArrayFromSelf),
    Schema.Tuple(Schema.Literal(2)),
    Schema.Tuple(Schema.Literal(3))
  ),
  Schema.typeSchema(DRep),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        switch (toA._tag) {
          case "KeyHashDRep": {
            const keyHashBytes = yield* ParseResult.encode(KeyHash.FromBytes)(toA.keyHash)
            return [0, keyHashBytes] as const
          }
          case "ScriptHashDRep": {
            const scriptHashBytes = yield* ParseResult.encode(ScriptHash.BytesSchema)(toA.scriptHash)
            return [1, scriptHashBytes] as const
          }
          case "AlwaysAbstainDRep":
            return [2] as const
          case "AlwaysNoConfidenceDRep":
            return [3] as const
        }
      }),
    decode: (fromA) =>
      Effect.gen(function* () {
        const [tag, ...rest] = fromA
        switch (tag) {
          case 0: {
            const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(rest[0] as Uint8Array)
            return yield* ParseResult.decode(DRep)({
              _tag: "KeyHashDRep",
              keyHash
            })
          }
          case 1: {
            const scriptHash = yield* ParseResult.decode(ScriptHash.BytesSchema)(rest[0] as Uint8Array)
            return yield* ParseResult.decode(DRep)({
              _tag: "ScriptHashDRep",
              scriptHash
            })
          }
          case 2:
            return yield* ParseResult.decode(DRep)({
              _tag: "AlwaysAbstainDRep"
            })
          case 3:
            return yield* ParseResult.decode(DRep)({
              _tag: "AlwaysNoConfidenceDRep"
            })
          default:
            return yield* ParseResult.fail(
              new ParseResult.Type(Schema.typeSchema(DRep).ast, fromA, `Invalid DRep tag: ${tag}`)
            )
        }
      })
  }
)

/**
 * Type alias for KeyHashDRep.
 *
 * @since 2.0.0
 * @category model
 */
export type KeyHashDRep = Extract<DRep, { _tag: "KeyHashDRep" }>

/**
 * Type alias for ScriptHashDRep.
 *
 * @since 2.0.0
 * @category model
 */
export type ScriptHashDRep = Extract<DRep, { _tag: "ScriptHashDRep" }>

/**
 * Type alias for AlwaysAbstainDRep.
 *
 * @since 2.0.0
 * @category model
 */
export type AlwaysAbstainDRep = Extract<DRep, { _tag: "AlwaysAbstainDRep" }>

/**
 * Type alias for AlwaysNoConfidenceDRep.
 *
 * @since 2.0.0
 * @category model
 */
export type AlwaysNoConfidenceDRep = Extract<DRep, { _tag: "AlwaysNoConfidenceDRep" }>

/**
 * CBOR bytes transformation schema for DRep.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    DRepCDDLSchema // CBOR → DRep
  )

/**
 * CBOR hex transformation schema for DRep.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → DRep
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    DRepError
  )

/**
 * Pattern match on a DRep to handle different DRep types.
 *
 * @since 2.0.0
 * @category transformation
 */
export const match = <A, B, C, D>(
  drep: DRep,
  cases: {
    KeyHashDRep: (drep: KeyHashDRep) => A
    ScriptHashDRep: (drep: ScriptHashDRep) => B
    AlwaysAbstainDRep: (drep: AlwaysAbstainDRep) => C
    AlwaysNoConfidenceDRep: (drep: AlwaysNoConfidenceDRep) => D
  }
): A | B | C | D => {
  switch (drep._tag) {
    case "KeyHashDRep":
      return cases.KeyHashDRep(drep)
    case "ScriptHashDRep":
      return cases.ScriptHashDRep(drep)
    case "AlwaysAbstainDRep":
      return cases.AlwaysAbstainDRep(drep)
    case "AlwaysNoConfidenceDRep":
      return cases.AlwaysNoConfidenceDRep(drep)
    default:
      throw new Error(`Exhaustive check failed: Unhandled case '${(drep as { _tag: string })._tag}' encountered.`)
  }
}

/**
 * Check if a DRep is a KeyHashDRep.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isKeyHashDRep = (drep: DRep): drep is KeyHashDRep => drep._tag === "KeyHashDRep"

/**
 * Check if a DRep is a ScriptHashDRep.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isScriptHashDRep = (drep: DRep): drep is ScriptHashDRep => drep._tag === "ScriptHashDRep"

/**
 * Check if a DRep is an AlwaysAbstainDRep.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAlwaysAbstainDRep = (drep: DRep): drep is AlwaysAbstainDRep => drep._tag === "AlwaysAbstainDRep"

/**
 * Check if a DRep is an AlwaysNoConfidenceDRep.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAlwaysNoConfidenceDRep = (drep: DRep): drep is AlwaysNoConfidenceDRep =>
  drep._tag === "AlwaysNoConfidenceDRep"

/**
 * Check if the given value is a valid DRep
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDRep = Schema.is(DRep)

/**
 * FastCheck generator for DRep instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.oneof(
  FastCheck.record({
    keyHash: KeyHash.generator
  }).map((props) => ({ _tag: "KeyHashDRep" as const, ...props })),
  FastCheck.record({
    scriptHash: ScriptHash.generator
  }).map((props) => ({ _tag: "ScriptHashDRep" as const, ...props })),
  FastCheck.record({}).map(() => ({ _tag: "AlwaysAbstainDRep" as const })),
  FastCheck.record({}).map(() => ({ _tag: "AlwaysNoConfidenceDRep" as const }))
)

/**
 * Check if two DRep instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: DRep, that: DRep): boolean => {
  if (self._tag !== that._tag) return false

  switch (self._tag) {
    case "KeyHashDRep":
      return KeyHash.equals(self.keyHash, (that as KeyHashDRep).keyHash)
    case "ScriptHashDRep":
      return ScriptHash.equals(self.scriptHash, (that as ScriptHashDRep).scriptHash)
    case "AlwaysAbstainDRep":
    case "AlwaysNoConfidenceDRep":
      return true // These have no additional data to compare
    default:
      return false
  }
}

/**
 * Create a KeyHashDRep from a KeyHash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromKeyHash = (keyHash: KeyHash.KeyHash): KeyHashDRep => ({
  _tag: "KeyHashDRep",
  keyHash
})

/**
 * Create a ScriptHashDRep from a ScriptHash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromScriptHash = (scriptHash: ScriptHash.ScriptHash): ScriptHashDRep => ({
  _tag: "ScriptHashDRep",
  scriptHash
})

/**
 * Create an AlwaysAbstainDRep.
 *
 * @since 2.0.0
 * @category constructors
 */
export const alwaysAbstain = (): AlwaysAbstainDRep => ({
  _tag: "AlwaysAbstainDRep"
})

/**
 * Create an AlwaysNoConfidenceDRep.
 *
 * @since 2.0.0
 * @category constructors
 */
export const alwaysNoConfidence = (): AlwaysNoConfidenceDRep => ({
  _tag: "AlwaysNoConfidenceDRep"
})
