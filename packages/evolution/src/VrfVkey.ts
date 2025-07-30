import { Data, FastCheck, pipe, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for VrfVkey related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VrfVkeyError extends Data.TaggedError("VrfVkeyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for VrfVkey representing a VRF verification key.
 * vrf_vkey = bytes .size 32
 * Follows the Conway-era CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VrfVkey = pipe(Bytes32.HexSchema, Schema.brand("VrfVkey")).annotations({
  identifier: "VrfVkey"
})

export type VrfVkey = typeof VrfVkey.Type

export const FromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VrfVkey // hex string -> VrfVkey
).annotations({
  identifier: "VrfVkey.Bytes"
})

export const FromHex = Schema.compose(
  Bytes32.HexSchema, // string -> hex string
  VrfVkey // hex string -> VrfVkey
).annotations({
  identifier: "VrfVkey.Hex"
})

/**
 * Check if two VrfVkey instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfVkey, b: VrfVkey): boolean => a === b

/**
 * Generate a random VrfVkey.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: Bytes32.Bytes32_BYTES_LENGTH,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for VrfVkey encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  VrfVkeyError
)
