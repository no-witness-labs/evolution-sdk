import { Data, Effect as Eff, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes448Error extends Data.TaggedError("Bytes448Error")<{
  message?: string
  cause?: unknown
}> {}

export const BYTES_LENGTH = 448
export const HEX_LENGTH = 896

/**
 * Schema for Bytes448 bytes with 448-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Schema.filter((a) => a.length === BYTES_LENGTH)).annotations({
  identifier: "Bytes448.Bytes",
  title: "448-byte Array",
  description: "A Uint8Array containing exactly 448 bytes",
  message: (issue) =>
    `Bytes448 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(448).fill(0)]
})

/**
 * Schema for Bytes448 hex strings with 896-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(Schema.filter((a) => a.length === HEX_LENGTH)).annotations({
  identifier: "Bytes448.Hex",
  title: "448-byte Hex String",
  description: "A hexadecimal string representing exactly 448 bytes (896 characters)",
  message: (issue) => `Bytes448 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(896)]
})

/**
 * Schema transformer for Bytes448 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes448-specific length validation.
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
  identifier: "Bytes448.FromBytes",
  title: "Bytes448 from Uint8Array",
  description: "Transforms a 448-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Effect namespace containing composable operations that can fail.
 * All functions return Effect objects for proper error handling and composition.
 */
export namespace Effect {
  /**
   * Parse Bytes448 from raw bytes using Effect error handling.
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<string, Bytes448Error> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) =>
        new Bytes448Error({
          message: "Failed to parse Bytes448 from bytes",
          cause
        })
    )

  /**
   * Convert Bytes448 hex to raw bytes using Effect error handling.
   */
  export const toBytes = (hex: string): Eff.Effect<Uint8Array, Bytes448Error> =>
    Eff.mapError(
      Schema.encode(FromBytes)(hex),
      (cause) =>
        new Bytes448Error({
          message: "Failed to encode Bytes448 to bytes",
          cause
        })
    )
}

/**
 * Parse Bytes448 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert Bytes448 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => Eff.runSync(Effect.toBytes(hex))
