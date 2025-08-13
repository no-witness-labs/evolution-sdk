import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"
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
 * CDDL schema for TransactionBody struct structure.
 *
 * Maps the TransactionBody fields to their CDDL field numbers according to Conway spec.
 * Uses Struct with proper CBOR tags for sets (tag 258) for CML compatibility.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Struct({
  0: CBOR.tag(258, Schema.Array(TransactionInput.CDDLSchema)), // set<transaction_input> - required
  1: Schema.Array(TransactionOutput.CDDLSchema), // [* transaction_output] - required
  2: CBOR.Integer, // coin (fee) - required
  3: Schema.optional(CBOR.Integer), // slot_no (ttl) - optional
  4: Schema.optional(Schema.Array(Certificate.CDDLSchema)), // certificates - optional
  5: Schema.optional(Withdrawals.CDDLSchema), // withdrawals - optional
  7: Schema.optional(CBOR.ByteArray), // auxiliary_data_hash - optional
  8: Schema.optional(CBOR.Integer), // slot_no (validity_interval_start) - optional
  9: Schema.optional(Schema.encodedSchema(Mint.CDDLSchema)), // mint - optional
  11: Schema.optional(CBOR.ByteArray), // script_data_hash - optional
  13: Schema.optional(CBOR.tag(258, Schema.Array(TransactionInput.CDDLSchema))), // nonempty_set<transaction_input> (collateral_inputs) - optional
  14: Schema.optional(Schema.Array(CBOR.ByteArray)), // required_signers - optional
  15: Schema.optional(CBOR.Integer), // network_id - optional
  16: Schema.optional(TransactionOutput.CDDLSchema), // transaction_output (collateral_return) - optional
  17: Schema.optional(CBOR.Integer), // coin (total_collateral) - optional
  18: Schema.optional(CBOR.tag(258, Schema.Array(TransactionInput.CDDLSchema))), // nonempty_set<transaction_input> (reference_inputs) - optional
  19: Schema.optional(Schema.encodedSchema(VotingProcedures.CDDLSchema)), // voting_procedures - optional
  20: Schema.optional(Schema.encodedSchema(ProposalProcedures.CDDLSchema)), // proposal_procedures - optional
  21: Schema.optional(CBOR.Integer), // coin (current_treasury_value) - optional
  22: Schema.optional(CBOR.Integer) // positive_coin (donation) - optional
})

type CDDLSchema = typeof CDDLSchema.Type

export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionBody), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const record = {} as any

      // Required fields
      // 0: inputs - always tagged as set
      const inputs = yield* Eff.all(toA.inputs.map((input) => ParseResult.encode(TransactionInput.FromCDDL)(input)))
      record[0] = CBOR.Tag.make({ tag: 258, value: inputs })

      // 1: outputs
      const outputs = yield* Eff.all(
        toA.outputs.map((output) => ParseResult.encode(TransactionOutput.FromTransactionOutputCDDLSchema)(output))
      )
      record[1] = outputs

      // 2: fee
      record[2] = toA.fee

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
      const mint = toA.mint ? yield* ParseResult.encode(Mint.FromCDDL)(toA.mint) : undefined
      const scriptDataHash = toA.scriptDataHash
        ? yield* ParseResult.encode(ScriptDataHash.FromBytes)(toA.scriptDataHash)
        : undefined
      const collateralInputs = toA.collateralInputs
        ? yield* Eff.all(toA.collateralInputs.map((input) => ParseResult.encode(TransactionInput.FromCDDL)(input)))
        : undefined
      const requiredSigners = toA.requiredSigners
        ? yield* Eff.all(toA.requiredSigners.map((signer) => ParseResult.encode(Hash28.FromBytes)(signer)))
        : undefined
      const networkId = toA.networkId !== undefined ? BigInt(toA.networkId) : undefined
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
      // Optional fields (only set if defined)
      if (ttl !== undefined) record[3] = ttl
      if (certificates !== undefined) record[4] = certificates
      if (withdrawals !== undefined) record[5] = withdrawals
      if (auxiliaryDataHash !== undefined) record[7] = auxiliaryDataHash
      if (validityIntervalStart !== undefined) record[8] = validityIntervalStart
      if (mint !== undefined) record[9] = mint
      if (scriptDataHash !== undefined) record[11] = scriptDataHash
      if (collateralInputs !== undefined) record[13] = CBOR.Tag.make({ tag: 258, value: collateralInputs })
      if (requiredSigners !== undefined) record[14] = requiredSigners
      if (networkId !== undefined) record[15] = networkId
      if (collateralReturn !== undefined) record[16] = collateralReturn
      if (totalCollateral !== undefined) record[17] = totalCollateral
      if (referenceInputs !== undefined) record[18] = CBOR.Tag.make({ tag: 258, value: referenceInputs })
      if (votingProcedures !== undefined) record[19] = votingProcedures
      if (proposalProcedures !== undefined) record[20] = proposalProcedures
      if (toA.currentTreasuryValue !== undefined) record[21] = toA.currentTreasuryValue
      if (toA.donation !== undefined) record[22] = toA.donation

      return record as CDDLSchema
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      // Required fields - access as record properties
      const inputsTag = fromA[0] // This is a CBOR.Tag with tag 258
      const inputsArray = inputsTag.value
      const inputs = yield* Eff.all(inputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input)))

      const outputsArray = fromA[1]
      const outputs = yield* Eff.all(
        outputsArray.map((output) => ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(output))
      )
      const fee = fromA[2]

      // Optional fields - access as record properties
      const ttl = fromA[3]

      const certificatesArray = fromA[4]
      const certificates = certificatesArray
        ? ((yield* Eff.all(
            certificatesArray.map((cert) => ParseResult.decode(Certificate.FromCDDL)(cert))
          )) as NonEmptyArray<Certificate.Certificate>)
        : undefined

      let withdrawals: Withdrawals.Withdrawals | undefined
      const withdrawalsMap = fromA[5]
      if (withdrawalsMap) {
        const decodedWithdrawals = new Map<RewardAccount.RewardAccount, Coin.Coin>()
        for (const [accountBytes, coinAmount] of withdrawalsMap.entries()) {
          const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(accountBytes)
          decodedWithdrawals.set(rewardAccount, coinAmount)
        }
        withdrawals = new Withdrawals.Withdrawals({ withdrawals: decodedWithdrawals })
      }

      const auxiliaryDataHashBytes = fromA[7]
      const auxiliaryDataHash = auxiliaryDataHashBytes
        ? yield* ParseResult.decode(AuxiliaryDataHash.BytesSchema)(auxiliaryDataHashBytes)
        : undefined
      const validityIntervalStart = fromA[8]
      const mintData = fromA[9]
      const mint = mintData ? yield* ParseResult.decode(Mint.FromCDDL)(mintData) : undefined
      const scriptDataHashBytes = fromA[11]
      const scriptDataHash = scriptDataHashBytes
        ? yield* ParseResult.decode(ScriptDataHash.FromBytes)(scriptDataHashBytes)
        : undefined

      const collateralInputsTag = fromA[13] // This might be a CBOR.Tag with tag 258
      const collateralInputsArray = collateralInputsTag ? collateralInputsTag.value : undefined
      const collateralInputs = collateralInputsArray
        ? ((yield* Eff.all(
            collateralInputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined

      const requiredSignersArray = fromA[14]
      const requiredSigners = requiredSignersArray
        ? ((yield* Eff.all(
            requiredSignersArray.map((signer) => ParseResult.decode(KeyHash.FromBytes)(signer))
          )) as NonEmptyArray<KeyHash.KeyHash>)
        : undefined

      const networkIdBigInt = fromA[15]
      const networkId = networkIdBigInt ? NetworkId.make(Number(networkIdBigInt)) : undefined
      const collateralReturnData = fromA[16]
      const collateralReturn = collateralReturnData
        ? yield* ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(collateralReturnData)
        : undefined
      const totalCollateral = fromA[17]

      const referenceInputsTag = fromA[18] // This might be a CBOR.Tag with tag 258
      const referenceInputsArray = referenceInputsTag ? referenceInputsTag.value : undefined
      const referenceInputs = referenceInputsArray
        ? ((yield* Eff.all(
            referenceInputsArray.map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined
      const votingProceduresData = fromA[19]
      const votingProcedures = votingProceduresData
        ? yield* ParseResult.decode(VotingProcedures.FromCDDL)(votingProceduresData)
        : undefined
      const proposalProceduresData = fromA[20]
      const proposalProcedures = proposalProceduresData
        ? yield* ParseResult.decode(ProposalProcedures.FromCDDL)(proposalProceduresData)
        : undefined
      const currentTreasuryValue = fromA[21]
      const donation = fromA[22]

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
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS) =>
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
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS) =>
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
export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS) =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Decode a TransactionBody from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS) =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode a TransactionBody to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (
  transactionBody: TransactionBody,
  options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
) => Eff.runSync(Effect.toCBORBytes(transactionBody, options))

/**
 * Encode a TransactionBody to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (
  transactionBody: TransactionBody,
  options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
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
    options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
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
    options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
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
    options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
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
    options: CBOR.CodecOptions = CBOR.STRUCT_FRIENDLY_OPTIONS
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

// ============================================================================
// FastCheck Arbitrary
// ============================================================================

/**
 * FastCheck arbitrary for generating random TransactionBody instances.
 * Used for property-based testing to generate valid test data.
 *
 * Generates basic TransactionBody instances with required fields (inputs, outputs, fee)
 * and optionally includes some other common fields.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<TransactionBody> = FastCheck.record({
  // Required fields
  inputs: FastCheck.array(TransactionInput.arbitrary, { minLength: 1, maxLength: 5 }),
  outputs: FastCheck.array(TransactionOutput.arbitrary(), { minLength: 1, maxLength: 5 }),
  fee: Coin.arbitrary,

  // Optional fields - start with some common ones
  ttl: FastCheck.option(FastCheck.bigInt({ min: 0n, max: 10000000n }), { nil: undefined }),
  validityIntervalStart: FastCheck.option(FastCheck.bigInt({ min: 0n, max: 10000000n }), { nil: undefined }),
  networkId: FastCheck.option(FastCheck.integer({ min: 0, max: 1 }).map(NetworkId.make), { nil: undefined })
}).map(
  (props) =>
    new TransactionBody({
      inputs: props.inputs,
      outputs: props.outputs,
      fee: props.fee,
      ttl: props.ttl,
      certificates: undefined,
      withdrawals: undefined,
      auxiliaryDataHash: undefined,
      validityIntervalStart: props.validityIntervalStart,
      mint: undefined,
      scriptDataHash: undefined,
      collateralInputs: undefined,
      requiredSigners: undefined,
      networkId: props.networkId,
      collateralReturn: undefined,
      totalCollateral: undefined,
      referenceInputs: undefined,
      votingProcedures: undefined,
      proposalProcedures: undefined,
      currentTreasuryValue: undefined,
      donation: undefined
    })
)
