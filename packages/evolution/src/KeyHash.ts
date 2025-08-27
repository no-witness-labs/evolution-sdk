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
 * KeyHash
 *
 * CDDL:
 * ```
 * addr_keyhash = hash28
 * ```
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
    return `KeyHash({ hash: ${this.hash} })`
  }
}

/**
 * Schema transformer from bytes to KeyHash.
 *
 * @since 2.0.0
 * @category transformer
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
 * @category transformer
 */
export const FromHex = Schema.compose(
  Bytes.FromHex, // string -> Uint8Array
  FromBytes
).annotations({
  identifier: "KeyHash.FromHex"
})

/**
 * Smart constructor for KeyHash
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
// Decoding Functions
// ============================================================================

/**
 * Decode a KeyHash from raw bytes.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, KeyHashError, "KeyHash.fromBytes")

/**
 * Decode a KeyHash from a hex string.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const fromHex = Function.makeDecodeSync(FromHex, KeyHashError, "KeyHash.fromHex")

/**
 * FastCheck arbitrary for generating random KeyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
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
 * @category encoding/decoding
 */
export const toBytes = (keyhash: KeyHash): Uint8Array => new Uint8Array(keyhash.hash) // Return a copy of the underlying bytes

/**
 * Convert a KeyHash to a hex string.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const toHex = (keyhash: KeyHash): string => Bytes.toHex(keyhash.hash)

/**
 * Create a KeyHash from a PrivateKey
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromPrivateKey = (privateKey: PrivateKey): KeyHash => {
  const vkey = VKey.fromPrivateKey(privateKey)
  const publicKeyBytes = vkey.bytes
  const keyHashBytes = blake2b(publicKeyBytes, { dkLen: 28 })
  return KeyHash.make({ hash: keyHashBytes }, { disableValidation: true })
}

/**
 * Create a KeyHash from a VKey
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromVKey = (vkey: VKey.VKey): KeyHash => {
  const publicKeyBytes = vkey.bytes
  const keyHashBytes = blake2b(publicKeyBytes, { dkLen: 28 })
  return KeyHash.make({ hash: keyHashBytes }, { disableValidation: true })
}

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  export const fromBytes = Function.makeDecodeEither(FromBytes, KeyHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, KeyHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, KeyHashError)
  export const toHex = Function.makeEncodeEither(FromHex, KeyHashError)
}
