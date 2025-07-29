import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as Numeric from "./Numeric.js"
import * as TransactionHash from "./TransactionHash.js"

/**
 * CDDL specs
 * transaction_input = [transaction_id : $Bytes32, index : uint .size 2]
 */

/**
 * Error class for TransactionInput related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionInputError extends Data.TaggedError("TransactionInputError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for TransactionInput representing a transaction input with transaction id and index.
 * transaction_input = [transaction_id : $Bytes32, index : uint .size 2]
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionInput extends Schema.TaggedClass<TransactionInput>()("TransactionInput", {
  transactionId: TransactionHash.TransactionHash,
  index: Numeric.Uint16Schema
}) {}

/**
 * Check if the given value is a valid TransactionInput.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isTransactionInput = Schema.is(TransactionInput)

/**
 * CDDL schema for TransactionInput.
 * transaction_input = [transaction_id : $Bytes32, index : uint .size 2]
 *
 * @since 2.0.0
 * @category schemas
 */
export const TransactionInputCDDLSchema = Schema.transformOrFail(
  Schema.Tuple(
    Schema.Uint8ArrayFromSelf, // transaction_id as bytes
    CBOR.Integer // index as bigint
  ),
  Schema.typeSchema(TransactionInput),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const txHashBytes = yield* ParseResult.encode(TransactionHash.BytesSchema)(toA.transactionId)
        return [txHashBytes, BigInt(toA.index)] as const
      }),
    decode: ([txHashBytes, indexBigInt]) =>
      Effect.gen(function* () {
        const transactionId = yield* ParseResult.decode(TransactionHash.BytesSchema)(txHashBytes)
        return yield* ParseResult.decode(TransactionInput)({
          _tag: "TransactionInput",
          transactionId,
          index: Number(indexBigInt)
        })
      })
  }
)

/**
 * CBOR bytes transformation schema for TransactionInput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    TransactionInputCDDLSchema // CBOR → TransactionInput
  )

/**
 * CBOR hex transformation schema for TransactionInput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → TransactionInput
  )

/**
 * Check if two TransactionInput instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionInput, b: TransactionInput): boolean =>
  a._tag === b._tag && a.index === b.index && a.transactionId === b.transactionId

/**
 * FastCheck generator for TransactionInput instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.tuple(TransactionHash.generator, Numeric.Uint16Generator).map(
  ([transactionId, index]) =>
    new TransactionInput({
      transactionId,
      index
    })
)

/**
 * Extended Codec with CBOR support for TransactionInput.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    TransactionInputError
  )
