import { blake2b } from "@noble/hashes/blake2"
import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"
import * as Hash28 from "./Hash28.js"
import * as NativeScripts from "./NativeScripts.js"
import type * as Script from "./Script.js"

/**
 * Error class for ScriptHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptHashError extends Data.TaggedError("ScriptHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for ScriptHash representing a script hash credential.
 * ```
 * script_hash = hash28
 * ```
 * Follows CIP-0019 binary representation.
 *
 * Stores raw 28-byte value for performance.
 *
 * @since 2.0.0
 * @category schemas
 */
export class ScriptHash extends Schema.TaggedClass<ScriptHash>()("ScriptHash", {
  hash: Hash28.BytesFromHex
}) {
  toJSON(): string {
    return toHex(this)
  }

  toString(): string {
    return `ScriptHash({ hash: ${this.hash} })`
  }
}

/**
 * Schema for transforming between Uint8Array and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(Schema.typeSchema(Hash28.BytesFromHex), Schema.typeSchema(ScriptHash), {
  strict: true,
  decode: (bytes) => new ScriptHash({ hash: bytes }, { disableValidation: true }), // Disable validation since we already check length in Hash28
  encode: (scriptHash) => scriptHash.hash
}).annotations({
  identifier: "ScriptHash.FromBytes"
})

/**
 * Schema for transforming between hex string and ScriptHash.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Hash28.BytesFromHex, FromBytes).annotations({
  identifier: "ScriptHash.FromHex"
})

/**
 * Smart constructor for ScriptHash that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ScriptHash>) => new ScriptHash(...args)

/**
 * Check if two ScriptHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ScriptHash, b: ScriptHash): boolean => Bytes.equals(a.hash, b.hash)

/**
 * FastCheck arbitrary for generating random ScriptHash instances.
 * Used for property-based testing to generate valid test data.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<ScriptHash> = FastCheck.uint8Array({ minLength: 28, maxLength: 28 }).map(
  (bytes) => make({ hash: bytes }, { disableValidation: true })
)

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a ScriptHash from raw bytes.
 * Expects exactly 28 bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, ScriptHashError, "ScriptHash.fromBytes")

/**
 * Parse a ScriptHash from a hex string.
 * Expects exactly 56 hex characters (28 bytes).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, ScriptHashError, "ScriptHash.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a ScriptHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (scriptHash: ScriptHash): Uint8Array => new Uint8Array(scriptHash.hash) // Return a copy of the underlying bytes

/**
 * Convert a ScriptHash to a hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = (scriptHash: ScriptHash): string => Bytes.toHex(scriptHash.hash)

// ============================================================================
// Script Hash Computation
// ============================================================================

/**
 * Compute a script hash (policy id) from any Script variant.
 *
 * Conway-era rule: prepend a 1-byte language tag to the script bytes, then hash with blake2b-224.
 * - 0x00: native/multisig (hash over CBOR of native_script)
 * - 0x01: Plutus V1 (hash over raw script bytes)
 * - 0x02: Plutus V2 (hash over raw script bytes)
 * - 0x03: Plutus V3 (hash over raw script bytes)
 *
 * @since 2.0.0
 * @category computation
 */
export const fromScript = (script: Script.Script): ScriptHash => {
  let tag: number
  let body: Uint8Array

  switch (script._tag) {
    // Plutus script cases
    case "PlutusV1":
      tag = 0x01
      body = script.bytes
      break

    case "PlutusV2":
      tag = 0x02
      body = script.bytes
      break

    case "PlutusV3":
      tag = 0x03
      body = script.bytes
      break

    // Native script case (TaggedClass)
    case "NativeScript":
      tag = 0x00
      body = NativeScripts.toCBORBytes(script)
      break

    default:
      throw new Error(`Unknown script type: ${(script as any)._tag}`)
  }

  const prefixed = new Uint8Array(1 + body.length)
  prefixed[0] = tag
  prefixed.set(body, 1)
  const hashBytes = blake2b(prefixed, { dkLen: 28 })
  return make({ hash: new Uint8Array(hashBytes) }, { disableValidation: true })
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
  export const fromBytes = Function.makeDecodeEither(FromBytes, ScriptHashError)
  export const fromHex = Function.makeDecodeEither(FromHex, ScriptHashError)
  export const toBytes = Function.makeEncodeEither(FromBytes, ScriptHashError)
  export const toHex = Function.makeEncodeEither(FromHex, ScriptHashError)
}
