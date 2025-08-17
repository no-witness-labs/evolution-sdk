import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as DatumOption from "./DatumOption.js"
import * as Function from "./Function.js"
import * as ScriptRef from "./ScriptRef.js"
import * as Value from "./Value.js"

export class TransactionOutputError extends Data.TaggedError("TransactionOutputError")<{
  message?: string
  cause?: unknown
}> {}

// Pre-bind frequently used ParseResult helpers for hot paths
const encAddress = ParseResult.encodeEither(Address.FromBytes)
const decAddress = ParseResult.decodeEither(Address.FromBytes)
const encValue = ParseResult.encodeEither(Value.FromCDDL)
const decValue = ParseResult.decodeEither(Value.FromCDDL)
const encDatumOption = ParseResult.encodeEither(DatumOption.DatumOptionCDDLSchema)
const decDatumOption = ParseResult.decodeEither(DatumOption.DatumOptionCDDLSchema)
const decDatumHash = ParseResult.decodeEither(DatumOption.DatumHashFromBytes)
const encScriptRef = ParseResult.encodeEither(ScriptRef.FromCDDL)
const decScriptRef = ParseResult.decodeEither(ScriptRef.FromCDDL)

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
    datumHash: Schema.optional(DatumOption.DatumHash)
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
  Value.CDDLSchema, // value
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
      E.gen(function* () {
        const addressBytes = yield* encAddress(toI.address)
        const valueBytes = yield* encValue(toI.amount)

        if (toI.datumHash !== undefined) {
          return [addressBytes, valueBytes, toI.datumHash.hash] as const
        }

        return [addressBytes, valueBytes] as const
      }),
    decode: (fromI) =>
      E.gen(function* () {
        const [addressBytes, valueBytes, datumHashBytes] = fromI

        const address = yield* decAddress(addressBytes)
        const amount = yield* decValue(valueBytes)
        let datumHash: DatumOption.DatumHash | undefined
        if (datumHashBytes !== undefined) {
          datumHash = yield* decDatumHash(datumHashBytes)
        }

        return new ShelleyTransactionOutput(
          {
            address,
            amount,
            datumHash
          },
          { disableValidation: true }
        )
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
      E.gen(function* () {
        const addressBytes = yield* encAddress(toI.address)
        const valueBytes = yield* encValue(toI.amount)

        // Prepare optional fields
        const datumOptionBytes = toI.datumOption !== undefined ? yield* encDatumOption(toI.datumOption) : undefined

        const scriptRefBytes = toI.scriptRef !== undefined ? yield* encScriptRef(toI.scriptRef) : undefined

        // Build result object with conditional properties
        return {
          0: addressBytes,
          1: valueBytes,
          ...(datumOptionBytes !== undefined && { 2: datumOptionBytes }),
          ...(scriptRefBytes !== undefined && { 3: scriptRefBytes })
        }
      }),
    decode: (fromI) =>
      E.gen(function* () {
        const addressBytes = fromI[0]
        const valueBytes = fromI[1]
        const datumOptionBytes = fromI[2]
        const scriptRefBytes = fromI[3]

        if (addressBytes === undefined || valueBytes === undefined) {
          // return yield* ParseResult.fail(new ParseResult.Type(BabbageTransactionOutput.ast, fromI))
          return yield* E.left(new ParseResult.Type(BabbageTransactionOutput.ast, fromI))
        }

        const address = yield* decAddress(addressBytes)
        const amount = yield* decValue(valueBytes)

        let datumOption: DatumOption.DatumOption | undefined
        if (datumOptionBytes !== undefined) {
          datumOption = yield* decDatumOption(datumOptionBytes)
        }

        let scriptRef: ScriptRef.ScriptRef | undefined
        if (scriptRefBytes !== undefined) {
          scriptRef = yield* decScriptRef(scriptRefBytes)
        }

        return new BabbageTransactionOutput(
          {
            address,
            amount,
            datumOption,
            scriptRef
          },
          { disableValidation: true }
        )
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
  datumHash?: DatumOption.DatumHash
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
  FastCheck.oneof(
    // Shelley TransactionOutput
    FastCheck.record({
      address: Address.arbitrary,
      amount: Coin.arbitrary.map((coin) => Value.onlyCoin(coin)),
      datumHash: FastCheck.option(DatumOption.datumHashArbitrary, { nil: undefined })
    }).map((props) => new ShelleyTransactionOutput(props)),

    // Babbage TransactionOutput
    FastCheck.record({
      address: Address.arbitrary,
      amount: Coin.arbitrary.map((coin) => Value.onlyCoin(coin)),
      datumOption: FastCheck.option(DatumOption.arbitrary, { nil: undefined }),
      scriptRef: FastCheck.option(ScriptRef.arbitrary, { nil: undefined })
    }).map((props) => new BabbageTransactionOutput(props))
  )

/**
 * Either namespace containing schema decode and encode operations.
 *
 * @since 2.0.0
 * @category Either
 */
export namespace Either {
  /**
   * Parse a TransactionOutput from CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeDecodeEither(FromCBORBytes(options), TransactionOutputError)(bytes)

  /**
   * Parse a TransactionOutput from CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeDecodeEither(FromCBORHex(options), TransactionOutputError)(hex)

  /**
   * Convert a TransactionOutput to CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: TransactionOutput, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeEncodeEither(FromCBORBytes(options), TransactionOutputError)(value)

  /**
   * Convert a TransactionOutput to CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: TransactionOutput, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
    Function.makeEncodeEither(FromCBORHex(options), TransactionOutputError)(value)
}

/**
 * Convert TransactionOutput to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: TransactionOutput, options?: CBOR.CodecOptions): Uint8Array =>
  Function.makeEncodeSync(FromCBORBytes(options), TransactionOutputError, "TransactionOutput.toCBORBytes")(value)

/**
 * Convert TransactionOutput to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: TransactionOutput, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), TransactionOutputError, "TransactionOutput.toCBORHex")(value)

/**
 * Parse TransactionOutput from CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): TransactionOutput =>
  Function.makeDecodeSync(FromCBORBytes(options), TransactionOutputError, "TransactionOutput.fromCBORBytes")(bytes)

/**
 * Parse TransactionOutput from CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): TransactionOutput =>
  Function.makeDecodeSync(FromCBORHex(options), TransactionOutputError, "TransactionOutput.fromCBORHex")(hex)
