import { Data, Effect as Eff, FastCheck, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Bytes32 from "./Bytes32.js"
import type { PrivateKey } from "./PrivateKey.js"
import { FromBytes as PrivateKeyFromBytes } from "./PrivateKey.js"

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
export const VKey = Bytes32.HexSchema.pipe(Schema.brand("VKey")).annotations({
  identifier: "VKey"
})

export type VKey = typeof VKey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VKey // hex string -> VKey
).annotations({
  identifier: "VKey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VKey // hex string -> VKey
).annotations({
  identifier: "VKey.Hex"
})

/**
 * Smart constructor for VKey that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = VKey.make

/**
 * Check if two VKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VKey, b: VKey): boolean => a === b

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
export const fromBytes = (bytes: Uint8Array): VKey => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse a VKey from a hex string.
 * Expects exactly 64 hex characters (32 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): VKey => Eff.runSync(Effect.fromHex(hex))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a VKey to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (vkey: VKey): Uint8Array => Eff.runSync(Effect.toBytes(vkey))

/**
 * Convert a VKey to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (vkey: VKey): string => vkey // Already a hex string

/**
 * FastCheck arbitrary for generating random VKey instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<VKey> = FastCheck
  .uint8Array({ minLength: Bytes32.BYTES_LENGTH, maxLength: Bytes32.BYTES_LENGTH })
  .map(fromBytes)

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
export const fromPrivateKey = (privateKey: PrivateKey): VKey => {
  const privateKeyBytes = Schema.encodeSync(PrivateKeyFromBytes)(privateKey)

  let publicKeyBytes: Uint8Array
  if (privateKeyBytes.length === 64) {
    // CML-compatible extended private key: use first 32 bytes as scalar
    const scalar = privateKeyBytes.slice(0, 32)
    publicKeyBytes = sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
  } else {
    // Standard 32-byte Ed25519 private key using sodium
    publicKeyBytes = sodium.crypto_sign_seed_keypair(privateKeyBytes).publicKey
  }

  return Schema.decodeSync(FromBytes)(publicKeyBytes)
}

/**
 * Create a VKey from a PrivateKey using Effect error handling.
 * For extended keys (64 bytes), uses CML-compatible Ed25519-BIP32 algorithm.
 * For normal keys (32 bytes), uses standard Ed25519.
 *
 * @since 2.0.0
 * @category cryptography
 */
const fromPrivateKeyEffect = (privateKey: PrivateKey): Eff.Effect<VKey, VKeyError> =>
  Eff.gen(function* () {
    const privateKeyBytes = yield* Schema.encode(PrivateKeyFromBytes)(privateKey).pipe(
      Eff.mapError(
        (cause) =>
          new VKeyError({
            message: "Failed to encode private key to bytes",
            cause
          })
      )
    )

    const publicKeyBytes = yield* Eff.try({
      try: () => {
        if (privateKeyBytes.length === 64) {
          // CML-compatible extended private key: use first 32 bytes as scalar
          const scalar = privateKeyBytes.slice(0, 32)
          return sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
        } else {
          // Standard 32-byte Ed25519 private key using sodium
          return sodium.crypto_sign_seed_keypair(privateKeyBytes).publicKey
        }
      },
      catch: (cause) =>
        new VKeyError({
          message: "Failed to derive public key from private key",
          cause
        })
    })

    return yield* Schema.decode(FromBytes)(publicKeyBytes).pipe(
      Eff.mapError(
        (cause) =>
          new VKeyError({
            message: "Failed to create VKey from public key bytes",
            cause
          })
      )
    )
  })

/**
 * Verify a signature against a message using this verification key.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const verify = (
  vkey: VKey,
  message: Uint8Array,
  signature: Uint8Array
): boolean => {
  // Convert VKey to bytes
  const publicKeyBytes = toBytes(vkey)
  return sodium.crypto_sign_verify_detached(signature, message, publicKeyBytes)
}

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 * Returns Effect<Success, Error> for composable error handling.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse a VKey from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<VKey, VKeyError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new VKeyError({
            message: "Failed to parse VKey from bytes",
            cause
          })
      )
    )

  /**
   * Parse a VKey from a hex string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<VKey, VKeyError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new VKeyError({
            message: "Failed to parse VKey from hex",
            cause
          })
      )
    )

  /**
   * Convert a VKey to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (vkey: VKey): Eff.Effect<Uint8Array, VKeyError> =>
    Schema.encode(FromBytes)(vkey).pipe(
      Eff.mapError(
        (cause) =>
          new VKeyError({
            message: "Failed to encode VKey to bytes",
            cause
          })
      )
    )

  /**
   * Create a VKey from a PrivateKey using Effect error handling.
   *
   * @since 2.0.0
   * @category cryptography
   */
  export const fromPrivateKey = fromPrivateKeyEffect
}
