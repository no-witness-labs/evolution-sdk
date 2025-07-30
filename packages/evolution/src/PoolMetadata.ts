import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as Url from "./Url.js"

/**
 * Error class for PoolMetadata related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PoolMetadataError extends Data.TaggedError("PoolMetadataError")<{
  message?: string
  reason?: "InvalidStructure" | "InvalidUrl" | "InvalidBytes"
}> {}

/**
 * Schema for PoolMetadata representing pool metadata information.
 * pool_metadata = [url, bytes]
 *
 * @since 2.0.0
 * @category model
 */
export class PoolMetadata extends Schema.TaggedClass<PoolMetadata>()("PoolMetadata", {
  url: Url.Url,
  hash: Schema.Uint8ArrayFromSelf
}) {}

/**
 * CDDL schema for PoolMetadata as defined in the specification:
 * pool_metadata = [url, bytes]
 *
 * Transforms between CBOR tuple structure and PoolMetadata model.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    CBOR.Text, // url as CBOR text string
    CBOR.ByteArray // hash as CBOR byte string
  ),
  Schema.typeSchema(PoolMetadata),
  {
    strict: true,
    encode: (poolMetadata) => Effect.succeed([poolMetadata.url, poolMetadata.hash] as const),
    decode: ([urlText, hash]) =>
      Effect.gen(function* () {
        const url = yield* ParseResult.decode(Url.Url)(urlText)
        return new PoolMetadata({ url, hash })
      })
  }
)

/**
 * CBOR bytes transformation schema for PoolMetadata.
 * Transforms between Uint8Array and PoolMetadata using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → PoolMetadata
  )

/**
 * CBOR hex transformation schema for PoolMetadata.
 * Transforms between hex string and PoolMetadata using CBOR encoding.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → PoolMetadata
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options)
    },
    PoolMetadataError
  )
