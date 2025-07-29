import { pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"

/**
 * Regular expression that matches valid hexadecimal strings.
 * Validates that a string:
 * - Contains only hexadecimal characters (0-9, a-f)
 * - Has an even number of characters (bytes are represented as pairs of hex digits)
 * - Can be empty (matches zero or more pairs)
 */
export const HEX_REGEX = /^(?:[0-9a-f]{2})*$/

export const HexStringFilter = <Source extends string, Target>(self: Schema.Schema<Source, Target>) =>
  pipe(self, Schema.pattern(HEX_REGEX)).annotations({
    message: () => `must be a hex string`,
    identifier: "HexString"
  })

export const HexStringSchema = Schema.String.pipe(Schema.filter((a) => Bytes.isHex(a))).annotations({
  message: () => `must be a hex string`,
  identifier: "HexString"
})

export const Uint8ArraySchema = Schema.declare(
  (input: unknown): input is Uint8Array => input instanceof Uint8ArraySchema,
  {
    identifier: "Uint8Array",
    message: () => `Expected Uint8Array`
  }
)
