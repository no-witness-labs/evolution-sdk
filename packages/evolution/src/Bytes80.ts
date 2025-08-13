import { Data, Effect as Eff, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes80Error extends Data.TaggedError("Bytes80Error")<{
  message?: string
  cause?: unknown
}> {}

export const BYTES_LENGTH = 80
export const HEX_LENGTH = 160

/**
 * Schema for Bytes80 bytes with 80-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Schema.filter((a) => a.length === BYTES_LENGTH)).annotations({
  identifier: "Bytes80.Bytes",
  title: "80-byte Array",
  description: "A Uint8Array containing exactly 80 bytes",
  message: (issue) => `Bytes80 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(80).fill(0)]
})

/**
 * Schema for Bytes80 hex strings with 160-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(Schema.filter((a) => a.length === HEX_LENGTH)).annotations({
  identifier: "Bytes80.Hex",
  title: "80-byte Hex String",
  description: "A hexadecimal string representing exactly 80 bytes (160 characters)",
  message: (issue) => `Bytes80 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(160)]
})

/**
 * Schema transformer for Bytes80 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes80-specific length validation.
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
  identifier: "Bytes80.FromBytes",
  title: "Bytes80 from Uint8Array",
  description: "Transforms a 80-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Effect namespace containing composable operations that can fail.
 * All functions return Effect objects for proper error handling and composition.
 */
export namespace Effect {
  /**
   * Parse Bytes80 from raw bytes using Effect error handling.
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<string, Bytes80Error> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new Bytes80Error({
          message: "Failed to parse Bytes80 from bytes",
          cause
        })
    )

  /**
   * Convert Bytes80 hex to raw bytes using Effect error handling.
   */
  export const toBytes = (hex: string): Eff.Effect<Uint8Array, Bytes80Error> =>
    Eff.mapError(
      Schema.encode(FromBytes)(hex),
      (cause) =>
        new Bytes80Error({
          message: "Failed to encode Bytes80 to bytes",
          cause
        })
    )
}

/**
 * Parse Bytes80 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert Bytes80 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => Eff.runSync(Effect.toBytes(hex))
