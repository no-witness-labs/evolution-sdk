import { pbkdf2 } from "@noble/hashes/pbkdf2"
import { sha512 } from "@noble/hashes/sha2"
import { Data, Effect as Eff, FastCheck, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Bip32PublicKey from "./Bip32PublicKey.js"
import * as Bytes96 from "./Bytes96.js"
import * as PrivateKey from "./PrivateKey.js"

// Initialize libsodium
await sodium.ready

/**
 * Error class for Bip32PrivateKey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class Bip32PrivateKeyError extends Data.TaggedError("Bip32PrivateKeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for Bip32PrivateKey representing a BIP32-Ed25519 extended private key.
 * Always 96 bytes: 32-byte scalar + 32-byte IV + 32-byte chaincode.
 * Follows BIP32-Ed25519 hierarchical deterministic key derivation.
 * Uses V2 derivation scheme for full CML (Cardano Multiplatform Library) compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Bip32PrivateKey = Bytes96.HexSchema.pipe(Schema.brand("Bip32PrivateKey")).annotations({
  identifier: "Bip32PrivateKey"
})

export type Bip32PrivateKey = typeof Bip32PrivateKey.Type

export const FromBytes = Schema.compose(
  Bytes96.FromBytes, // Uint8Array -> hex string
  Bip32PrivateKey // hex string -> Bip32PrivateKey
).annotations({
  identifier: "Bip32PrivateKey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes96.HexSchema, // string -> hex string
  Bip32PrivateKey // hex string -> Bip32PrivateKey
).annotations({
  identifier: "Bip32PrivateKey.Hex"
})

// Constants for BIP32-Ed25519
const SCALAR_INDEX = 0
const SCALAR_SIZE = 32
const CHAIN_CODE_INDEX = 64
const CHAIN_CODE_SIZE = 32
const PBKDF2_ITERATIONS = 4096
const PBKDF2_KEY_SIZE = 96

/**
 * Clamp the scalar by:
 * 1. Clearing the 3 lower bits
 * 2. Clearing the three highest bits
 * 3. Setting the second-highest bit
 *
 * This follows Ed25519-BIP32 specification requirements.
 */
const clampScalar = (scalar: Uint8Array): Uint8Array => {
  const clamped = new Uint8Array(scalar)
  clamped[0] &= 0b1111_1000
  clamped[31] &= 0b0001_1111
  clamped[31] |= 0b0100_0000
  return clamped
}

/**
 * Extract the scalar part (first 32 bytes) from the extended key.
 */
const extractScalar = (extendedKey: Uint8Array): Uint8Array => extendedKey.slice(SCALAR_INDEX, SCALAR_SIZE)

/**
 * Extract the chaincode part (bytes 64-95) from the extended key.
 */
const extractChainCode = (extendedKey: Uint8Array): Uint8Array =>
  extendedKey.slice(CHAIN_CODE_INDEX, CHAIN_CODE_INDEX + CHAIN_CODE_SIZE)

/**
 * Smart constructor for Bip32PrivateKey that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = Bip32PrivateKey.make

/**
 * Check if two Bip32PrivateKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Bip32PrivateKey, b: Bip32PrivateKey): boolean => a === b

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a Bip32PrivateKey from raw bytes (96 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): Bip32PrivateKey => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse a Bip32PrivateKey from a hex string (192 hex characters).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): Bip32PrivateKey => Eff.runSync(Effect.fromHex(hex))

/**
 * Create a Bip32PrivateKey from BIP39 entropy with PBKDF2 key stretching.
 * This is the proper way to generate a master key from a BIP39 seed.
 *
 * @since 2.0.0
 * @category bip39
 */
export const fromBip39Entropy = (entropy: Uint8Array, password: string = ""): Bip32PrivateKey =>
  Eff.runSync(Effect.fromBip39Entropy(entropy, password))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Bip32PrivateKey to raw bytes (96 bytes).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (bip32PrivateKey: Bip32PrivateKey): Uint8Array => Eff.runSync(Effect.toBytes(bip32PrivateKey))

/**
 * Convert a Bip32PrivateKey to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (bip32PrivateKey: Bip32PrivateKey): string => bip32PrivateKey // Already a hex string

// ============================================================================
// Key Derivation
// ============================================================================

/**
 * Derive a child private key using a single derivation index.
 * Supports both hard derivation (>= 0x80000000) and soft derivation (< 0x80000000).
 *
 * @since 2.0.0
 * @category bip32
 */
export const deriveChild = (bip32PrivateKey: Bip32PrivateKey, index: number): Bip32PrivateKey =>
  Eff.runSync(Effect.deriveChild(bip32PrivateKey, index))

/**
 * Derive a child private key using multiple derivation indices.
 * Each index can be either hard or soft derivation.
 *
 * @since 2.0.0
 * @category bip32
 */
export const derive = (bip32PrivateKey: Bip32PrivateKey, indices: Array<number>): Bip32PrivateKey =>
  Eff.runSync(Effect.derive(bip32PrivateKey, indices))

/**
 * Derive a child private key using a BIP32 path string.
 * Supports paths like "m/1852'/1815'/0'/0/0" or "1852'/1815'/0'/0/0".
 *
 * @since 2.0.0
 * @category bip32
 */
export const derivePath = (bip32PrivateKey: Bip32PrivateKey, path: string): Bip32PrivateKey =>
  Eff.runSync(Effect.derivePath(bip32PrivateKey, path))

// ============================================================================
// Key Conversion
// ============================================================================

/**
 * Convert a Bip32PrivateKey to a standard PrivateKey for signing operations.
 * Extracts the first 64 bytes (scalar + IV) for Ed25519 signing.
 *
 * @since 2.0.0
 * @category conversion
 */
export const toPrivateKey = (bip32PrivateKey: Bip32PrivateKey): PrivateKey.PrivateKey =>
  Eff.runSync(Effect.toPrivateKey(bip32PrivateKey))

// ============================================================================
// CML Compatibility Functions
// ============================================================================

/**
 * Serialize Bip32PrivateKey to CML-compatible 128-byte format.
 * Format: [private_key(32)] + [IV(32)] + [public_key(32)] + [chain_code(32)]
 * This matches the format expected by CML.Bip32PrivateKey.from_128_xprv()
 *
 * @since 2.0.0
 * @category cml-compatibility
 */
export const to128XPRV = (bip32PrivateKey: Bip32PrivateKey): Uint8Array =>
  Eff.runSync(Effect.to_128_xprv(bip32PrivateKey))

/**
 * Create Bip32PrivateKey from CML-compatible 128-byte format.
 * Format: [private_key(32)] + [IV(32)] + [public_key(32)] + [chain_code(32)]
 * This matches the format returned by CML.Bip32PrivateKey.to_128_xprv()
 *
 * @since 2.0.0
 * @category cml-compatibility
 */
export const from128XPRV = (bytes: Uint8Array): Bip32PrivateKey => Eff.runSync(Effect.from_128_xprv(bytes))

// ============================================================================
// Public Key Derivation
// ============================================================================

/**
 * Derive the public key from this BIP32 private key.
 * Uses the scalar part for Ed25519 point multiplication.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const toPublicKey = (bip32PrivateKey: Bip32PrivateKey): Bip32PublicKey.Bip32PublicKey =>
  Eff.runSync(Effect.toPublicKey(bip32PrivateKey))

// ============================================================================
// FastCheck Arbitrary
// ============================================================================

/**
 * FastCheck arbitrary for generating random Bip32PrivateKey instances for testing.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: 96,
  maxLength: 96
}).map((bytes) => Eff.runSync(Effect.fromBytes(bytes)))

// ============================================================================
// Cardano-specific utilities
// ============================================================================

/**
 * Cardano BIP44 derivation path utilities for BIP32 keys.
 *
 * @since 2.0.0
 * @category cardano
 */
export const CardanoPath = {
  /**
   * Create a Cardano BIP44 derivation path as indices array.
   * Standard path: [1852', 1815', account', role, index]
   */
  indices: (account: number = 0, role: 0 | 2 = 0, index: number = 0): Array<number> => [
    0x80000000 + 1852, // Purpose: 1852' (hardened)
    0x80000000 + 1815, // Coin type: ADA (hardened)
    0x80000000 + account, // Account (hardened)
    role, // Role: 0=payment, 2=stake (not hardened)
    index // Index (not hardened)
  ],

  /**
   * Payment key indices (role = 0)
   */
  paymentIndices: (account: number = 0, index: number = 0) => CardanoPath.indices(account, 0, index),

  /**
   * Stake key indices (role = 2)
   */
  stakeIndices: (account: number = 0, index: number = 0) => CardanoPath.indices(account, 2, index)
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
   * Parse a Bip32PrivateKey from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      if (bytes.length !== 96) {
        return yield* Eff.fail(
          new Bip32PrivateKeyError({
            message: `Expected 96 bytes, got ${bytes.length} bytes`
          })
        )
      }
      return yield* Eff.mapError(
        Schema.decode(FromBytes)(bytes),
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to parse Bip32PrivateKey from bytes",
            cause
          })
      )
    })

  /**
   * Parse a Bip32PrivateKey from a hex string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.mapError(
      Schema.decode(Bip32PrivateKey)(hex),
      (cause) =>
        new Bip32PrivateKeyError({
          message: "Failed to parse Bip32PrivateKey from hex",
          cause
        })
    )

  /**
   * Create a Bip32PrivateKey from BIP39 entropy using Effect error handling.
   *
   * @since 2.0.0
   * @category bip39
   */
  export const fromBip39Entropy = (
    entropy: Uint8Array,
    password: string = ""
  ): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const keyMaterial = yield* Eff.try(() =>
        pbkdf2(sha512, password, entropy, { c: PBKDF2_ITERATIONS, dkLen: PBKDF2_KEY_SIZE })
      )

      // Clamp the scalar part (first 32 bytes)
      const clamped = new Uint8Array(keyMaterial)
      clamped.set(clampScalar(keyMaterial.slice(0, 32)), 0)

      return yield* Schema.decode(FromBytes)(clamped)
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to generate Bip32PrivateKey from BIP39 entropy",
            cause
          })
      )
    )

  /**
   * Convert a Bip32PrivateKey to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (bip32PrivateKey: Bip32PrivateKey): Eff.Effect<Uint8Array, Bip32PrivateKeyError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(bip32PrivateKey),
      (cause) =>
        new Bip32PrivateKeyError({
          message: "Failed to encode Bip32PrivateKey to bytes",
          cause
        })
    )

  /**
   * Derive a child private key using a single index with Effect error handling.
   *
   * @since 2.0.0
   * @category bip32
   */
  export const deriveChild = (
    bip32PrivateKey: Bip32PrivateKey,
    index: number
  ): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const keyBytes = yield* Schema.encode(FromBytes)(bip32PrivateKey)

      // For soft derivation, we need the computed public key bytes, not the Bip32PublicKey
      const computedPublicKeyBytes = yield* Eff.try(() => {
        const scalar = extractScalar(keyBytes)
        return sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
      })

      const derivedBytes = yield* Eff.try(() => {
        const scalar = keyBytes.slice(0, 32) // First 32 bytes: scalar
        const iv = keyBytes.slice(32, 64) // Second 32 bytes: IV
        const chainCode = extractChainCode(keyBytes)

        // Determine if this is hardened or soft derivation
        const isHardened = index >= 0x80000000
        const actualIndex = index // Use the actual index, don't force hardened

        // Serialize index in little-endian (V2 scheme) - CML compatible
        const indexBytes = new Uint8Array(4)
        indexBytes[0] = actualIndex & 0xff
        indexBytes[1] = (actualIndex >>> 8) & 0xff
        indexBytes[2] = (actualIndex >>> 16) & 0xff
        indexBytes[3] = (actualIndex >>> 24) & 0xff

        // Create HMAC input for Z - use appropriate tag and key material
        let zInput: Uint8Array
        if (isHardened) {
          // Hardened derivation: tag(0x00) + scalar(32) + iv(32) + index(4 bytes)
          const zTag = new Uint8Array([0x00]) // TAG_DERIVE_Z_HARDENED
          zInput = new Uint8Array(1 + 32 + 32 + 4)
          zInput.set(zTag, 0)
          zInput.set(scalar, 1)
          zInput.set(iv, 33)
          zInput.set(indexBytes, 65)
        } else {
          // Soft derivation: tag(0x02) + public_key(32 bytes) + index(4 bytes)
          const zTag = new Uint8Array([0x02]) // TAG_DERIVE_Z_SOFT - try 0x02
          zInput = new Uint8Array(1 + 32 + 4)
          zInput.set(zTag, 0)
          zInput.set(computedPublicKeyBytes, 1)
          zInput.set(indexBytes, 33)
        }

        // HMAC-SHA512 with chain code as key
        const hmacZ = sodium.crypto_auth_hmacsha512(zInput, chainCode)

        const z = new Uint8Array(hmacZ)
        const zl = z.slice(0, 32)
        const zr = z.slice(32, 64)

        // multiply8_v2: multiply by 8 using DERIVATION_V2 scheme (CML compatible)
        // This implements add_28_mul8_v2(kl, zl) where kl is the scalar (left half)
        const kl = scalar // Use the scalar, not the first 32 bytes of 64-byte "private key"
        const scaledLeft = new Uint8Array(32)
        let carry = 0
        // First 28 bytes: kl[i] + (zl[i] << 3) + carry
        for (let i = 0; i < 28; i++) {
          const r = kl[i] + (zl[i] << 3) + carry
          scaledLeft[i] = r & 0xff
          carry = r >> 8
        }
        // Last 4 bytes: kl[i] + carry (no shift)
        for (let i = 28; i < 32; i++) {
          const r = kl[i] + carry
          scaledLeft[i] = r & 0xff
          carry = r >> 8
        }

        // scalar_add_no_overflow: The left half is already computed in scaledLeft
        const newKeyMaterial = new Uint8Array(64)
        // Use the computed scaledLeft directly for left half (new scalar)
        newKeyMaterial.set(scaledLeft, 0)

        // Add right half (zr + iv) - the IV becomes the new right half
        let carryBit = 0
        for (let i = 0; i < 32; i++) {
          const sum = iv[i] + zr[i] + carryBit
          newKeyMaterial[i + 32] = sum & 0xff
          carryBit = sum > 255 ? 1 : 0
        }

        // Derive new chain code: use appropriate tag and key material
        let ccInput: Uint8Array
        if (isHardened) {
          // Hardened derivation: tag(0x01) + scalar(32) + iv(32) + index(4 bytes)
          const ccTag = new Uint8Array([0x01]) // TAG_DERIVE_CC_HARDENED
          ccInput = new Uint8Array(1 + 32 + 32 + 4)
          ccInput.set(ccTag, 0)
          ccInput.set(scalar, 1)
          ccInput.set(iv, 33)
          ccInput.set(indexBytes, 65)
        } else {
          // Soft derivation: tag(0x03) + public_key(32 bytes) + index(4 bytes)
          const ccTag = new Uint8Array([0x03]) // TAG_DERIVE_CC_SOFT - corrected to 0x03
          ccInput = new Uint8Array(1 + 32 + 4)
          ccInput.set(ccTag, 0)
          ccInput.set(computedPublicKeyBytes, 1)
          ccInput.set(indexBytes, 33)
        }

        const hmacCC = sodium.crypto_auth_hmacsha512(ccInput, chainCode)
        const newChainCode = new Uint8Array(hmacCC).slice(32, 64) // Take right 32 bytes

        // Construct the new key: newKeyMaterial(64 bytes) + newChainCode(32 bytes) = 96 bytes
        return new Uint8Array([...newKeyMaterial, ...newChainCode])
      })

      return yield* Schema.decode(FromBytes)(derivedBytes)
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PrivateKeyError({
            message: `Failed to derive child key with index ${index}`,
            cause
          })
      )
    )

  /**
   * Derive a child private key using multiple indices with Effect error handling.
   *
   * @since 2.0.0
   * @category bip32
   */
  export const derive = (
    bip32PrivateKey: Bip32PrivateKey,
    indices: Array<number>
  ): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      let currentKey = bip32PrivateKey

      for (const index of indices) {
        currentKey = yield* deriveChild(currentKey, index)
      }

      return currentKey
    })

  /**
   * Parse a BIP32 derivation path string into indices array.
   *
   * @since 2.0.0
   * @category bip32
   */
  const parsePath = (path: string): Eff.Effect<Array<number>, Bip32PrivateKeyError> =>
    Eff.try(() => {
      const cleanPath = path.startsWith("m/") ? path.slice(2) : path
      const segments = cleanPath.split("/")

      return segments.map((segment) => {
        const isHardened = segment.endsWith("'") || segment.endsWith("h")
        const indexStr = isHardened ? segment.slice(0, -1) : segment
        const index = parseInt(indexStr, 10)

        if (isNaN(index)) {
          throw new Error(`Invalid path segment: ${segment}`)
        }

        return isHardened ? 0x80000000 + index : index
      })
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PrivateKeyError({
            message: `Failed to parse derivation path: ${path}`,
            cause
          })
      )
    )

  /**
   * Derive a child private key using a path string with Effect error handling.
   *
   * @since 2.0.0
   * @category bip32
   */
  export const derivePath = (
    bip32PrivateKey: Bip32PrivateKey,
    path: string
  ): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const indices = yield* parsePath(path)
      return yield* derive(bip32PrivateKey, indices)
    })

  /**
   * Convert a Bip32PrivateKey to a standard PrivateKey using Effect error handling.
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toPrivateKey = (
    bip32PrivateKey: Bip32PrivateKey
  ): Eff.Effect<PrivateKey.PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const keyBytes = yield* toBytes(bip32PrivateKey)
      const privateKeyBytes = keyBytes.slice(0, 64) // scalar + IV

      return yield* Eff.mapError(
        Schema.decode(PrivateKey.FromBytes)(privateKeyBytes),
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to convert Bip32PrivateKey to PrivateKey",
            cause
          })
      )
    })

  /**
   * Derive the public key from this BIP32 private key using Effect error handling.
   *
   * @since 2.0.0
   * @category cryptography
   */
  export const toPublicKey = (
    bip32PrivateKey: Bip32PrivateKey
  ): Eff.Effect<Bip32PublicKey.Bip32PublicKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const keyBytes = yield* Schema.encode(FromBytes)(bip32PrivateKey)

      const publicKeyBytes = yield* Eff.try(() => {
        const scalar = extractScalar(keyBytes)
        return sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
      })

      const chainCode = extractChainCode(keyBytes)

      return yield* Eff.mapError(
        Bip32PublicKey.Effect.fromBytes(publicKeyBytes, chainCode),
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to create Bip32PublicKey",
            cause
          })
      )
    }).pipe(
      Eff.mapError(
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to derive public key from Bip32PrivateKey",
            cause
          })
      )
    )

  // ============================================================================
  // CML Compatibility Methods
  // ============================================================================

  /**
   * Serialize Bip32PrivateKey to CML-compatible 128-byte format using Effect error handling.
   * Format: [private_key(32)] + [IV(32)] + [public_key(32)] + [chain_code(32)]
   * This matches the format expected by CML.Bip32PrivateKey.from_128_xprv()
   *
   * @since 2.0.0
   * @category cml-compatibility
   */
  export const to_128_xprv = (bip32PrivateKey: Bip32PrivateKey): Eff.Effect<Uint8Array, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      const keyBytes = yield* Eff.mapError(
        Schema.encode(FromBytes)(bip32PrivateKey),
        (cause) => new Bip32PrivateKeyError({ message: "Failed to encode key bytes", cause })
      )
      const publicKey = yield* toPublicKey(bip32PrivateKey)
      const publicKeyBytes = yield* Eff.mapError(
        Bip32PublicKey.Effect.toBytes(publicKey),
        (cause) => new Bip32PrivateKeyError({ message: "Failed to get public key bytes", cause })
      )

      // Extract components from our 96-byte format: [scalar(32)] + [IV(32)] + [chaincode(32)]
      const scalar = keyBytes.slice(0, 32)
      const iv = keyBytes.slice(32, 64)
      const chaincode = keyBytes.slice(64, 96)

      // Extract just the public key part (first 32 bytes) from the public key bytes
      const publicKeyOnly = publicKeyBytes.slice(0, 32)

      // Construct CML's 128-byte format: [scalar(32)] + [IV(32)] + [public_key(32)] + [chaincode(32)]
      const cmlFormat = new Uint8Array(128)
      cmlFormat.set(scalar, 0) // Bytes 0-31: private key
      cmlFormat.set(iv, 32) // Bytes 32-63: IV/extension
      cmlFormat.set(publicKeyOnly, 64) // Bytes 64-95: public key
      cmlFormat.set(chaincode, 96) // Bytes 96-127: chain code

      return cmlFormat
    })

  /**
   * Create Bip32PrivateKey from CML-compatible 128-byte format using Effect error handling.
   * Format: [private_key(32)] + [IV(32)] + [public_key(32)] + [chain_code(32)]
   * This matches the format returned by CML.Bip32PrivateKey.to_128_xprv()
   *
   * @since 2.0.0
   * @category cml-compatibility
   */
  export const from_128_xprv = (bytes: Uint8Array): Eff.Effect<Bip32PrivateKey, Bip32PrivateKeyError> =>
    Eff.gen(function* () {
      if (bytes.length !== 128) {
        return yield* Eff.fail(
          new Bip32PrivateKeyError({
            message: `Expected exactly 128 bytes for CML format, got ${bytes.length}`
          })
        )
      }

      // Extract components from CML's 128-byte format
      const scalar = bytes.slice(0, 32) // Bytes 0-31: private key
      const iv = bytes.slice(32, 64) // Bytes 32-63: IV/extension
      const chaincode = bytes.slice(96, 128) // Bytes 96-127: chain code

      // Verify the public key matches the private key
      const expectedPublicKey = bytes.slice(64, 96) // Bytes 64-95: public key
      const derivedPublicKey = yield* Eff.try(() => sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)).pipe(
        Eff.mapError((cause) => new Bip32PrivateKeyError({ message: "Failed to derive public key", cause }))
      )

      const publicKeyMatches = derivedPublicKey.every((byte, i) => byte === expectedPublicKey[i])
      if (!publicKeyMatches) {
        return yield* Eff.fail(
          new Bip32PrivateKeyError({
            message: "Public key does not match private key in 128-byte format"
          })
        )
      }

      // Construct our internal 96-byte format: [scalar(32)] + [IV(32)] + [chaincode(32)]
      const internalFormat = new Uint8Array(96)
      internalFormat.set(scalar, 0) // Bytes 0-31: scalar
      internalFormat.set(iv, 32) // Bytes 32-63: IV
      internalFormat.set(chaincode, 64) // Bytes 64-95: chaincode

      return yield* Eff.mapError(
        Schema.decode(FromBytes)(internalFormat),
        (cause) =>
          new Bip32PrivateKeyError({
            message: "Failed to decode internal format",
            cause
          })
      )
    })
}
