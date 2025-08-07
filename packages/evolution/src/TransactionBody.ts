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
  inputs: Schema.NonEmptyArray(TransactionInput.TransactionInput), // 0
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
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Struct({
  0: Schema.Array(Schema.encodedSchema(TransactionInput.CDDLSchema)), // set<transaction_input>
  1: Schema.Array(Schema.encodedSchema(TransactionOutput.CDDLSchema)), // [* transaction_output]
  2: CBOR.Integer, // coin
  3: Schema.optional(CBOR.Integer), // slot_no (ttl)
  4: Schema.optional(Schema.Array(Schema.encodedSchema(Certificate.CDDLSchema))), // certificates
  5: Schema.optional(Withdrawals.CDDLSchema), // withdrawals
  7: Schema.optional(CBOR.ByteArray), // auxiliary_data_hash
  8: Schema.optional(CBOR.Integer), // slot_no (validity_interval_start)
  9: Schema.optional(Schema.encodedSchema(Mint.CDDLSchema)), // mint
  11: Schema.optional(CBOR.ByteArray), // script_data_hash
  13: Schema.optional(Schema.Array(TransactionInput.CDDLSchema)), // nonempty_set<transaction_input>
  14: Schema.optional(Schema.Array(CBOR.ByteArray)), // required_signers
  15: Schema.optional(CBOR.Integer), // network_id
  16: Schema.optional(Schema.encodedSchema(TransactionOutput.CDDLSchema)), // transaction_output
  17: Schema.optional(CBOR.Integer), // coin
  18: Schema.optional(Schema.Array(Schema.encodedSchema(TransactionInput.CDDLSchema))), // nonempty_set<transaction_input>
  19: Schema.optional(Schema.encodedSchema(VotingProcedures.CDDLSchema)), // voting_procedures
  20: Schema.optional(Schema.encodedSchema(ProposalProcedures.CDDLSchema)), // proposal_procedures
  21: Schema.optional(CBOR.Integer), // coin
  22: Schema.optional(CBOR.Integer) // positive_coin
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
      const mint = toA.mint ? yield* ParseResult.encode(Mint.MintCDDLSchema)(toA.mint) : undefined
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

      return {
        0: inputs,
        1: outputs,
        2: fee,
        3: ttl,
        4: certificates,
        5: withdrawals,
        7: auxiliaryDataHash,
        8: validityIntervalStart,
        9: mint,
        11: scriptDataHash,
        13: collateralInputs,
        14: requiredSigners,
        15: networkId,
        16: collateralReturn,
        17: totalCollateral,
        18: referenceInputs,
        19: votingProcedures,
        20: proposalProcedures,
        21: currentTreasuryValue,
        22: donation
      }
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      // Required fields
      const inputs = (yield* Eff.all(
        fromA[0].map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
      )) as NonEmptyArray<TransactionInput.TransactionInput>

      const outputs = yield* Eff.all(
        fromA[1].map((output) => ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(output))
      )
      const fee = fromA[2]

      // Optional fields
      const ttl = fromA[3]

      const certificates = fromA[4]
        ? ((yield* Eff.all(
            fromA[4].map((cert) => ParseResult.decode(Certificate.FromCDDL)(cert))
          )) as NonEmptyArray<Certificate.Certificate>)
        : undefined

      let withdrawals: Withdrawals.Withdrawals | undefined
      if (fromA[5]) {
        const decodedWithdrawals = new Map<RewardAccount.RewardAccount, Coin.Coin>()
        for (const [accountBytes, coinAmount] of fromA[5].entries()) {
          const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(accountBytes)
          decodedWithdrawals.set(rewardAccount, coinAmount)
        }
        withdrawals = new Withdrawals.Withdrawals({ withdrawals: decodedWithdrawals })
      }

      const auxiliaryDataHash = fromA[7]
        ? yield* ParseResult.decode(AuxiliaryDataHash.BytesSchema)(fromA[7])
        : undefined
      const validityIntervalStart = fromA[8]
      const mint = fromA[9] ? yield* ParseResult.decode(Mint.MintCDDLSchema)(fromA[9]) : undefined
      const scriptDataHash = fromA[11] ? yield* ParseResult.decode(ScriptDataHash.FromBytes)(fromA[11]) : undefined

      const collateralInputs = fromA[13]
        ? ((yield* Eff.all(
            fromA[13].map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined

      const requiredSigners = fromA[14]
        ? ((yield* Eff.all(
            fromA[14].map((signer) => ParseResult.decode(KeyHash.FromBytes)(signer))
          )) as NonEmptyArray<KeyHash.KeyHash>)
        : undefined

      const networkId = fromA[15] ? NetworkId.make(Number(fromA[15])) : undefined
      const collateralReturn = fromA[16]
        ? yield* ParseResult.decode(TransactionOutput.FromTransactionOutputCDDLSchema)(fromA[16])
        : undefined
      const totalCollateral = fromA[17]

      const referenceInputs = fromA[18]
        ? ((yield* Eff.all(
            fromA[18].map((input) => ParseResult.decode(TransactionInput.FromCDDL)(input))
          )) as NonEmptyArray<TransactionInput.TransactionInput>)
        : undefined
      const votingProcedures = fromA[19] ? yield* ParseResult.decode(VotingProcedures.FromCDDL)(fromA[19]) : undefined
      const proposalProcedures = fromA[20]
        ? yield* ParseResult.decode(ProposalProcedures.FromCDDL)(fromA[20])
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
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options),
    FromCDDL
  ).annotations({
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
  Schema.compose(
    CBOR.FromHex(options),
    FromCDDL
  ).annotations({
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
export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): TransactionBody =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Decode a TransactionBody from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): TransactionBody =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode a TransactionBody to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (transactionBody: TransactionBody, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(transactionBody, options))

/**
 * Encode a TransactionBody to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (transactionBody: TransactionBody, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): string =>
  Eff.runSync(Effect.toCBORHex(transactionBody, options))

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
  export const fromCBORBytes = (bytes: Uint8Array, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Eff.Effect<TransactionBody, TransactionBodyError> =>
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
  export const fromCBORHex = (hex: string, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Eff.Effect<TransactionBody, TransactionBodyError> =>
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
  export const toCBORBytes = (transactionBody: TransactionBody, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Eff.Effect<Uint8Array, TransactionBodyError> =>
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
  export const toCBORHex = (transactionBody: TransactionBody, options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS): Eff.Effect<string, TransactionBodyError> =>
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
