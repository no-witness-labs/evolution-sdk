import { Data, Effect as Eff, FastCheck, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Bytes64 from "./Bytes64.js"

// Initialize libsodium
await sodium.ready

/**
 * Error class for Bip32PublicKey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class Bip32PublicKeyError extends Data.TaggedError("Bip32PublicKeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Bip32PublicKey representing a BIP32-Ed25519 extended public key.
 * Always 64 bytes: 32-byte public key + 32-byte chaincode.
 * Follows BIP32-Ed25519 hierarchical deterministic key derivation.
 * Supports soft derivation only (hardened derivation requires private key).
 *
 * @since 2.0.0
 * @category schemas
 */
export const Bip32PublicKey = Bytes64.HexSchema
  .pipe(Schema.brand("Bip32PublicKey"))
  .annotations({
    identifier: "Bip32PublicKey"
  })

export type Bip32PublicKey = typeof Bip32PublicKey.Type

export const FromBytes = Schema.compose(
  Bytes64.FromBytes, // Uint8Array -> hex string
  Bip32PublicKey // hex string -> Bip32PublicKey
).annotations({
  identifier: "Bip32PublicKey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes64.HexSchema, // string -> hex string
  Bip32PublicKey // hex string -> Bip32PublicKey
).annotations({
  identifier: "Bip32PublicKey.Hex"
})

/**
 * Smart constructor for Bip32PublicKey that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Bip32PublicKey.make

/**
 * Check if two Bip32PublicKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Bip32PublicKey, b: Bip32PublicKey): boolean => a === b

// Helper functions for extracting data from the 64-byte format

/**
 * Extract the public key (first 32 bytes) from a Bip32PublicKey.
 *
 * @since 2.0.0
 * @category accessors
 */
const extractPublicKey = (keyBytes: Uint8Array): Uint8Array => {
  if (keyBytes.length !== 64) {
    throw new Error(`Expected 64 bytes for Bip32PublicKey, got ${keyBytes.length}`)
  }
  return keyBytes.slice(0, 32)
}

/**
 * Extract the chain code (last 32 bytes) from a Bip32PublicKey.
 *
 * @since 2.0.0
 * @category accessors
 */
const extractChainCode = (keyBytes: Uint8Array): Uint8Array => {
  if (keyBytes.length !== 64) {
    throw new Error(`Expected 64 bytes for Bip32PublicKey, got ${keyBytes.length}`)
  }
  return keyBytes.slice(32, 64)
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Create a BIP32 public key from public key and chain code bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (publicKey: Uint8Array, chainCode: Uint8Array): Bip32PublicKey => {
  if (publicKey.length !== 32) {
    throw new Error(`Public key must be 32 bytes, got ${publicKey.length}`)
  }
  if (chainCode.length !== 32) {
    throw new Error(`Chain code must be 32 bytes, got ${chainCode.length}`)
  }
  
  const result = new Uint8Array(64)
  result.set(publicKey, 0)
  result.set(chainCode, 32)
  
  return Eff.runSync(Schema.decode(FromBytes)(result))
}

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Bip32PublicKey to raw bytes (64 bytes).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (bip32PublicKey: Bip32PublicKey): Uint8Array =>
  Eff.runSync(Effect.toBytes(bip32PublicKey))

/**
 * Convert a Bip32PublicKey to raw public key bytes (32 bytes only).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toRawBytes = (bip32PublicKey: Bip32PublicKey): Uint8Array => {
  const keyBytes = toBytes(bip32PublicKey)
  return extractPublicKey(keyBytes)
}

// ============================================================================
// Derivation Functions
// ============================================================================

/**
 * Derive a child public key using the specified index (soft derivation only).
 *
 * @since 2.0.0
 * @category derivation
 */
export const deriveChild = (bip32PublicKey: Bip32PublicKey, index: number): Bip32PublicKey =>
  Eff.runSync(Effect.deriveChild(bip32PublicKey, index))

// ============================================================================
// Accessor Functions
// ============================================================================

/**
 * Get the chain code.
 *
 * @since 2.0.0
 * @category accessors
 */
export const chainCode = (bip32PublicKey: Bip32PublicKey): Uint8Array => {
  const keyBytes = toBytes(bip32PublicKey)
  return extractChainCode(keyBytes)
}

/**
 * Get the public key bytes.
 *
 * @since 2.0.0
 * @category accessors
 */
export const publicKey = (bip32PublicKey: Bip32PublicKey): Uint8Array => {
  const keyBytes = toBytes(bip32PublicKey)
  return extractPublicKey(keyBytes)
}

// ============================================================================
// FastCheck Arbitrary
// ============================================================================

/**
 * FastCheck arbitrary for generating random Bip32PublicKey instances for testing.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: 64,
  maxLength: 64
}).map((bytes) => Eff.runSync(Effect.fromBytes(bytes.slice(0, 32), bytes.slice(32, 64))))

/**
 * @since 2.0.0
 * @category Effect
 */
export namespace Effect {
  /**
   * Create a BIP32 public key from public key and chain code bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (
    publicKey: Uint8Array, 
    chainCode: Uint8Array
  ): Eff.Effect<Bip32PublicKey, Bip32PublicKeyError> =>
    Eff.gen(function* () {
      if (publicKey.length !== 32) {
        return yield* Eff.fail(
          new Bip32PublicKeyError({
            message: `Public key must be 32 bytes, got ${publicKey.length}`
          })
        )
      }
      if (chainCode.length !== 32) {
        return yield* Eff.fail(
          new Bip32PublicKeyError({
            message: `Chain code must be 32 bytes, got ${chainCode.length}`
          })
        )
      }
      
      const result = new Uint8Array(64)
      result.set(publicKey, 0)
      result.set(chainCode, 32)
      
      return yield* Schema.decode(FromBytes)(result)
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PublicKeyError({
            message: "Failed to create Bip32PublicKey from bytes",
            cause
          })
      )
    )

  /**
   * Convert Bip32PublicKey to bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (bip32PublicKey: Bip32PublicKey): Eff.Effect<Uint8Array, Bip32PublicKeyError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(bip32PublicKey),
      (cause) =>
        new Bip32PublicKeyError({
          message: "Failed to encode Bip32PublicKey to bytes",
          cause
        })
    )

  /**
   * Derive a child public key using the specified index with Effect error handling.
   * Only supports soft derivation (index < 0x80000000).
   *
   * @since 2.0.0
   * @category derivation
   */
  export const deriveChild = (
    bip32PublicKey: Bip32PublicKey, 
    index: number
  ): Eff.Effect<Bip32PublicKey, Bip32PublicKeyError> =>
    Eff.gen(function* () {
      if (index >= 0x80000000) {
        return yield* Eff.fail(
          new Bip32PublicKeyError({
            message: `Hardened derivation (index >= 0x80000000) not supported for public keys, got index ${index}`
          })
        )
      }

      // Get the key bytes first
      const keyBytes = yield* toBytes(bip32PublicKey)
      const parentPublicKey = extractPublicKey(keyBytes)
      const parentChainCode = extractChainCode(keyBytes)

      const derivedBytes = yield* Eff.try(() => {
        // Serialize index in little-endian (V2 scheme) - CML compatible
        const indexBytes = new Uint8Array(4)
        indexBytes[0] = index & 0xff
        indexBytes[1] = (index >>> 8) & 0xff
        indexBytes[2] = (index >>> 16) & 0xff
        indexBytes[3] = (index >>> 24) & 0xff
        
        // Create HMAC input for Z (soft derivation): tag(0x02) + public_key(32 bytes) + index(4 bytes)
        const zTag = new Uint8Array([0x02]) // TAG_DERIVE_Z_SOFT
        const zInput = new Uint8Array(1 + 32 + 4)
        zInput.set(zTag, 0)
        zInput.set(parentPublicKey, 1)
        zInput.set(indexBytes, 33)
        
        // HMAC-SHA512 with chain code as key
        const hmacZ = sodium.crypto_auth_hmacsha512(zInput, parentChainCode)
        const z = new Uint8Array(hmacZ)
        const zl = z.slice(0, 32)
        
        // For public key derivation, we need to compute: parentPublicKey + mul8(zl)*G
        // where G is the Ed25519 base point and mul8(zl) applies the same 8-multiplication
        // that's used in private key derivation (add_28_mul8_v2 algorithm)
        
        // Apply the same mul8 operation that private key derivation uses
        // This is critical for compatibility - multiply first 28 bytes by 8
        const zl8 = new Uint8Array(32)
        let carry = 0
        // First 28 bytes: zl[i] << 3 (multiply by 8)
        for (let i = 0; i < 28; i++) {
          const r = (zl[i] << 3) + carry
          zl8[i] = r & 0xff
          carry = r >> 8
        }
        // Last 4 bytes: just carry (no multiplication)
        for (let i = 28; i < 32; i++) {
          const r = carry
          zl8[i] = r & 0xff
          carry = r >> 8
        }
        
        // Now compute zl8*G (scalar multiplication with base point using processed zl)
        const zl8G = sodium.crypto_scalarmult_ed25519_base_noclamp(zl8)
        
        // Then add parentPublicKey + zl8G (point addition)
        const childPublicKey = sodium.crypto_core_ed25519_add(parentPublicKey, zl8G)
        
        // Derive new chain code: tag(0x03) + public_key(32 bytes) + index(4 bytes)
        const ccTag = new Uint8Array([0x03]) // TAG_DERIVE_CC_SOFT - corrected to 0x03
        const ccInput = new Uint8Array(1 + 32 + 4)
        ccInput.set(ccTag, 0)
        ccInput.set(parentPublicKey, 1)
        ccInput.set(indexBytes, 33)
        
        const hmacCC = sodium.crypto_auth_hmacsha512(ccInput, parentChainCode)
        const newChainCode = new Uint8Array(hmacCC).slice(32, 64) // Take right 32 bytes
        
        return {
          publicKey: childPublicKey,
          chainCode: newChainCode
        }
      })

      // Create the new key bytes
      const newKeyBytes = new Uint8Array(64)
      newKeyBytes.set(derivedBytes.publicKey, 0)
      newKeyBytes.set(derivedBytes.chainCode, 32)

      return yield* Schema.decode(FromBytes)(newKeyBytes)
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PublicKeyError({
            message: `Failed to derive child public key with index ${index}`,
            cause
          })
      )
    )
}
