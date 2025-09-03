/**
 * Bytes4 module provides utilities for handling fixed-length and variable-length byte arrays.
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
export class Bytes4Error extends Data.TaggedError("Bytes4Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Constant bytes length
 *
 * @since 2.0.0
 * @category constants
 */
export const BYTES_LENGTH = 4

export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Bytes.bytesLengthEquals(BYTES_LENGTH))

export const HexSchema = Bytes.HexSchema.pipe(Bytes.hexLengthEquals(BYTES_LENGTH))

/**
 * Schema transformation for fixed-length bytes
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Bytes.makeBytesTransformation({
  id: `Bytes${BYTES_LENGTH}.Bytes${BYTES_LENGTH}FromHex`,
  stringSchema: HexSchema,
  uint8ArraySchema: BytesSchema,
  decode: Bytes.fromHexUnsafe,
  encode: Bytes.toHexUnsafe
})

export const VariableBytes = Schema.Uint8ArrayFromSelf.pipe(Bytes.bytesLengthBetween(0, BYTES_LENGTH))

/**
 * Schema transformation for variable-length bytes (0..BYTES_LENGTH).
 *
 * @since 2.0.0
 * @category schemas
 */
export const VariableBytesFromHex = Bytes.makeBytesTransformation({
  id: `Bytes${BYTES_LENGTH}.VariableBytes${BYTES_LENGTH}FromHex`,
  stringSchema: Bytes.HexLenientSchema.pipe(Bytes.hexLengthBetween(0, BYTES_LENGTH)),
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
export const fromHex = Function.makeDecodeSync(FromHex, Bytes4Error, "Bytes4.fromHex")

/**
 * Encode fixed-length bytes to hex.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, Bytes4Error, "Bytes4.toHex4")

/**
 * Decode variable-length hex (0..BYTES_LENGTH) into bytes.
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromVariableHex = Function.makeDecodeSync(VariableBytesFromHex, Bytes4Error, "Bytes4.fromVariableHex4")

/**
 * Encode variable-length bytes (0..BYTES_LENGTH) to hex.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toVariableHex = Function.makeEncodeSync(VariableBytesFromHex, Bytes4Error, "Bytes4.toVariableHex4")

// =============================================================================
// Either (safe) API
// =============================================================================

export namespace Either {
  /**
   * Safely decode fixed-length hex into bytes.
   * @since 2.0.0
   * @category decoding
   */
  export const fromHex = Function.makeDecodeEither(FromHex, Bytes4Error)
  /**
   * Safely encode fixed-length bytes to hex.
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, Bytes4Error)
  /**
   * Safely decode variable-length hex (0..BYTES_LENGTH) into bytes.
   * @since 2.0.0
   * @category decoding
   */
  export const fromVariableHex = Function.makeDecodeEither(VariableBytesFromHex, Bytes4Error)
  /**
   * Safely encode variable-length bytes (0..BYTES_LENGTH) to hex.
   * @since 2.0.0
   * @category encoding
   */
  export const toVariableHex = Function.makeDecodeEither(VariableBytesFromHex, Bytes4Error)
}
