import { Data, Effect as Eff, FastCheck, Schema } from "effect"

import * as CBOR from "./CBOR.js"

/**
 * Error class for transaction metadatum related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionMetadatumError extends Data.TaggedError("TransactionMetadatumError")<{
  message?: string
  cause?: unknown
}> {}

export type TransactionMetadatum = TextMetadatum | IntMetadatum | BytesMetadatum | MetadatumMap | ArrayMetadatum

/**
 * Schema for text-based transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export class TextMetadatum extends Schema.TaggedClass<TextMetadatum>("TextMetadatum")("TextMetadatum", {
  value: Schema.String
}) {}

/**
 * Schema for integer-based transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export class IntMetadatum extends Schema.TaggedClass<IntMetadatum>("IntMetadatum")("IntMetadatum", {
  value: Schema.BigIntFromSelf
}) {}

/**
 * Schema for bytes-based transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export class BytesMetadatum extends Schema.TaggedClass<BytesMetadatum>("BytesMetadatum")("BytesMetadatum", {
  value: Schema.Uint8ArrayFromSelf
}) {}

/**
 * Schema for map-based transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export class MetadatumMap extends Schema.TaggedClass<MetadatumMap>("MetadatumMap")("MetadatumMap", {
  value: Schema.typeSchema(
    Schema.MapFromSelf({
      key: Schema.suspend((): Schema.Schema<TransactionMetadatum> => TransactionMetadatum),
      value: Schema.suspend((): Schema.Schema<TransactionMetadatum> => TransactionMetadatum)
    })
  )
}) {}

/**
 * Schema for array-based transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export class ArrayMetadatum extends Schema.TaggedClass<ArrayMetadatum>("ArrayMetadatum")("ArrayMetadatum", {
  value: Schema.Array(Schema.suspend((): Schema.Schema<TransactionMetadatum> => TransactionMetadatum))
}) {}

/**
 * Union schema for all types of transaction metadata.
 *
 * @since 2.0.0
 * @category schemas
 */
export const TransactionMetadatum = Schema.Union(
  TextMetadatum,
  IntMetadatum,
  BytesMetadatum,
  ArrayMetadatum,
  MetadatumMap
).annotations({
  identifier: "TransactionMetadatum",
  description: "A transaction metadata value supporting text, integers, bytes, arrays, and maps"
})

/**
 * Type representing the CDDL-compatible format for transaction metadata.
 *
 * @since 2.0.0
 * @category model
 */
export type CDDLSchema = bigint | string | Uint8Array | ReadonlyArray<CDDLSchema> | Map<CDDLSchema, CDDLSchema>

/**
 * Schema for CDDL-compatible transaction metadata format.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema: Schema.Schema<CDDLSchema> = Schema.Union(
  Schema.String,
  Schema.BigIntFromSelf,
  Schema.Uint8ArrayFromSelf,
  Schema.Array(Schema.suspend((): Schema.Schema<CDDLSchema> => CDDLSchema)),
  Schema.typeSchema(
    Schema.MapFromSelf({
      key: Schema.suspend((): Schema.Schema<CDDLSchema> => CDDLSchema),
      value: Schema.suspend((): Schema.Schema<CDDLSchema> => CDDLSchema)
    })
  )
).annotations({
  identifier: "TransactionMetadatum.CDDLSchema",
  description: "CDDL-compatible format for transaction metadata"
})

type encode = (
  toI: TextMetadatum | IntMetadatum | BytesMetadatum | MetadatumMap | ArrayMetadatum,
  toA: TextMetadatum | IntMetadatum | BytesMetadatum | MetadatumMap | ArrayMetadatum
) => CDDLSchema
const encode: encode = (toI, toA) => {
  switch (toI._tag) {
    case "TextMetadatum":
      return toI.value
    case "IntMetadatum":
      return toI.value
    case "BytesMetadatum":
      return toI.value
    case "ArrayMetadatum":
      return toI.value.map((item) => encode(item, toA))
    case "MetadatumMap": {
      const map = new Map<CDDLSchema, CDDLSchema>()
      for (const [key, value] of toI.value.entries()) {
        map.set(encode(key, toA), encode(value, toA))
      }
      return map
    }
  }
}

type decode = (
  fromA: CDDLSchema,
  fromI: CDDLSchema
) => TextMetadatum | IntMetadatum | BytesMetadatum | MetadatumMap | ArrayMetadatum
const decode: decode = (fromA, fromI) => {
  if (typeof fromA === "string") {
    return new TextMetadatum({ value: fromA })
  } else if (typeof fromA === "bigint") {
    return new IntMetadatum({ value: fromA })
  } else if (fromA instanceof Uint8Array) {
    return new BytesMetadatum({ value: fromA })
  } else if (Array.isArray(fromA)) {
    return new ArrayMetadatum({ value: fromA.map((item) => decode(item, fromI)) })
  } else if (fromA instanceof Map) {
    const map = new Map()
    for (const [key, value] of fromA.entries()) {
      map.set(decode(key, fromI), decode(value, fromI))
    }
    return new MetadatumMap({ value: map })
  }
  throw new TransactionMetadatumError({ message: "Invalid CDDL format" })
}

export const FromCDDL = Schema.transform(CDDLSchema, Schema.typeSchema(TransactionMetadatum), {
  strict: true,
  encode,
  decode
}).annotations({
  identifier: "TransactionMetadatum.FromCDDL",
  description: "Transforms CDDL schema to TransactionMetadatum"
})

/**
 * Schema transformer for TransactionMetadatum from CBOR bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "TransactionMetadatum.FromCBORBytes",
    description: "Transforms CBOR bytes to TransactionMetadatum"
  })

/**
 * Schema transformer for TransactionMetadatum from CBOR hex string.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCBORBytes(options)).annotations({
    identifier: "TransactionMetadatum.FromCBORHex",
    description: "Transforms CBOR hex string to TransactionMetadatum"
  })

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if two TransactionMetadatum instances are equal.
 *
 * @since 2.0.0
 * @category utilities
 */
export const equals = (a: TransactionMetadatum, b: TransactionMetadatum): boolean => {
  if (a._tag !== b._tag) return false

  switch (a._tag) {
    case "TextMetadatum":
      return a.value === (b as TextMetadatum).value
    case "IntMetadatum":
      return a.value === (b as IntMetadatum).value
    case "BytesMetadatum":
      return (
        a.value.length === (b as BytesMetadatum).value.length &&
        a.value.every((byte, i) => byte === (b as BytesMetadatum).value[i])
      )
    case "ArrayMetadatum": {
      const bArray = b as ArrayMetadatum
      return a.value.length === bArray.value.length && a.value.every((item, i) => equals(item, bArray.value[i]))
    }
    case "MetadatumMap": {
      const bMap = b as MetadatumMap
      if (a.value.size !== bMap.value.size) return false
      for (const [key, value] of a.value.entries()) {
        const bValue = Array.from(bMap.value.entries()).find(([bKey]) => equals(key, bKey))?.[1]
        if (!bValue || !equals(value, bValue)) return false
      }
      return true
    }
  }
}

/**
 * FastCheck arbitrary for generating random TransactionMetadatum instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<TransactionMetadatum> = FastCheck.oneof(
  FastCheck.string().map((value) => new TextMetadatum({ value })),
  FastCheck.bigInt().map((value) => new IntMetadatum({ value })),
  FastCheck.uint8Array({ maxLength: 10 }).map((value) => new BytesMetadatum({ value })),
  FastCheck.array(
    FastCheck.oneof(
      FastCheck.string().map((value) => new TextMetadatum({ value })),
      FastCheck.bigInt().map((value) => new IntMetadatum({ value }))
    ),
    { maxLength: 3 }
  ).map((value) => new ArrayMetadatum({ value })),
  FastCheck.array(
    FastCheck.tuple(
      FastCheck.string().map((value) => new TextMetadatum({ value })),
      FastCheck.bigInt().map((value) => new IntMetadatum({ value }))
    ),
    { maxLength: 3 }
  ).map((entries) => {
    const map = new Map()
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return new MetadatumMap({ value: map })
  })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a TransactionMetadatum from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): TransactionMetadatum =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options ?? CBOR.CML_DEFAULT_OPTIONS))

/**
 * Parse a TransactionMetadatum from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): TransactionMetadatum =>
  Eff.runSync(Effect.fromCBORHex(hex, options ?? CBOR.CML_DEFAULT_OPTIONS))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a TransactionMetadatum to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (metadatum: TransactionMetadatum, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(metadatum, options ?? CBOR.CML_DEFAULT_OPTIONS))

/**
 * Convert a TransactionMetadatum to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (metadatum: TransactionMetadatum, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(metadatum, options ?? CBOR.CML_DEFAULT_OPTIONS))

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a TextMetadatum from a string value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const text = (value: string): TextMetadatum => new TextMetadatum({ value })

/**
 * Create an IntMetadatum from a bigint value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const int = (value: bigint): IntMetadatum => new IntMetadatum({ value })

/**
 * Create a BytesMetadatum from a Uint8Array value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const bytes = (value: Uint8Array): BytesMetadatum => new BytesMetadatum({ value })

/**
 * Create an ArrayMetadatum from an array of TransactionMetadatum values.
 *
 * @since 2.0.0
 * @category constructors
 */
export const array = (value: Array<TransactionMetadatum>): ArrayMetadatum => new ArrayMetadatum({ value })

/**
 * Create a MetadatumMap from a Map of TransactionMetadatum key-value pairs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const map = (value: Map<TransactionMetadatum, TransactionMetadatum>): MetadatumMap => new MetadatumMap({ value })

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse a TransactionMetadatum from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<TransactionMetadatum, TransactionMetadatumError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionMetadatumError({
            message: "Failed to decode TransactionMetadatum from CBOR bytes",
            cause
          })
      )
    )

  /**
   * Parse a TransactionMetadatum from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<TransactionMetadatum, TransactionMetadatumError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionMetadatumError({
            message: "Failed to decode TransactionMetadatum from CBOR hex",
            cause
          })
      )
    )

  /**
   * Convert a TransactionMetadatum to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    metadatum: TransactionMetadatum,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, TransactionMetadatumError> =>
    Schema.encode(FromCBORBytes(options))(metadatum).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionMetadatumError({
            message: "Failed to encode TransactionMetadatum to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Convert a TransactionMetadatum to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    metadatum: TransactionMetadatum,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, TransactionMetadatumError> =>
    Schema.encode(FromCBORHex(options))(metadatum).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionMetadatumError({
            message: "Failed to encode TransactionMetadatum to CBOR hex",
            cause
          })
      )
    )
}
