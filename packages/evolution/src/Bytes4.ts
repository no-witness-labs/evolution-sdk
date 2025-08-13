import { Data, Either as E, Schema } from "effect"

import * as Bytes from "./Bytes.js"

export class Bytes4Error extends Data.TaggedError("Bytes4Error")<{
  message?: string
  cause?: unknown
}> {}

export const BYTES_LENGTH = 4
export const HEX_LENGTH = 8

/**
 * Schema for Bytes4 bytes with 4-byte length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.Uint8ArrayFromSelf.pipe(Schema.filter((a) => a.length === BYTES_LENGTH)).annotations({
  identifier: "Bytes4.Bytes",
  title: "4-byte Array",
  description: "A Uint8Array containing exactly 4 bytes",
  message: (issue) => `Bytes4 bytes must be exactly ${BYTES_LENGTH} bytes, got ${(issue.actual as Uint8Array).length}`,
  examples: [new Uint8Array(4).fill(0)]
})

/**
 * Schema for Bytes4 hex strings with 8-character length validation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexSchema = Bytes.HexSchema.pipe(Schema.filter((a) => a.length === HEX_LENGTH)).annotations({
  identifier: "Bytes4.Hex",
  title: "4-byte Hex String",
  description: "A hexadecimal string representing exactly 4 bytes (8 characters)",
  message: (issue) => `Bytes4 hex must be exactly ${HEX_LENGTH} characters, got ${(issue.actual as string).length}`,
  examples: ["a".repeat(8)]
})

/**
 * Schema transformer for Bytes4 that converts between hex strings and byte arrays.
 * Like Bytes.BytesSchema but with Bytes4-specific length validation.
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
  identifier: "Bytes4.FromBytes",
  title: "Bytes4 from Uint8Array",
  description: "Transforms a 4-byte Uint8Array to hex string representation",
  documentation: "Converts raw bytes to lowercase hexadecimal string without 0x prefix"
})

/**
 * Effect namespace containing composable operations that can fail.
 * All functions return Effect objects for proper error handling and composition.
 */
export namespace Either {
  /**
   * Parse Bytes4 from raw bytes using Either error handling.
   */
  export const fromBytes = (bytes: Uint8Array): E.Either<string, Bytes4Error> =>
    E.mapLeft(
      Schema.decodeEither(FromBytes)(bytes),
      (cause) =>
        new Bytes4Error({
          message: "Failed to parse Bytes4 from bytes",
          cause
        })
    )

  /**
   * Convert Bytes4 hex to raw bytes using Either error handling.
   */
  export const toBytes = (hex: string): E.Either<Uint8Array, Bytes4Error> =>
    E.mapLeft(
      Schema.encodeEither(FromBytes)(hex),
      (cause) =>
        new Bytes4Error({
          message: "Failed to encode Bytes4 to bytes",
          cause
        })
    )
}

/**
 * Parse Bytes4 from raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = (bytes: Uint8Array): string => {
  try {
    return Schema.decodeSync(FromBytes)(bytes)
  } catch (cause) {
    throw new Bytes4Error({
      message: "Failed to parse Bytes4 from bytes",
      cause
    })
  }
}

/**
 * Convert Bytes4 hex to raw bytes (unsafe - throws on error).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = (hex: string): Uint8Array => {
  try {
    return Schema.encodeSync(FromBytes)(hex)
  } catch (cause) {
    throw new Bytes4Error({
      message: "Failed to encode Bytes4 to bytes",
      cause
    })
  }
}
