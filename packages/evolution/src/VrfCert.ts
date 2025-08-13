import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Bytes32 from "./Bytes32.js"
import * as Bytes80 from "./Bytes80.js"
import * as CBOR from "./CBOR.js"

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
export const VRFOutput = Bytes32.HexSchema.pipe(Schema.brand("VrfOutput")).annotations({
  identifier: "VrfOutput",
  description: "VRF output as a 32-byte hex string used in VRF certificates"
})

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
export const VRFProof = Bytes80.HexSchema.pipe(Schema.brand("VrfProof")).annotations({
  identifier: "VrfProof",
  description: "VRF proof as an 80-byte hex string used in VRF certificates"
})

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
      Eff.gen(function* () {
        const outputBytes = yield* ParseResult.encode(VRFOutputFromBytes)(vrfCert.output)
        const proofBytes = yield* ParseResult.encode(VRFProofFromBytes)(vrfCert.proof)
        return [outputBytes, proofBytes] as const
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
    identifier: "VrfCert.FromCBORBytes",
    title: "VrfCert from CBOR Bytes",
    description: "Transforms CBOR bytes (Uint8Array) to VrfCert"
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
    identifier: "VrfCert.FromCBORHex",
    title: "VrfCert from CBOR Hex",
    description: "Transforms CBOR hex string to VrfCert"
  })

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

/**
 * @since 2.0.0
 * @category FastCheck
 */
export const arbitrary = (): FastCheck.Arbitrary<VrfCert> =>
  FastCheck.record({
    output: FastCheck.hexaString({ minLength: 64, maxLength: 64 }),
    proof: FastCheck.hexaString({ minLength: 160, maxLength: 160 })
  }).chain(({ output, proof }) =>
    FastCheck.constant(
      new VrfCert({
        output: Eff.runSync(Schema.decode(VRFOutput)(output)),
        proof: Eff.runSync(Schema.decode(VRFProof)(proof))
      })
    )
  )

/**
 * Effect namespace containing schema decode and encode operations.
 *
 * @since 2.0.0
 * @category Effect
 */
export namespace Effect {
  /**
   * Parse a VrfCert from CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (input: Uint8Array, options?: CBOR.CodecOptions): Eff.Effect<VrfCert, VrfCertError> =>
    Eff.mapError(
      Schema.decode(FromCBORBytes(options))(input),
      (cause) => new VrfCertError({ message: "Failed to decode VrfCert from CBOR bytes", cause })
    )

  /**
   * Parse a VrfCert from CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (input: string, options?: CBOR.CodecOptions): Eff.Effect<VrfCert, VrfCertError> =>
    Eff.mapError(
      Schema.decode(FromCBORHex(options))(input),
      (cause) => new VrfCertError({ message: "Failed to decode VrfCert from CBOR hex", cause })
    )

  /**
   * Convert a VrfCert to CBOR bytes using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (value: VrfCert, options?: CBOR.CodecOptions): Eff.Effect<Uint8Array, VrfCertError> =>
    Eff.mapError(
      Schema.encode(FromCBORBytes(options))(value),
      (cause) => new VrfCertError({ message: "Failed to encode VrfCert to CBOR bytes", cause })
    )

  /**
   * Convert a VrfCert to CBOR hex using Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (value: VrfCert, options?: CBOR.CodecOptions): Eff.Effect<string, VrfCertError> =>
    Eff.mapError(
      Schema.encode(FromCBORHex(options))(value),
      (cause) => new VrfCertError({ message: "Failed to encode VrfCert to CBOR hex", cause })
    )
}

/**
 * Convert VrfCert to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (value: VrfCert, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(value, options))

/**
 * Convert VrfCert to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (value: VrfCert, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(value, options))

/**
 * Parse VrfCert from CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORBytes = (value: Uint8Array, options?: CBOR.CodecOptions): VrfCert =>
  Eff.runSync(Effect.fromCBORBytes(value, options))

/**
 * Parse VrfCert from CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORHex = (value: string, options?: CBOR.CodecOptions): VrfCert =>
  Eff.runSync(Effect.fromCBORHex(value, options))
