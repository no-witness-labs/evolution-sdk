import { Data, Either as E, FastCheck, ParseResult, Schema } from "effect"
import type { NonEmptyArray } from "effect/Array"

import * as Anchor from "./Anchor.js"
import * as AuxiliaryDataHash from "./AuxiliaryDataHash.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Certificate from "./Certificate.js"
import * as Coin from "./Coin.js"
import * as Function from "./Function.js"
import * as GovernanceAction from "./GovernanceAction.js"
import * as KeyHash from "./KeyHash.js"
import * as Mint from "./Mint.js"
import * as NetworkId from "./NetworkId.js"
import * as PositiveCoin from "./PositiveCoin.js"
import * as ProposalProcedure from "./ProposalProcedure.js"
import * as ProposalProcedures from "./ProposalProcedures.js"
import * as RewardAccount from "./RewardAccount.js"
import * as ScriptDataHash from "./ScriptDataHash.js"
import * as TransactionInput from "./TransactionInput.js"
import * as TransactionOutput from "./TransactionOutput.js"
import * as VotingProcedures from "./VotingProcedures.js"
import * as Withdrawals from "./Withdrawals.js"

/**
 * TransactionBody
 *
 * ```
 * transaction_body =
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
}) {
  toString(): string {
    const fields: Array<string> = []

    // Required fields
    fields.push(`inputs: [${this.inputs.join(", ")}]`)
    fields.push(`outputs: [${this.outputs.join(", ")}]`)
    fields.push(`fee: ${this.fee}`)

    // Optional fields (only show if present)
    if (this.ttl !== undefined) fields.push(`ttl: ${this.ttl}`)
    if (this.certificates !== undefined) fields.push(`certificates: [${this.certificates.join(", ")}]`)
    if (this.withdrawals !== undefined) fields.push(`withdrawals: ${this.withdrawals}`)
    if (this.auxiliaryDataHash !== undefined) fields.push(`auxiliaryDataHash: ${this.auxiliaryDataHash}`)
    if (this.validityIntervalStart !== undefined) fields.push(`validityIntervalStart: ${this.validityIntervalStart}`)
    if (this.mint !== undefined) fields.push(`mint: ${this.mint}`)
    if (this.scriptDataHash !== undefined) fields.push(`scriptDataHash: ${this.scriptDataHash}`)
    if (this.collateralInputs !== undefined) fields.push(`collateralInputs: [${this.collateralInputs.join(", ")}]`)
    if (this.requiredSigners !== undefined) fields.push(`requiredSigners: [${this.requiredSigners.join(", ")}]`)
    if (this.networkId !== undefined) fields.push(`networkId: ${this.networkId}`)
    if (this.collateralReturn !== undefined) fields.push(`collateralReturn: ${this.collateralReturn}`)
    if (this.totalCollateral !== undefined) fields.push(`totalCollateral: ${this.totalCollateral}`)
    if (this.referenceInputs !== undefined) fields.push(`referenceInputs: [${this.referenceInputs.join(", ")}]`)
    if (this.votingProcedures !== undefined) fields.push(`votingProcedures: ${this.votingProcedures}`)
    if (this.proposalProcedures !== undefined) fields.push(`proposalProcedures: ${this.proposalProcedures}`)
    if (this.currentTreasuryValue !== undefined) fields.push(`currentTreasuryValue: ${this.currentTreasuryValue}`)
    if (this.donation !== undefined) fields.push(`donation: ${this.donation}`)

    return `TransactionBody { ${fields.join(", ")} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

export const make = (...args: ConstructorParameters<typeof TransactionBody>) => new TransactionBody(...args)

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

// Pre-bind hot ParseResult helpers
const encodeTxInput = ParseResult.encodeEither(TransactionInput.FromCDDL)
const decodeTxInput = ParseResult.decodeEither(TransactionInput.FromCDDL)
const encodeTxOutput = ParseResult.encodeEither(TransactionOutput.FromCDDL)
const decodeTxOutput = ParseResult.decodeEither(TransactionOutput.FromCDDL)
const encodeCertificate = ParseResult.encodeEither(Certificate.FromCDDL)
const decodeCertificate = ParseResult.decodeEither(Certificate.FromCDDL)
const encodeMint = ParseResult.encodeEither(Mint.FromCDDL)
const decodeMint = ParseResult.decodeEither(Mint.FromCDDL)
const encodeVotingProcedures = ParseResult.encodeEither(VotingProcedures.FromCDDL)
const decodeVotingProcedures = ParseResult.decodeEither(VotingProcedures.FromCDDL)
const encodeProposalProcedure = ParseResult.encodeEither(ProposalProcedure.FromCDDL)
const decodeProposalProcedure = ParseResult.decodeEither(ProposalProcedure.FromCDDL)
const encodeRewardAccountBytes = ParseResult.encodeEither(RewardAccount.FromBytes)
const decodeRewardAccountBytes = ParseResult.decodeEither(RewardAccount.FromBytes)
const decodeAuxiliaryDataHash = ParseResult.decodeEither(AuxiliaryDataHash.BytesSchema)
const decodeScriptDataHash = ParseResult.decodeEither(ScriptDataHash.FromBytes)
const decodeKeyHash = ParseResult.decodeEither(KeyHash.FromBytes)

/**
 * CDDL schema for TransactionBody struct structure.
 *
 * Maps the TransactionBody fields to their CDDL spec.
 * Uses Struct with proper CBOR tags for sets (tag 258)
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
  20: Schema.optional(CBOR.tag(258, Schema.Array(ProposalProcedure.CDDLSchema))), // proposal_procedures (nonempty_set) - optional
  21: Schema.optional(CBOR.Integer), // coin (current_treasury_value) - optional
  22: Schema.optional(CBOR.Integer) // positive_coin (donation) - optional
})

type CDDLSchema = typeof CDDLSchema.Type

export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(TransactionBody), {
  strict: true,
  encode: (toA) =>
    E.gen(function* () {
      const record = {} as any

      // Required fields
      // 0: inputs - always tagged as set
      const inputsLen = toA.inputs.length
      const inputsArr = new Array(inputsLen)
      for (let i = 0; i < inputsLen; i++) {
        inputsArr[i] = yield* encodeTxInput(toA.inputs[i])
      }
      record[0] = CBOR.Tag.make({ tag: 258, value: inputsArr }, { disableValidation: true })

      // 1: outputs
      const outputsLen = toA.outputs.length
      const outputsArr = new Array(outputsLen)
      for (let i = 0; i < outputsLen; i++) {
        outputsArr[i] = yield* encodeTxOutput(toA.outputs[i])
      }
      record[1] = outputsArr

      // 2: fee
      record[2] = toA.fee

      // Optional fields (assign directly when present)
      if (toA.ttl !== undefined) record[3] = toA.ttl

      if (toA.certificates) {
        const len = toA.certificates.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* encodeCertificate(toA.certificates[i])
        }
        record[4] = arr
      }

      if (toA.withdrawals) {
        const map = new Map<Uint8Array, bigint>()
        for (const [rewardAccount, coin] of toA.withdrawals.withdrawals.entries()) {
          const accountBytes = yield* encodeRewardAccountBytes(rewardAccount)
          map.set(accountBytes, coin)
        }
        record[5] = map
      }

      if (toA.auxiliaryDataHash) record[7] = toA.auxiliaryDataHash.bytes

      if (toA.validityIntervalStart !== undefined) record[8] = toA.validityIntervalStart

      if (toA.mint) record[9] = yield* encodeMint(toA.mint)

      if (toA.scriptDataHash) record[11] = toA.scriptDataHash.hash

      if (toA.collateralInputs) {
        const len = toA.collateralInputs.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* encodeTxInput(toA.collateralInputs[i])
        }
        record[13] = CBOR.Tag.make({ tag: 258, value: arr }, { disableValidation: true })
      }

      if (toA.requiredSigners) {
        record[14] = toA.requiredSigners.map((signer) => signer.hash)
      }

      if (toA.networkId !== undefined) record[15] = BigInt(toA.networkId)

      if (toA.collateralReturn) {
        record[16] = yield* encodeTxOutput(toA.collateralReturn)
      }

      if (toA.totalCollateral !== undefined) record[17] = toA.totalCollateral

      if (toA.referenceInputs) {
        const len = toA.referenceInputs.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* encodeTxInput(toA.referenceInputs[i])
        }
        record[18] = CBOR.Tag.make({ tag: 258, value: arr }, { disableValidation: true })
      }

      if (toA.votingProcedures) record[19] = yield* encodeVotingProcedures(toA.votingProcedures)

      if (toA.proposalProcedures && toA.proposalProcedures.procedures.length > 0) {
        const len = toA.proposalProcedures.procedures.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* encodeProposalProcedure(toA.proposalProcedures.procedures[i])
        }
        record[20] = CBOR.Tag.make({ tag: 258, value: arr }, { disableValidation: true })
      }

      if (toA.currentTreasuryValue !== undefined) record[21] = toA.currentTreasuryValue

      if (toA.donation !== undefined) record[22] = toA.donation

      return record as CDDLSchema
    }),
  decode: (fromA) =>
    E.gen(function* () {
      // Required fields - access as record properties
      const inputsTag = fromA[0] // CBOR.Tag 258
      const inputsArray = inputsTag.value
      const inputsLen = inputsArray.length
      const inputs = new Array(inputsLen)
      for (let i = 0; i < inputsLen; i++) {
        inputs[i] = yield* decodeTxInput(inputsArray[i])
      }

      const outputsArray = fromA[1]
      const outputsLen = outputsArray.length
      const outputs = new Array(outputsLen)
      for (let i = 0; i < outputsLen; i++) {
        outputs[i] = yield* decodeTxOutput(outputsArray[i])
      }
      const fee = fromA[2]

      // Optional fields - access as record properties
      const ttl = fromA[3]

      const certificatesArray = fromA[4]
      let certificates: NonEmptyArray<Certificate.Certificate> | undefined
      if (certificatesArray) {
        const len = certificatesArray.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* decodeCertificate(certificatesArray[i])
        }
        certificates = arr as NonEmptyArray<Certificate.Certificate>
      }

      let withdrawals: Withdrawals.Withdrawals | undefined
      const withdrawalsMap = fromA[5]
      if (withdrawalsMap) {
        const decodedWithdrawals = new Map<RewardAccount.RewardAccount, Coin.Coin>()
        for (const [accountBytes, coinAmount] of withdrawalsMap.entries()) {
          const rewardAccount = yield* decodeRewardAccountBytes(accountBytes)
          decodedWithdrawals.set(rewardAccount, coinAmount)
        }
        withdrawals = new Withdrawals.Withdrawals({ withdrawals: decodedWithdrawals })
      }

      const auxiliaryDataHashBytes = fromA[7]
      const auxiliaryDataHash = auxiliaryDataHashBytes
        ? yield* decodeAuxiliaryDataHash(auxiliaryDataHashBytes)
        : undefined
      const validityIntervalStart = fromA[8]
      const mintData = fromA[9]
      const mint = mintData ? yield* decodeMint(mintData) : undefined
      const scriptDataHashBytes = fromA[11]
      const scriptDataHash = scriptDataHashBytes ? yield* decodeScriptDataHash(scriptDataHashBytes) : undefined

      const collateralInputsTag = fromA[13] // CBOR.Tag 258
      const collateralInputsArray = collateralInputsTag ? collateralInputsTag.value : undefined
      let collateralInputs: NonEmptyArray<TransactionInput.TransactionInput> | undefined
      if (collateralInputsArray) {
        const len = collateralInputsArray.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* decodeTxInput(collateralInputsArray[i])
        }
        collateralInputs = arr as NonEmptyArray<TransactionInput.TransactionInput>
      }

      const requiredSignersArray = fromA[14]
      let requiredSigners: NonEmptyArray<KeyHash.KeyHash> | undefined
      if (requiredSignersArray) {
        const len = requiredSignersArray.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* decodeKeyHash(requiredSignersArray[i])
        }
        requiredSigners = arr as NonEmptyArray<KeyHash.KeyHash>
      }

      const networkIdBigInt = fromA[15]
      const networkId = networkIdBigInt ? NetworkId.make(Number(networkIdBigInt)) : undefined
      const collateralReturnData = fromA[16]
      const collateralReturn = collateralReturnData ? yield* decodeTxOutput(collateralReturnData) : undefined
      const totalCollateral = fromA[17]

      const referenceInputsTag = fromA[18] // CBOR.Tag 258
      const referenceInputsArray = referenceInputsTag ? referenceInputsTag.value : undefined
      let referenceInputs: NonEmptyArray<TransactionInput.TransactionInput> | undefined
      if (referenceInputsArray) {
        const len = referenceInputsArray.length
        const arr = new Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = yield* decodeTxInput(referenceInputsArray[i])
        }
        referenceInputs = arr as NonEmptyArray<TransactionInput.TransactionInput>
      }
      const votingProceduresData = fromA[19]
      const votingProcedures = votingProceduresData ? yield* decodeVotingProcedures(votingProceduresData) : undefined
      const proposalProceduresTag = fromA[20]
      const proposalProceduresArray = proposalProceduresTag
        ? (proposalProceduresTag.value as ReadonlyArray<typeof ProposalProcedure.CDDLSchema.Type>)
        : undefined
      const proposalProcedures = proposalProceduresArray
        ? new ProposalProcedures.ProposalProcedures({
            procedures: yield* E.all(proposalProceduresArray.map((pp) => decodeProposalProcedure(pp)))
          })
        : undefined
      const currentTreasuryValue = fromA[21]
      const donation = fromA[22]

      return new TransactionBody(
        {
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
        },
        { disableValidation: true }
      )
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

export const isTransactionBody = Schema.is(TransactionBody)

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse a TransactionBody from CBOR bytes.
 * Default options use STRUCT_FRIENDLY_OPTIONS for better readability.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  TransactionBodyError,
  "TransactionBody.fromCBORBytes"
)

/**
 * Parse a TransactionBody from CBOR hex string.
 * Default options use STRUCT_FRIENDLY_OPTIONS for better readability.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  TransactionBodyError,
  "TransactionBody.fromCBORHex",
  CBOR.STRUCT_FRIENDLY_OPTIONS
)

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a TransactionBody to CBOR bytes.
 * Default options use STRUCT_FRIENDLY_OPTIONS for better readability.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  TransactionBodyError,
  "TransactionBody.toCBORBytes",
  CBOR.STRUCT_FRIENDLY_OPTIONS
)

/**
 * Convert a TransactionBody to CBOR hex string.
 * Default options use STRUCT_FRIENDLY_OPTIONS for better readability.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  TransactionBodyError,
  "TransactionBody.toCBORHex",
  CBOR.STRUCT_FRIENDLY_OPTIONS
)

// ============================================================================
// Either Namespace - Either-based Error Handling
// ============================================================================

/**
 * Either-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category either
 */
export namespace Either {
  export const fromCBORBytes = Function.makeCBORDecodeEither(
    FromCDDL,
    TransactionBodyError,
    CBOR.STRUCT_FRIENDLY_OPTIONS
  )
  export const fromCBORHex = Function.makeCBORDecodeHexEither(
    FromCDDL,
    TransactionBodyError,
    CBOR.STRUCT_FRIENDLY_OPTIONS
  )
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, TransactionBodyError, CBOR.STRUCT_FRIENDLY_OPTIONS)
  export const toCBORHex = Function.makeCBOREncodeHexEither(
    FromCDDL,
    TransactionBodyError,
    CBOR.STRUCT_FRIENDLY_OPTIONS
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
export const arbitrary: FastCheck.Arbitrary<TransactionBody> =
  // First, generate core fields
  FastCheck.record({
    inputs: FastCheck.uniqueArray(TransactionInput.arbitrary, {
      minLength: 1,
      maxLength: 5,
      selector: (i) => `${Bytes.toHexUnsafe(i.transactionId.hash)}:${i.index.toString()}`
    }),
    outputs: FastCheck.array(TransactionOutput.arbitrary(), { minLength: 1, maxLength: 5 }),
    fee: Coin.arbitrary,
    networkId: FastCheck.option(FastCheck.integer({ min: 0, max: 1 }).map(NetworkId.make), { nil: undefined }),
    // Optional extra (added first for iterative hardening)
    auxiliaryDataHash: FastCheck.option(AuxiliaryDataHash.arbitrary, { nil: undefined }),
    // Second optional extra: donation (positive_coin)
    donation: FastCheck.option(PositiveCoin.arbitrary, { nil: undefined }),
    // Third optional extra: script_data_hash
    scriptDataHash: FastCheck.option(ScriptDataHash.arbitrary, { nil: undefined }),
    // Fourth optional extra: mint
    mint: FastCheck.option(Mint.arbitrary, { nil: undefined }),
    // Fifth optional extra: current_treasury_value (coin)
    currentTreasuryValue: FastCheck.option(Coin.arbitrary, { nil: undefined }),
    // Sixth optional extra: required_signers (nonempty unique KeyHash[])
    requiredSigners: FastCheck.option(
      FastCheck.uniqueArray(KeyHash.arbitrary, {
        minLength: 1,
        maxLength: 5,
        selector: (k) => Bytes.toHexUnsafe(k.hash)
      }),
      { nil: undefined }
    ),
    // Seventh optional extra: withdrawals
    withdrawals: FastCheck.option(Withdrawals.arbitrary, { nil: undefined }),
    // Eighth optional extra: certificates
    certificates: FastCheck.option(FastCheck.array(Certificate.arbitrary, { minLength: 1, maxLength: 5 }), {
      nil: undefined
    }),
    // Ninth optional extra: collateral_inputs (nonempty unique set)
    collateralInputs: FastCheck.option(
      FastCheck.uniqueArray(TransactionInput.arbitrary, {
        minLength: 1,
        maxLength: 3,
        selector: (i) => `${Bytes.toHexUnsafe(i.transactionId.hash)}:${i.index.toString()}`
      }),
      { nil: undefined }
    ),
    // Tenth optional extra: reference_inputs (nonempty unique set)
    referenceInputs: FastCheck.option(
      FastCheck.uniqueArray(TransactionInput.arbitrary, {
        minLength: 1,
        maxLength: 3,
        selector: (i) => `${Bytes.toHexUnsafe(i.transactionId.hash)}:${i.index.toString()}`
      }),
      { nil: undefined }
    ),
    // Eleventh optional extra: collateral_return (transaction_output)
    collateralReturn: FastCheck.option(TransactionOutput.arbitrary(), { nil: undefined }),
    // Twelfth optional extra: total_collateral (coin)
    totalCollateral: FastCheck.option(Coin.arbitrary, { nil: undefined }),
    // Thirteenth optional extra: voting_procedures
    votingProcedures: FastCheck.option(VotingProcedures.arbitrary, { nil: undefined }),
    // Fourteenth optional extra: proposal_procedures (nonempty set) with non-null anchors per CML parity
    proposalProcedures: FastCheck.option(
      FastCheck.record({
        procedures: FastCheck.array(
          FastCheck.record({
            deposit: Coin.arbitrary,
            rewardAccount: RewardAccount.arbitrary,
            governanceAction: GovernanceAction.arbitrary,
            anchor: Anchor.arbitrary
          }).map((params) => ProposalProcedure.make(params)),
          { minLength: 1, maxLength: 3 }
        )
      }).map((params) => new ProposalProcedures.ProposalProcedures(params)),
      { nil: undefined }
    )
  })
    // Then, stitch in ttl/vis with the invariant ttl ≥ vis when both present
    .chain((base) => {
      const visArb = FastCheck.bigInt({ min: 0n, max: 10_000_000n })
      const ttlArb = FastCheck.bigInt({ min: 0n, max: 10_000_000n })

      const both = FastCheck.tuple(visArb, ttlArb).map(([vis, ttl]) => {
        // Ensure ttl >= vis
        return ttl < vis ? { ttl: vis, validityIntervalStart: ttl } : { ttl, validityIntervalStart: vis }
      })

      const onlyVis = visArb.map((vis) => ({ ttl: undefined as bigint | undefined, validityIntervalStart: vis }))
      const onlyTtl = ttlArb.map((ttl) => ({ ttl, validityIntervalStart: undefined as bigint | undefined }))
      const none = FastCheck.constant({
        ttl: undefined as bigint | undefined,
        validityIntervalStart: undefined as bigint | undefined
      })

      return FastCheck.oneof({ arbitrary: both, weight: 2 }, onlyVis, onlyTtl, none).map(
        ({ ttl, validityIntervalStart }) => ({
          ...base,
          ttl,
          validityIntervalStart
        })
      )
    })
    .map((props) => {
      return new TransactionBody({
        inputs: props.inputs,
        outputs: props.outputs,
        fee: props.fee,
        ttl: props.ttl,
        certificates: props.certificates as NonEmptyArray<Certificate.Certificate> | undefined,
        withdrawals: props.withdrawals,
        auxiliaryDataHash: props.auxiliaryDataHash,
        validityIntervalStart: props.validityIntervalStart,
        mint: props.mint,
        scriptDataHash: props.scriptDataHash,
        collateralInputs: props.collateralInputs as NonEmptyArray<TransactionInput.TransactionInput> | undefined,
        requiredSigners: props.requiredSigners as NonEmptyArray<KeyHash.KeyHash> | undefined,
        networkId: props.networkId,
        collateralReturn: props.collateralReturn,
        totalCollateral: props.totalCollateral,
        referenceInputs: props.referenceInputs as NonEmptyArray<TransactionInput.TransactionInput> | undefined,
        votingProcedures: props.votingProcedures,
        proposalProcedures: props.proposalProcedures,
        currentTreasuryValue: props.currentTreasuryValue,
        donation: props.donation
      })
    })
