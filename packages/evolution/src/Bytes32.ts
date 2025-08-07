import { Data, Either as E, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes32Error extends Data.TaggedError("Bytes32Error")<{
  message?: string
  cause?: unknown
}> {}

// Add constants following the style guide
export const BYTES_LENGTH = 32
export const HEX_LENGTH = 64

/**
 * Schema for Bytes32 bytes with 32-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(
  Schema.filter((a) => a.length === BYTES_LENGTH)
).annotations({
  identifier: "Bytes32.Bytes",
  title: "32-byte Array",
  description: "A Uint8Array containing exactly 32 bytes",
  message: (issue) =>
    `Bytes32 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(32).fill(0)],
})

/**
 * Schema for Bytes32 hex strings with 64-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(
  Schema.filter((a) => a.length === HEX_LENGTH)
).annotations({
  identifier: "Bytes32.Hex",
  title: "32-byte Hex String", 
  description: "A hexadecimal string representing exactly 32 bytes (64 characters)",
  message: (issue) =>
    `Bytes32 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(64)],
})

/**
 * Schema for variable-length byte arrays from 0 to 32 bytes.
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
  identifier: "Bytes32.VariableBytes"
})

/**
 * Schema for variable-length hex strings from 0 to 64 characters (0 to 32 bytes).
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
  identifier: "Bytes32.VariableHex"
})

/**
 * Schema transformer for Bytes32 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes32-specific length validation.
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
  identifier: "Bytes32.FromBytes",
  title: "Bytes32 from Uint8Array",
  description: "Transforms a 32-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Schema transformer for variable-length data that converts between hex strings and byte arrays.
 * Works with 0 to 32 bytes (0 to 64 hex characters).
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
  identifier: "Bytes32.FromVariableBytes",
  title: "Variable Bytes32 from Uint8Array",
  description: "Transforms variable-length byte arrays (0-32 bytes) to hex strings (0-64 chars)",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Either namespace containing composable operations that can fail.
 * All functions return Either objects for proper error handling and composition.
 */
export namespace Either {
  /**
   * Parse Bytes32 from raw bytes using Either error handling.
   */
  export const fromBytes = (bytes: Uint8Array): E.Either<string, Bytes32Error> =>
    E.mapLeft(
      Schema.decodeEither(FromBytes)(bytes),
      (cause) => new Bytes32Error({
        message: "Failed to parse Bytes32 from bytes",
        cause
      })
    )

  /**
   * Convert Bytes32 hex to raw bytes using Either error handling.
   */
  export const toBytes = (hex: string): E.Either<Uint8Array, Bytes32Error> =>
    E.mapLeft(
      Schema.encodeEither(FromBytes)(hex),
      (cause) => new Bytes32Error({
        message: "Failed to encode Bytes32 to bytes",
        cause
      })
    )

  /**
   * Parse variable-length data from raw bytes using Either error handling.
   */
  export const fromVariableBytes = (bytes: Uint8Array): E.Either<string, Bytes32Error> =>
    E.mapLeft(
      Schema.decodeEither(FromVariableBytes)(bytes),
      (cause) => new Bytes32Error({
        message: "Failed to parse variable Bytes32 from bytes",
        cause
      })
    )

  /**
   * Convert variable-length hex to raw bytes using Either error handling.
   */
  export const toVariableBytes = (hex: string): E.Either<Uint8Array, Bytes32Error> =>
    E.mapLeft(
      Schema.encodeEither(FromVariableBytes)(hex),
      (cause) => new Bytes32Error({
        message: "Failed to encode variable Bytes32 to bytes",
        cause
      })
    )
}

/**
 * Parse Bytes32 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0  
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => {
  try {
    return Schema.decodeSync(FromBytes)(bytes)
  } catch (cause) {
    throw new Bytes32Error({
      message: "Failed to parse Bytes32 from bytes",
      cause
    })
  }
}

/**
 * Convert Bytes32 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => {
  try {
    return Schema.encodeSync(FromBytes)(hex)
  } catch (cause) {
    throw new Bytes32Error({
      message: "Failed to encode Bytes32 to bytes",
      cause
    })
  }
}

/**
 * Parse variable-length data from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromVariableBytes = (bytes: Uint8Array): string => {
  try {
    return Schema.decodeSync(FromVariableBytes)(bytes)
  } catch (cause) {
    throw new Bytes32Error({
      message: "Failed to parse variable Bytes32 from bytes",
      cause
    })
  }
}

/**
 * Convert variable-length hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toVariableBytes = (hex: string): Uint8Array => {
  try {
    return Schema.encodeSync(FromVariableBytes)(hex)
  } catch (cause) {
    throw new Bytes32Error({
      message: "Failed to encode variable Bytes32 to bytes",
      cause
    })
  }
}
