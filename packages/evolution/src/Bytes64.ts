import { Data, Effect as Eff, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes64Error extends Data.TaggedError("Bytes64Error")<{
  message?: string
  cause?: unknown
}> {}

// Add constants following the style guide
export const BYTES_LENGTH = 64
export const HEX_LENGTH = 128

/**
 * Schema for Bytes64 bytes with 64-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Schema.filter((a) => a.length === BYTES_LENGTH)).annotations({
  identifier: "Bytes64.Bytes",
  title: "64-byte Array",
  description: "A Uint8Array containing exactly 64 bytes",
  message: (issue) => `Bytes64 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(64).fill(0)]
})

/**
 * Schema for Bytes64 hex strings with 128-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(Schema.filter((a) => a.length === HEX_LENGTH)).annotations({
  identifier: "Bytes64.Hex",
  title: "64-byte Hex String",
  description: "A hexadecimal string representing exactly 64 bytes (128 characters)",
  message: (issue) => `Bytes64 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(128)]
})

/**
 * Schema transformer for Bytes64 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes64-specific length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Schema.transform(BytesSchema, HexSchema, {
  strict: true,
  decode: (toA) => {
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += toA[i].toString(16).padStart(2, "0")
    }
    return hex
  },
  encode: (fromA) => {
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      array[ai] = parseInt(fromA.slice(hi, hi + 2), 16)
    }
    return array
  }
}).annotations({
  identifier: "Bytes64.FromBytes",
  title: "Bytes64 from Uint8Array",
  description: "Transforms a 64-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse Bytes64 from raw bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => {
  try {
    return Schema.decodeSync(FromBytes)(bytes)
  } catch (cause) {
    throw new Bytes64Error({
      message: "Failed to parse Bytes64 from bytes",
      cause
    })
  }
}

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert Bytes64 hex to raw bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => Eff.runSync(Effect.toBytes(hex))

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
   * Parse Bytes64 from raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<string, Bytes64Error> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new Bytes64Error({
          message: "Failed to parse Bytes64 from bytes",
          cause
        })
    )

  /**
   * Convert Bytes64 hex to raw bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = (hex: string): Eff.Effect<Uint8Array, Bytes64Error> =>
    Eff.mapError(
      Schema.encode(FromBytes)(hex),
      (cause) =>
        new Bytes64Error({
          message: "Failed to encode Bytes64 to bytes",
          cause
        })
    )
}
