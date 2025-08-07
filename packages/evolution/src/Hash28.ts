import { Data, Effect as Eff, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Hash28Error extends Data.TaggedError("Hash28Error")<{
  message?: string
  cause?: unknown
}> {}

// Add constants following the style guide
export const BYTES_LENGTH = 28
export const HEX_LENGTH = 56

/**
 * Schema for Hash28 bytes with 28-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(
  Schema.filter((a) => a.length === BYTES_LENGTH)
).annotations({
  identifier: "Hash28.Bytes",
  title: "28-byte Hash Array",
  description: "A Uint8Array containing exactly 28 bytes",
  message: (issue) =>
    `Hash28 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(28).fill(0)],
})

/**
 * Schema for Hash28 hex strings with 56-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(
  Schema.filter((a) => a.length === HEX_LENGTH)
).annotations({
  identifier: "Hash28.Hex",
  title: "28-byte Hash Hex String", 
  description: "A hexadecimal string representing exactly 28 bytes (56 characters)",
  message: (issue) =>
    `Hash28 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(56)],
})

/**
 * Schema for variable-length byte arrays from 0 to 28 bytes.
 * Useful for asset names and other variable-length data structures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VariableBytesSchema = Schema.Uint8ArrayFromSelf.pipe(
  Schema.filter((a) => a.length >= 0 && a.length <= BYTES_LENGTH)
).annotations({
  message: (issue) =>
    `must be a byte array of length 0 to ${BYTES_LENGTH}, but got ${(issue.actual as Uint8Array).length}`,
  identifier: "Hash28.VariableBytes"
})

/**
 * Schema for variable-length hex strings from 0 to 56 characters (0 to 28 bytes).
 * Useful for asset names and other variable-length data structures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VariableHexSchema = Bytes.HexSchema.pipe(
  Schema.filter((a) => a.length >= 0 && a.length <= HEX_LENGTH)
).annotations({
  message: (issue) =>
    `must be a hex string of length 0 to ${HEX_LENGTH}, but got ${(issue.actual as string).length}`,
  identifier: "Hash28.VariableHex"
})

/**
 * Schema transformation that converts from Uint8Array to hex string.
 * Like Bytes.FromBytes but with Hash28-specific length validation.
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
  identifier: "Hash28.FromBytes",
  title: "Hash28 from Uint8Array",
  description: "Transforms a 28-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Schema transformer for variable-length data that converts between hex strings and byte arrays.
 * Works with 0 to 28 bytes (0 to 56 hex characters).
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromVariableBytes = Schema.transform(VariableBytesSchema, VariableHexSchema, {
  strict: true,
  decode: (toA) => {
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += toA[i].toString(16).padStart(2, "0")
    }
    return hex
  },
  encode: (fromA) => {
    if (fromA.length === 0) return new Uint8Array(0)
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      array[ai] = parseInt(fromA.slice(hi, hi + 2), 16)
    }
    return array
  }
}).annotations({
  identifier: "Hash28.FromVariableBytes",
  title: "Variable Hash28 from Uint8Array",
  description: "Transforms variable-length byte arrays (0-28 bytes) to hex strings (0-56 chars)",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Effect namespace containing composable operations that can fail.
 * All functions return Effect objects for proper error handling and composition.
 */
export namespace Effect {
  /**
   * Parse Hash28 from raw bytes using Effect error handling.
   */
  export const fromBytes = (bytes: Uint8Array): Eff.Effect<string, Hash28Error> =>
    Eff.mapError(
      Schema.decode(FromBytes)(bytes),
      (cause) => new Hash28Error({
        message: "Failed to parse Hash28 from bytes",
        cause
      })
    )

  /**
   * Convert Hash28 hex to raw bytes using Effect error handling.
   */
  export const toBytes = (hex: string): Eff.Effect<Uint8Array, Hash28Error> =>
    Eff.mapError(
      Schema.encode(FromBytes)(hex),
      (cause) => new Hash28Error({
        message: "Failed to encode Hash28 to bytes",
        cause
      })
    )

  /**
   * Parse variable-length data from raw bytes using Effect error handling.
   */
  export const fromVariableBytes = (bytes: Uint8Array): Eff.Effect<string, Hash28Error> =>
    Eff.mapError(
      Schema.decode(FromVariableBytes)(bytes),
      (cause) => new Hash28Error({
        message: "Failed to parse variable Hash28 from bytes",
        cause
      })
    )

  /**
   * Convert variable-length hex to raw bytes using Effect error handling.
   */
  export const toVariableBytes = (hex: string): Eff.Effect<Uint8Array, Hash28Error> =>
    Eff.mapError(
      Schema.encode(FromVariableBytes)(hex),
      (cause) => new Hash28Error({
        message: "Failed to encode variable Hash28 to bytes",
        cause
      })
    )
}

/**
 * Parse Hash28 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0  
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string =>
  Eff.runSync(Effect.fromBytes(bytes))

/**
 * Convert Hash28 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array =>
  Eff.runSync(Effect.toBytes(hex))

/**
 * Parse variable-length data from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromVariableBytes = (bytes: Uint8Array): string =>
  Eff.runSync(Effect.fromVariableBytes(bytes))

/**
 * Convert variable-length hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toVariableBytes = (hex: string): Uint8Array =>
  Eff.runSync(Effect.toVariableBytes(hex))
