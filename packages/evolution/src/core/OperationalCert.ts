import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as Function from "./Function.js"
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
 * CDDL:
 * ```
 * operational_cert = [
 *   hot_vkey : kes_vkey,
 *   sequence_number : uint64,
 *   kes_period : uint64,
 *   sigma : ed25519_signature
 * ]
 * ```
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

export const CDDLSchema = Schema.Tuple(
  CBOR.ByteArray, // hot_vkey as bytes
  CBOR.Integer, // sequence_number as bigint
  CBOR.Integer, // kes_period as bigint
  CBOR.ByteArray // sigma as bytes
)

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
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(OperationalCert), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const hotVkeyBytes = yield* ParseResult.encode(KESVkey.FromBytes)(toA.hotVkey)
      const sigmaBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(toA.sigma)
      return [hotVkeyBytes, BigInt(toA.sequenceNumber), BigInt(toA.kesPeriod), sigmaBytes] as const
    }),
  decode: ([hotVkeyBytes, sequenceNumber, kesPeriod, sigmaBytes]) =>
    Eff.gen(function* () {
      const hotVkey = yield* ParseResult.decode(KESVkey.FromBytes)(hotVkeyBytes)
      const sigma = yield* ParseResult.decode(Ed25519Signature.FromBytes)(sigmaBytes)
      return new OperationalCert({ hotVkey, sequenceNumber, kesPeriod, sigma })
    })
})

/**
 * CBOR bytes transformation schema for OperationalCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
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
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → OperationalCert
  )

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
 * Check if the given value is a valid OperationalCert
 *
 * @since 2.0.0
 * @category predicates
 */
export const isOperationalCert = Schema.is(OperationalCert)

/**
 * FastCheck arbitrary for generating random OperationalCert instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.record({
  hotVkey: KESVkey.arbitrary,
  sequenceNumber: FastCheck.bigUint(),
  kesPeriod: FastCheck.bigUint(),
  sigma: Ed25519Signature.arbitrary
}).map((props) => new OperationalCert(props))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse OperationalCert from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  OperationalCertError,
  "OperationalCert.fromCBORBytes"
)

/**
 * Parse OperationalCert from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, OperationalCertError, "OperationalCert.fromCBORHex")

/**
 * Encode OperationalCert to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, OperationalCertError, "OperationalCert.toCBORBytes")

/**
 * Encode OperationalCert to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, OperationalCertError, "OperationalCert.toCBORHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  /**
   * Parse OperationalCert from CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, OperationalCertError)

  /**
   * Parse OperationalCert from CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, OperationalCertError)

  /**
   * Encode OperationalCert to CBOR bytes with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, OperationalCertError)

  /**
   * Encode OperationalCert to CBOR hex string with Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, OperationalCertError)
}
