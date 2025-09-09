import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
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
  cause?: unknown
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

export const CDDLSchema = Schema.Union(
  Schema.Tuple(Schema.Literal(0n), Schema.Uint8ArrayFromSelf),
  Schema.Tuple(Schema.Literal(1n), Schema.Uint8ArrayFromSelf),
  Schema.Tuple(Schema.Literal(2n)),
  Schema.Tuple(Schema.Literal(3n))
)

/**
 * CDDL schema for DRep with proper transformation.
 * drep = [0, addr_keyhash] / [1, script_hash] / [2] / [3]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(DRep), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      switch (toA._tag) {
        case "KeyHashDRep": {
          const keyHashBytes = yield* ParseResult.encode(KeyHash.FromBytes)(toA.keyHash)
          return [0n, keyHashBytes] as const
        }
        case "ScriptHashDRep": {
          const scriptHashBytes = yield* ParseResult.encode(ScriptHash.FromBytes)(toA.scriptHash)
          return [1n, scriptHashBytes] as const
        }
        case "AlwaysAbstainDRep":
          return [2n] as const
        case "AlwaysNoConfidenceDRep":
          return [3n] as const
      }
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const [tag, ...rest] = fromA
      switch (tag) {
        case 0n: {
          const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(rest[0] as Uint8Array)
          return DRep.members[0].make({
            keyHash
          })
        }
        case 1n: {
          const scriptHash = yield* ParseResult.decode(ScriptHash.FromBytes)(rest[0] as Uint8Array)
          return DRep.members[1].make({
            scriptHash
          })
        }
        case 2n:
          return DRep.members[2].make({})
        case 3n:
          return DRep.members[3].make({})
        default:
          return yield* ParseResult.fail(
            new ParseResult.Type(Schema.typeSchema(DRep).ast, fromA, `Invalid DRep tag: ${tag}`)
          )
      }
    })
})

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
export const FromBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → DRep
  )

/**
 * CBOR hex transformation schema for DRep.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → DRep
  )

/**
 * Check if the given value is a valid DRep
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDRep = Schema.is(DRep)

/**
 * FastCheck arbitrary for generating random DRep instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.oneof(
  FastCheck.record({
    keyHash: KeyHash.arbitrary
  }).map((props) => ({ _tag: "KeyHashDRep" as const, ...props })),
  FastCheck.record({
    scriptHash: ScriptHash.arbitrary
  }).map((props) => ({ _tag: "ScriptHashDRep" as const, ...props })),
  FastCheck.record({}).map(() => ({ _tag: "AlwaysAbstainDRep" as const })),
  FastCheck.record({}).map(() => ({ _tag: "AlwaysNoConfidenceDRep" as const }))
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse DRep from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, DRepError, "DRep.fromBytes")

/**
 * Parse DRep from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeCBORDecodeHexSync(FromCDDL, DRepError, "DRep.fromHex")

/**
 * Encode DRep to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeCBOREncodeSync(FromCDDL, DRepError, "DRep.toBytes")

/**
 * Encode DRep to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeCBOREncodeHexSync(FromCDDL, DRepError, "DRep.toHex")

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
   * Parse DRep from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeCBORDecodeEither(FromCDDL, DRepError)

  /**
   * Parse DRep from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeCBORDecodeHexEither(FromCDDL, DRepError)

  /**
   * Encode DRep to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeCBOREncodeEither(FromCDDL, DRepError)

  /**
   * Encode DRep to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeCBOREncodeHexEither(FromCDDL, DRepError)
}

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

/**
 * Pattern match over DRep.
 *
 * @since 2.0.0
 * @category pattern matching
 */
export const match =
  <A>(patterns: {
    KeyHashDRep: (keyHash: KeyHash.KeyHash) => A
    ScriptHashDRep: (scriptHash: ScriptHash.ScriptHash) => A
    AlwaysAbstainDRep: () => A
    AlwaysNoConfidenceDRep: () => A
  }) =>
  (drep: DRep) => {
    switch (drep._tag) {
      case "KeyHashDRep":
        return patterns.KeyHashDRep(drep.keyHash)
      case "ScriptHashDRep":
        return patterns.ScriptHashDRep(drep.scriptHash)
      case "AlwaysAbstainDRep":
        return patterns.AlwaysAbstainDRep()
      case "AlwaysNoConfidenceDRep":
        return patterns.AlwaysNoConfidenceDRep()
    }
  }

/**
 * Check if DRep is a KeyHashDRep.
 *
 * @since 2.0.0
 * @category type guards
 */
export const isKeyHashDRep = (drep: DRep): drep is KeyHashDRep => drep._tag === "KeyHashDRep"

/**
 * Check if DRep is a ScriptHashDRep.
 *
 * @since 2.0.0
 * @category type guards
 */
export const isScriptHashDRep = (drep: DRep): drep is ScriptHashDRep => drep._tag === "ScriptHashDRep"

/**
 * Check if DRep is an AlwaysAbstainDRep.
 *
 * @since 2.0.0
 * @category type guards
 */
export const isAlwaysAbstainDRep = (drep: DRep): drep is AlwaysAbstainDRep => drep._tag === "AlwaysAbstainDRep"

/**
 * Check if DRep is an AlwaysNoConfidenceDRep.
 *
 * @since 2.0.0
 * @category type guards
 */
export const isAlwaysNoConfidenceDRep = (drep: DRep): drep is AlwaysNoConfidenceDRep =>
  drep._tag === "AlwaysNoConfidenceDRep"
