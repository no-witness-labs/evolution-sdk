import { Data, Effect as Eff, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as NetworkId from "./NetworkId.js"

/**
 * Error class for ByronAddress related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ByronAddressError extends Data.TaggedError("ByronAddressError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Byron legacy address format
 *
 * @since 2.0.0
 * @category schemas
 */
export class ByronAddress extends Schema.TaggedClass<ByronAddress>("ByronAddress")("ByronAddress", {
  networkId: NetworkId.NetworkId,
  bytes: Bytes.HexSchema
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "ByronAddress",
      networkId: this.networkId,
      bytes: this.bytes
    }
  }
}

/**
 * Schema for encoding/decoding Byron addresses as bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const BytesSchema = Schema.transformOrFail(Schema.Uint8ArrayFromSelf, ByronAddress, {
  strict: true,
  encode: (_, __, ___, toA) => ParseResult.decode(Bytes.FromHex)(toA.bytes),
  decode: (_, __, ast, fromA) =>
    Eff.gen(function* () {
      const hexString = yield* ParseResult.encode(Bytes.FromHex)(fromA)
      return new ByronAddress({
        networkId: NetworkId.NetworkId.make(0),
        bytes: hexString
      })
    })
})

/**
 * Schema for encoding/decoding Byron addresses as hex strings.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = Schema.compose(Bytes.FromHex, BytesSchema)

/**
 * Checks if two Byron addresses are equal.
 *
 * @since 2.0.0
 * @category utils
 */
export const equals = (a: ByronAddress, b: ByronAddress): boolean => {
  return a.networkId === b.networkId && a.bytes === b.bytes
}
