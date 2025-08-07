import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as DatumOption from "./DatumOption.js"
import * as ScriptRef from "./ScriptRef.js"
import * as Value from "./Value.js"

export class TransactionOutputError extends Data.TaggedError("TransactionOutputError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * TransactionOutput types based on Conway CDDL specification
 *
 * ```
 * CDDL: transaction_output = shelley_transaction_output / babbage_transaction_output
 *
 * shelley_transaction_output = [address, amount : value, ? Bytes32]
 *
 * babbage_transaction_output =
 *   {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
 * ```
 *
 * @since 2.0.0
 * @category model
 */

/**
 * Shelley-era transaction output format
 *
 * ```
 * CDDL: shelley_transaction_output = [address, amount : value, ? Bytes32]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ShelleyTransactionOutput extends Schema.TaggedClass<ShelleyTransactionOutput>()(
  "ShelleyTransactionOutput",
  {
    address: Address.Address,
    amount: Value.Value,
    datumHash: Schema.optional(Bytes32.HexSchema)
  }
) {}

/**
 * Babbage-era transaction output format
 *
 * ```
 * CDDL: babbage_transaction_output =
 *   {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class BabbageTransactionOutput extends Schema.TaggedClass<BabbageTransactionOutput>()(
  "BabbageTransactionOutput",
  {
    address: Address.Address, // 0
    amount: Value.Value, // 1
    datumOption: Schema.optional(DatumOption.DatumOptionSchema), // 2
    scriptRef: Schema.optional(ScriptRef.ScriptRef) // 3
  }
) {}

/**
 * Union type for transaction outputs
 *
 * ```
 * CDDL: transaction_output = shelley_transaction_output / babbage_transaction_output
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const TransactionOutput = Schema.Union(ShelleyTransactionOutput, BabbageTransactionOutput)

export type TransactionOutput = typeof TransactionOutput.Type

export const ShelleyTransactionOutputCDDL = Schema.Tuple(
  Schema.Uint8ArrayFromSelf, // address as bytes
  Schema.encodedSchema(Value.FromCDDL), // value
  Schema.optionalElement(Schema.Uint8ArrayFromSelf) // optional datum_hash as bytes
)

/**
 * CDDL schema for Shelley transaction outputs
 *
 * ```
 * CDDL: shelley_transaction_output = [address, amount : value, ? Bytes32]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromShelleyTransactionOutputCDDLSchema = Schema.transformOrFail(
  ShelleyTransactionOutputCDDL,
  Schema.typeSchema(ShelleyTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      Eff.gen(function* () {
        const addressBytes = yield* ParseResult.encode(Address.FromBytes)(toI.address)
        const valueBytes = yield* ParseResult.encode(Value.FromCDDL)(toI.amount)

        if (toI.datumHash !== undefined) {
          const hashBytes = yield* ParseResult.encode(Bytes.FromBytes)(toI.datumHash)
          return [addressBytes, valueBytes, hashBytes] as const
        }

        return [addressBytes, valueBytes] as const
      }),
    decode: (fromI) =>
      Eff.gen(function* () {
        const [addressBytes, valueBytes, datumHashBytes] = fromI

        const address = yield* ParseResult.decode(Address.FromBytes)(addressBytes)
        const amount = yield* ParseResult.decode(Value.FromCDDL)(valueBytes)

        let datumHash: string | undefined
        if (datumHashBytes !== undefined) {
          datumHash = yield* ParseResult.decode(Bytes.FromBytes)(datumHashBytes)
        }

        return new ShelleyTransactionOutput({
          address,
          amount,
          datumHash
        })
      })
  }
)

const BabbageTransactionOutputCDDL = Schema.Struct({
  0: Schema.Uint8ArrayFromSelf, // address as bytes
  1: Schema.encodedSchema(Value.FromCDDL), // value
  2: Schema.optional(Schema.encodedSchema(DatumOption.DatumOptionCDDLSchema)), // optional datum_option
  3: Schema.optional(Schema.encodedSchema(ScriptRef.FromCDDL)) // optional script_ref
})

/**
 * CDDL schema for Babbage transaction outputs
 *
 * ```
 * CDDL: babbage_transaction_output = {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBabbageTransactionOutputCDDLSchema = Schema.transformOrFail(
  BabbageTransactionOutputCDDL,
  Schema.typeSchema(BabbageTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      Eff.gen(function* () {
        const addressBytes = yield* ParseResult.encode(Address.FromBytes)(toI.address)
        const valueBytes = yield* ParseResult.encode(Value.FromCDDL)(toI.amount)

        // Prepare optional fields
        const datumOptionBytes =
          toI.datumOption !== undefined
            ? yield* ParseResult.encode(DatumOption.DatumOptionCDDLSchema)(toI.datumOption)
            : undefined

        const scriptRefBytes =
          toI.scriptRef !== undefined ? yield* ParseResult.encode(ScriptRef.FromCDDL)(toI.scriptRef) : undefined

        // Build result object with conditional properties
        return {
          0: addressBytes,
          1: valueBytes,
          ...(datumOptionBytes !== undefined && { 2: datumOptionBytes }),
          ...(scriptRefBytes !== undefined && { 3: scriptRefBytes })
        }
      }),
    decode: (fromI) =>
      Eff.gen(function* () {
        const addressBytes = fromI[0]
        const valueBytes = fromI[1]
        const datumOptionBytes = fromI[2]
        const scriptRefBytes = fromI[3]

        if (addressBytes === undefined || valueBytes === undefined) {
          return yield* ParseResult.fail(new ParseResult.Type(BabbageTransactionOutput.ast, fromI))
        }

        const address = yield* ParseResult.decode(Address.FromBytes)(addressBytes)
        const amount = yield* ParseResult.decode(Value.FromCDDL)(valueBytes)

        let datumOption: DatumOption.DatumOption | undefined
        if (datumOptionBytes !== undefined) {
          datumOption = yield* ParseResult.decode(DatumOption.DatumOptionCDDLSchema)(datumOptionBytes)
        }

        let scriptRef: ScriptRef.ScriptRef | undefined
        if (scriptRefBytes !== undefined) {
          scriptRef = yield* ParseResult.decode(ScriptRef.FromCDDL)(scriptRefBytes)
        }

        return new BabbageTransactionOutput({
          address,
          amount,
          datumOption,
          scriptRef
        })
      })
  }
)

export const CDDLSchema = Schema.Union(ShelleyTransactionOutputCDDL, BabbageTransactionOutputCDDL)

/**
 * CDDL schema for transaction outputs
 *
 * ```
 * CDDL: transaction_output = shelley_transaction_output / babbage_transaction_output
 * shelley_transaction_output = [address, amount : value, ? Bytes32]
 * babbage_transaction_output = {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromTransactionOutputCDDLSchema = Schema.Union(
  FromShelleyTransactionOutputCDDLSchema,
  FromBabbageTransactionOutputCDDLSchema
)

/**
 * CBOR bytes transformation schema for TransactionOutput.
 * Transforms between CBOR bytes and TransactionOutput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromTransactionOutputCDDLSchema // CBOR → TransactionOutput
  ).annotations({
    identifier: "TransactionOutput.FromCBORBytes",
    title: "TransactionOutput from CBOR Bytes",
    description: "Transforms CBOR bytes (Uint8Array) to TransactionOutput"
  })

/**
 * CBOR hex transformation schema for TransactionOutput.
 * Transforms between CBOR hex string and TransactionOutput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → TransactionOutput
  ).annotations({
    identifier: "TransactionOutput.FromCBORHex",
    title: "TransactionOutput from CBOR Hex",
    description: "Transforms CBOR hex string to TransactionOutput"
  })

/**
 * Check if two TransactionOutput instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionOutput, b: TransactionOutput): boolean => {
  if (a._tag !== b._tag) return false

  if (a._tag === "ShelleyTransactionOutput" && b._tag === "ShelleyTransactionOutput") {
    return a.address === b.address && a.amount === b.amount && a.datumHash === b.datumHash
  }

  if (a._tag === "BabbageTransactionOutput" && b._tag === "BabbageTransactionOutput") {
    return (
      a.address === b.address && a.amount === b.amount && a.datumOption === b.datumOption && a.scriptRef === b.scriptRef
    )
  }

  return false
}

/**
 * Create a Shelley transaction output.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeShelley = (
  address: Address.Address,
  amount: Value.Value,
  datumHash?: string
): ShelleyTransactionOutput => new ShelleyTransactionOutput({ address, amount, datumHash })

/**
 * Create a Babbage transaction output.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeBabbage = (
  address: Address.Address,
  amount: Value.Value,
  datumOption?: DatumOption.DatumOption,
  scriptRef?: ScriptRef.ScriptRef
): BabbageTransactionOutput => new BabbageTransactionOutput({ address, amount, datumOption, scriptRef })

/**
 * @since 2.0.0
 * @category FastCheck
 */
export const arbitrary = (): FastCheck.Arbitrary<TransactionOutput> =>
  FastCheck.constant(
    // Return a basic instance that will be properly typed by the schema
    {} as TransactionOutput
  )

/**
 * Effect namespace containing schema decode and encode operations.
 *
 * @since 2.0.0
 * @category Effect
 */
export namespace Effect {
  /**
   * Parse a TransactionOutput from CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    input: Uint8Array,
    options?: CBOR.CodecOptions
  ): Eff.Effect<TransactionOutput, TransactionOutputError> =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(input),
      (cause) => new TransactionOutputError({ message: "Failed to decode TransactionOutput from CBOR bytes", cause })
    )

  /**
   * Parse a TransactionOutput from CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    input: string,
    options?: CBOR.CodecOptions
  ): Eff.Effect<TransactionOutput, TransactionOutputError> =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(input),
      (cause) => new TransactionOutputError({ message: "Failed to decode TransactionOutput from CBOR hex", cause })
    )

  /**
   * Convert a TransactionOutput to CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    value: TransactionOutput,
    options?: CBOR.CodecOptions
  ): Eff.Effect<Uint8Array, TransactionOutputError> =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(value),
      (cause) => new TransactionOutputError({ message: "Failed to encode TransactionOutput to CBOR bytes", cause })
    )

  /**
   * Convert a TransactionOutput to CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    value: TransactionOutput,
    options?: CBOR.CodecOptions
  ): Eff.Effect<string, TransactionOutputError> =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(value),
      (cause) => new TransactionOutputError({ message: "Failed to encode TransactionOutput to CBOR hex", cause })
    )
}

/**
 * Convert TransactionOutput to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: TransactionOutput, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Convert TransactionOutput to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: TransactionOutput, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(value, options))

/**
 * Parse TransactionOutput from CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORBytes = (value: Uint8Array, options?: CBOR.CodecOptions): TransactionOutput =>
  Eff.runSync(Effect.fromCBORBytes(value, options))

/**
 * Parse TransactionOutput from CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORHex = (value: string, options?: CBOR.CodecOptions): TransactionOutput =>
  Eff.runSync(Effect.fromCBORHex(value, options))
