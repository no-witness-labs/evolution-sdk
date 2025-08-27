import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Address from "./Address.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as DatumOption from "./DatumOption.js"
import * as Function from "./Function.js"
import * as ScriptRef from "./ScriptRef.js"
import * as Value from "./Value.js"

/**
 * Error class for TransactionOutput related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionOutputError extends Data.TaggedError("TransactionOutputError")<{
  message?: string
  cause?: unknown
}> {}

// Pre-bind frequently used ParseResult helpers for hot paths
const encAddress = ParseResult.encodeEither(Address.FromBytes)
const decAddress = ParseResult.decodeUnknownEither(Address.FromBytes)
const encValue = ParseResult.encodeEither(Value.FromCDDL)
const decValue = ParseResult.decodeUnknownEither(Value.FromCDDL)
const encDatumOption = ParseResult.encodeEither(DatumOption.FromCDDL)
const decDatumOption = ParseResult.decodeUnknownEither(DatumOption.FromCDDL)
const decDatumHash = ParseResult.decodeEither(DatumOption.DatumHashFromBytes)
const encScriptRef = ParseResult.encodeEither(ScriptRef.FromCDDL)
const decScriptRef = ParseResult.decodeUnknownEither(ScriptRef.FromCDDL)

/**
 * Shelley-era transaction output format
 *
 * CDDL:
 * ```
 * shelley_transaction_output = [address, amount : value, ? Bytes32]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ShelleyTransactionOutput extends Schema.TaggedClass<ShelleyTransactionOutput>()(
  "ShelleyTransactionOutput",
  {
    address: Address.Address,
    amount: Value.Value,
    datumHash: Schema.optional(DatumOption.DatumHash)
  }
) {
  toString(): string {
    const fields = [`address: ${this.address}`, `amount: ${this.amount}`]
    if (this.datumHash !== undefined) fields.push(`datumHash: ${this.datumHash}`)
    return `ShelleyTransactionOutput { ${fields.join(", ")} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

/**
 * Babbage-era transaction output format
 *
 * CDDL:
 * ```
 * babbage_transaction_output =
 *   {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class BabbageTransactionOutput extends Schema.TaggedClass<BabbageTransactionOutput>()(
  "BabbageTransactionOutput",
  {
    address: Address.Address, // 0
    amount: Value.Value, // 1
    datumOption: Schema.optional(DatumOption.DatumOptionSchema), // 2
    scriptRef: Schema.optional(ScriptRef.ScriptRef) // 3
  }
) {
  toString(): string {
    const fields = [`address: ${this.address}`, `amount: ${this.amount}`]
    if (this.datumOption !== undefined) fields.push(`datumOption: ${this.datumOption}`)
    if (this.scriptRef !== undefined) fields.push(`scriptRef: ${this.scriptRef}`)
    return `BabbageTransactionOutput { ${fields.join(", ")} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

/**
 * Union type for transaction outputs
 *
 * CDDL:
 * ```
 * transaction_output = shelley_transaction_output / babbage_transaction_output
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const TransactionOutput = Schema.Union(ShelleyTransactionOutput, BabbageTransactionOutput)

export type TransactionOutput = typeof TransactionOutput.Type

export const ShelleyTransactionOutputCDDL = Schema.Tuple(
  Schema.Uint8ArrayFromSelf, // address as bytes
  Value.CDDLSchema, // value
  Schema.optionalElement(Schema.Uint8ArrayFromSelf) // optional datum_hash as bytes
)

/**
 * CDDL schema for Shelley transaction outputs
 *
 * @since 2.0.0
 * @category transformation
 */
export const FromShelleyTransactionOutputCDDLSchema = Schema.transformOrFail(
  ShelleyTransactionOutputCDDL,
  Schema.typeSchema(ShelleyTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      E.gen(function* () {
        const addressBytes = yield* encAddress(toI.address)
        const valueBytes = yield* encValue(toI.amount)

        if (toI.datumHash !== undefined) {
          return [addressBytes, valueBytes, toI.datumHash.hash] as const
        }

        return [addressBytes, valueBytes] as const
      }),
    decode: (fromI) =>
      E.gen(function* () {
        const [addressBytes, valueBytes, datumHashBytes] = fromI

        // Validate addressBytes is a byte array before decoding (avoid instanceof)
        if (Object.prototype.toString.call(addressBytes) !== "[object Uint8Array]") {
          return yield* E.left(new ParseResult.Type(BabbageTransactionOutputCDDL.ast, fromI))
        }
        const address = yield* decAddress(addressBytes)
        const amount = yield* decValue(valueBytes as any)
        let datumHash: DatumOption.DatumHash | undefined
        if (datumHashBytes !== undefined) {
          datumHash = yield* decDatumHash(datumHashBytes)
        }

        return new ShelleyTransactionOutput(
          {
            address,
            amount,
            datumHash
          },
          { disableValidation: true }
        )
      })
  }
)

const BabbageTransactionOutputCDDL = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: CBOR.CBORSchema
})

/**
 * CDDL schema for Babbage transaction outputs
 *
 * @since 2.0.0
 * @category transformation
 */
export const FromBabbageTransactionOutputCDDLSchema = Schema.transformOrFail(
  BabbageTransactionOutputCDDL,
  Schema.typeSchema(BabbageTransactionOutput),
  {
    strict: true,
    encode: (toI) =>
      E.gen(function* () {
        const outputMap = new Map<bigint, CBOR.CBOR>()
        const addressBytes = yield* encAddress(toI.address)
        const valueBytes = yield* encValue(toI.amount)
        // Prepare optional fields
        const datumOptionBytes = toI.datumOption !== undefined ? yield* encDatumOption(toI.datumOption) : undefined
        const scriptRefBytes = toI.scriptRef !== undefined ? yield* encScriptRef(toI.scriptRef) : undefined

        // Build result object with conditional properties
        outputMap.set(0n, addressBytes)
        outputMap.set(1n, valueBytes)
        if (datumOptionBytes !== undefined) {
          outputMap.set(2n, datumOptionBytes)
        }
        if (scriptRefBytes !== undefined) {
          outputMap.set(3n, scriptRefBytes)
        }
        return outputMap
      }),
    decode: (fromI) =>
      E.gen(function* () {
        // Assume `fromI` is a CBOR Map and read keys directly.
        const addressBytes = fromI.get(0n)
        const valueBytes = fromI.get(1n)
        const datumOptionBytes = fromI.get(2n)
        const scriptRefBytes = fromI.get(3n)

        const address = yield* decAddress(addressBytes)
        const amount = yield* decValue(valueBytes)

        const datumOption = datumOptionBytes !== undefined ? yield* decDatumOption(datumOptionBytes) : undefined

        const scriptRef = scriptRefBytes !== undefined ? yield* decScriptRef(scriptRefBytes) : undefined

        return new BabbageTransactionOutput(
          {
            address,
            amount,
            datumOption,
            scriptRef
          },
          { disableValidation: true }
        )
      })
  }
)

export const CDDLSchema = Schema.Union(ShelleyTransactionOutputCDDL, BabbageTransactionOutputCDDL)

/**
 * CDDL schema for transaction outputs
 *
 * @since 2.0.0
 * @category transformer
 */
export const FromCDDL = Schema.Union(FromShelleyTransactionOutputCDDLSchema, FromBabbageTransactionOutputCDDLSchema)

/**
 * CBOR bytes transformation schema for TransactionOutput.
 *
 * @since 2.0.0
 * @category transformer
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → TransactionOutput
  ).annotations({
    identifier: "TransactionOutput.FromCBORBytes",
    title: "TransactionOutput from CBOR Bytes",
    description: "Transforms CBOR bytes (Uint8Array) to TransactionOutput"
  })

/**
 * CBOR hex transformation schema for TransactionOutput.
 *
 * @since 2.0.0
 * @category transformer
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → TransactionOutput
  ).annotations({
    identifier: "TransactionOutput.FromCBORHex",
    title: "TransactionOutput from CBOR Hex",
    description: "Transforms CBOR hex string to TransactionOutput"
  })

/**
 * Check if two TransactionOutput instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: TransactionOutput, b: TransactionOutput): boolean => {
  if (a._tag !== b._tag) return false

  // helper for optional fields: both undefined => equal, one undefined => not equal, otherwise use provided comparator
  const optionalEquals = <T>(x: T | undefined, y: T | undefined, cmp: (u: T, v: T) => boolean): boolean => {
    if (x === undefined && y === undefined) return true
    if (x === undefined || y === undefined) return false
    return cmp(x, y)
  }

  if (a._tag === "ShelleyTransactionOutput" && b._tag === "ShelleyTransactionOutput") {
    const addrEq = Address.equals(a.address, b.address)
    const amountEq = Value.equals(a.amount, b.amount)
    const datumEq = optionalEquals(a.datumHash, b.datumHash, DatumOption.equals)
    return addrEq && amountEq && datumEq
  }

  if (a._tag === "BabbageTransactionOutput" && b._tag === "BabbageTransactionOutput") {
    const addrEq = Address.equals(a.address, b.address)
    const amountEq = Value.equals(a.amount, b.amount)
    const datumEq = optionalEquals(a.datumOption, b.datumOption, DatumOption.equals)
    const scriptEq = optionalEquals(a.scriptRef, b.scriptRef, ScriptRef.equals)
    return addrEq && amountEq && datumEq && scriptEq
  }

  return false
}

/**
 * Create a Shelley transaction output.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeShelley = (...args: ConstructorParameters<typeof ShelleyTransactionOutput>) =>
  new ShelleyTransactionOutput(...args)

/**
 * Create a Babbage transaction output.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeBabbage = (...args: ConstructorParameters<typeof BabbageTransactionOutput>) =>
  new BabbageTransactionOutput(...args)

/**
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = (): FastCheck.Arbitrary<TransactionOutput> =>
  FastCheck.oneof(
    // Shelley TransactionOutput
    FastCheck.record({
      address: Address.arbitrary,
      amount: Value.arbitrary,
      datumHash: FastCheck.option(DatumOption.datumHashArbitrary, { nil: undefined })
    }).map((props) => new ShelleyTransactionOutput(props)),

    // Babbage TransactionOutput
    FastCheck.record({
      address: Address.arbitrary,
      amount: Value.arbitrary,
      datumOption: FastCheck.option(DatumOption.arbitrary, { nil: undefined }),
      scriptRef: FastCheck.option(ScriptRef.arbitrary, { nil: undefined })
    }).map((props) => new BabbageTransactionOutput(props))
  )

/**
 * Convert TransactionOutput to CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  TransactionOutputError,
  "TransactionOutput.toCBORBytes"
)

/**
 * Convert TransactionOutput to CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, TransactionOutputError, "TransactionOutput.toCBORHex")

/**
 * Parse TransactionOutput from CBOR bytes (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  TransactionOutputError,
  "TransactionOutput.fromCBORBytes"
)

/**
 * Parse TransactionOutput from CBOR hex (unsafe).
 *
 * @since 2.0.0
 * @category decoding
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  TransactionOutputError,
  "TransactionOutput.fromCBORHex"
)

/**
 * Either namespace containing schema decode and encode operations.
 *
 * @since 2.0.0
 * @category Either
 */
export namespace Either {
  /**
   * Parse a TransactionOutput from CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, TransactionOutputError)

  /**
   * Parse a TransactionOutput from CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, TransactionOutputError)

  /**
   * Convert a TransactionOutput to CBOR bytes using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, TransactionOutputError)

  /**
   * Convert a TransactionOutput to CBOR hex using Either error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, TransactionOutputError)
}
