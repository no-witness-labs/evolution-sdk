import { Data, FastCheck, Schema } from "effect"

import * as Function from "./Function.js"
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
 * PolicyId as a TaggedClass representing a minting policy identifier.
 * A PolicyId is a script hash (hash28) that identifies a minting policy.
 *
 * Note: PolicyId is equivalent to ScriptHash as defined in the CDDL:
 * policy_id = script_hash
 * script_hash = hash28
 *
 * @since 2.0.0
 * @category model
 */
export class PolicyId extends Schema.TaggedClass<PolicyId>()("PolicyId", {
  hash: Hash28.BytesSchema
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return toHex(this)
  }
}

/**
 * Schema transformer from bytes to PolicyId.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Hash28.BytesSchema, PolicyId, {
  strict: true,
  decode: (hash) => new PolicyId({ hash }, { disableValidation: true }),
  encode: (policyId) => policyId.hash
}).annotations({ identifier: "PolicyId.FromBytes" })

/**
 * Schema transformer from hex string to PolicyId.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Hash28.FromHex, FromBytes).annotations({
  identifier: "PolicyId.FromHex"
})

/**
 * Smart constructor for PolicyId that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof PolicyId>) => new PolicyId(...args)

/**
 * Check if two PolicyId instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PolicyId, b: PolicyId): boolean => Hash28.equals(a.hash, b.hash)

/**
 * Check if the given value is a valid PolicyId
 *
 * @since 2.0.0
 * @category predicates
 */
export const isPolicyId = Schema.is(PolicyId)

/**
 * FastCheck arbitrary for generating random PolicyId instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<PolicyId> = FastCheck.uint8Array({
  minLength: Hash28.BYTES_LENGTH,
  maxLength: Hash28.BYTES_LENGTH
}).map((bytes) => make({ hash: bytes }, { disableValidation: true }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PolicyId from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, PolicyIdError, "PolicyId.fromBytes")

/**
 * Parse PolicyId from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, PolicyIdError, "PolicyId.fromHex")

/**
 * Encode PolicyId to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, PolicyIdError, "PolicyId.toBytes")

/**
 * Encode PolicyId to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, PolicyIdError, "PolicyId.toHex")

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
   * Parse PolicyId from bytes using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, PolicyIdError)

  /**
   * Parse PolicyId from hex string using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, PolicyIdError)

  /**
   * Encode PolicyId to bytes using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, PolicyIdError)

  /**
   * Encode PolicyId to hex string using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, PolicyIdError)
}
