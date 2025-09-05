import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import * as Function from "./Function.js"

/**
 * Error class for VrfKeyHash related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VrfKeyHashError extends Data.TaggedError("VrfKeyHashError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * VrfKeyHash is a 32-byte hash representing a VRF verification key.
 * vrf_keyhash = Bytes32
 *
 * @since 2.0.0
 * @category schemas
 */
export class VrfKeyHash extends Schema.TaggedClass<VrfKeyHash>()("VrfKeyHash", {
  hash: Bytes32.BytesFromHex
}) {
  toJSON(): string {
    return Bytes32.toHex(this.hash)
  }

  toString(): string {
    return Bytes32.toHex(this.hash)
  }
}

export const FromBytes = Schema.transform(Schema.typeSchema(Bytes32.BytesFromHex), Schema.typeSchema(VrfKeyHash), {
  strict: true,
  decode: (bytes) => new VrfKeyHash({ hash: bytes }, { disableValidation: true }), // Disable validation since we already check length in Bytes32
  encode: (vrfKeyHash) => vrfKeyHash.hash
}).annotations({
  identifier: "VrfKeyHash.FromBytes"
})

export const FromHex = Schema.compose(
  Bytes32.BytesFromHex, // string -> hex string
  FromBytes // hex string -> VrfKeyHash
).annotations({
  identifier: "VrfKeyHash.FromHex"
})

export const make = (...args: ConstructorParameters<typeof VrfKeyHash>) => new VrfKeyHash(...args)

/**
 * Check if two VrfKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfKeyHash, b: VrfKeyHash): boolean => Bytes32.equals(a.hash, b.hash)

/**
 * FastCheck arbitrary for generating random VrfKeyHash instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.uint8Array({
  minLength: Bytes32.BYTES_LENGTH,
  maxLength: Bytes32.BYTES_LENGTH
}).map((bytes) => make({ hash: bytes }, { disableValidation: true }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse VrfKeyHash from raw bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, VrfKeyHashError, "VrfKeyHash.fromBytes")

/**
 * Parse VrfKeyHash from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, VrfKeyHashError, "VrfKeyHash.fromHex")

/**
 * Encode VrfKeyHash to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, VrfKeyHashError, "VrfKeyHash.toBytes")

/**
 * Encode VrfKeyHash to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, VrfKeyHashError, "VrfKeyHash.toHex")

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
   * Parse VrfKeyHash from raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, VrfKeyHashError)

  /**
   * Parse VrfKeyHash from hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, VrfKeyHashError)

  /**
   * Encode VrfKeyHash to raw bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, VrfKeyHashError)
}
