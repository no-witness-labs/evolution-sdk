import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as Bytes80 from "./Bytes80.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"

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
export const VRFOutput = Bytes32.HexSchema.pipe(Schema.brand("VrfOutput"))

/**
 * Type alias for VRF output.
 *
 * @since 2.0.0
 * @category model
 */
export type VRFOutput = typeof VRFOutput.Type

/**
 * Schema for VRF output as a byte array.
 * vrf_output = bytes .size 32
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFOutputFromBytes = Schema.compose(
  Bytes32.FromBytes, // Uint8Array -> hex string
  VRFOutput // hex string -> VRFOutput
).annotations({
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
  Bytes32.HexSchema, // string -> hex string
  VRFOutput // hex string -> VRFOutput
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
export const VRFProof = Bytes80.HexSchema.pipe(Schema.brand("VrfProof"))

/**
 * Type alias for VRF proof.
 *
 * @since 2.0.0
 * @category model
 */
export type VRFProof = typeof VRFProof.Type

/**
 * Schema for VRF proof as a byte array.
 * vrf_proof = bytes .size 80
 *
 * @since 2.0.0
 * @category schemas
 */
export const VRFProofFromBytes = Schema.compose(
  Bytes80.FromBytes, // Uint8Array -> hex string
  VRFProof // hex string -> VRFProof
).annotations({
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
  Bytes80.HexSchema, // string -> hex string
  VRFProof // hex string -> VRFProof
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
      Effect.gen(function* () {
        const outputBytes = yield* ParseResult.encode(Bytes.FromBytes)(vrfCert.output)
        const proofBytes = yield* ParseResult.encode(Bytes.FromBytes)(vrfCert.proof)
        return [outputBytes, proofBytes] as const
      }),
    decode: ([outputBytes, proofBytes]) =>
      Effect.gen(function* () {
        const output = yield* ParseResult.decode(Bytes.FromBytes)(outputBytes)
        const proof = yield* ParseResult.decode(Bytes.FromBytes)(proofBytes)
        return new VrfCert({
          output: VRFOutput.make(output),
          proof: VRFProof.make(proof)
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
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    VrfCertCDDLSchema // CBOR → VrfCert
  )

/**
 * CBOR hex transformation schema for VrfCert.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → VrfCert
  )

/**
 * Check if two VrfCert instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VrfCert, b: VrfCert): boolean =>
  a._tag === b._tag && a.output === b.output && a.proof === b.proof

/**
 * Create a VrfCert from output and proof.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (output: VRFOutput, proof: VRFProof): VrfCert => new VrfCert({ output, proof })

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    VrfCertError
  )
