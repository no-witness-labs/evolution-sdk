/**
 * Hash28 module provides utilities for handling 28-byte hash values and variable-length byte arrays.
 *
 * @since 2.0.0
 */
import { Data, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Function from "./Function.js"

/**
 * Error type for this module.
 *
 * @since 2.0.0
 * @category errors
 */
export class Hash28Error extends Data.TaggedError("Hash28Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Constant bytes length
 *
 * @since 2.0.0
 * @category constants
 */
export const BYTES_LENGTH = 28

export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(
  Bytes.bytesLengthEquals(BYTES_LENGTH, `Hash${BYTES_LENGTH}.Hash${BYTES_LENGTH}`)
)

export const HexSchema = Bytes.HexSchema.pipe(
  Bytes.hexLengthEquals(BYTES_LENGTH, `Hash${BYTES_LENGTH}.Hex${BYTES_LENGTH}`)
)

/**
 * Schema transformation for fixed-length bytes
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Bytes.makeBytesTransformation({
  id: `Hash${BYTES_LENGTH}.Hash${BYTES_LENGTH}FromHex`,
  stringSchema: HexSchema,
  uint8ArraySchema: BytesSchema,
  decode: Bytes.fromHexUnsafe,
  encode: Bytes.toHexUnsafe
})

export const VariableBytes = Schema.Uint8ArrayFromSelf.pipe(
  Bytes.bytesLengthBetween(0, BYTES_LENGTH, `Hash${BYTES_LENGTH}.VariableHash${BYTES_LENGTH}`)
)

/**
 * Schema transformation for variable-length bytes (0..BYTES_LENGTH).
 *
 * @since 2.0.0
 * @category schemas
 */
export const VariableBytesFromHex = Bytes.makeBytesTransformation({
  id: `Hash${BYTES_LENGTH}.VariableHash${BYTES_LENGTH}FromHex`,
  stringSchema: Bytes.HexLenientSchema.pipe(
    Bytes.hexLengthBetween(0, BYTES_LENGTH, `Hash${BYTES_LENGTH}.VariableHex${BYTES_LENGTH}`)
  ),
  uint8ArraySchema: VariableBytes,
  decode: Bytes.fromHexLenient,
  encode: Bytes.toHexLenientUnsafe
})

export const equals = Bytes.equals

// =============================================================================
// Public (throwing) API
// =============================================================================

/**
 * Decode fixed-length hex into bytes.
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromHex = Function.makeDecodeSync(FromHex, Hash28Error, "Hash28.fromHex")

/**
 * Encode fixed-length bytes to hex.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, Hash28Error, "Hash28.toHex")

/**
 * Decode variable-length hex (0..BYTES_LENGTH) into bytes.
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromVariableHex = Function.makeDecodeSync(VariableBytesFromHex, Hash28Error, "Hash28.fromVariableHex")

/**
 * Encode variable-length bytes (0..BYTES_LENGTH) to hex.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toVariableHex = Function.makeEncodeSync(VariableBytesFromHex, Hash28Error, "Hash28.toVariableHex")

// =============================================================================
// Either (safe) API
// =============================================================================

export namespace Either {
  /**
   * Safely decode fixed-length hex into bytes.
   * @since 2.0.0
   * @category decoding
   */
  export const fromHex = Function.makeDecodeEither(FromHex, Hash28Error)
  /**
   * Safely encode fixed-length bytes to hex.
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, Hash28Error)
  /**
   * Safely decode variable-length hex (0..BYTES_LENGTH) into bytes.
   * @since 2.0.0
   * @category decoding
   */
  export const fromVariableHex = Function.makeDecodeEither(VariableBytesFromHex, Hash28Error)
  /**
   * Safely encode variable-length bytes (0..BYTES_LENGTH) to hex.
   * @since 2.0.0
   * @category encoding
   */
  export const toVariableHex = Function.makeEncodeEither(VariableBytesFromHex, Hash28Error)
}
