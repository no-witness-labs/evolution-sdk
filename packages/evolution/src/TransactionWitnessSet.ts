import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as PlutusData from "./Data.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as NativeScripts from "./NativeScripts.js"
import * as Redeemer from "./Redeemer.js"
import * as VKey from "./VKey.js"

/**
 * Error class for TransactionWitnessSet related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionWitnessSetError extends Data.TaggedError("TransactionWitnessSetError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * VKey witness for Ed25519 signatures.
 *
 * CDDL: vkeywitness = [ vkey, ed25519_signature ]
 *
 * @since 2.0.0
 * @category model
 */
export class VKeyWitness extends Schema.Class<VKeyWitness>("VKeyWitness")({
  vkey: VKey.VKey,
  signature: Ed25519Signature.Ed25519Signature
}) {}

/**
 * Bootstrap witness for Byron-era addresses.
 *
 * CDDL: bootstrap_witness = [
 *   public_key : vkey,
 *   signature : ed25519_signature,
 *   chain_code : bytes .size 32,
 *   attributes : bytes
 * ]
 *
 * @since 2.0.0
 * @category model
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

export class PlutusV1 extends Schema.TaggedClass<PlutusV1>("PlutusV1")("PlutusV1", {
  script: Schema.Uint8ArrayFromSelf
}) {}

export class PlutusV2 extends Schema.TaggedClass<PlutusV2>("PlutusV2")("PlutusV2", {
  script: Schema.Uint8ArrayFromSelf
}) {}

export class PlutusV3 extends Schema.TaggedClass<PlutusV3>("PlutusV3")("PlutusV3", {
  script: Schema.Uint8ArrayFromSelf
}) {}

/**
 * Plutus script reference with version tag.
 *
 * ```
 * CDDL: plutus_script =
 *   [ 0, plutus_v1_script ]
 * / [ 1, plutus_v2_script ]
 * / [ 2, plutus_v3_script ]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export const PlutusScript = Schema.Union(PlutusV1, PlutusV2, PlutusV3).annotations({
  identifier: "PlutusScript",
  description: "Plutus script with version tag"
})

export type PlutusScript = typeof PlutusScript.Type

/**
 * TransactionWitnessSet based on Conway CDDL specification.
 *
 * ```
 * CDDL: transaction_witness_set = {
 *   ? 0 : [* vkeywitness]
 *   ? 1 : [* native_script]
 *   ? 2 : [* bootstrap_witness]
 *   ? 3 : [* plutus_v1_script]
 *   ? 4 : [* plutus_data]
 *   ? 5 : [* redeemer]
 *   ? 6 : [* plutus_v2_script]
 *   ? 7 : [* plutus_v3_script]
 * }
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionWitnessSet extends Schema.Class<TransactionWitnessSet>("TransactionWitnessSet")({
  vkeyWitnesses: Schema.optional(Schema.Array(VKeyWitness)),
  nativeScripts: Schema.optional(Schema.Array(NativeScripts.Native)),
  bootstrapWitnesses: Schema.optional(Schema.Array(BootstrapWitness)),
  plutusV1Scripts: Schema.optional(Schema.Array(PlutusV1)),
  plutusData: Schema.optional(Schema.Array(PlutusData.DataSchema)),
  redeemers: Schema.optional(Schema.Array(Schema.typeSchema(Redeemer.Redeemer))),
  plutusV2Scripts: Schema.optional(Schema.Array(PlutusV2)),
  plutusV3Scripts: Schema.optional(Schema.Array(PlutusV3))
}) {}

/**
 * CDDL schema for VKeyWitness.
 *
 * @since 2.0.0
 * @category schemas
 */
const VKeyWitnessCDDL = Schema.Tuple(
  CBOR.ByteArray, // vkey as bytes
  CBOR.ByteArray // signature as bytes
)

/**
 * CDDL schema for BootstrapWitness.
 *
 * @since 2.0.0
 * @category schemas
 */
const BootstrapWitnessCDDL = Schema.Tuple(
  CBOR.ByteArray, // public_key
  CBOR.ByteArray, // signature
  CBOR.ByteArray, // chain_code
  CBOR.ByteArray // attributes
)

/**
 * CDDL schema for TransactionWitnessSet as map structure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: Schema.Union(
    Schema.Array(VKeyWitnessCDDL), // 0: [* vkeywitness]
    Schema.Array(NativeScripts.FromCDDL), // 1: [* native_script]
    Schema.Array(BootstrapWitnessCDDL), // 2: [* bootstrap_witness]
    Schema.Array(CBOR.ByteArray), // 3: [* plutus_v1_script], 6: [* plutus_v2_script], 7: [* plutus_v3_script]
    Schema.Array(PlutusData.CDDLSchema), // 4: [* plutus_data]
    Schema.Array(Redeemer.CDDLSchema) // 5: [* redeemer]
  )
})

/**
 * CDDL transformation schema for TransactionWitnessSet.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionWitnessSet), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const map = new Map<bigint, any>()

      // 0: vkeywitnesses
      if (toA.vkeyWitnesses && toA.vkeyWitnesses.length > 0) {
        const vkeyWitnesses = yield* Eff.all(
          toA.vkeyWitnesses.map((witness) =>
            Eff.gen(function* () {
              const vkeyBytes = yield* ParseResult.encode(VKey.FromBytes)(witness.vkey)
              const signatureBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(witness.signature)
              return [vkeyBytes, signatureBytes] as const
            })
          )
        )
        map.set(0n, vkeyWitnesses)
      }

      // 1: native_scripts
      if (toA.nativeScripts && toA.nativeScripts.length > 0) {
        const nativeScripts = yield* Eff.all(
          toA.nativeScripts.map((script) => ParseResult.encode(NativeScripts.FromCDDL)(script))
        )
        map.set(1n, nativeScripts)
      }

      // 2: bootstrap_witnesses
      if (toA.bootstrapWitnesses && toA.bootstrapWitnesses.length > 0) {
        const bootstrapWitnesses = yield* Eff.all(
          toA.bootstrapWitnesses.map((witness) =>
            Eff.gen(function* () {
              const publicKeyBytes = yield* ParseResult.encode(VKey.FromBytes)(witness.publicKey)
              const signatureBytes = yield* ParseResult.encode(Ed25519Signature.FromBytes)(witness.signature)
              return [publicKeyBytes, signatureBytes, witness.chainCode, witness.attributes] as const
            })
          )
        )
        map.set(2n, bootstrapWitnesses)
      }

      // 3: plutus_v1_scripts
      if (toA.plutusV1Scripts && toA.plutusV1Scripts.length > 0) {
        map.set(3n, toA.plutusV1Scripts)
      }

      // 4: plutus_data
      if (toA.plutusData && toA.plutusData.length > 0) {
        const plutusDataCBOR = yield* Eff.all(
          toA.plutusData.map((data) => ParseResult.encode(PlutusData.FromCDDL)(data))
        )
        map.set(4n, plutusDataCBOR)
      }

      // 5: redeemers
      if (toA.redeemers && toA.redeemers.length > 0) {
        const redeemers = yield* Eff.all(
          toA.redeemers.map((redeemer) =>
            Eff.gen(function* () {
              const dataCBOR = yield* ParseResult.encode(PlutusData.FromCDDL)(redeemer.data)
              return [redeemer.tag, redeemer.index, dataCBOR, redeemer.exUnits] as const
            })
          )
        )
        map.set(5n, redeemers)
      }

      // 6: plutus_v2_scripts
      if (toA.plutusV2Scripts && toA.plutusV2Scripts.length > 0) {
        map.set(6n, toA.plutusV2Scripts)
      }

      // 7: plutus_v3_scripts
      if (toA.plutusV3Scripts && toA.plutusV3Scripts.length > 0) {
        map.set(7n, toA.plutusV3Scripts)
      }

      return map
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const witnessSet: {
        vkeyWitnesses?: Array<VKeyWitness>
        nativeScripts?: Array<NativeScripts.Native>
        bootstrapWitnesses?: Array<BootstrapWitness>
        plutusV1Scripts?: Array<PlutusV1>
        plutusData?: Array<PlutusData.Data>
        redeemers?: Array<Redeemer.Redeemer>
        plutusV2Scripts?: Array<PlutusV2>
        plutusV3Scripts?: Array<PlutusV3>
      } = {}

      // Parse each field from the map
      for (const [key, value] of fromA.entries()) {
        switch (key) {
          case 0n: {
            // vkeywitnesses
            const vkeyWitnesses: Array<VKeyWitness> = []
            for (const [vkeyBytes, signatureBytes] of value as Array<[Uint8Array, Uint8Array]>) {
              const vkey = yield* ParseResult.decode(VKey.FromBytes)(vkeyBytes)
              const signature = yield* ParseResult.decode(Ed25519Signature.FromBytes)(signatureBytes)
              vkeyWitnesses.push(new VKeyWitness({ vkey, signature }))
            }
            witnessSet.vkeyWitnesses = vkeyWitnesses
            break
          }
          case 1n: {
            // native_scripts
            const nativeScripts = yield* Eff.all(
              (value as Array<any>).map((scriptCBOR) => ParseResult.decode(NativeScripts.Native)(scriptCBOR))
            )
            witnessSet.nativeScripts = nativeScripts
            break
          }
          case 2n: {
            // bootstrap_witnesses
            const bootstrapWitnesses: Array<BootstrapWitness> = []
            for (const [publicKeyBytes, signatureBytes, chainCode, attributes] of value as Array<
              [Uint8Array, Uint8Array, Uint8Array, Uint8Array]
            >) {
              const publicKey = yield* ParseResult.decode(VKey.FromBytes)(publicKeyBytes)
              const signature = yield* ParseResult.decode(Ed25519Signature.FromBytes)(signatureBytes)
              bootstrapWitnesses.push(new BootstrapWitness({ publicKey, signature, chainCode, attributes }))
            }
            witnessSet.bootstrapWitnesses = bootstrapWitnesses
            break
          }
          case 3n: {
            // plutus_v1_scripts
            const plutusV1Scripts = (value as Array<Uint8Array>).map(script => new PlutusV1({ script }))
            witnessSet.plutusV1Scripts = plutusV1Scripts
            break
          }
          case 4n: {
            // plutus_data
            const plutusData = yield* Eff.all(
              value.map((dataCBOR) => ParseResult.decode(PlutusData.FromCDDL)(dataCBOR))
            )
            witnessSet.plutusData = plutusData
            break
          }
          case 5n: {
            // redeemers
            const redeemers: Array<Redeemer.Redeemer> = []
            for (const [tag, index, dataCBOR, exUnits] of value as Array<readonly [bigint, bigint, any, readonly [bigint, bigint]]>) {
              const data = yield* ParseResult.decode(PlutusData.FromCDDL)(dataCBOR)
              redeemers.push(new Redeemer.Redeemer({ tag: Redeemer.integerToTag(tag), index, data, exUnits }))
            }
            witnessSet.redeemers = redeemers
            break
          }
          case 6n: {
            // plutus_v2_scripts
            const plutusV2Scripts = (value as Array<Uint8Array>).map(script => new PlutusV2({ script }))
            witnessSet.plutusV2Scripts = plutusV2Scripts
            break
          }
          case 7n: {
            // plutus_v3_scripts
            const plutusV3Scripts = (value as Array<Uint8Array>).map(script => new PlutusV3({ script }))
            witnessSet.plutusV3Scripts = plutusV3Scripts
            break
          }
        }
      }

      return yield* ParseResult.decode(TransactionWitnessSet)(witnessSet)
    })
})

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "TransactionWitnessSet.FromCBORBytes",
    description: "Transforms CBOR bytes to TransactionWitnessSet"
  })

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCBORBytes(options)).annotations({
    identifier: "TransactionWitnessSet.FromCBORHex",
    description: "Transforms CBOR hex string to TransactionWitnessSet"
  })

/**
 * Smart constructor for TransactionWitnessSet that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = TransactionWitnessSet.make

/**
 * Check if two TransactionWitnessSet instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionWitnessSet, b: TransactionWitnessSet): boolean => {
  // Deep equality check would be complex, so we use JSON comparison for now
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * FastCheck arbitrary for generating random TransactionWitnessSet instances.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<TransactionWitnessSet> = FastCheck.record({
  vkeyWitnesses: FastCheck.option(
    FastCheck.array(
      FastCheck.record({
        vkey: VKey.arbitrary,
        signature: Ed25519Signature.arbitrary
      }).map(({ signature, vkey }) => new VKeyWitness({ vkey, signature }))
    )
  ),
  nativeScripts: FastCheck.option(FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 100 }))),
  bootstrapWitnesses: FastCheck.option(
    FastCheck.array(
      FastCheck.record({
        publicKey: VKey.arbitrary,
        signature: Ed25519Signature.arbitrary,
        chainCode: FastCheck.uint8Array({ minLength: 32, maxLength: 32 }),
        attributes: FastCheck.uint8Array({ minLength: 0, maxLength: 100 })
      }).map(
        ({ attributes, chainCode, publicKey, signature }) =>
          new BootstrapWitness({ publicKey, signature, chainCode, attributes })
      )
    )
  ),
  plutusV1Scripts: FastCheck.option(
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map(scripts =>
      scripts.map(script => new PlutusV1({ script }))
    )
  ),
  plutusData: FastCheck.option(FastCheck.array(PlutusData.arbitrary)),
  redeemers: FastCheck.option(
    FastCheck.array(
      FastCheck.record({
        data: PlutusData.arbitrary,
        exUnits: FastCheck.tuple(
          FastCheck.bigInt({ min: 0n, max: 10000000n }),
          FastCheck.bigInt({ min: 0n, max: 10000000n })
        ),
        index: FastCheck.bigInt({ min: 0n, max: 1000n }),
        tag: FastCheck.constantFrom("spend" as const, "mint" as const, "cert" as const, "reward" as const)
      }).map(({ data, exUnits, index, tag }) => new Redeemer.Redeemer({ tag, index, data, exUnits }))
    )
  ),
  plutusV2Scripts: FastCheck.option(
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map(scripts =>
      scripts.map(script => new PlutusV2({ script }))
    )
  ),
  plutusV3Scripts: FastCheck.option(
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map(scripts =>
      scripts.map(script => new PlutusV3({ script }))
    )
  )
}).map((witnessSetData) => {
  // Convert null values to undefined for optional fields
  const cleanedData = Object.fromEntries(
    Object.entries(witnessSetData).filter(([_, value]) => value !== null)
  )
  return TransactionWitnessSet.make(cleanedData)
})

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a TransactionWitnessSet from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): TransactionWitnessSet =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse a TransactionWitnessSet from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): TransactionWitnessSet =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a TransactionWitnessSet to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (witnessSet: TransactionWitnessSet, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(witnessSet, options))

/**
 * Convert a TransactionWitnessSet to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (witnessSet: TransactionWitnessSet, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(witnessSet, options))

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an empty TransactionWitnessSet.
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = (): TransactionWitnessSet => TransactionWitnessSet.make({})

/**
 * Create a TransactionWitnessSet with only VKey witnesses.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromVKeyWitnesses = (witnesses: Array<VKeyWitness>): TransactionWitnessSet =>
  TransactionWitnessSet.make({ vkeyWitnesses: witnesses })

/**
 * Create a TransactionWitnessSet with only native scripts.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromNativeScripts = (scripts: Array<NativeScripts.Native>): TransactionWitnessSet =>
  TransactionWitnessSet.make({ nativeScripts: scripts })

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse a TransactionWitnessSet from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options?: CBOR.CodecOptions
  ): Eff.Effect<TransactionWitnessSet, TransactionWitnessSetError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (error) =>
          new TransactionWitnessSetError({
            message: "Failed to decode TransactionWitnessSet from CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Parse a TransactionWitnessSet from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORHex = (
    hex: string,
    options?: CBOR.CodecOptions
  ): Eff.Effect<TransactionWitnessSet, TransactionWitnessSetError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (error) =>
          new TransactionWitnessSetError({
            message: "Failed to decode TransactionWitnessSet from CBOR hex",
            cause: error
          })
      )
    )

  /**
   * Convert a TransactionWitnessSet to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORBytes = (
    witnessSet: TransactionWitnessSet,
    options?: CBOR.CodecOptions
  ): Eff.Effect<Uint8Array, TransactionWitnessSetError> =>
    Schema.encode(FromCBORBytes(options))(witnessSet).pipe(
      Eff.mapError(
        (error) =>
          new TransactionWitnessSetError({
            message: "Failed to encode TransactionWitnessSet to CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Convert a TransactionWitnessSet to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORHex = (
    witnessSet: TransactionWitnessSet,
    options?: CBOR.CodecOptions
  ): Eff.Effect<string, TransactionWitnessSetError> =>
    Schema.encode(FromCBORHex(options))(witnessSet).pipe(
      Eff.mapError(
        (error) =>
          new TransactionWitnessSetError({
            message: "Failed to encode TransactionWitnessSet to CBOR hex",
            cause: error
          })
      )
    )
}
