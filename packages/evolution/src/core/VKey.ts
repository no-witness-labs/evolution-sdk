import { Data, FastCheck, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"
import type * as PrivateKey from "./PrivateKey.js"

/**
 * Error class for VKey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VKeyError extends Data.TaggedError("VKeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for VKey representing a verification key.
 * vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export class VKey extends Schema.TaggedClass<VKey>()("VKey", {
  bytes: Bytes32.BytesFromHex
}) {}

export const FromBytes = Schema.transform(Schema.typeSchema(Bytes32.BytesFromHex), Schema.typeSchema(VKey), {
  strict: true,
  decode: (bytes) => new VKey({ bytes }),
  encode: (vkey) => vkey.bytes
}).annotations({
  identifier: "VKey.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes32.BytesFromHex, // string -> Bytes32
  FromBytes // Bytes32 -> VKey
).annotations({
  identifier: "VKey.FromHex"
})

/**
 * Smart constructor for VKey that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof VKey>) => new VKey(...args)

/**
 * Check if two VKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VKey, b: VKey): boolean => Bytes.equals(a.bytes, b.bytes)

/**
 * Check if the given value is a valid VKey
 *
 * @since 2.0.0
 * @category predicates
 */
export const isVKey = Schema.is(VKey)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a VKey from raw bytes.
 * Expects exactly 32 bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, VKeyError, "VKey.fromBytes")

/**
 * Parse a VKey from a hex string.
 * Expects exactly 64 hex characters (32 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, VKeyError, "VKey.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a VKey to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, VKeyError, "VKey.toBytes")

/**
 * Convert a VKey to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, VKeyError, "VKey.toHex")

/**
 * FastCheck arbitrary for generating random VKey instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<VKey> = FastCheck.uint8Array({
  minLength: Bytes32.BYTES_LENGTH,
  maxLength: Bytes32.BYTES_LENGTH
}).map((bytes) => make({ bytes }, { disableValidation: true }))

// ============================================================================
// Cryptographic Operations
// ============================================================================

/**
 * Create a VKey from a PrivateKey (sync version that throws VKeyError).
 * For extended keys (64 bytes), uses CML-compatible Ed25519-BIP32 algorithm.
 * For normal keys (32 bytes), uses standard Ed25519.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const fromPrivateKey = (privateKey: PrivateKey.PrivateKey): VKey => {
  const privateKeyBytes = privateKey.key

  let publicKeyBytes: Uint8Array
  if (privateKeyBytes.length === 64) {
    // CML-compatible extended private key: use first 32 bytes as scalar
    const scalar = privateKeyBytes.slice(0, 32)
    publicKeyBytes = sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
  } else {
    // Standard 32-byte Ed25519 private key using sodium
    publicKeyBytes = sodium.crypto_sign_seed_keypair(privateKeyBytes).publicKey
  }

  return new VKey({ bytes: publicKeyBytes })
}

/**
 * Create a VKey from a PrivateKey using Effect error handling.
 * For extended keys (64 bytes), uses CML-compatible Ed25519-BIP32 algorithm.
 * For normal keys (32 bytes), uses standard Ed25519.
 *
 * @since 2.0.0
 * @category cryptography
 */

/**
 * Verify a signature against a message using this verification key.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const verify = (vkey: VKey, message: Uint8Array, signature: Uint8Array): boolean => {
  // Convert VKey to bytes
  const publicKeyBytes = vkey.bytes
  return sodium.crypto_sign_verify_detached(signature, message, publicKeyBytes)
}

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse a VKey from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, VKeyError)

  /**
   * Parse a VKey from a hex string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, VKeyError)

  /**
   * Convert a VKey to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, VKeyError)
}
