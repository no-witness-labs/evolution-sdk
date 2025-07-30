import { Schema } from "effect"

/**
 * BoundedBytes schema based on Conway CDDL specification
 *
 * CDDL: bounded_bytes = bytes .size (0 .. 64)
 *
 * The real bounded_bytes does not have this limit. it instead has
 * a different limit which cannot be expressed in CDDL.
 *
 * The limit is as follows:
 *  - bytes with a definite-length encoding are limited to size 0..64
 *  - for bytes with an indefinite-length CBOR encoding, each chunk is
 *    limited to size 0..64
 *  ( reminder: in CBOR, the indefinite-length encoding of
 *  bytestrings consists of a token #2.31 followed by a sequence
 *  of definite-length encoded bytestrings and a stop code )
 *
 * @since 2.0.0
 * @category schemas
 */
export const BoundedBytesSchema = Schema.Uint8ArrayFromSelf.pipe(
  Schema.filter((bytes) => bytes.length >= 0 && bytes.length <= 64, {
    message: () => "BoundedBytes must be between 0 and 64 bytes in length"
  })
)
