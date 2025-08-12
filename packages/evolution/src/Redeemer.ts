import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as PlutusData from "./Data.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for Redeemer related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class RedeemerError extends Data.TaggedError("RedeemerError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Redeemer tag enum for different script execution contexts.
 *
 * CDDL: redeemer_tag = 0 ; spend | 1 ; mint | 2 ; cert | 3 ; reward
 *
 * @since 2.0.0
 * @category model
 */
export const RedeemerTag = Schema.Literal("spend", "mint", "cert", "reward").annotations({
  identifier: "Redeemer.Tag",
  title: "Redeemer Tag",
  description: "Tag indicating the context where the redeemer is used"
})

export type RedeemerTag = typeof RedeemerTag.Type

/**
 * Execution units for Plutus script execution.
 *
 * CDDL: ex_units = [mem: uint64, steps: uint64]
 *
 * @since 2.0.0
 * @category model
 */
export const ExUnits = Schema.Tuple(
  Numeric.Uint64Schema.annotations({
    identifier: "Redeemer.ExUnits.Memory",
    title: "Memory Units",
    description: "Memory units consumed by script execution"
  }),
  Numeric.Uint64Schema.annotations({
    identifier: "Redeemer.ExUnits.Steps",
    title: "CPU Steps",
    description: "CPU steps consumed by script execution"
  })
).annotations({
  identifier: "Redeemer.ExUnits",
  title: "Execution Units",
  description: "Memory and CPU limits for Plutus script execution"
})

export type ExUnits = typeof ExUnits.Type

/**
 * Redeemer for Plutus script execution based on Conway CDDL specification.
 *
 * CDDL: redeemer = [ tag, index, data, ex_units ]
 * Where:
 * - tag: redeemer_tag (0=spend, 1=mint, 2=cert, 3=reward)
 * - index: uint64 (index into the respective input/output/certificate/reward array)
 * - data: plutus_data (the actual redeemer data passed to the script)
 * - ex_units: [mem: uint64, steps: uint64] (execution unit limits)
 *
 * @since 2.0.0
 * @category model
 */
export class Redeemer extends Schema.Class<Redeemer>("Redeemer")({
  tag: RedeemerTag,
  index: Numeric.Uint64Schema.annotations({
    identifier: "Redeemer.Index",
    title: "Redeemer Index",
    description: "Index into the respective transaction array (inputs, outputs, certificates, or rewards)"
  }),
  data: PlutusData.DataSchema.annotations({
    identifier: "Redeemer.Data",
    title: "Redeemer Data",
    description: "PlutusData passed to the script for validation"
  }),
  exUnits: ExUnits
}) {}

/**
 * Helper function to convert RedeemerTag string to CBOR integer.
 *
 * @since 2.0.0
 * @category utilities
 */
export const tagToInteger = (tag: RedeemerTag): bigint => {
  switch (tag) {
    case "spend":
      return 0n
    case "mint":
      return 1n
    case "cert":
      return 2n
    case "reward":
      return 3n
  }
}

/**
 * Helper function to convert CBOR integer to RedeemerTag string.
 *
 * @since 2.0.0
 * @category utilities
 */
export const integerToTag = (value: bigint): RedeemerTag => {
  switch (value) {
    case 0n:
      return "spend"
    case 1n:
      return "mint"
    case 2n:
      return "cert"
    case 3n:
      return "reward"
    default:
      throw new RedeemerError({
        message: `Invalid redeemer tag: ${value}. Must be 0 (spend), 1 (mint), 2 (cert), or 3 (reward)`
      })
  }
}

/**
 * CDDL schema for Redeemer as tuple structure.
 *
 * CDDL: redeemer = [ tag, index, data, ex_units ]
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Tuple(
  CBOR.Integer.annotations({
    identifier: "Redeemer.CDDL.Tag",
    title: "Redeemer Tag (CBOR)",
    description: "Redeemer tag as CBOR integer (0=spend, 1=mint, 2=cert, 3=reward)"
  }),
  CBOR.Integer.annotations({
    identifier: "Redeemer.CDDL.Index", 
    title: "Redeemer Index (CBOR)",
    description: "Index into transaction array as CBOR integer"
  }),
  PlutusData.CDDLSchema.annotations({
    identifier: "Redeemer.CDDL.Data",
    title: "Redeemer Data (CBOR)",
    description: "PlutusData as CBOR value"
  }),
  Schema.Tuple(CBOR.Integer, CBOR.Integer).annotations({
    identifier: "Redeemer.CDDL.ExUnits",
    title: "Execution Units (CBOR)",
    description: "Memory and CPU limits as CBOR integers"
  })
).annotations({
  identifier: "Redeemer.CDDLSchema",
  title: "Redeemer CDDL Schema",
  description: "CDDL representation of Redeemer as tuple"
})

/**
 * CDDL transformation schema for Redeemer.
 *
 * Transforms between CBOR tuple representation and Redeemer class instance.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Redeemer), {
  strict: true,
  encode: (redeemer) =>
    Effect.gen(function* () {
      const tagInteger = tagToInteger(redeemer.tag)
      const dataCBOR = yield* ParseResult.encode(PlutusData.FromCDDL)(redeemer.data)
      return [tagInteger, redeemer.index, dataCBOR, redeemer.exUnits] as const
    }),
  decode: ([tagInteger, index, dataCBOR, exUnits]) =>
    Effect.gen(function* () {
      const tag = yield* Effect.try({
        try: () => integerToTag(tagInteger),
        catch: (error) => new ParseResult.Type(RedeemerTag.ast, tagInteger, String(error))
      })
      const data = yield* ParseResult.decode(PlutusData.FromCDDL)(dataCBOR)
      return new Redeemer({ tag, index, data, exUnits })
    })
})

/**
 * CBOR bytes transformation schema for Redeemer using CDDL.
 * Transforms between CBOR bytes and Redeemer using CDDL encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Redeemer
  ).annotations({
    identifier: "Redeemer.FromCBORBytes",
    title: "Redeemer from CBOR Bytes using CDDL",
    description: "Transforms CBOR bytes to Redeemer using CDDL encoding"
  })

/**
 * CBOR hex transformation schema for Redeemer using CDDL.
 * Transforms between CBOR hex string and Redeemer using CDDL encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Redeemer
  ).annotations({
    identifier: "Redeemer.FromCBORHex",
    title: "Redeemer from CBOR Hex using CDDL",
    description: "Transforms CBOR hex string to Redeemer using CDDL encoding"
  })

// ============================================================================
// Constructors
// ============================================================================

/**
 * Create a spend redeemer for spending UTxO inputs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const spend = (index: bigint, data: PlutusData.Data, exUnits: ExUnits): Redeemer =>
  new Redeemer({ tag: "spend", index, data, exUnits })

/**
 * Create a mint redeemer for minting/burning tokens.
 *
 * @since 2.0.0
 * @category constructors
 */
export const mint = (index: bigint, data: PlutusData.Data, exUnits: ExUnits): Redeemer =>
  new Redeemer({ tag: "mint", index, data, exUnits })

/**
 * Create a cert redeemer for certificate validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const cert = (index: bigint, data: PlutusData.Data, exUnits: ExUnits): Redeemer =>
  new Redeemer({ tag: "cert", index, data, exUnits })

/**
 * Create a reward redeemer for withdrawal validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const reward = (index: bigint, data: PlutusData.Data, exUnits: ExUnits): Redeemer =>
  new Redeemer({ tag: "reward", index, data, exUnits })

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if a redeemer is for spending inputs.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isSpend = (redeemer: Redeemer): boolean => redeemer.tag === "spend"

/**
 * Check if a redeemer is for minting/burning.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isMint = (redeemer: Redeemer): boolean => redeemer.tag === "mint"

/**
 * Check if a redeemer is for certificates.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isCert = (redeemer: Redeemer): boolean => redeemer.tag === "cert"

/**
 * Check if a redeemer is for withdrawals.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isReward = (redeemer: Redeemer): boolean => redeemer.tag === "reward"

// ============================================================================
// Transformations
// ============================================================================

/**
 * Encode Redeemer to CBOR bytes.
 *
 * @since 2.0.0
 * @category transformation
 */
export const toCBORBytes = (redeemer: Redeemer, options?: CBOR.CodecOptions): Uint8Array => {
  try {
    return Schema.encodeSync(FromCBORBytes(options))(redeemer)
  } catch (cause) {
    throw new RedeemerError({
      message: "Failed to encode Redeemer to CBOR bytes",
      cause
    })
  }
}

/**
 * Encode Redeemer to CBOR hex string.
 *
 * @since 2.0.0
 * @category transformation
 */
export const toCBORHex = (redeemer: Redeemer, options?: CBOR.CodecOptions): string => {
  try {
    return Schema.encodeSync(FromCBORHex(options))(redeemer)
  } catch (cause) {
    throw new RedeemerError({
      message: "Failed to encode Redeemer to CBOR hex",
      cause
    })
  }
}

/**
 * Decode Redeemer from CBOR bytes.
 *
 * @since 2.0.0
 * @category transformation
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Redeemer => {
  try {
    return Schema.decodeSync(FromCBORBytes(options))(bytes)
  } catch (cause) {
    throw new RedeemerError({
      message: "Failed to decode Redeemer from CBOR bytes",
      cause
    })
  }
}

/**
 * Decode Redeemer from CBOR hex string.
 *
 * @since 2.0.0
 * @category transformation
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Redeemer => {
  try {
    return Schema.decodeSync(FromCBORHex(options))(hex)
  } catch (cause) {
    throw new RedeemerError({
      message: "Failed to decode Redeemer from CBOR hex",
      cause
    })
  }
}

// ============================================================================
// Generators
// ============================================================================

/**
 * FastCheck arbitrary for generating random RedeemerTag values.
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitraryRedeemerTag: FastCheck.Arbitrary<RedeemerTag> = FastCheck.constantFrom(
  "spend",
  "mint", 
  "cert",
  "reward"
)

/**
 * FastCheck arbitrary for generating random ExUnits values.
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitraryExUnits: FastCheck.Arbitrary<ExUnits> = FastCheck.tuple(
  FastCheck.bigInt({ min: 0n, max: 10_000_000n }), // memory
  FastCheck.bigInt({ min: 0n, max: 10_000_000n })  // steps
)

/**
 * FastCheck arbitrary for generating random Redeemer instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitrary: FastCheck.Arbitrary<Redeemer> = FastCheck.record({
  index: FastCheck.bigInt({ min: 0n, max: 1000n }),
  tag: arbitraryRedeemerTag,
  data: PlutusData.arbitrary,
  exUnits: arbitraryExUnits
}).map(({ data, exUnits, index, tag }) => new Redeemer({ tag, index, data, exUnits }))
