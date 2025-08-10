import { bech32 } from "@scure/base"
import * as BIP32 from "@scure/bip32"
import * as BIP39 from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english"
import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"
import sodium from "libsodium-wrappers-sumo"

import * as Bytes32 from "./Bytes32.js"
import * as Bytes64 from "./Bytes64.js"
import * as VKey from "./VKey.js"

/**
 * Error class for PrivateKey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PrivateKeyError extends Data.TaggedError("PrivateKeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for PrivateKey representing an Ed25519 private key.
 * Supports both standard 32-byte and CIP-0003 extended 64-byte formats.
 * Follows the Conway-era CDDL specification with CIP-0003 compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const PrivateKey = Schema.Union(Bytes32.HexSchema, Bytes64.HexSchema)
  .pipe(Schema.brand("PrivateKey"))
  .annotations({
    identifier: "PrivateKey",
    description: "An Ed25519 private key supporting both standard 32-byte and CIP-0003 extended 64-byte formats"
  })

export type PrivateKey = typeof PrivateKey.Type

export const FromBytes = Schema.compose(Schema.Union(Bytes32.FromBytes, Bytes64.FromBytes), PrivateKey).annotations({
  identifier: "PrivateKey.FromBytes",
  description: "Transforms raw bytes (Uint8Array) to PrivateKey hex string"
})

export const FromHex = PrivateKey

export const FromBech32 = Schema.transformOrFail(Schema.String, PrivateKey, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      const privateKeyBytes = yield* ParseResult.encode(FromBytes)(toA)
      const words = bech32.toWords(privateKeyBytes)
      return bech32.encode("ed25519e_sk", words, 1023)
    }),
  decode: (fromA, _, ast) =>
    Eff.gen(function* () {
      const { prefix, words } = yield* ParseResult.try({
        try: () => bech32.decode(fromA as any, 1023),
        catch: (error) => new ParseResult.Type(ast, fromA, `Failed to decode Bech32: ${(error as Error).message}`)
      })
      if (prefix !== "ed25519e_sk") {
        throw new ParseResult.Type(ast, fromA, `Expected ed25519e_sk prefix, got ${prefix}`)
      }
      const decoded = bech32.fromWords(words)
      return yield* ParseResult.decode(FromBytes)(decoded)
    })
}).annotations({
  identifier: "PrivateKey.FromBech32",
  description: "Transforms Bech32 string (ed25519e_sk1...) to PrivateKey"
})

/**
 * Smart constructor for PrivateKey that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PrivateKey.make

/**
 * Check if two PrivateKey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PrivateKey, b: PrivateKey): boolean => a === b

/**
 * FastCheck arbitrary for generating random PrivateKey instances.
 * Generates 32-byte private keys.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({ minLength: 32, maxLength: 32 }).map((bytes) => 
  Eff.runSync(Effect.fromBytes(bytes))
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a PrivateKey from raw bytes.
 * Supports both 32-byte and 64-byte private keys.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): PrivateKey => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Parse a PrivateKey from a hex string.
 * Supports both 32-byte (64 chars) and 64-byte (128 chars) hex strings.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = (hex: string): PrivateKey => Eff.runSync(Effect.fromHex(hex))

/**
 * Parse a PrivateKey from a Bech32 string.
 * Expected format: ed25519e_sk1...
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBech32 = (bech32: string): PrivateKey => Eff.runSync(Effect.fromBech32(bech32))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a PrivateKey to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (privateKey: PrivateKey): Uint8Array => Eff.runSync(Effect.toBytes(privateKey))

/**
 * Convert a PrivateKey to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (privateKey: PrivateKey): string => privateKey // Already a hex string

/**
 * Convert a PrivateKey to a Bech32 string.
 * Format: ed25519e_sk1...
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBech32 = (privateKey: PrivateKey): string => Eff.runSync(Effect.toBech32(privateKey))

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Generate a random 32-byte Ed25519 private key.
 * Compatible with CML.PrivateKey.generate_ed25519().
 *
 * @since 2.0.0
 * @category generators
 */
export const generate = () => sodium.randombytes_buf(32)

/**
 * Generate a random 64-byte extended Ed25519 private key.
 * Compatible with CML.PrivateKey.generate_ed25519extended().
 *
 * @since 2.0.0
 * @category generators
 */
export const generateExtended = () => sodium.randombytes_buf(64)

/**
 * Derive the public key (VKey) from a private key.
 * Compatible with CML privateKey.to_public().
 *
 * @since 2.0.0
 * @category cryptography
 */
export const toPublicKey = (privateKey: PrivateKey): VKey.VKey => VKey.fromPrivateKey(privateKey)

/**
 * Generate a new mnemonic phrase using BIP39.
 *
 * @since 2.0.0
 * @category bip39
 */
export const generateMnemonic = (strength: 128 | 160 | 192 | 224 | 256 = 256): string =>
  BIP39.generateMnemonic(wordlist, strength)

/**
 * Validate a mnemonic phrase using BIP39.
 *
 * @since 2.0.0
 * @category bip39
 */
export const validateMnemonic = (mnemonic: string): boolean => BIP39.validateMnemonic(mnemonic, wordlist)

/**
 * Create a PrivateKey from a mnemonic phrase (sync version that throws PrivateKeyError).
 * All errors are normalized to PrivateKeyError with contextual information.
 *
 * @since 2.0.0
 * @category bip39
 */
export const fromMnemonic = (mnemonic: string, password?: string): PrivateKey =>
  Eff.runSync(Effect.fromMnemonic(mnemonic, password))

/**
 * Derive a child private key using BIP32 path (sync version that throws PrivateKeyError).
 * All errors are normalized to PrivateKeyError with contextual information.
 *
 * @since 2.0.0
 * @category bip32
 */
export const derive = (privateKey: PrivateKey, path: string): PrivateKey => Eff.runSync(Effect.derive(privateKey, path))

// ============================================================================
// Cryptographic Operations
// ============================================================================

/**
 * Sign a message using Ed25519 (sync version that throws PrivateKeyError).
 * All errors are normalized to PrivateKeyError with contextual information.
 * For extended keys (64 bytes), uses CML-compatible Ed25519-BIP32 signing.
 * For normal keys (32 bytes), uses standard Ed25519 signing.
 *
 * @since 2.0.0
 * @category cryptography
 */
export const sign = (privateKey: PrivateKey, message: Uint8Array): Uint8Array =>
  Eff.runSync(Effect.sign(privateKey, message))

/**
 * Cardano BIP44 derivation path utilities.
 *
 * @since 2.0.0
 * @category cardano
 */
export const CardanoPath = {
  /**
   * Create a Cardano BIP44 derivation path.
   * Standard path: m/1852'/1815'/account'/role/index
   */
  create: (account: number = 0, role: 0 | 2 = 0, index: number = 0) => `m/1852'/${1815}'/${account}'/${role}/${index}`,

  /**
   * Payment key path (role = 0)
   */
  payment: (account: number = 0, index: number = 0) => CardanoPath.create(account, 0, index),

  /**
   * Stake key path (role = 2)
   */
  stake: (account: number = 0, index: number = 0) => CardanoPath.create(account, 2, index)
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
   * Parse a PrivateKey from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<PrivateKey, PrivateKeyError> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new PrivateKeyError({
          message: `Failed to parse PrivateKey from bytes`,
          cause
        })
    )

  /**
   * Parse a PrivateKey from a hex string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = (hex: string): Eff.Effect<PrivateKey, PrivateKeyError> =>
    Eff.mapError(
      Schema.decode(FromHex)(hex),
      (cause) =>
        new PrivateKeyError({
          message: "Failed to parse PrivateKey from hex",
          cause
        })
    )

  /**
   * Parse a PrivateKey from a Bech32 string using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBech32 = (bech32: string): Eff.Effect<PrivateKey, PrivateKeyError> =>
    Eff.mapError(
      Schema.decode(FromBech32)(bech32),
      (cause) =>
        new PrivateKeyError({
          message: "Failed to parse PrivateKey from Bech32",
          cause
        })
    )

  /**
   * Convert a PrivateKey to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (privateKey: PrivateKey): Eff.Effect<Uint8Array, PrivateKeyError> =>
    Eff.mapError(
      Schema.encode(FromBytes)(privateKey),
      (cause) =>
        new PrivateKeyError({
          message: "Failed to encode PrivateKey to bytes",
          cause
        })
    )

  /**
   * Convert a PrivateKey to a Bech32 string using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBech32 = (privateKey: PrivateKey): Eff.Effect<string, PrivateKeyError> =>
    Eff.mapError(
      Schema.encode(FromBech32)(privateKey),
      (cause) =>
        new PrivateKeyError({
          message: "Failed to encode PrivateKey to Bech32",
          cause
        })
    )

  /**
   * Create a PrivateKey from a mnemonic phrase using Effect error handling.
   *
   * @since 2.0.0
   * @category bip39
   */
  export const fromMnemonic = (mnemonic: string, password?: string): Eff.Effect<PrivateKey, PrivateKeyError> =>
    Eff.gen(function* () {
      if (!validateMnemonic(mnemonic)) {
        return yield* Eff.fail(new PrivateKeyError({ message: "Invalid mnemonic phrase" }))
      }
      const seed = BIP39.mnemonicToSeedSync(mnemonic, password || "")
      const hdKey = BIP32.HDKey.fromMasterSeed(seed)
      if (!hdKey.privateKey) {
        return yield* Eff.fail(new PrivateKeyError({ message: "No private key in HD key" }))
      }
      return yield* fromBytes(hdKey.privateKey)
    })

  /**
   * Derive a child private key using BIP32 path with Effect error handling.
   *
   * @since 2.0.0
   * @category bip32
   */
  export const derive = (privateKey: PrivateKey, path: string): Eff.Effect<PrivateKey, PrivateKeyError> =>
    Eff.gen(function* () {
      const privateKeyBytes = yield* toBytes(privateKey)
      const hdKey = BIP32.HDKey.fromMasterSeed(privateKeyBytes)
      const childKey = hdKey.derive(path)
      if (!childKey.privateKey) {
        return yield* Eff.fail(new PrivateKeyError({ message: "No private key in derived HD key" }))
      }
      return yield* fromBytes(childKey.privateKey)
    })

  /**
   * Sign a message using Ed25519 with Effect error handling.
   *
   * @since 2.0.0
   * @category cryptography
   */
  export const sign = (privateKey: PrivateKey, message: Uint8Array): Eff.Effect<Uint8Array, PrivateKeyError> =>
    Eff.gen(function* () {
      const privateKeyBytes = yield* toBytes(privateKey)

      if (privateKeyBytes.length === 64) {
        // CML-compatible extended signing algorithm
        const scalar = privateKeyBytes.slice(0, 32)
        const iv = privateKeyBytes.slice(32, 64)

        const publicKey = sodium.crypto_scalarmult_ed25519_base_noclamp(scalar)
        const nonceHash = sodium.crypto_hash_sha512(new Uint8Array([...iv, ...message]))
        const nonce = sodium.crypto_core_ed25519_scalar_reduce(nonceHash)
        const r = sodium.crypto_scalarmult_ed25519_base_noclamp(nonce)
        const hramHash = sodium.crypto_hash_sha512(new Uint8Array([...r, ...publicKey, ...message]))
        const hram = sodium.crypto_core_ed25519_scalar_reduce(hramHash)
        const s = sodium.crypto_core_ed25519_scalar_add(sodium.crypto_core_ed25519_scalar_mul(hram, scalar), nonce)

        return new Uint8Array([...r, ...s])
      }

      // Standard 32-byte Ed25519 signing
      const publicKey = sodium.crypto_sign_seed_keypair(privateKeyBytes).publicKey
      const secretKey = new Uint8Array([...privateKeyBytes, ...publicKey])
      return sodium.crypto_sign_detached(message, secretKey)
    })
}
