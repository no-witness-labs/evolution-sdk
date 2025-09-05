import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Numeric from "./Numeric.js"
import * as TransactionMetadatum from "./TransactionMetadatum.js"

/**
 * Error class for Metadata related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MetadataError extends Data.TaggedError("MetadataError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Type representing a transaction metadatum label (uint .size 8).
 *
 * @since 2.0.0
 * @category model
 */
export type MetadataLabel = typeof MetadataLabel.Type

/**
 * Schema for transaction metadatum label (uint .size 8).
 *
 * @since 2.0.0
 * @category schemas
 */
export const MetadataLabel = Numeric.Uint8Schema.annotations({
  identifier: "Metadata.MetadataLabel",
  description: "A transaction metadatum label (0-255)"
})

/**
 * Schema for transaction metadata (map from labels to metadata).
 * ```
 * Represents: metadata = {* transaction_metadatum_label => transaction_metadatum}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const Metadata = Schema.MapFromSelf({
  key: MetadataLabel,
  value: TransactionMetadatum.TransactionMetadatum
}).annotations({
  identifier: "Metadata",
  description: "Transaction metadata as a map from labels to transaction metadata values"
})

export type Metadata = typeof Metadata.Type

/**
 * Schema for CDDL-compatible metadata format.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: Schema.BigIntFromSelf,
  value: TransactionMetadatum.CDDLSchema
})

/**
 * Transform schema from CDDL to Metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Metadata), {
  strict: true,
  encode: (toI) =>
    E.gen(function* () {
      const map = new Map<bigint, TransactionMetadatum.CDDLSchema>()
      for (const [label, metadatum] of toI.entries()) {
        const transactionMetadatum = yield* ParseResult.encodeEither(TransactionMetadatum.FromCDDL)(metadatum)
        map.set(label, transactionMetadatum)
      }
      return map
    }),
  decode: (fromA) =>
    E.gen(function* () {
      const map = new Map<MetadataLabel, TransactionMetadatum.TransactionMetadatum>()
      for (const [label, metadatum] of fromA.entries()) {
        const transactionMetadatum = yield* ParseResult.decodeEither(TransactionMetadatum.FromCDDL)(metadatum)
        map.set(label, transactionMetadatum)
      }
      return map
    })
})

/**
 * Schema transformer for Metadata from CBOR bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "Metadata.FromCBORBytes",
    description: "Transforms CBOR bytes to Metadata"
  })

/**
 * Schema transformer for Metadata from CBOR hex string.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCBORBytes(options)).annotations({
    identifier: "Metadata.FromCBORHex",
    description: "Transforms CBOR hex string to Metadata"
  })

// make

/**
 * Smart constructor for Metadata that validates and applies typing.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof Metadata>) => new Metadata(...args)

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if two Metadata instances are equal.
 *
 * @since 2.0.0
 * @category utilities
 */
export const equals = (a: Metadata, b: Metadata): boolean => {
  if (a.size !== b.size) return false

  for (const [key, value] of a.entries()) {
    const bValue = b.get(key)
    if (!bValue || !TransactionMetadatum.equals(value, bValue)) return false
  }

  return true
}

/**
 * FastCheck arbitrary for generating random Metadata instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<Metadata> = FastCheck.array(
  FastCheck.tuple(
    FastCheck.bigInt({ min: 0n, max: 255n }), // MetadataLabel (uint8)
    TransactionMetadatum.arbitrary
  ),
  { maxLength: 5 }
).map((entries) => fromEntries(entries))

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse Metadata from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, MetadataError, "Metadata.fromCBORBytes")

/**
 * Parse Metadata from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, MetadataError, "Metadata.fromCBORHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert Metadata to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, MetadataError, "Metadata.toCBORBytes")

/**
 * Convert Metadata to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, MetadataError, "Metadata.toCBORHex")

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create Metadata from an array of label-metadatum pairs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromEntries = (entries: Array<[MetadataLabel, TransactionMetadatum.TransactionMetadatum]>): Metadata =>
  (new Map(entries))

/**
 * Create an empty Metadata map.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): Metadata => new Map() as Metadata

/**
 * Add or update a metadata entry.
 *
 * @since 2.0.0
 * @category constructors
 */
export const set = (
  metadata: Metadata,
  label: MetadataLabel,
  metadatum: TransactionMetadatum.TransactionMetadatum
): Metadata => {
  const newMap = new Map(metadata)
  newMap.set(label, metadatum)
  return newMap as Metadata
}

/**
 * Get a metadata entry by label.
 *
 * @since 2.0.0
 * @category utilities
 */
export const get = (metadata: Metadata, label: MetadataLabel): TransactionMetadatum.TransactionMetadatum | undefined =>
  metadata.get(label)

/**
 * Check if a label exists in the metadata.
 *
 * @since 2.0.0
 * @category utilities
 */
export const has = (metadata: Metadata, label: MetadataLabel): boolean => metadata.has(label)

/**
 * Remove a metadata entry by label.
 *
 * @since 2.0.0
 * @category constructors
 */
export const remove = (metadata: Metadata, label: MetadataLabel): Metadata => {
  const newMap = new Map(metadata)
  newMap.delete(label)
  return newMap as Metadata
}

/**
 * Get the size (number of entries) of the metadata.
 *
 * @since 2.0.0
 * @category utilities
 */
export const size = (metadata: Metadata): number => metadata.size

/**
 * Get all labels in the metadata.
 *
 * @since 2.0.0
 * @category utilities
 */
export const labels = (metadata: Metadata): Array<MetadataLabel> => Array.from(metadata.keys())

/**
 * Get all metadata values in the metadata.
 *
 * @since 2.0.0
 * @category utilities
 */
export const values = (metadata: Metadata): Array<TransactionMetadatum.TransactionMetadatum> =>
  Array.from(metadata.values())

/**
 * Get all entries in the metadata.
 *
 * @since 2.0.0
 * @category utilities
 */
export const entries = (metadata: Metadata): Array<[MetadataLabel, TransactionMetadatum.TransactionMetadatum]> =>
  Array.from(metadata.entries())

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse Metadata from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, MetadataError)

  /**
   * Parse Metadata from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, MetadataError)

  /**
   * Convert Metadata to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, MetadataError)

  /**
   * Convert Metadata to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, MetadataError)
}
