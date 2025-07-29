import { Data, Effect, FastCheck, ParseResult, pipe, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as CBOR from "./CBOR.js"
import { createEncoders } from "./Codec.js"
import * as Url from "./Url.js"

/**
 * Error class for Anchor related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class AnchorError extends Data.TaggedError("AnchorError")<{
  message?: string
  reason?: "InvalidStructure" | "InvalidUrl" | "InvalidHash"
}> {}

/**
 * Schema for Anchor representing an anchor with URL and data hash.
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 *
 * @since 2.0.0
 * @category model
 */
export class Anchor extends Schema.TaggedClass<Anchor>()("Anchor", {
  anchorUrl: Url.Url,
  anchorDataHash: Bytes32.HexSchema
}) {}

/**
 * CDDL schema for Anchor as tuple structure.
 * anchor = [anchor_url: url, anchor_data_hash: Bytes32]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(Schema.Tuple(CBOR.Text, CBOR.ByteArray), Schema.typeSchema(Anchor), {
  strict: true,
  encode: (toA) =>
    pipe(
      ParseResult.encode(Bytes32.FromBytes)(toA.anchorDataHash),
      Effect.map((anchorDataHash) => [toA.anchorUrl, anchorDataHash] as const)
    ),
  decode: ([anchorUrl, anchorDataHash]) =>
    pipe(
      ParseResult.decode(Bytes32.FromBytes)(anchorDataHash),
      Effect.map(
        (anchorDataHash) =>
          new Anchor({
            anchorUrl: Url.make(anchorUrl),
            anchorDataHash
          })
      )
    )
})

/**
 * CBOR bytes transformation schema for Anchor.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Anchor
  )

/**
 * CBOR hex transformation schema for Anchor.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → Anchor
  )

/**
 * Create an Anchor from a URL string and hash string.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (anchorUrl: string, anchorDataHash: string): Anchor =>
  new Anchor({
    anchorUrl: Url.make(anchorUrl),
    anchorDataHash
  })

/**
 * Check if two Anchor instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: Anchor, that: Anchor): boolean => {
  if (self.anchorUrl !== that.anchorUrl) return false
  if (self.anchorDataHash.length !== that.anchorDataHash.length) return false
  for (let i = 0; i < self.anchorDataHash.length; i++) {
    if (self.anchorDataHash[i] !== that.anchorDataHash[i]) return false
  }
  return true
}

/**
 * FastCheck generator for Anchor instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.record({
  anchorUrl: Url.generator,
  anchorDataHash: FastCheck.uint8Array({ minLength: 32, maxLength: 32 })
}).map(
  ({ anchorDataHash, anchorUrl }) =>
    new Anchor({
      anchorUrl,
      anchorDataHash: Bytes.Codec.Decode.bytes(anchorDataHash)
    })
)

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    AnchorError
  )
