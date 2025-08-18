import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
import * as KeyHash from "./KeyHash.js"
import * as ScriptHash from "./ScriptHash.js"

/**
 * Extends TaggedError for better error handling and categorization
 *
 * @since 2.0.0
 * @category errors
 */

export class CredentialError extends Data.TaggedError("CredentialError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Credential schema representing either a key hash or script hash
 * credential = [0, addr_keyhash // 1, script_hash]
 * Used to identify ownership of addresses or stake rights
 *
 * @since 2.0.0
 * @category schemas
 */
export const Credential = Schema.Union(KeyHash.KeyHash, ScriptHash.ScriptHash)

/**
 * Type representing a credential that can be either a key hash or script hash
 * Used in various address formats to identify ownership
 *
 * @since 2.0.0
 * @category model
 */
export type Credential = typeof Credential.Type

/**
 * Check if the given value is a valid Credential
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Credential)

export const CDDLSchema = Schema.Tuple(
  Schema.Literal(0n, 1n),
  Schema.Uint8ArrayFromSelf // hash bytes
)

/**
 * CDDL schema for Credential as defined in the specification:
 * credential = [0, addr_keyhash // 1, script_hash]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Credential), {
  strict: true,
  encode: (toI) =>
    Eff.gen(function* () {
      switch (toI._tag) {
        case "KeyHash": {
          return [0n, toI.hash] as const
        }
        case "ScriptHash": {
          return [1n, toI.hash] as const
        }
      }
    }),
  decode: ([tag, hashBytes]) =>
    Eff.gen(function* () {
      switch (tag) {
        case 0n: {
          const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(hashBytes)
          return keyHash
        }
        case 1n: {
          const scriptHash = yield* ParseResult.decode(ScriptHash.FromBytes)(hashBytes)
          return scriptHash
        }
      }
    })
})

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Credential
  )

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Credential
  )

/**
 * Check if two Credential instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Credential, b: Credential): boolean => {
  return a._tag === b._tag && Bytes.equals(a.hash, b.hash)
}

/**
 * FastCheck arbitrary for generating random Credential instances.
 * Randomly selects between generating a KeyHash or ScriptHash credential.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.oneof(KeyHash.arbitrary, ScriptHash.arbitrary)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse a Credential from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, CredentialError, "Credential.fromCBORBytes")

/**
 * Parse a Credential from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, CredentialError, "Credential.fromCBORHex")

/**
 * Convert a Credential to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, CredentialError, "Credential.toCBORBytes")

/**
 * Convert a Credential to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, CredentialError, "Credential.toCBORHex")

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
   * Parse a Credential from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, CredentialError)

  /**
   * Parse a Credential from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, CredentialError)

  /**
   * Convert a Credential to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, CredentialError)

  /**
   * Convert a Credential to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, CredentialError)
}
