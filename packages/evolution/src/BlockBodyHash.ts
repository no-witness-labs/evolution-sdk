import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for BlockBodyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class BlockBodyHashError extends Data.TaggedError("BlockBodyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for BlockBodyHash representing a block body hash.
 * block_body_hash = Bytes32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category model
 */
export class BlockBodyHash extends Schema.TaggedClass<BlockBodyHash>()("BlockBodyHash", {
  bytes: Bytes32.BytesSchema
}) {}

/**
 * Schema for transforming between Uint8Array and BlockBodyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Bytes32.BytesSchema, BlockBodyHash, {
  strict: true,
  decode: (bytes) => new BlockBodyHash({ bytes }, { disableValidation: true }),
  encode: (bbh) => bbh.bytes
}).annotations({
  identifier: "BlockBodyHash.FromBytes"
})

/**
 * Schema for transforming between hex string and BlockBodyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.FromHex, // string -> Bytes32
  FromBytes // Bytes32 -> BlockBodyHash
).annotations({
  identifier: "BlockBodyHash.FromHex"
})

/**
 * Smart constructor for BlockBodyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof BlockBodyHash>) => new BlockBodyHash(...args)

/**
 * Check if two BlockBodyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockBodyHash, b: BlockBodyHash): boolean => Bytes32.equals(a.bytes, b.bytes)

/**
 * Check if the given value is a valid BlockBodyHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isBlockBodyHash = Schema.is(BlockBodyHash)

/**
 * FastCheck arbitrary for generating random BlockBodyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (bytes) => new BlockBodyHash({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse BlockBodyHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, BlockBodyHashError, "BlockBodyHash.fromBytes")

/**
 * Parse BlockBodyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, BlockBodyHashError, "BlockBodyHash.fromHex")

/**
 * Encode BlockBodyHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, BlockBodyHashError, "BlockBodyHash.toBytes")

/**
 * Encode BlockBodyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, BlockBodyHashError, "BlockBodyHash.toHex")

// ============================================================================
// Either Namespace (composable non-throwing API)
// ============================================================================

export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, BlockBodyHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, BlockBodyHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, BlockBodyHashError)
  export const toHex = Function.makeEncodeEither(FromHex, BlockBodyHashError)
}
