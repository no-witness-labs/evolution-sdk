import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
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

export const CDDLSchema = Schema.Tuple(
  Schema.Uint8ArrayFromSelf, // transaction_id as bytes
  CBOR.Integer // index as bigint
)

/**
 * CDDL schema for TransactionInput.
 * transaction_input = [transaction_id : $Bytes32, index : uint .size 2]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionInput), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const txHashBytes = yield* ParseResult.encode(TransactionHash.FromBytes)(toA.transactionId)
      return [txHashBytes, BigInt(toA.index)] as const
    }),
  decode: ([txHashBytes, indexBigInt]) =>
    Eff.gen(function* () {
      const transactionId = yield* ParseResult.decode(TransactionHash.FromBytes)(txHashBytes)
      return yield* ParseResult.decode(TransactionInput)({
        _tag: "TransactionInput",
        transactionId,
        index: Number(indexBigInt)
      })
    })
}).annotations({
  identifier: "TransactionInput.FromCDDL",
  description: "Transforms CBOR structure to TransactionInput"
})

/**
 * CBOR bytes transformation schema for TransactionInput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → TransactionInput
  ).annotations({
    identifier: "TransactionInput.FromCBORBytes",
    description: "Transforms CBOR bytes to TransactionInput"
  })

/**
 * CBOR hex transformation schema for TransactionInput.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → TransactionInput
  ).annotations({
    identifier: "TransactionInput.FromCBORHex",
    description: "Transforms CBOR hex string to TransactionInput"
  })

/**
 * Smart constructor for creating TransactionInput instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (props: { transactionId: TransactionHash.TransactionHash; index: number }): TransactionInput =>
  new TransactionInput({
    transactionId: props.transactionId,
    index: Numeric.Uint16Make(props.index)
  })

/**
 * Check if two TransactionInput instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionInput, b: TransactionInput): boolean =>
  a._tag === b._tag && a.index === b.index && a.transactionId === b.transactionId

/**
 * FastCheck arbitrary for TransactionInput instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.tuple(TransactionHash.arbitrary, Numeric.Uint16Generator).map(
  ([transactionId, index]) =>
    make({
      transactionId,
      index
    })
)

/**
 * Effect namespace for TransactionInput operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Convert CBOR bytes to TransactionInput using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(bytes),
      (cause) => new TransactionInputError({ message: "Failed to decode from CBOR bytes", cause })
    )

  /**
   * Convert CBOR hex string to TransactionInput using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(hex),
      (cause) => new TransactionInputError({ message: "Failed to decode from CBOR hex", cause })
    )

  /**
   * Convert TransactionInput to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (input: TransactionInput, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(input),
      (cause) => new TransactionInputError({ message: "Failed to encode to CBOR bytes", cause })
    )

  /**
   * Convert TransactionInput to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (input: TransactionInput, options?: CBOR.CodecOptions) =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(input),
      (cause) => new TransactionInputError({ message: "Failed to encode to CBOR hex", cause })
    )
}

/**
 * Convert CBOR bytes to TransactionInput (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): TransactionInput =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Convert CBOR hex string to TransactionInput (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): TransactionInput =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Convert TransactionInput to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (input: TransactionInput, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(input, options))

/**
 * Convert TransactionInput to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (input: TransactionInput, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(input, options))
