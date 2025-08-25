import { Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as Function from "./Function.js"
import * as VKey from "./VKey.js"

/**
 * Bootstrap witness for Byron-era addresses.
 *
 * CDDL:
 * ```
 * bootstrap_witness = [
 *   public_key : vkey,
 *   signature : ed25519_signature,
 *   chain_code : bytes .size 32,
 *   attributes : bytes
 * ]
 * ```
 */
export class BootstrapWitness extends Schema.Class<BootstrapWitness>("BootstrapWitness")({
  publicKey: VKey.VKey,
  signature: Ed25519Signature.Ed25519Signature,
  chainCode: Schema.Uint8ArrayFromSelf.pipe(
    Schema.filter((bytes) => bytes.length === 32, {
      message: () => "Chain code must be exactly 32 bytes"
    })
  ),
  attributes: Schema.Uint8ArrayFromSelf
}) {}

// Tuple schema as per CDDL
export const CDDLSchema = Schema.Tuple(
  CBOR.ByteArray, // public_key
  CBOR.ByteArray, // signature
  CBOR.ByteArray, // chain_code
  CBOR.ByteArray // attributes
)

/**
 * Transform between tuple CDDL shape and class.
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(BootstrapWitness), {
  strict: true,
  encode: (bw) =>
    Eff.gen(function* () {
      const publicKeyBytes = yield* ParseResult.encode(VKey.FromBytes)(bw.publicKey)
      const signatureBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(bw.signature)
      const attributesBytes = bw.attributes.length === 0 ? new Uint8Array([0xa0]) : bw.attributes
      return [publicKeyBytes, signatureBytes, bw.chainCode, attributesBytes] as const
    }),
  decode: ([publicKeyBytes, signatureBytes, chainCode, attributes]) =>
    Eff.gen(function* () {
      const publicKey = yield* ParseResult.decode(VKey.FromBytes)(publicKeyBytes)
      const signature = yield* ParseResult.decode(Ed25519Signature.FromBytes)(signatureBytes)
      return new BootstrapWitness({ publicKey, signature, chainCode, attributes })
    })
}).annotations({ identifier: "BootstrapWitness.FromCDDL" })

// Parsing helpers
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  Ed25519Signature.Ed25519SignatureError, // reuse an existing error type; callers typically wrap
  "BootstrapWitness.fromCBORBytes"
)

export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  Ed25519Signature.Ed25519SignatureError,
  "BootstrapWitness.fromCBORHex"
)

// Encoding helpers
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  Ed25519Signature.Ed25519SignatureError,
  "BootstrapWitness.toCBORBytes"
)

export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  Ed25519Signature.Ed25519SignatureError,
  "BootstrapWitness.toCBORHex"
)

/**
 * Arbitrary generator for BootstrapWitness instances.
 */
export const arbitrary: FastCheck.Arbitrary<BootstrapWitness> = FastCheck.record({
  attributes: FastCheck.oneof(
    FastCheck.constant(new Uint8Array([0xa0])),
    FastCheck.uint8Array({ minLength: 1, maxLength: 64 }).map((path) => {
      const m = new Map<bigint, Uint8Array>()
      // Byron AddrAttributes: key 1 holds derivation_path; value is CBOR-encoded bytes
      const inner = CBOR.internalEncodeSync(path, CBOR.CML_DEFAULT_OPTIONS)
      m.set(1n, inner)
      return CBOR.internalEncodeSync(m, CBOR.CML_DEFAULT_OPTIONS)
    })
  ),
  chainCode: FastCheck.uint8Array({ minLength: 32, maxLength: 32 }),
  publicKey: VKey.arbitrary,
  signature: Ed25519Signature.arbitrary
}).map(
  ({ attributes, chainCode, publicKey, signature }) =>
    new BootstrapWitness({ attributes, chainCode, publicKey, signature })
)
