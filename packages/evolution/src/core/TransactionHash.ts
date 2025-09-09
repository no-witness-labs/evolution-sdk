import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for TransactionHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionHashError extends Data.TaggedError("TransactionHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for TransactionHash.
 * transaction_hash = Bytes32
 *
 * @since 2.0.0
 * @category schemas
 */
export class TransactionHash extends Schema.TaggedClass<TransactionHash>()("TransactionHash", {
  hash: Bytes32.BytesFromHex
}) {
  toString(): string {
    return `TransactionHash { hash: ${this.hash} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

/**
 * Schema for transforming between Uint8Array and TransactionHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.typeSchema(Bytes32.BytesFromHex), Schema.typeSchema(TransactionHash), {
  strict: true,
  decode: (bytes) => new TransactionHash({ hash: bytes }, { disableValidation: true }), // Disable validation since we already check length in Bytes32
  encode: (txHash) => txHash.hash
}).annotations({
  identifier: "TransactionHash.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes32.BytesFromHex, // string -> Bytes32
  FromBytes // Bytes32 -> TransactionHash
).annotations({
  identifier: "TransactionHash.FromHex"
})

/**
 * Smart constructor for TransactionHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof TransactionHash>) => new TransactionHash(...args)

/**
 * Check if two TransactionHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionHash, b: TransactionHash): boolean => Bytes32.equals(a.hash, b.hash)

/**
 * Check if the given value is a valid TransactionHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isTransactionHash = Schema.is(TransactionHash)

/**
 * FastCheck arbitrary for generating random TransactionHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: 32,
  maxLength: 32
}).map((bytes) => new TransactionHash({ hash: bytes }, { disableValidation: true })) // Disable validation since we already check length in FastCheck

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse TransactionHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, TransactionHashError, "TransactionHash.fromBytes")

/**
 * Parse TransactionHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, TransactionHashError, "TransactionHash.fromHex")

/**
 * Encode TransactionHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, TransactionHashError, "TransactionHash.toBytes")

/**
 * Encode TransactionHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, TransactionHashError, "TransactionHash.toHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse TransactionHash from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, TransactionHashError)

  /**
   * Parse TransactionHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, TransactionHashError)

  /**
   * Encode TransactionHash to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, TransactionHashError)

  /**
   * Encode TransactionHash to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, TransactionHashError)
}
