import { Data, FastCheck, Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"
import { createEncoders } from "./Codec.js"

/**
 * Error class for AssetName related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AssetNameError extends Data.TaggedError("AssetNameError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for AssetName representing a native asset identifier.
 * Asset names are limited to 32 bytes (0-64 hex characters).
 *
 * @since 2.0.0
 * @category model
 */
export const AssetName = Bytes32.VariableHexSchema.pipe(Schema.brand("AssetName")).annotations({
  identifier: "AssetName"
})

export type AssetName = typeof AssetName.Type

/**
 * Schema for encoding/decoding AssetName as bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.compose(Bytes32.FromVariableBytes, AssetName).annotations({
  identifier: "AssetName.Bytes"
})

/**
 * Schema for encoding/decoding AssetName as hex strings.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Bytes32.VariableHexSchema, AssetName).annotations({
  identifier: "AssetName.Hex"
})

/**
 * Check if two AssetName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: AssetName, b: AssetName): boolean => a === b

/**
 * Generate a random AssetName.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.uint8Array({
  minLength: 0,
  maxLength: Bytes32.Bytes32_BYTES_LENGTH
}).map((bytes) => Codec.Decode.bytes(bytes))

/**
 * Codec utilities for AssetName encoding and decoding operations.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const Codec = createEncoders(
  {
    bytes: FromBytes,
    hex: FromHex
  },
  AssetNameError
)
