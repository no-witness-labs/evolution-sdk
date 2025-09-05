import { Data, FastCheck, Schema } from "effect"

import * as Function from "./Function.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for PoolKeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PoolKeyHashError extends Data.TaggedError("PoolKeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * PoolKeyHash as a TaggedClass representing a stake pool's verification key hash.
 * pool_keyhash = hash28
 *
 * @since 2.0.0
 * @category model
 */
export class PoolKeyHash extends Schema.TaggedClass<PoolKeyHash>()("PoolKeyHash", {
  hash: Hash28.BytesFromHex
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return toHex(this)
  }
}

/**
 * Schema transformer from bytes to PoolKeyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.typeSchema(Hash28.BytesFromHex), Schema.typeSchema(PoolKeyHash), {
  strict: true,
  decode: (hash) => new PoolKeyHash({ hash }, { disableValidation: true }),
  encode: (poolKeyHash) => poolKeyHash.hash
}).annotations({ identifier: "PoolKeyHash.FromBytes" })

/**
 * Schema transformer from hex string to PoolKeyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Hash28.BytesFromHex, FromBytes).annotations({
  identifier: "PoolKeyHash.FromHex"
})

/**
 * Smart constructor for PoolKeyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof PoolKeyHash>) => new PoolKeyHash(...args)

/**
 * Check if two PoolKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PoolKeyHash, b: PoolKeyHash): boolean => Hash28.equals(a.hash, b.hash)

/**
 * FastCheck arbitrary for generating random PoolKeyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<PoolKeyHash> = FastCheck.uint8Array({
  minLength: Hash28.BYTES_LENGTH,
  maxLength: Hash28.BYTES_LENGTH
}).map((bytes) => make({ hash: bytes }, { disableValidation: true }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PoolKeyHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, PoolKeyHashError, "PoolKeyHash.fromBytes")

/**
 * Parse PoolKeyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, PoolKeyHashError, "PoolKeyHash.fromHex")

/**
 * Encode PoolKeyHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, PoolKeyHashError, "PoolKeyHash.toBytes")

/**
 * Encode PoolKeyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, PoolKeyHashError, "PoolKeyHash.toHex")

// ============================================================================
// Either Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse PoolKeyHash from bytes using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, PoolKeyHashError)

  /**
   * Parse PoolKeyHash from hex string using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, PoolKeyHashError)

  /**
   * Encode PoolKeyHash to bytes using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, PoolKeyHashError)

  /**
   * Encode PoolKeyHash to hex string using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, PoolKeyHashError)
}
