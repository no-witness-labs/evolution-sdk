import { Data, Effect, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
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

export type TransactionOutput = Schema.Schema.Type<typeof TransactionOutput>

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
export const ShelleyTransactionOutputCDDLSchema = Schema.transformOrFail(
  Schema.Tuple(
    Schema.Uint8ArrayFromSelf, // address as bytes
    Schema.encodedSchema(Value.ValueCDDLSchema), // value
    Schema.optionalElement(Schema.Uint8ArrayFromSelf) // optional datum_hash as bytes
  ),
  Schema.typeSchema(ShelleyTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      Effect.gen(function* () {
        const addressBytes = yield* ParseResult.encode(Address.FromBytes)(toI.address)
        const valueBytes = yield* ParseResult.encode(Value.ValueCDDLSchema)(toI.amount)

        if (toI.datumHash !== undefined) {
          const hashBytes = yield* ParseResult.encode(Bytes.FromBytes)(toI.datumHash)
          return [addressBytes, valueBytes, hashBytes] as const
        }

        return [addressBytes, valueBytes] as const
      }),
    decode: (fromI) =>
      Effect.gen(function* () {
        const [addressBytes, valueBytes, datumHashBytes] = fromI

        const address = yield* ParseResult.decode(Address.FromBytes)(addressBytes)
        const amount = yield* ParseResult.decode(Value.ValueCDDLSchema)(valueBytes)

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
export const BabbageTransactionOutputCDDLSchema = Schema.transformOrFail(
  Schema.Struct({
    0: Schema.Uint8ArrayFromSelf, // address as bytes
    1: Schema.encodedSchema(Value.ValueCDDLSchema), // value
    2: Schema.optional(Schema.encodedSchema(DatumOption.DatumOptionCDDLSchema)), // optional datum_option
    3: Schema.optional(Schema.encodedSchema(ScriptRef.FromCDDL)) // optional script_ref
  }),
  Schema.typeSchema(BabbageTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      Effect.gen(function* () {
        const addressBytes = yield* ParseResult.encode(Address.FromBytes)(toI.address)
        const valueBytes = yield* ParseResult.encode(Value.ValueCDDLSchema)(toI.amount)

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
      Effect.gen(function* () {
        const addressBytes = fromI[0]
        const valueBytes = fromI[1]
        const datumOptionBytes = fromI[2]
        const scriptRefBytes = fromI[3]

        if (addressBytes === undefined || valueBytes === undefined) {
          return yield* ParseResult.fail(new ParseResult.Type(BabbageTransactionOutput.ast, fromI))
        }

        const address = yield* ParseResult.decode(Address.FromBytes)(addressBytes)
        const amount = yield* ParseResult.decode(Value.ValueCDDLSchema)(valueBytes)

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
export const TransactionOutputCDDLSchema = Schema.Union(
  ShelleyTransactionOutputCDDLSchema,
  BabbageTransactionOutputCDDLSchema
)

/**
 * CBOR bytes transformation schema for TransactionOutput.
 * Transforms between Uint8Array and TransactionOutput using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    TransactionOutputCDDLSchema // CBOR → TransactionOutput
  )

/**
 * CBOR hex transformation schema for TransactionOutput.
 * Transforms between hex string and TransactionOutput using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → TransactionOutput
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    TransactionOutputError
  )
