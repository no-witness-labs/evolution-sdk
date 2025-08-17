import { blake2b } from "@noble/hashes/blake2"
import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"
import * as Hash28 from "./Hash28.js"
import type { PrivateKey } from "./PrivateKey.js"
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
 * KeyHash as a TaggedClass (breaking change from branded hex string).
 * ```
 * addr_keyhash = hash28
 * ```
 * Follows CIP-0019 binary representation.
 *
 * Stores raw 28-byte value for performance.
 *
 * @since 2.0.0
 * @category model
 */
export class KeyHash extends Schema.TaggedClass<KeyHash>()("KeyHash", {
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
 * Schema transformer from bytes to KeyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Hash28.BytesSchema, KeyHash, {
  strict: true,
  decode: (bytes) => new KeyHash({ hash: bytes }, { disableValidation: true }), // Disable validation since we already check length in Hash28
  encode: (keyHash) => keyHash.hash
}).annotations({
  identifier: "KeyHash.FromBytes"
})

/**
 * Schema transformer from hex string to KeyHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(
  Bytes.FromHex, // string -> Uint8Array
  FromBytes
).annotations({
  identifier: "KeyHash.FromHex"
})

/**
 * Smart constructor for KeyHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof KeyHash>) => new KeyHash(...args)

/**
 * Check if two KeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: KeyHash, b: KeyHash): boolean => Bytes.equals(a.hash, b.hash)

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
export const fromBytes = Function.makeDecodeSync(FromBytes, KeyHashError, "KeyHash.fromBytes")

/**
 * Parse a KeyHash from a hex string.
 * Expects exactly 56 hex characters (28 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, KeyHashError, "KeyHash.fromHex")

/**
 * FastCheck arbitrary for generating random KeyHash instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary: FastCheck.Arbitrary<KeyHash> = FastCheck.uint8Array({ minLength: 28, maxLength: 28 }).map(
  (bytes) => make({ hash: bytes }, { disableValidation: true })
)

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a KeyHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (keyhash: KeyHash): Uint8Array => new Uint8Array(keyhash.hash) // Return a copy of the underlying bytes

/**
 * Convert a KeyHash to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (keyhash: KeyHash): string => Bytes.toHex(keyhash.hash)

// ============================================================================
// Cryptographic Operations (throwing)
// ============================================================================

/**
 * Create a KeyHash from a PrivateKey (sync version that throws KeyHashError).
 * All errors are normalized to KeyHashError with contextual information.
 */
export const fromPrivateKey = (privateKey: PrivateKey): KeyHash => {
  const vkey = VKey.fromPrivateKey(privateKey)
  const publicKeyBytes = VKey.toBytes(vkey)
  const keyHashBytes = blake2b(publicKeyBytes, { dkLen: 28 })
  return KeyHash.make({ hash: keyHashBytes })
}

/**
 * Create a KeyHash from a VKey (sync version that throws KeyHashError).
 * All errors are normalized to KeyHashError with contextual information.
 */
export const fromVKey = (vkey: VKey.VKey): KeyHash => {
  const publicKeyBytes = VKey.toBytes(vkey)
  const keyHashBytes = blake2b(publicKeyBytes, { dkLen: 28 })
  return KeyHash.make({ hash: keyHashBytes })
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
  export const fromBytes = Function.makeDecodeEither(FromBytes, KeyHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, KeyHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, KeyHashError)
  export const toHex = Function.makeEncodeEither(FromHex, KeyHashError)
}
