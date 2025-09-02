import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for BlockHeaderHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class BlockHeaderHashError extends Data.TaggedError("BlockHeaderHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for BlockHeaderHash representing a block header hash.
 * block_header_hash = Bytes32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category model
 */
export class BlockHeaderHash extends Schema.TaggedClass<BlockHeaderHash>()("BlockHeaderHash", {
  bytes: Bytes32.BytesSchema
}) {}

/**
 * Schema for transforming between Uint8Array and BlockHeaderHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Bytes32.BytesSchema, BlockHeaderHash, {
  strict: true,
  decode: (bytes) => new BlockHeaderHash({ bytes }, { disableValidation: true }),
  encode: (bhh) => bhh.bytes
}).annotations({
  identifier: "BlockHeaderHash.FromBytes"
})

/**
 * Schema for transforming between hex string and BlockHeaderHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes32.FromHex, // string -> Bytes32
  FromBytes // Bytes32 -> BlockHeaderHash
).annotations({
  identifier: "BlockHeaderHash.FromHex"
})

/**
 * Smart constructor for BlockHeaderHash.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof BlockHeaderHash>) => new BlockHeaderHash(...args)

/**
 * Check if two BlockHeaderHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: BlockHeaderHash, b: BlockHeaderHash): boolean => Bytes32.equals(a.bytes, b.bytes)

/**
 * Check if the given value is a valid BlockHeaderHash
 *
 * @since 2.0.0
 * @category predicates
 */
export const isBlockHeaderHash = Schema.is(BlockHeaderHash)

/**
 * FastCheck arbitrary for generating random BlockHeaderHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map(
  (bytes) => new BlockHeaderHash({ bytes }, { disableValidation: true })
)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse BlockHeaderHash from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, BlockHeaderHashError, "BlockHeaderHash.fromBytes")

/**
 * Parse BlockHeaderHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, BlockHeaderHashError, "BlockHeaderHash.fromHex")

/**
 * Encode BlockHeaderHash to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, BlockHeaderHashError, "BlockHeaderHash.toBytes")

/**
 * Encode BlockHeaderHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, BlockHeaderHashError, "BlockHeaderHash.toHex")

// ============================================================================
// Either Namespace (composable non-throwing API)
// ============================================================================

export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, BlockHeaderHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, BlockHeaderHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, BlockHeaderHashError)
  export const toHex = Function.makeEncodeEither(FromHex, BlockHeaderHashError)
}
