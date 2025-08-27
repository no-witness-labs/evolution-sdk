import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as PlutusData from "./Data.js"
import * as Function from "./Function.js"

/**
 * Error class for DatumOption related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class DatumOptionError extends Data.TaggedError("DatumOptionError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for DatumHash variant of DatumOption.
 * Represents a reference to datum data stored elsewhere via its hash.
 *
 * @since 2.0.0
 * @category schemas
 */
export class DatumHash extends Schema.TaggedClass<DatumHash>()("DatumHash", {
  hash: Bytes32.BytesSchema
}) {
  toString(): string {
    return `DatumHash { hash: ${this.hash} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

export const DatumHashFromBytes = Schema.transform(Bytes32.BytesSchema, DatumHash, {
  strict: true,
  decode: (bytes) => new DatumHash({ hash: bytes }, { disableValidation: true }),
  encode: (dh) => dh.hash
}).annotations({
  identifier: "DatumOption.DatumHashFromBytes"
})

/**
 * Schema for InlineDatum variant of DatumOption.
 * Represents inline plutus data embedded directly in the transaction output.
 *
 * @since 2.0.0
 * @category schemas
 */
export class InlineDatum extends Schema.TaggedClass<InlineDatum>()("InlineDatum", {
  data: PlutusData.DataSchema
}) {
  toString(): string {
    return `InlineDatum { data: ${this.data} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

/**
 * Schema for DatumOption representing optional datum information in transaction outputs.
 *
 * CDDL: datum_option = [0, Bytes32// 1, data]
 *
 * Where:
 * - [0, Bytes32] represents a datum hash reference
 * - [1, data] represents inline plutus data
 *
 * @since 2.0.0
 * @category schemas
 */
export const DatumOptionSchema = Schema.Union(DatumHash, InlineDatum).annotations({
  identifier: "DatumOption"
})

/**
 * Type alias for DatumOption representing optional datum information.
 * Can be either a hash reference to datum data or inline plutus data.
 *
 * @since 2.0.0
 * @category model
 */
export type DatumOption = typeof DatumOptionSchema.Type

/**
 * Create a DatumOption with a datum hash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeDatumHash = (...args: ConstructorParameters<typeof DatumHash>) => new DatumHash(...args)

/**
 * Create a DatumOption with inline data.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeInlineDatum = (...args: ConstructorParameters<typeof InlineDatum>) => new InlineDatum(...args)

/**
 * Check if a DatumOption is a datum hash.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDatumHash = Schema.is(DatumHash)

/**
 * Check if a DatumOption is inline data.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isInlineDatum = Schema.is(InlineDatum)

/**
 * Check if two DatumOption instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: DatumOption, b: DatumOption): boolean => {
  if (a._tag !== b._tag) return false
  if (a._tag === "DatumHash" && b._tag === "DatumHash") {
    return Bytes32.equals(a.hash, b.hash)
  }
  if (a._tag === "InlineDatum" && b._tag === "InlineDatum") {
    return PlutusData.equals(a.data, b.data)
  }
  return false
}

export const datumHashArbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (hash) => new DatumHash({ hash })
)
export const inlineDatumArbitrary = PlutusData.arbitrary.map((data) => new InlineDatum({ data }))

/**
 * FastCheck arbitrary for generating random DatumOption instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.oneof(datumHashArbitrary, inlineDatumArbitrary)

export const CDDLSchema = Schema.Union(
  Schema.Tuple(Schema.Literal(0n), CBOR.ByteArray), // [0, Bytes32]
  Schema.Tuple(Schema.Literal(1n), CBOR.tag(24, Schema.Uint8ArrayFromSelf)) // [1, tag(24, bytes)] - PlutusData as bytes in tag 24
)

/**
 * CDDL schema for DatumOption.
 * datum_option = [0, Bytes32] / [1, #6.24(bytes)]
 *
 * Where:
 * - [0, Bytes32] represents a datum hash (tag 0 with 32-byte hash)
 * - [1, #6.24(bytes)] represents inline data (tag 1 with CBOR tag 24 containing plutus data as bytes)
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(DatumOptionSchema), {
  strict: true,
  encode: (toA) =>
    E.gen(function* () {
      const result =
        toA._tag === "DatumHash"
          ? ([0n, toA.hash] as const) // Encode as [0, Bytes32]
          : ([1n, { _tag: "Tag" as const, tag: 24 as const, value: PlutusData.toCBORBytes(toA.data) }] as const) // Encode as [1, tag(24, bytes)]
      return yield* E.right(result)
    }),
  decode: ([tag, value], _, ast) =>
    E.gen(function* () {
      if (tag === 0n) {
        // Decode as DatumHash
        return yield* E.right(new DatumHash({ hash: value }, { disableValidation: true }))
      } else if (tag === 1n) {
        // Decode as InlineDatum - value is now a CBOR tag 24 wrapper containing bytes
        const taggedValue = value as { _tag: "Tag"; tag: number; value: Uint8Array }
        if (taggedValue._tag !== "Tag" || taggedValue.tag !== 24) {
          return yield* E.left(
            new ParseResult.Type(
              ast,
              [tag, value],
              `Invalid InlineDatum format: expected tag 24, got ${taggedValue._tag} with tag ${taggedValue.tag}`
            )
          )
        }
        return yield* E.right(
          new InlineDatum(
            {
              data: PlutusData.fromCBORBytes(taggedValue.value)
            },
            { disableValidation: true }
          )
        )
      }
      return yield* E.left(new ParseResult.Type(ast, [tag, value], `Invalid DatumOption tag: ${tag}. Expected 0 or 1.`))
    })
}).annotations({
  identifier: "DatumOption.DatumOptionCDDLSchema",
  description: "Transforms CBOR structure to DatumOption"
})

/**
 * CBOR bytes transformation schema for DatumOption.
 * Transforms between Uint8Array and DatumOption using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → DatumOption
  ).annotations({
    identifier: "DatumOption.FromCBORBytes",
    description: "Transforms CBOR bytes to DatumOption"
  })

/**
 * CBOR hex transformation schema for DatumOption.
 * Transforms between hex string and DatumOption using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → DatumOption
  ).annotations({
    identifier: "DatumOption.FromCBORHex",
    description: "Transforms CBOR hex string to DatumOption"
  })

/**
 * Either namespace for DatumOption operations that can fail
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse a DatumOption from CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, DatumOptionError)

  /**
   * Parse a DatumOption from CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, DatumOptionError)

  /**
   * Convert a DatumOption to CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, DatumOptionError)

  /**
   * Convert a DatumOption to CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, DatumOptionError)
}

/**
 * Convert DatumOption to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, DatumOptionError, "DatumOption.toCBORBytes")

/**
 * Convert DatumOption to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, DatumOptionError, "DatumOption.toCBORHex")

/**
 * Convert CBOR bytes to DatumOption (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, DatumOptionError, "DatumOption.fromCBORBytes")

/**
 * Convert CBOR hex string to DatumOption (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, DatumOptionError, "DatumOption.fromCBORHex")
