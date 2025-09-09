import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bootstrap from "./BootstrapWitness.js"
import * as CBOR from "./CBOR.js"
import * as PlutusData from "./Data.js"
import * as Ed25519Signature from "./Ed25519Signature.js"
import * as Function from "./Function.js"
import * as NativeScripts from "./NativeScripts.js"
import * as PlutusV1 from "./PlutusV1.js"
import * as PlutusV2 from "./PlutusV2.js"
import * as PlutusV3 from "./PlutusV3.js"
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
// BootstrapWitness moved to its own module in ./BootstrapWitness.ts

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
export const PlutusScript = Schema.Union(PlutusV1.PlutusV1, PlutusV2.PlutusV2, PlutusV3.PlutusV3).annotations({
  identifier: "PlutusScript",
  description: "Plutus script with version tag"
})

export type PlutusScript = typeof PlutusScript.Type

/**
 * TransactionWitnessSet based on Conway CDDL specification.
 *
 * ```
 * CDDL: transaction_witness_set = {
 *   ? 0 : nonempty_set<vkeywitness>
 *   ? 1 : nonempty_set<native_script>
 *   ? 2 : nonempty_set<bootstrap_witness>
 *   ? 3 : nonempty_set<plutus_v1_script>
 *   ? 4 : nonempty_set<plutus_data>
 *   ? 5 : redeemers
 *   ? 6 : nonempty_set<plutus_v2_script>
 *   ? 7 : nonempty_set<plutus_v3_script>
 * }
 *
 * nonempty_set<a0> = #6.258([+ a0])/ [+ a0]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionWitnessSet extends Schema.Class<TransactionWitnessSet>("TransactionWitnessSet")({
  vkeyWitnesses: Schema.optional(Schema.Array(VKeyWitness)),
  nativeScripts: Schema.optional(Schema.Array(NativeScripts.NativeScript)),
  bootstrapWitnesses: Schema.optional(Schema.Array(Bootstrap.BootstrapWitness)),
  plutusV1Scripts: Schema.optional(Schema.Array(PlutusV1.PlutusV1)),
  plutusData: Schema.optional(Schema.Array(PlutusData.DataSchema)),
  redeemers: Schema.optional(Schema.Array(Redeemer.Redeemer)),
  plutusV2Scripts: Schema.optional(Schema.Array(PlutusV2.PlutusV2)),
  plutusV3Scripts: Schema.optional(Schema.Array(PlutusV3.PlutusV3))
}) {}

// Note: Individual tuple encodings are handled inline during encode/decode.

/**
 * CDDL schema for BootstrapWitness.
 *
 * @since 2.0.0
 * @category schemas
 */
// BootstrapWitness CDDL schema provided by ./BootstrapWitness.ts

/**
 * CDDL schema for TransactionWitnessSet encoded as a CBOR map with integer keys.
 * Keys and values follow Conway-era CDDL:
 *   0: nonempty_set<vkeywitness>
 *   1: nonempty_set<native_script>
 *   2: nonempty_set<bootstrap_witness>
 *   3: nonempty_set<plutus_v1_script>
 *   4: nonempty_set<plutus_data>
 *   5: redeemers (array of [tag, index, data, ex_units])
 *   6: nonempty_set<plutus_v2_script>
 *   7: nonempty_set<plutus_v3_script>
 *
 * nonempty_set<a0> = #6.258([+ a0]) / [+ a0]
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: CBOR.CBORSchema
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
      const record = new Map<bigint, CBOR.CBOR>()

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
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(0n, CBOR.Tag.make({ tag: 258, value: vkeyWitnesses }))
      }

      // 1: native_scripts
      if (toA.nativeScripts && toA.nativeScripts.length > 0) {
        const nativeScripts = yield* Eff.all(
          toA.nativeScripts.map((script) => ParseResult.encode(NativeScripts.FromCDDL)(script))
        )
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(1n, CBOR.Tag.make({ tag: 258, value: nativeScripts }))
      }

      // 2: bootstrap_witnesses
      if (toA.bootstrapWitnesses && toA.bootstrapWitnesses.length > 0) {
        const bootstrapWitnesses = yield* Eff.all(
          toA.bootstrapWitnesses.map((witness) => ParseResult.encode(Bootstrap.FromCDDL)(witness))
        )
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(2n, CBOR.Tag.make({ tag: 258, value: bootstrapWitnesses }))
      }

      // 3: plutus_v1_scripts
      if (toA.plutusV1Scripts && toA.plutusV1Scripts.length > 0) {
        const plutusV1Scripts = toA.plutusV1Scripts.map((script) => script.bytes)
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(3n, CBOR.Tag.make({ tag: 258, value: plutusV1Scripts }))
      }

      // 4: plutus_data
      if (toA.plutusData && toA.plutusData.length > 0) {
        const plutusDataCBOR = yield* Eff.all(
          toA.plutusData.map((data) => ParseResult.encode(PlutusData.FromCDDL)(data))
        )
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(4n, CBOR.Tag.make({ tag: 258, value: plutusDataCBOR }))
      }

      // 5: redeemers
      if (toA.redeemers && toA.redeemers.length > 0) {
        const redeemers = yield* Eff.all(
          toA.redeemers.map((redeemer) =>
            Eff.gen(function* () {
              const dataCBOR = yield* ParseResult.encode(PlutusData.FromCDDL)(redeemer.data)
              const tagInteger = Redeemer.tagToInteger(redeemer.tag)
              return [tagInteger, redeemer.index, dataCBOR, redeemer.exUnits] as const
            })
          )
        )
        record.set(5n, redeemers)
      }

      // 6: plutus_v2_scripts
      if (toA.plutusV2Scripts && toA.plutusV2Scripts.length > 0) {
        const plutusV2Scripts = toA.plutusV2Scripts.map((script) => script.bytes)
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(6n, CBOR.Tag.make({ tag: 258, value: plutusV2Scripts }))
      }

      // 7: plutus_v3_scripts
      if (toA.plutusV3Scripts && toA.plutusV3Scripts.length > 0) {
        const plutusV3Scripts = toA.plutusV3Scripts.map((script) => script.bytes)
        // Use CBOR tag 258 for nonempty_set as per CDDL spec
        record.set(7n, CBOR.Tag.make({ tag: 258, value: plutusV3Scripts }))
      }

      return record
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const witnessSet: {
        vkeyWitnesses?: Array<VKeyWitness>
        nativeScripts?: Array<NativeScripts.NativeScript>
        bootstrapWitnesses?: Array<Bootstrap.BootstrapWitness>
        plutusV1Scripts?: Array<PlutusV1.PlutusV1>
        plutusData?: Array<PlutusData.Data>
        redeemers?: Array<Redeemer.Redeemer>
        plutusV2Scripts?: Array<PlutusV2.PlutusV2>
        plutusV3Scripts?: Array<PlutusV3.PlutusV3>
      } = {}

      // Parse each field from the record
      // Helper to accept nonempty_set<a0> in both forms:
      // - Tagged: #6.258([+ a0])
      // - Untagged: [+ a0]
      const asNonEmptyArray = <T>(value: unknown): ReadonlyArray<T> | undefined => {
        if (value === undefined) return undefined
        if (CBOR.isTag(value)) {
          const tag = value as { _tag: "Tag"; tag: number; value: unknown }
          if (tag.tag !== 258) return undefined
          if (Array.isArray(tag.value)) return tag.value as ReadonlyArray<T>
          return undefined
        }
        if (Array.isArray(value)) return value as ReadonlyArray<T>
        return undefined
      }

      // 0: vkeywitnesses
      const vkeysArr = asNonEmptyArray<readonly [Uint8Array, Uint8Array]>(fromA.get(0n))
      if (vkeysArr !== undefined) {
        const vkeyWitnesses: Array<VKeyWitness> = []
        for (const [vkeyBytes, signatureBytes] of vkeysArr) {
          const vkey = yield* ParseResult.decode(VKey.FromBytes)(vkeyBytes)
          const signature = yield* ParseResult.decode(Ed25519Signature.FromBytes)(signatureBytes)
          vkeyWitnesses.push(new VKeyWitness({ vkey, signature }))
        }
        witnessSet.vkeyWitnesses = vkeyWitnesses
      }

      // 1: native_scripts
      const nativeArr = asNonEmptyArray<typeof NativeScripts.CDDLSchema.Type>(fromA.get(1n))
      if (nativeArr !== undefined) {
        const nativeScripts = yield* Eff.all(
          nativeArr.map((scriptCBOR) => ParseResult.decode(NativeScripts.FromCDDL)(scriptCBOR))
        )
        witnessSet.nativeScripts = nativeScripts
      }

      // 2: bootstrap_witnesses
      const bootstrapArr = asNonEmptyArray<typeof Bootstrap.CDDLSchema.Type>(fromA.get(2n))
      if (bootstrapArr !== undefined) {
        const bootstrapWitnesses: Array<Bootstrap.BootstrapWitness> = []
        for (const tuple of bootstrapArr) {
          const bw = yield* ParseResult.decode(Bootstrap.FromCDDL)(tuple)
          bootstrapWitnesses.push(bw)
        }
        witnessSet.bootstrapWitnesses = bootstrapWitnesses
      }

      // 3: plutus_v1_scripts
      const p1Arr = asNonEmptyArray<Uint8Array>(fromA.get(3n))
      if (p1Arr !== undefined) {
        const plutusV1Scripts = p1Arr.map((script) => new PlutusV1.PlutusV1({ bytes: script }))
        witnessSet.plutusV1Scripts = plutusV1Scripts
      }

      // 4: plutus_data
      const pdataArr = asNonEmptyArray<typeof PlutusData.CDDLSchema.Type>(fromA.get(4n))
      if (pdataArr !== undefined) {
        // Some real-world CBOR producers may include the simple value `undefined` inside this set.
        // Filter out such entries before decoding to strict PlutusData.
        const isDefined = <T>(x: T | undefined): x is T => x !== undefined
        const sanitized = pdataArr.filter(isDefined)
        const plutusData = yield* Eff.all(
          sanitized.map((dataCBOR) => ParseResult.decode(PlutusData.FromCDDL)(dataCBOR))
        )
        witnessSet.plutusData = plutusData
      }

      // 5: redeemers (note: some producers may wrap this in nonempty_set tag 258 even though CDDL doesn't require it)
      const asRedeemersArray = (
        value: unknown
      ):
        | ReadonlyArray<readonly [bigint, bigint, typeof PlutusData.CDDLSchema.Type, readonly [bigint, bigint]]>
        | undefined => {
        if (value === undefined) return undefined
        if (CBOR.isTag(value)) {
          const tag = value as { _tag: "Tag"; tag: number; value: unknown }
          if (tag.tag !== 258) return undefined
          if (Array.isArray(tag.value))
            return tag.value as ReadonlyArray<
              readonly [bigint, bigint, typeof PlutusData.CDDLSchema.Type, readonly [bigint, bigint]]
            >
          return undefined
        }
        if (Array.isArray(value))
          return value as ReadonlyArray<
            readonly [bigint, bigint, typeof PlutusData.CDDLSchema.Type, readonly [bigint, bigint]]
          >
        return undefined
      }

      const redeemersArray = asRedeemersArray(fromA.get(5n))
      if (redeemersArray !== undefined) {
        const redeemers: Array<Redeemer.Redeemer> = []
        for (const [tag, index, dataCBOR, exUnits] of redeemersArray) {
          // Guard against unexpected CBOR simple `undefined` in datum position by substituting empty bytes
          const safeDataCBOR = (
            dataCBOR === undefined ? new Uint8Array(0) : dataCBOR
          ) as typeof PlutusData.CDDLSchema.Type
          const data = yield* ParseResult.decode(PlutusData.FromCDDL)(safeDataCBOR)
          redeemers.push(new Redeemer.Redeemer({ tag: Redeemer.integerToTag(tag), index, data, exUnits }))
        }
        witnessSet.redeemers = redeemers
      }

      // 6: plutus_v2_scripts
      const p2Arr = asNonEmptyArray<Uint8Array>(fromA.get(6n))
      if (p2Arr !== undefined) {
        const plutusV2Scripts = p2Arr.map((bytes) => new PlutusV2.PlutusV2({ bytes }))
        witnessSet.plutusV2Scripts = plutusV2Scripts
      }

      // 7: plutus_v3_scripts
      const p3Arr = asNonEmptyArray<Uint8Array>(fromA.get(7n))
      if (p3Arr !== undefined) {
        const plutusV3Scripts = p3Arr.map((bytes) => new PlutusV3.PlutusV3({ bytes }))
        witnessSet.plutusV3Scripts = plutusV3Scripts
      }

      // Build the class instance directly to allow fully empty witness sets
      return new TransactionWitnessSet(witnessSet, { disableValidation: true })
    })
})

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "TransactionWitnessSet.FromCBORBytes",
    description: "Transforms CBOR bytes to TransactionWitnessSet"
  })

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCDDL).annotations({
    identifier: "TransactionWitnessSet.FromCBORHex",
    description: "Transforms CBOR hex string to TransactionWitnessSet"
  })

/**
 * Smart constructor for TransactionWitnessSet that validates and applies branding.
 *
 * @since 2.0.0
 * @category constructors
 */
// Wrap static make to preserve `this` binding from Schema.Class

export const make = (...args: ConstructorParameters<typeof TransactionWitnessSet>) =>
  TransactionWitnessSet.make(...args)

/**
 * Check if two TransactionWitnessSet instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionWitnessSet, b: TransactionWitnessSet): boolean => {
  // Use CBOR byte comparison to avoid JSON.stringify and handle all cases correctly
  try {
    const aBytes = toCBORBytes(a)
    const bBytes = toCBORBytes(b)
    if (aBytes.length !== bBytes.length) return false
    for (let i = 0; i < aBytes.length; i++) {
      if (aBytes[i] !== bBytes[i]) return false
    }
    return true
  } catch {
    return false
  }
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
  // Generate valid NativeScripts via its own arbitrary
  nativeScripts: FastCheck.option(FastCheck.array(NativeScripts.arbitrary)),
  bootstrapWitnesses: FastCheck.option(FastCheck.array(Bootstrap.arbitrary)),
  plutusV1Scripts: FastCheck.option(
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map((scripts) =>
      scripts.map((bytes) => new PlutusV1.PlutusV1({ bytes }))
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
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map((scripts) =>
      scripts.map((bytes) => new PlutusV2.PlutusV2({ bytes }))
    )
  ),
  plutusV3Scripts: FastCheck.option(
    FastCheck.array(FastCheck.uint8Array({ minLength: 1, maxLength: 1000 })).map((scripts) =>
      scripts.map((bytes) => new PlutusV3.PlutusV3({ bytes }))
    )
  )
}).map((witnessSetData) => {
  // Convert null values to undefined for optional fields
  const cleanedData = Object.fromEntries(Object.entries(witnessSetData).filter(([_, value]) => value !== null))
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
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  TransactionWitnessSetError,
  "TransactionWitnessSet.fromCBORBytes"
)

/**
 * Parse a TransactionWitnessSet from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  TransactionWitnessSetError,
  "TransactionWitnessSet.fromCBORHex"
)

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a TransactionWitnessSet to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  TransactionWitnessSetError,
  "TransactionWitnessSet.toCBORBytes"
)

/**
 * Convert a TransactionWitnessSet to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  TransactionWitnessSetError,
  "TransactionWitnessSet.toCBORHex"
)

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
export const fromNativeScripts = (scripts: Array<NativeScripts.NativeScript>): TransactionWitnessSet =>
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
export namespace Either {
  /**
   * Parse a TransactionWitnessSet from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, TransactionWitnessSetError)

  /**
   * Parse a TransactionWitnessSet from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, TransactionWitnessSetError)

  /**
   * Convert a TransactionWitnessSet to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, TransactionWitnessSetError)

  /**
   * Convert a TransactionWitnessSet to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, TransactionWitnessSetError)
}
