import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as Bytes80 from "./Bytes80.js"
import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"

/**
 * Error class for VrfCert related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VrfCertError extends Data.TaggedError("VrfCertError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for VRF output (32 bytes).
 * vrf_output = bytes .size 32
 *
 * @since 2.0.0
 * @category schemas
 */
export class VRFOutput extends Schema.TaggedClass<VRFOutput>()("VrfOutput", {
  bytes: Bytes32.BytesSchema
}) {}

/**
 * Schema for VRF output as a byte array.
 * vrf_output = bytes .size 32
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFOutputFromBytes = Schema.transform(Bytes32.BytesSchema, VRFOutput, {
  strict: true,
  decode: (bytes) => new VRFOutput({ bytes }, { disableValidation: true }), // Disable validation since we already check length in Bytes32
  encode: (vrfOutput) => vrfOutput.bytes
}).annotations({
  identifier: "VrfOutput.Bytes"
})

/**
 * Schema for VRF output as a hex string.
 * vrf_output = bytes .size 32
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFOutputHexSchema = Schema.compose(
  Bytes32.FromHex, // string -> hex string
  VRFOutputFromBytes // hex string -> VRFOutput
).annotations({
  identifier: "VrfOutput.Hex"
})

/**
 * Schema for VRF proof (80 bytes).
 * vrf_proof = bytes .size 80
 *
 * @since 2.0.0
 * @category schemas
 */
export class VRFProof extends Schema.TaggedClass<VRFProof>()("VrfProof", {
  bytes: Bytes80.BytesSchema
}) {}

/**
 * Schema for VRF proof as a byte array.
 * vrf_proof = bytes .size 80
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFProofFromBytes = Schema.transform(Bytes80.BytesSchema, VRFProof, {
  strict: true,
  decode: (bytes) => new VRFProof({ bytes }, { disableValidation: true }), // Disable validation since we already check length in Bytes80
  encode: (vrfProof) => vrfProof.bytes
}).annotations({
  identifier: "VrfProof.Bytes"
})

/**
 * Schema for VRF proof as a hex string.
 * vrf_proof = bytes .size 80
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFProofHexSchema = Schema.compose(
  Bytes80.FromHex, // string -> hex string
  VRFProofFromBytes // hex string -> VRFProof
).annotations({
  identifier: "VrfProof.Hex"
})

/**
 * Schema for VrfCert representing a VRF certificate.
 * vrf_cert = [vrf_output, vrf_proof]
 *
 * @since 2.0.0
 * @category model
 */
export class VrfCert extends Schema.TaggedClass<VrfCert>()("VrfCert", {
  output: VRFOutput,
  proof: VRFProof
}) {}

/**
 * Check if the given value is a valid VrfCert.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isVrfCert = Schema.is(VrfCert)

/**
 * CDDL schema for VrfCert as tuple structure.
 * vrf_cert = [vrf_output, vrf_proof]
 * vrf_output = bytes .size 32
 * vrf_proof = bytes .size 80
 *
 * @since 2.0.0
 * @category schemas
 */
export const VrfCertCDDLSchema = Schema.transformOrFail(
  Schema.Tuple(
    CBOR.ByteArray, // vrf_output as bytes
    CBOR.ByteArray // vrf_proof as bytes
  ),
  Schema.typeSchema(VrfCert),
  {
    strict: true,
    encode: (vrfCert) =>
      Eff.gen(function* () {
        return [vrfCert.output.bytes, vrfCert.proof.bytes] as const
      }),
    decode: ([outputBytes, proofBytes]) =>
      Eff.gen(function* () {
        const output = yield* ParseResult.decode(VRFOutputFromBytes)(outputBytes)
        const proof = yield* ParseResult.decode(VRFProofFromBytes)(proofBytes)
        return new VrfCert({
          output,
          proof
        })
      })
  }
)

/**
 * CBOR bytes transformation schema for VrfCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    VrfCertCDDLSchema // CBOR → VrfCert
  ).annotations({
    identifier: "VrfCert.FromCBORBytes"
  })

/**
 * CBOR hex transformation schema for VrfCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → VrfCert
  ).annotations({
    identifier: "VrfCert.FromCBORHex"
  })

/**
 * Check if two VrfCert instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfCert, b: VrfCert): boolean =>
  a._tag === b._tag && Bytes.equals(a.output.bytes, b.output.bytes) && Bytes.equals(a.proof.bytes, b.proof.bytes)

/**
 * Create a VrfCert from output and proof.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (output: VRFOutput, proof: VRFProof): VrfCert => new VrfCert({ output, proof })

/**
 * @since 2.0.0
 * @category FastCheck
 */
export const arbitrary = FastCheck.record({
  output: FastCheck.uint8Array({ minLength: 32, maxLength: 32 }),
  proof: FastCheck.uint8Array({ minLength: 80, maxLength: 80 })
}).chain(({ output, proof }) =>
  FastCheck.constant(
    new VrfCert({
      output: new VRFOutput({ bytes: output }),
      proof: new VRFProof({ bytes: proof })
    })
  )
)

/**
 * Effect namespace containing schema decode and encode operations.
 *
 * @since 2.0.0
 * @category Effect
 */
export namespace Either {
  /**
   * Parse a VrfCert from CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (input: Uint8Array, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORBytes(options), VrfCertError)(input)

  /**
   * Parse a VrfCert from CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (input: string, options?: CBOR.CodecOptions) =>
    Function.makeDecodeEither(FromCBORHex(options), VrfCertError)(input)

  /**
   * Convert a VrfCert to CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: VrfCert, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORBytes(options), VrfCertError)(value)

  /**
   * Convert a VrfCert to CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: VrfCert, options?: CBOR.CodecOptions) =>
    Function.makeEncodeEither(FromCBORHex(options), VrfCertError)(value)
}

/**
 * Convert VrfCert to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: VrfCert, options?: CBOR.CodecOptions): Uint8Array =>
  Function.makeEncodeSync(FromCBORBytes(options), VrfCertError, "VrfCert.toCBORBytes")(value)

/**
 * Convert VrfCert to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: VrfCert, options?: CBOR.CodecOptions): string =>
  Function.makeEncodeSync(FromCBORHex(options), VrfCertError, "VrfCert.toCBORHex")(value)

/**
 * Parse VrfCert from CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORBytes = (value: Uint8Array, options?: CBOR.CodecOptions): VrfCert =>
  Function.makeDecodeSync(FromCBORBytes(options), VrfCertError, "VrfCert.fromCBORBytes")(value)

/**
 * Parse VrfCert from CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORHex = (value: string, options?: CBOR.CodecOptions): VrfCert =>
  Function.makeDecodeSync(FromCBORHex(options), VrfCertError, "VrfCert.fromCBORHex")(value)
