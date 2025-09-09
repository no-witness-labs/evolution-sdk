import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as BlockBodyHash from "./BlockBodyHash.js"
import * as BlockHeaderHash from "./BlockHeaderHash.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as Function from "./Function.js"
import * as KESVkey from "./KESVkey.js"
import * as Numeric from "./Numeric.js"
import * as OperationalCert from "./OperationalCert.js"
import * as ProtocolVersion from "./ProtocolVersion.js"
import * as VKey from "./VKey.js"
import * as VrfCert from "./VrfCert.js"
import * as VrfVkey from "./VrfVkey.js"

/**
 * Error class for HeaderBody related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class HeaderBodyError extends Data.TaggedError("HeaderBodyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for HeaderBody representing a block header body.
 * header_body = [
 *   block_number : uint64,
 *   slot : uint64,
 *   prev_hash : block_header_hash / null,
 *   issuer_vkey : vkey,
 *   vrf_vkey : vrf_vkey,
 *   vrf_result : vrf_cert,
 *   block_body_size : uint32,
 *   block_body_hash : block_body_hash,
 *   operational_cert : operational_cert,
 *   protocol_version : protocol_version
 * ]
 *
 * @since 2.0.0
 * @category model
 */
export class HeaderBody extends Schema.TaggedClass<HeaderBody>()("HeaderBody", {
  blockNumber: Numeric.Uint64Schema,
  slot: Numeric.Uint64Schema,
  prevHash: Schema.NullOr(BlockHeaderHash.BlockHeaderHash),
  issuerVkey: VKey.VKey,
  vrfVkey: VrfVkey.VrfVkey,
  vrfResult: VrfCert.VrfCert,
  blockBodySize: Numeric.Uint32Schema,
  blockBodyHash: BlockBodyHash.BlockBodyHash,
  operationalCert: OperationalCert.OperationalCert,
  protocolVersion: ProtocolVersion.ProtocolVersion
}) {}

/**
 * Smart constructor for creating HeaderBody instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof HeaderBody>) => new HeaderBody(...args)

/**
 * Check if two HeaderBody instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: HeaderBody, b: HeaderBody): boolean =>
  a.blockNumber === b.blockNumber &&
  a.slot === b.slot &&
  a.prevHash === b.prevHash &&
  VKey.equals(a.issuerVkey, b.issuerVkey) &&
  VrfVkey.equals(a.vrfVkey, b.vrfVkey) &&
  VrfCert.equals(a.vrfResult, b.vrfResult) &&
  a.blockBodySize === b.blockBodySize &&
  BlockBodyHash.equals(a.blockBodyHash, b.blockBodyHash) &&
  OperationalCert.equals(a.operationalCert, b.operationalCert) &&
  ProtocolVersion.equals(a.protocolVersion, b.protocolVersion)

/**
 * FastCheck arbitrary for generating random HeaderBody instances
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.record({
  blockNumber: Numeric.Uint64Arbitrary,
  slot: Numeric.Uint64Arbitrary,
  prevHash: FastCheck.option(BlockHeaderHash.arbitrary),
  issuerVkey: VKey.arbitrary,
  vrfVkey: VrfVkey.arbitrary,
  vrfResult: FastCheck.record({
    output: FastCheck.uint8Array({ minLength: 32, maxLength: 32 }),
    proof: FastCheck.uint8Array({ minLength: 80, maxLength: 80 })
  }),
  blockBodySize: Numeric.Uint32Arbitrary,
  blockBodyHash: BlockBodyHash.arbitrary,
  operationalCert: OperationalCert.arbitrary,
  protocolVersion: ProtocolVersion.arbitrary
}).map(
  (props) =>
    new HeaderBody(
      {
        blockNumber: props.blockNumber,
        slot: props.slot,
        prevHash: props.prevHash,
        issuerVkey: props.issuerVkey,
        vrfVkey: props.vrfVkey,
        vrfResult: new VrfCert.VrfCert({
          output: new VrfCert.VRFOutput({ bytes: props.vrfResult.output }),
          proof: new VrfCert.VRFProof({ bytes: props.vrfResult.proof })
        }),
        blockBodySize: props.blockBodySize,
        blockBodyHash: props.blockBodyHash,
        operationalCert: props.operationalCert,
        protocolVersion: props.protocolVersion
      },
      {
        disableValidation: true
      }
    )
)

/**
 * CDDL schema for HeaderBody.
 * header_body = [
 *   block_number : uint64,
 *   slot : uint64,
 *   prev_hash : block_header_hash / null,
 *   issuer_vkey : vkey,
 *   vrf_vkey : vrf_vkey,
 *   vrf_result : vrf_cert,
 *   block_body_size : uint32,
 *   block_body_hash : block_body_hash,
 *   operational_cert : operational_cert,
 *   protocol_version : protocol_version
 * ]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    CBOR.Integer, // block_number as bigint
    CBOR.Integer, // slot as bigint
    Schema.NullOr(CBOR.ByteArray), // prev_hash as bytes or null
    CBOR.ByteArray, // issuer_vkey as bytes (32 bytes)
    CBOR.ByteArray, // vrf_vkey as bytes (32 bytes)
    VrfCert.CDDLSchema, // vrf_result as VrfCert
    CBOR.Integer, // block_body_size as bigint
    CBOR.ByteArray, // block_body_hash as bytes
    OperationalCert.CDDLSchema, // operational_cert as OperationalCert
    ProtocolVersion.CDDLSchema // protocol_version as ProtocolVersion
  ),
  Schema.typeSchema(HeaderBody),
  {
    strict: true,
    encode: (toA) =>
      Eff.gen(function* () {
        const prevHashBytes = toA.prevHash ? yield* ParseResult.encode(BlockHeaderHash.FromBytes)(toA.prevHash) : null
        const issuerVkeyBytes = yield* ParseResult.encode(VKey.FromBytes)(toA.issuerVkey)
        const vrfVkeyBytes = yield* ParseResult.encode(VrfVkey.FromBytes)(toA.vrfVkey)
        const vrfOutputBytes = yield* ParseResult.encode(VrfCert.VRFOutputFromBytes)(toA.vrfResult.output)
        const vrfProofBytes = yield* ParseResult.encode(VrfCert.VRFProofFromBytes)(toA.vrfResult.proof)
        const blockBodyHashBytes = yield* ParseResult.encode(BlockBodyHash.FromBytes)(toA.blockBodyHash)
        const hotVkeyBytes = yield* ParseResult.encode(KESVkey.FromBytes)(toA.operationalCert.hotVkey)
        const sigmaBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(toA.operationalCert.sigma)

        return [
          BigInt(toA.blockNumber),
          BigInt(toA.slot),
          prevHashBytes,
          issuerVkeyBytes,
          vrfVkeyBytes,
          [vrfOutputBytes, vrfProofBytes] as const,
          BigInt(toA.blockBodySize),
          blockBodyHashBytes,
          [
            hotVkeyBytes,
            BigInt(toA.operationalCert.sequenceNumber),
            BigInt(toA.operationalCert.kesPeriod),
            sigmaBytes
          ] as const,
          [BigInt(toA.protocolVersion.major), BigInt(toA.protocolVersion.minor)] as const
        ] as const
      }),
    decode: ([
      rawBlockNumber,
      rawSlotNumber,
      prevHashBytes,
      issuerVkeyBytes,
      vrfVkeyBytes,
      [vrfOutputBytes, vrfProofBytes],
      rawBlockBodySize,
      blockBodyHashBytes,
      [hotVkeyBytes, sequenceNumber, kesPeriod, sigmaBytes],
      [protocolMajor, protocolMinor]
    ]) =>
      Eff.gen(function* () {
        const blockNumber = yield* ParseResult.decode(Schema.typeSchema(Numeric.Uint64Schema))(rawBlockNumber)
        const slot = yield* ParseResult.decode(Schema.typeSchema(Numeric.Uint64Schema))(rawSlotNumber)
        const prevHash = prevHashBytes ? yield* ParseResult.decode(BlockHeaderHash.FromBytes)(prevHashBytes) : null
        const issuerVkey = yield* ParseResult.decode(VKey.FromBytes)(issuerVkeyBytes)
        const vrfVkey = yield* ParseResult.decode(VrfVkey.FromBytes)(vrfVkeyBytes)
        const blockBodySize = yield* ParseResult.decode(Schema.typeSchema(Numeric.Uint64Schema))(rawBlockBodySize)
        const blockBodyHash = yield* ParseResult.decode(BlockBodyHash.FromBytes)(blockBodyHashBytes)
        const vrfResult = yield* ParseResult.decode(VrfCert.FromCDDL)([vrfOutputBytes, vrfProofBytes])
        const operationalCert = yield* ParseResult.decode(OperationalCert.FromCDDL)([
          hotVkeyBytes,
          sequenceNumber,
          kesPeriod,
          sigmaBytes
        ])
        const protocolVersion = yield* ParseResult.decode(ProtocolVersion.FromCDDL)([protocolMajor, protocolMinor])

        return new HeaderBody(
          {
            blockNumber,
            slot,
            prevHash,
            issuerVkey,
            vrfVkey,
            vrfResult,
            blockBodySize,
            blockBodyHash,
            operationalCert,
            protocolVersion
          },
          {
            disableValidation: true
          }
        )
      })
  }
).annotations({
  identifier: "HeaderBody.FromCDDL",
  description: "Transforms CBOR structure to HeaderBody"
})

/**
 * Check if the given value is a valid HeaderBody.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isHeaderBody = Schema.is(HeaderBody)

/**
 * CBOR bytes transformation schema for HeaderBody.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → HeaderBody
  ).annotations({
    identifier: "HeaderBody.FromCBORBytes",
    description: "Transforms CBOR bytes to HeaderBody"
  })

/**
 * CBOR hex transformation schema for HeaderBody.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → HeaderBody
  ).annotations({
    identifier: "HeaderBody.FromCBORHex",
    description: "Transforms CBOR hex string to HeaderBody"
  })

/**
 * Effect namespace for HeaderBody operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Convert CBOR bytes to HeaderBody using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, HeaderBodyError)

  /**
   * Convert CBOR hex string to HeaderBody using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, HeaderBodyError)

  /**
   * Convert HeaderBody to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, HeaderBodyError)

  /**
   * Convert HeaderBody to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, HeaderBodyError)
}

/**
 * Convert CBOR bytes to HeaderBody (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, HeaderBodyError, "HeaderBody.fromCBORBytes")

/**
 * Convert CBOR hex string to HeaderBody (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, HeaderBodyError, "HeaderBody.fromCBORHex")

/**
 * Convert HeaderBody to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, HeaderBodyError, "HeaderBody.toCBORBytes")

/**
 * Convert HeaderBody to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, HeaderBodyError, "HeaderBody.toCBORHex")
