import { blake2b } from "@noble/hashes/blake2"
import { Data, Effect as Eff, FastCheck, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Hash28 from "./Hash28.js"
import * as PrivateKey from "./PrivateKey.js"
import * as VKey from "./VKey.js"

/**
 * Error class for KeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class KeyHashError extends Data.TaggedError("KeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for KeyHash representing a verification key hash.
 * addr_keyhash = hash28
 * Follows CIP-0019 binary representation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const KeyHash = Hash28.HexSchema.pipe(Schema.brand("KeyHash")).annotations({
  identifier: "KeyHash",
  title: "Verification Key Hash",
  description: "A 28-byte verification key hash"
})

export type KeyHash = typeof KeyHash.Type

export const FromBytes = Schema.compose(
  Hash28.FromBytes, // Uint8Array -> hex string
  KeyHash // hex string -> KeyHash
).annotations({
  identifier: "KeyHash.FromBytes",
  title: "KeyHash from Bytes",
  description: "Transforms raw bytes (Uint8Array) to KeyHash hex string",
  message: () => "Invalid key hash bytes - must be exactly 28 bytes"
})

export const FromHex = KeyHash

/**
 * Smart constructor for KeyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = KeyHash.make

/**
 * Check if two KeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KeyHash, b: KeyHash): boolean => a === b

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a KeyHash from raw bytes.
 * Expects exactly 28 bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): KeyHash => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse a KeyHash from a hex string.
 * Expects exactly 56 hex characters (28 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): KeyHash => Eff.runSync(Effect.fromHex(hex))

/**
 * FastCheck arbitrary for generating random KeyHash instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<KeyHash> = FastCheck
  .uint8Array({ minLength: 28, maxLength: 28 })
  .map(fromBytes)

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a KeyHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (keyHash: KeyHash): Uint8Array => Eff.runSync(Effect.toBytes(keyHash))

/**
 * Convert a KeyHash to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (keyHash: KeyHash): string => keyHash // Already a hex string

// ============================================================================
// Cryptographic Operations
// ============================================================================

/**
 * Create a KeyHash from a PrivateKey (sync version that throws KeyHashError).
 * All errors are normalized to KeyHashError with contextual information.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const fromPrivateKey = (privateKey: PrivateKey.PrivateKey): KeyHash => Eff.runSync(Effect.fromPrivateKey(privateKey))

/**
 * Create a KeyHash from a VKey (sync version that throws KeyHashError).
 * All errors are normalized to KeyHashError with contextual information.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const fromVKey = (vkey: VKey.VKey): KeyHash => Eff.runSync(Effect.fromVKey(vkey))

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
   * Parse a KeyHash from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<KeyHash, KeyHashError> =>
    Schema.decode(FromBytes)(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new KeyHashError({
            message: "Failed to parse KeyHash from bytes",
            cause
          })
      )
    )

  /**
   * Parse a KeyHash from a hex string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<KeyHash, KeyHashError> =>
    Schema.decode(FromHex)(hex).pipe(
      Eff.mapError(
        (cause) =>
          new KeyHashError({
            message: "Failed to parse KeyHash from hex",
            cause
          })
      )
    )

  /**
   * Convert a KeyHash to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (keyHash: KeyHash): Eff.Effect<Uint8Array, KeyHashError> =>
    Schema.encode(FromBytes)(keyHash).pipe(
      Eff.mapError(
        (cause) =>
          new KeyHashError({
            message: "Failed to encode KeyHash to bytes",
            cause
          })
      )
    )

  /**
   * Create a KeyHash from a PrivateKey using Effect error handling.
   *
   * @since 2.0.0
   * @category cryptography
   */
  export const fromPrivateKey = (privateKey: PrivateKey.PrivateKey): Eff.Effect<KeyHash, KeyHashError> =>
    Eff.gen(function* () {
      const privateKeyBytes = yield* Eff.mapError(
        Schema.encode(PrivateKey.FromBytes)(privateKey),
        (cause) =>
          new KeyHashError({
            message: "Failed to encode private key to bytes",
            cause
          })
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
          new KeyHashError({
            message: "Failed to derive public key from private key",
            cause
          })
      })

      const keyHashBytes = yield* Eff.try({
        try: () => blake2b(publicKeyBytes, { dkLen: 28 }),
        catch: (cause) =>
          new KeyHashError({
            message: "Failed to hash public key",
            cause
          })
      })

      return yield* Eff.mapError(
        Schema.decode(FromBytes)(keyHashBytes),
        (cause) =>
          new KeyHashError({
            message: "Failed to create KeyHash from hash bytes",
            cause
          })
      )
    })

  /**
   * Create a KeyHash from a VKey using Effect error handling.
   *
   * @since 2.0.0
   * @category cryptography
   */
  export const fromVKey = (vkey: VKey.VKey): Eff.Effect<KeyHash, KeyHashError> =>
    Eff.gen(function* () {
      const publicKeyBytes = yield* Eff.mapError(
        Schema.encode(VKey.FromBytes)(vkey),
        (cause) =>
          new KeyHashError({
            message: "Failed to encode VKey to bytes",
            cause
          })
      )

      const keyHashBytes = yield* Eff.try({
        try: () => blake2b(publicKeyBytes, { dkLen: 28 }),
        catch: (cause) =>
          new KeyHashError({
            message: "Failed to hash public key",
            cause
          })
      })

      return yield* Eff.mapError(
        Schema.decode(FromBytes)(keyHashBytes),
        (cause) =>
          new KeyHashError({
            message: "Failed to create KeyHash from hash bytes",
            cause
          })
      )
    })
}
