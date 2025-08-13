import { Data, Effect as Eff, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes57Error extends Data.TaggedError("Bytes57Error")<{
  message?: string
  cause?: unknown
}> {}

export const BYTES_LENGTH = 57
export const HEX_LENGTH = 114

/**
 * Schema for Bytes57 bytes with 57-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Schema.filter((a) => a.length === BYTES_LENGTH)).annotations({
  identifier: "Bytes57.Bytes",
  title: "57-byte Array",
  description: "A Uint8Array containing exactly 57 bytes",
  message: (issue) => `Bytes57 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(57).fill(0)]
})

/**
 * Schema for Bytes57 hex strings with 114-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(Schema.filter((a) => a.length === HEX_LENGTH)).annotations({
  identifier: "Bytes57.Hex",
  title: "57-byte Hex String",
  description: "A hexadecimal string representing exactly 57 bytes (114 characters)",
  message: (issue) => `Bytes57 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(114)]
})

/**
 * Schema transformer for Bytes57 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes57-specific length validation.
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
  identifier: "Bytes57.FromBytes",
  title: "Bytes57 from Uint8Array",
  description: "Transforms a 57-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Effect namespace containing composable operations that can fail.
 * All functions return Effect objects for proper error handling and composition.
 */
export namespace Effect {
  /**
   * Parse Bytes57 from raw bytes using Effect error handling.
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<string, Bytes57Error> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new Bytes57Error({
          message: "Failed to parse Bytes57 from bytes",
          cause
        })
    )

  /**
   * Convert Bytes57 hex to raw bytes using Effect error handling.
   */
  export const toBytes = (hex: string): Eff.Effect<Uint8Array, Bytes57Error> =>
    Eff.mapError(
      Schema.encode(FromBytes)(hex),
      (cause) =>
        new Bytes57Error({
          message: "Failed to encode Bytes57 to bytes",
          cause
        })
    )
}

/**
 * Parse Bytes57 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert Bytes57 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => Eff.runSync(Effect.toBytes(hex))
