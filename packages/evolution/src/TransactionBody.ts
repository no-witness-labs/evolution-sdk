import { Data, Effect as Eff, ParseResult, Schema } from "effect"
import type { NonEmptyArray } from "effect/Array"

import * as AuxiliaryDataHash from "./AuxiliaryDataHash.js"
import * as CBOR from "./CBOR.js"
import * as Certificate from "./Certificate.js"
import * as Coin from "./Coin.js"
import * as Hash28 from "./Hash28.js"
import * as KeyHash from "./KeyHash.js"
import * as Mint from "./Mint.js"
import * as NetworkId from "./NetworkId.js"
import * as PositiveCoin from "./PositiveCoin.js"
import * as ProposalProcedures from "./ProposalProcedures.js"
import * as RewardAccount from "./RewardAccount.js"
import * as ScriptDataHash from "./ScriptDataHash.js"
import * as TransactionInput from "./TransactionInput.js"
import * as TransactionOutput from "./TransactionOutput.js"
import * as VotingProcedures from "./VotingProcedures.js"
import * as Withdrawals from "./Withdrawals.js"

/**
 * TransactionBody based on Conway CDDL specification
 *
 * ```
 * CDDL: transaction_body =
 *   {   0  : set<transaction_input>
 *   ,   1  : [* transaction_output]
 *   ,   2  : coin
 *   , ? 3  : slot_no
 *   , ? 4  : certificates
 *   , ? 5  : withdrawals
 *   , ? 7  : auxiliary_data_hash
 *   , ? 8  : slot_no
 *   , ? 9  : mint
 *   , ? 11 : script_data_hash
 *   , ? 13 : nonempty_set<transaction_input>
 *   , ? 14 : required_signers
 *   , ? 15 : network_id
 *   , ? 16 : transaction_output
 *   , ? 17 : coin
 *   , ? 18 : nonempty_set<transaction_input>
 *   , ? 19 : voting_procedures
 *   , ? 20 : proposal_procedures
 *   , ? 21 : coin
 *   , ? 22 : positive_coin
 *   }
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionBody extends Schema.TaggedClass<TransactionBody>()("TransactionBody", {
  inputs: Schema.Array(TransactionInput.TransactionInput), // 0
  outputs: Schema.Array(TransactionOutput.TransactionOutput), // 1
  fee: Coin.Coin, // 2
  ttl: Schema.optional(Schema.BigIntFromSelf), // 3 - slot_no
  certificates: Schema.optional(Schema.NonEmptyArray(Certificate.Certificate)), // 4
  withdrawals: Schema.optional(Withdrawals.Withdrawals), // 5
  auxiliaryDataHash: Schema.optional(AuxiliaryDataHash.AuxiliaryDataHash), // 7
  validityIntervalStart: Schema.optional(Schema.BigIntFromSelf), // 8 - slot_no
  mint: Schema.optional(Mint.Mint), // 9
  scriptDataHash: Schema.optional(ScriptDataHash.ScriptDataHash), // 11
  collateralInputs: Schema.optional(Schema.NonEmptyArray(TransactionInput.TransactionInput)), // 13
  requiredSigners: Schema.optional(Schema.NonEmptyArray(KeyHash.KeyHash)), // 14
  networkId: Schema.optional(NetworkId.NetworkId), // 15
  collateralReturn: Schema.optional(TransactionOutput.TransactionOutput), // 16
  totalCollateral: Schema.optional(Coin.Coin), // 17
  referenceInputs: Schema.optional(Schema.NonEmptyArray(TransactionInput.TransactionInput)), // 18
  votingProcedures: Schema.optional(VotingProcedures.VotingProcedures), // 19
  proposalProcedures: Schema.optional(ProposalProcedures.ProposalProcedures), // 20
  currentTreasuryValue: Schema.optional(Coin.Coin), // 21
  donation: Schema.optional(PositiveCoin.PositiveCoinSchema) // 22
}) {}

/**
 * Error class for TransactionBody related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TransactionBodyError extends Data.TaggedError("TransactionBodyError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * CDDL schema for TransactionBody map structure.
 *
 * Maps the TransactionBody fields to their CDDL field numbers according to Conway spec.
 * Uses MapFromSelf to produce CBOR with integer keys (not string keys) for CML compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: CBOR.Integer,
  value: Schema.Union(
    Schema.Array(TransactionInput.CDDLSchema), // 0: set<transaction_input>, 13: collateral_inputs, 18: reference_inputs
    Schema.Array(TransactionOutput.CDDLSchema), // 1: [* transaction_output]
    CBOR.Integer, // 2: coin (fee), 3: slot_no (ttl), 8: slot_no (validity_interval_start), 15: network_id, 17: coin (total_collateral), 21: coin (current_treasury_value), 22: positive_coin (donation)
    Schema.Array(Certificate.CDDLSchema), // 4: certificates
    Withdrawals.CDDLSchema, // 5: withdrawals
    CBOR.ByteArray, // 7: auxiliary_data_hash, 11: script_data_hash
    Schema.encodedSchema(Mint.CDDLSchema), // 9: mint
    Schema.Array(CBOR.ByteArray), // 14: required_signers
    TransactionOutput.CDDLSchema, // 16: transaction_output (collateral_return)
    Schema.encodedSchema(VotingProcedures.CDDLSchema), // 19: voting_procedures
    Schema.encodedSchema(ProposalProcedures.CDDLSchema) // 20: proposal_procedures
  )
})

export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionBody), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      // Required fields
      const inputs = yield* Eff.all(toA.inputs.map((input) => ParseResult.encode(TransactionInput.FromCDDL)(input)))
      const outputs = yield* Eff.all(
        toA.outputs.map((output) => ParseResult.encode(TransactionOutput.FromTransactionOutputCDDLSchema)(output))
      )
      const fee = toA.fee

      // Optional fields
      const ttl = toA.ttl
      const certificates = toA.certificates
        ? yield* Eff.all(toA.certificates.map((cert) => ParseResult.encode(Certificate.FromCDDL)(cert)))
        : undefined
      const withdrawalsMap = new Map<Uint8Array, bigint>()
      if (toA.withdrawals) {
        for (const [rewardAccount, coin] of toA.withdrawals.withdrawals.entries()) {
          const accountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(rewardAccount)
          withdrawalsMap.set(accountBytes, coin)
        }
      }
      const withdrawals = toA.withdrawals ? withdrawalsMap : undefined
      const auxiliaryDataHash = toA.auxiliaryDataHash
        ? yield* ParseResult.encode(AuxiliaryDataHash.BytesSchema)(toA.auxiliaryDataHash)
        : undefined
      const validityIntervalStart = toA.validityIntervalStart
      const mint = toA.mint ? (yield* ParseResult.encode(Mint.FromCDDL)(toA.mint)) : undefined 
      const scriptDataHash = toA.scriptDataHash
        ? yield* ParseResult.encode(ScriptDataHash.FromBytes)(toA.scriptDataHash)
        : undefined
      const collateralInputs = toA.collateralInputs
        ? yield* Eff.all(toA.collateralInputs.map((input) => ParseResult.encode(TransactionInput.FromCDDL)(input)))
        : undefined
      const requiredSigners = toA.requiredSigners
        ? yield* Eff.all(toA.requiredSigners.map((signer) => ParseResult.encode(Hash28.FromBytes)(signer)))
        : undefined
      const networkId = toA.networkId ? BigInt(toA.networkId) : undefined
      const collateralReturn = toA.collateralReturn
        ? yield* ParseResult.encode(TransactionOutput.FromTransactionOutputCDDLSchema)(toA.collateralReturn)
        : undefined
      const totalCollateral = toA.totalCollateral
      const referenceInputs = toA.referenceInputs
        ? yield* Eff.all(toA.referenceInputs.map((input) => ParseResult.encode(TransactionInput.FromCDDL)(input)))
        : undefined
      const votingProcedures = toA.votingProcedures
        ? yield* ParseResult.encode(VotingProcedures.FromCDDL)(toA.votingProcedures)
        : undefined
      const proposalProcedures = toA.proposalProcedures
        ? yield* ParseResult.encode(ProposalProcedures.FromCDDL)(toA.proposalProcedures)
        : undefined
      const currentTreasuryValue = toA.currentTreasuryValue
      const donation = toA.donation

      // Create Map with integer keys for CBOR
      const map = new Map<bigint, any>()
      
      // Required fields
      map.set(0n, inputs)
      map.set(1n, outputs)
      map.set(2n, fee)
      
      // Optional fields (only set if defined)
      if (ttl !== undefined) map.set(3n, ttl)
      if (certificates !== undefined) map.set(4n, certificates)
      if (withdrawals !== undefined) map.set(5n, withdrawals)
      if (auxiliaryDataHash !== undefined) map.set(7n, auxiliaryDataHash)
      if (validityIntervalStart !== undefined) map.set(8n, validityIntervalStart)
      if (mint !== undefined) map.set(9n, mint)
      if (scriptDataHash !== undefined) map.set(11n, scriptDataHash)
      if (collateralInputs !== undefined) map.set(13n, collateralInputs)
      if (requiredSigners !== undefined) map.set(14n, requiredSigners)
      if (networkId !== undefined) map.set(15n, networkId)
      if (collateralReturn !== undefined) map.set(16n, collateralReturn)
      if (totalCollateral !== undefined) map.set(17n, totalCollateral)
      if (referenceInputs !== undefined) map.set(18n, referenceInputs)
      if (votingProcedures !== undefined) map.set(19n, votingProcedures)
      if (proposalProcedures !== undefined) map.set(20n, proposalProcedures)
      if (currentTreasuryValue !== undefined) map.set(21n, currentTreasuryValue)
      if (donation !== undefined) map.set(22n, donation)

      return map
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      // Required fields
      const inputsArray = fromA.get(0n) as Array<any>
      const inputs = (yield* Eff.all(
        inputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
      )) as NonEmptyArray<TransactionInput.TransactionInput>

      const outputsArray = fromA.get(1n) as Array<any>
      const outputs = yield* Eff.all(
        outputsArray.map((output) => ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(output))
      )
      const fee = fromA.get(2n) as bigint

      // Optional fields
      const ttl = fromA.get(3n) as bigint | undefined

      const certificatesArray = fromA.get(4n) as Array<any> | undefined
      const certificates = certificatesArray
        ? ((yield* Eff.all(
            certificatesArray.map((cert) => ParseResult.decode(Certificate.FromCDDL)(cert))
          )) as NonEmptyArray<Certificate.Certificate>)
        : undefined

      let withdrawals: Withdrawals.Withdrawals | undefined
      const withdrawalsMap = fromA.get(5n) as Map<Uint8Array, bigint> | undefined
      if (withdrawalsMap) {
        const decodedWithdrawals = new Map<RewardAccount.RewardAccount, Coin.Coin>()
        for (const [accountBytes, coinAmount] of withdrawalsMap.entries()) {
          const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(accountBytes)
          decodedWithdrawals.set(rewardAccount, coinAmount)
        }
        withdrawals = new Withdrawals.Withdrawals({ withdrawals: decodedWithdrawals })
      }

      const auxiliaryDataHashBytes = fromA.get(7n) as Uint8Array | undefined
      const auxiliaryDataHash = auxiliaryDataHashBytes
        ? yield* ParseResult.decode(AuxiliaryDataHash.BytesSchema)(auxiliaryDataHashBytes)
        : undefined
      const validityIntervalStart = fromA.get(8n) as bigint | undefined
      const mintData = fromA.get(9n) as ReadonlyMap<Uint8Array, ReadonlyMap<Uint8Array, bigint>> | undefined
      const mint = mintData ? yield* ParseResult.decode(Mint.FromCDDL)(mintData) : undefined
      const scriptDataHashBytes = fromA.get(11n) as Uint8Array | undefined
      const scriptDataHash = scriptDataHashBytes ? yield* ParseResult.decode(ScriptDataHash.FromBytes)(scriptDataHashBytes) : undefined

      const collateralInputsArray = fromA.get(13n) as Array<any> | undefined
      const collateralInputs = collateralInputsArray
        ? ((yield* Eff.all(
            collateralInputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined

      const requiredSignersArray = fromA.get(14n) as Array<Uint8Array> | undefined
      const requiredSigners = requiredSignersArray
        ? ((yield* Eff.all(
            requiredSignersArray.map((signer) => ParseResult.decode(KeyHash.FromBytes)(signer))
          )) as NonEmptyArray<KeyHash.KeyHash>)
        : undefined

      const networkIdBigInt = fromA.get(15n) as bigint | undefined
      const networkId = networkIdBigInt ? NetworkId.make(Number(networkIdBigInt)) : undefined
      const collateralReturnData = fromA.get(16n) as any
      const collateralReturn = collateralReturnData
        ? yield* ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(collateralReturnData)
        : undefined
      const totalCollateral = fromA.get(17n) as bigint | undefined

      const referenceInputsArray = fromA.get(18n) as Array<any> | undefined
      const referenceInputs = referenceInputsArray
        ? ((yield* Eff.all(
            referenceInputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined
      const votingProceduresData = fromA.get(19n) as any
      const votingProcedures = votingProceduresData ? yield* ParseResult.decode(VotingProcedures.FromCDDL)(votingProceduresData) : undefined
      const proposalProceduresData = fromA.get(20n) as any
      const proposalProcedures = proposalProceduresData
        ? yield* ParseResult.decode(ProposalProcedures.FromCDDL)(proposalProceduresData)
        : undefined
      const currentTreasuryValue = fromA.get(21n) as bigint | undefined
      const donation = fromA.get(22n) as bigint | undefined

      return new TransactionBody({
        inputs,
        outputs,
        fee,
        ttl,
        certificates,
        withdrawals,
        auxiliaryDataHash,
        validityIntervalStart,
        mint,
        scriptDataHash,
        collateralInputs,
        requiredSigners,
        networkId,
        collateralReturn,
        totalCollateral,
        referenceInputs,
        votingProcedures,
        proposalProcedures,
        currentTreasuryValue,
        donation
      })
    })
})

/**
 * CBOR bytes transformation schema for TransactionBody.
 * Transforms between CBOR bytes and TransactionBody using Conway CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromBytes(options), FromCDDL).annotations({
    identifier: "TransactionBody.FromCBORBytes",
    title: "TransactionBody from CBOR bytes",
    description: "Decode TransactionBody from CBOR-encoded bytes using Conway CDDL specification"
  })

/**
 * CBOR hex transformation schema for TransactionBody.
 * Transforms between CBOR hex string and TransactionBody using Conway CDDL specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(CBOR.FromHex(options), FromCDDL).annotations({
    identifier: "TransactionBody.FromCBORHex",
    title: "TransactionBody from CBOR hex",
    description: "Decode TransactionBody from CBOR-encoded hex string using Conway CDDL specification"
  })

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Decode a TransactionBody from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (
  bytes: Uint8Array,
  options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
) => Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Decode a TransactionBody from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode a TransactionBody to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (
  transactionBody: TransactionBody,
  options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
) => Eff.runSync(Effect.toCBORBytes(transactionBody, options))

/**
 * Encode a TransactionBody to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (
  transactionBody: TransactionBody,
  options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
) => Eff.runSync(Effect.toCBORHex(transactionBody, options))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Decode a TransactionBody from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<TransactionBody, TransactionBodyError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionBodyError({
            message: "Failed to decode TransactionBody from CBOR bytes",
            cause
          })
      )
    )

  /**
   * Decode a TransactionBody from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<TransactionBody, TransactionBodyError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionBodyError({
            message: "Failed to decode TransactionBody from CBOR hex",
            cause
          })
      )
    )

  /**
   * Encode a TransactionBody to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    transactionBody: TransactionBody,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, TransactionBodyError> =>
    Schema.encode(FromCBORBytes(options))(transactionBody).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionBodyError({
            message: "Failed to encode TransactionBody to CBOR bytes",
            cause
          })
      )
    )

  /**
   * Encode a TransactionBody to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    transactionBody: TransactionBody,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, TransactionBodyError> =>
    Schema.encode(FromCBORHex(options))(transactionBody).pipe(
      Eff.mapError(
        (cause) =>
          new TransactionBodyError({
            message: "Failed to encode TransactionBody to CBOR hex",
            cause
          })
      )
    )
}
