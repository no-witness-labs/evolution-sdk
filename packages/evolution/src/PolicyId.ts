import { Data, Effect as Eff, FastCheck, Schema } from "effect"

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
export const PolicyId = Hash28.HexSchema.pipe(Schema.brand("PolicyId")).annotations({
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
 * Smart constructor for PolicyId that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PolicyId.make

/**
 * Check if two PolicyId instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PolicyId, b: PolicyId): boolean => a === b

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
export const arbitrary = FastCheck.hexaString({
  minLength: Hash28.HEX_LENGTH,
  maxLength: Hash28.HEX_LENGTH
}).map((hex) => hex as PolicyId)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse PolicyId from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): PolicyId => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse PolicyId from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): PolicyId => Eff.runSync(Effect.fromHex(hex))

/**
 * Encode PolicyId to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (policyId: PolicyId): Uint8Array => Eff.runSync(Effect.toBytes(policyId))

/**
 * Encode PolicyId to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (policyId: PolicyId): string => Eff.runSync(Effect.toHex(policyId))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse PolicyId from bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<PolicyId, PolicyIdError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new PolicyIdError({
            message: "Failed to parse PolicyId from bytes",
            cause
          })
      )
    )

  /**
   * Parse PolicyId from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<PolicyId, PolicyIdError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new PolicyIdError({
            message: "Failed to parse PolicyId from hex",
            cause
          })
      )
    )

  /**
   * Encode PolicyId to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (policyId: PolicyId): Eff.Effect<Uint8Array, PolicyIdError> =>
    Schema.encode(FromBytes)(policyId).pipe(
      Eff.mapError(
        (cause) =>
          new PolicyIdError({
            message: "Failed to encode PolicyId to bytes",
            cause
          })
      )
    )

  /**
   * Encode PolicyId to hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = (policyId: PolicyId): Eff.Effect<string, PolicyIdError> =>
    Schema.encode(FromHex)(policyId).pipe(
      Eff.mapError(
        (cause) =>
          new PolicyIdError({
            message: "Failed to encode PolicyId to hex",
            cause
          })
      )
    )
}
