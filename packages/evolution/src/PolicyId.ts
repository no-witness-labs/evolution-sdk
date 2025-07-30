import { Data, FastCheck, pipe, Schema } from "effect"

import { createEncoders } from "./Codec.js"
import * as Hash28 from "./Hash28.js"

/**
 * Error class for PolicyId related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PolicyIdError extends Data.TaggedError("PolicyIdError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for PolicyId representing a minting policy identifier.
 * A PolicyId is a script hash (hash28) that identifies a minting policy.
 *
 * Note: PolicyId is equivalent to ScriptHash as defined in the CDDL:
 * policy_id = script_hash
 * script_hash = hash28
 *
 * @since 2.0.0
 * @category schemas
 */
export const PolicyId = pipe(Hash28.HexSchema, Schema.brand("PolicyId")).annotations({
  identifier: "PolicyId"
})

export type PolicyId = typeof PolicyId.Type

/**
 * Schema for transforming between Uint8Array and PolicyId.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  PolicyId // hex string -> PolicyId
).annotations({
  identifier: "PolicyId.Bytes"
})

/**
 * Schema for transforming between hex string and PolicyId.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Hash28.HexSchema, // string -> hex string
  PolicyId // hex string -> PolicyId
).annotations({
  identifier: "PolicyId.Hex"
})

/**
 * Check if two PolicyId instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PolicyId, b: PolicyId): boolean => a === b

/**
 * Generate a random PolicyId.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Hash28.HASH28_BYTES_LENGTH,
  maxLength: Hash28.HASH28_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for PolicyId encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  PolicyIdError
)
