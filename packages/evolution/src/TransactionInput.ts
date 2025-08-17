import { Data, Either as E, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as Numeric from "./Numeric.js"
import * as TransactionHash from "./TransactionHash.js"

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
 *
 * ```
 * transaction_input = [transaction_id : transaction_id, index : uint .size 2]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionInput extends Schema.TaggedClass<TransactionInput>()("TransactionInput", {
  transactionId: TransactionHash.TransactionHash,
  index: Numeric.Uint16Schema
}) {
  toString(): string {
    return `{ transactionId: ${this.transactionId}, index: ${this.index} }`
  }
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

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
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionInput), {
  strict: true,
  encode: (toA) => E.right([toA.transactionId.bytes, BigInt(toA.index)] as const),
  decode: ([txHashBytes, indexBigInt]) =>
    E.right(
      new TransactionInput({
        transactionId: TransactionHash.make({ bytes: txHashBytes }),
        index: Number(indexBigInt)
      })
    )
  // E.gen(function* () {
  //   // const transactionId = yield* ParseResult.decodeEither(TransactionHash.FromBytes)(txHashBytes)
  //   // return yield* ParseResult.decode(TransactionInput)({
  //   //   _tag: "TransactionInput",
  //   //   transactionId,
  //   //   index: Number(indexBigInt)
  //   // })
  //   return
  // })
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
export const make = (...args: ConstructorParameters<typeof TransactionInput>) => new TransactionInput(...args)

/**
 * Check if two TransactionInput instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionInput, b: TransactionInput): boolean =>
  a._tag === b._tag && a.index === b.index && TransactionHash.equals(a.transactionId, b.transactionId)

/**
 * FastCheck arbitrary for TransactionInput instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.tuple(TransactionHash.arbitrary, Numeric.Uint16Arbitrary).map(
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
export namespace Either {
  /**
   * Convert CBOR bytes to TransactionInput using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORBytes(options), TransactionInputError)(bytes)

  /**
   * Convert CBOR hex string to TransactionInput using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORHex(options), TransactionInputError)(hex)

  /**
   * Convert TransactionInput to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = (input: TransactionInput, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORBytes(options), TransactionInputError)(input)

  /**
   * Convert TransactionInput to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = (input: TransactionInput, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORHex(options), TransactionInputError)(input)
}

/**
 * Convert CBOR bytes to TransactionInput (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): TransactionInput =>
  Function.makeDecodeSync(FromCBORBytes(options), TransactionInputError, "TransactionInput.fromCBORBytes")(bytes)

/**
 * Convert CBOR hex string to TransactionInput (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): TransactionInput =>
  Function.makeDecodeSync(FromCBORHex(options), TransactionInputError, "TransactionInput.fromCBORHex")(hex)

/**
 * Convert TransactionInput to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = (input: TransactionInput, options?: CBOR.CodecOptions): Uint8Array =>
  Function.makeEncodeSync(FromCBORBytes(options), TransactionInputError, "TransactionInput.toCBORBytes")(input)

/**
 * Convert TransactionInput to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = (input: TransactionInput, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), TransactionInputError, "TransactionInput.toCBORHex")(input)
