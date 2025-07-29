import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as KESVkey from "./KESVkey.js"
import * as Numeric from "./Numeric.js"

/**
 * Error class for OperationalCert operations
 *
 * @since 2.0.0
 * @category errors
 */
export class OperationalCertError extends Data.TaggedError("OperationalCertError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * OperationalCert class based on Conway CDDL specification
 *
 * CDDL: operational_cert = [
 *   hot_vkey : kes_vkey,
 *   sequence_number : uint64,
 *   kes_period : uint64,
 *   sigma : ed25519_signature
 * ]
 *
 * @since 2.0.0
 * @category model
 */
export class OperationalCert extends Schema.TaggedClass<OperationalCert>()("OperationalCert", {
  hotVkey: KESVkey.KESVkey,
  sequenceNumber: Numeric.Uint64Schema,
  kesPeriod: Numeric.Uint64Schema,
  sigma: Ed25519Signature.Ed25519Signature
}) {}

/**
 * Check if two OperationalCert instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: OperationalCert, b: OperationalCert): boolean =>
  KESVkey.equals(a.hotVkey, b.hotVkey) &&
  a.sequenceNumber === b.sequenceNumber &&
  a.kesPeriod === b.kesPeriod &&
  Ed25519Signature.equals(a.sigma, b.sigma)

/**
 * CDDL schema for OperationalCert.
 * operational_cert = [
 *   hot_vkey : kes_vkey,
 *   sequence_number : uint64,
 *   kes_period : uint64,
 *   sigma : ed25519_signature
 * ]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    CBOR.ByteArray, // hot_vkey as bytes
    CBOR.Integer, // sequence_number as bigint
    CBOR.Integer, // kes_period as bigint
    CBOR.ByteArray // sigma as bytes
  ),
  Schema.typeSchema(OperationalCert),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const hotVkeyBytes = yield* ParseResult.encode(KESVkey.FromBytes)(toA.hotVkey)
        const sigmaBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(toA.sigma)
        return [hotVkeyBytes, BigInt(toA.sequenceNumber), BigInt(toA.kesPeriod), sigmaBytes] as const
      }),
    decode: ([hotVkeyBytes, sequenceNumber, kesPeriod, sigmaBytes]) =>
      Effect.gen(function* () {
        const hotVkey = yield* ParseResult.decode(KESVkey.FromBytes)(hotVkeyBytes)
        const sigma = yield* ParseResult.decode(Ed25519Signature.FromBytes)(sigmaBytes)
        return yield* ParseResult.decode(OperationalCert)({
          _tag: "OperationalCert",
          hotVkey,
          sequenceNumber,
          kesPeriod,
          sigma
        })
      })
  }
)

/**
 * CBOR bytes transformation schema for OperationalCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → OperationalCert
  )

/**
 * CBOR hex transformation schema for OperationalCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → OperationalCert
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    OperationalCertError
  )
