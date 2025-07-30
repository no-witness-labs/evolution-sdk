import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

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
export const VrfKeyHash = pipe(Bytes32.HexSchema, Schema.brand("VrfKeyHash")).annotations({
  identifier: "VrfKeyHash"
})

export type VrfKeyHash = typeof VrfKeyHash.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VrfKeyHash // hex string -> VrfKeyHash
).annotations({
  identifier: "VrfKeyHash.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VrfKeyHash // hex string -> VrfKeyHash
).annotations({
  identifier: "VrfKeyHash.Hex"
})

/**
 * Check if two VrfKeyHash instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfKeyHash, b: VrfKeyHash): boolean => a === b

/**
 * Generate a random VrfKeyHash.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for VrfKeyHash encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  VrfKeyHashError
)
