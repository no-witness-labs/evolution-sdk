import { Data, Effect as Eff, Schema } from "effect"
import type { NonEmptyArray } from "effect/Array"

import type * as AddressEras from "../core/AddressEras.js"
import type * as AuxiliaryData from "../core/AuxiliaryData.js"
import * as Coin from "../core/Coin.js"
import * as KeyHash from "../core/KeyHash.js"
import * as Mint from "../core/Mint.js"
import type * as NetworkId from "../core/NetworkId.js"
import * as NonZeroInt64 from "../core/NonZeroInt64.js"
import * as Transaction from "../core/Transaction.js"
import * as TransactionBody from "../core/TransactionBody.js"
import * as TransactionInput from "../core/TransactionInput.js"
import * as TransactionOutput from "../core/TransactionOutput.js"
import * as TransactionWitnessSet from "../core/TransactionWitnessSet.js"
import * as Value from "../core/Value.js"
import * as Withdrawals from "../core/Withdrawals.js"
import * as Hash from "../utils/Hash.js"
import type { CertificateBuilderResult } from "./CertificateBuilder.js"
import type { InputBuilderResult } from "./InputBuilder.js"
import type { MintBuilderResult } from "./MintBuilder.js"
import { type SingleOutputBuilderResult } from "./OutputBuilder.js"
import type { ProposalBuilderResult } from "./ProposalBuilder.js"
import type { VoteBuilderResult } from "./VoteBuilder.js"
import type { WithdrawalBuilderResult } from "./WithdrawalBuilder.js"

/**
 * Error class for TxBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class TxBuilderError extends Data.TaggedError("TxBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Configuration error for missing transaction builder parameters.
 *
 * @since 2.0.0
 * @category errors
 */
export class TxBuilderConfigError extends Data.TaggedError("TxBuilderConfigError")<{
  message?: string
  missingFields?: Array<string>
}> {}

/**
 * UTXO structure for transaction inputs.
 * This matches the CIP30 interface and is useful for builders.
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionUnspentOutput extends Schema.Class<TransactionUnspentOutput>("TransactionUnspentOutput")({
  input: TransactionInput.TransactionInput,
  output: TransactionOutput.TransactionOutput
}) {
  /**
   * Create a new TransactionUnspentOutput.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(
    input: TransactionInput.TransactionInput,
    output: TransactionOutput.TransactionOutput
  ): TransactionUnspentOutput {
    return new TransactionUnspentOutput({ input, output })
  }
}

/**
 * Coin selection strategy based on CIP-2 standard.
 *
 * @since 2.0.0
 * @category model
 */
export const CoinSelectionStrategyCIP2 = Schema.Literal(
  "LargestFirst",
  "RandomImprove",
  "RandomImproveMultiAsset"
).annotations({
  identifier: "TxBuilder.CoinSelectionStrategyCIP2",
  description: "Coin selection algorithms implementing CIP-2"
})

export type CoinSelectionStrategyCIP2 = typeof CoinSelectionStrategyCIP2.Type

/**
 * Change selection algorithm for creating change outputs.
 *
 * @since 2.0.0
 * @category model
 */
export const ChangeSelectionAlgo = Schema.Literal("Default").annotations({
  identifier: "TxBuilder.ChangeSelectionAlgo",
  description: "Algorithm for creating transaction change outputs"
})

export type ChangeSelectionAlgo = typeof ChangeSelectionAlgo.Type

/**
 * Linear fee algorithm configuration.
 *
 * @since 2.0.0
 * @category model
 */
export class LinearFee extends Schema.Class<LinearFee>("LinearFee")({
  constant: Coin.Coin.annotations({
    description: "Base fee constant in lovelace"
  }),
  coefficient: Coin.Coin.annotations({
    description: "Fee coefficient per byte in lovelace"
  })
}) {}

/**
 * Ex-unit prices for script execution.
 *
 * @since 2.0.0
 * @category model
 */
export class ExUnitPrices extends Schema.Class<ExUnitPrices>("ExUnitPrices")({
  memPrice: Schema.Struct({
    numerator: Schema.BigInt,
    denominator: Schema.BigInt
  }),
  stepPrice: Schema.Struct({
    numerator: Schema.BigInt,
    denominator: Schema.BigInt
  })
}) {}

/**
 * Transaction builder configuration with protocol parameters.
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionBuilderConfig extends Schema.Class<TransactionBuilderConfig>("TransactionBuilderConfig")({
  feeAlgo: LinearFee,
  coinsPerUtxoByte: Coin.Coin,
  poolDeposit: Coin.Coin,
  keyDeposit: Coin.Coin,
  maxValueSize: Schema.Number,
  maxTxSize: Schema.Number,
  utxoCostPerWord: Schema.optional(Coin.Coin),
  exUnitPrices: Schema.optional(ExUnitPrices),
  preferPureChange: Schema.optional(Schema.Boolean)
}) {}

/**
 * Builder for creating TransactionBuilderConfig with validation.
 *
 * @since 2.0.0
 * @category builders
 */
export class TransactionBuilderConfigBuilder {
  private feeAlgo?: LinearFee
  private coinsPerUtxoByte?: Coin.Coin
  private poolDeposit?: Coin.Coin
  private keyDeposit?: Coin.Coin
  private maxValueSize?: number
  private maxTxSize?: number
  private utxoCostPerWord?: Coin.Coin
  private exUnitPrices?: ExUnitPrices
  private preferPureChange?: boolean

  /**
   * Create a new TransactionBuilderConfigBuilder.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(): TransactionBuilderConfigBuilder {
    return new TransactionBuilderConfigBuilder()
  }

  /**
   * Set the fee algorithm.
   *
   * @since 2.0.0
   * @category setters
   */
  feeAlgorithm(feeAlgo: LinearFee): TransactionBuilderConfigBuilder {
    this.feeAlgo = feeAlgo
    return this
  }

  /**
   * Set coins per UTXO byte for minimum ADA calculation.
   *
   * @since 2.0.0
   * @category setters
   */
  coinsPerUtxoWord(coins: Coin.Coin): TransactionBuilderConfigBuilder {
    this.coinsPerUtxoByte = coins
    return this
  }

  /**
   * Set pool registration deposit.
   *
   * @since 2.0.0
   * @category setters
   */
  poolDepositAmount(deposit: Coin.Coin): TransactionBuilderConfigBuilder {
    this.poolDeposit = deposit
    return this
  }

  /**
   * Set key registration deposit.
   *
   * @since 2.0.0
   * @category setters
   */
  keyDepositAmount(deposit: Coin.Coin): TransactionBuilderConfigBuilder {
    this.keyDeposit = deposit
    return this
  }

  /**
   * Set maximum value size per output.
   *
   * @since 2.0.0
   * @category setters
   */
  maxValueSizeLimit(size: number): TransactionBuilderConfigBuilder {
    this.maxValueSize = size
    return this
  }

  /**
   * Set maximum transaction size.
   *
   * @since 2.0.0
   * @category setters
   */
  maxTxSizeLimit(size: number): TransactionBuilderConfigBuilder {
    this.maxTxSize = size
    return this
  }

  /**
   * Set UTXO cost per word (legacy parameter).
   *
   * @since 2.0.0
   * @category setters
   */
  utxoCostPerWordAmount(cost: Coin.Coin): TransactionBuilderConfigBuilder {
    this.utxoCostPerWord = cost
    return this
  }

  /**
   * Set execution unit prices for script fees.
   *
   * @since 2.0.0
   * @category setters
   */
  executionUnitPrices(prices: ExUnitPrices): TransactionBuilderConfigBuilder {
    this.exUnitPrices = prices
    return this
  }

  /**
   * Set preference for pure change (no assets).
   *
   * @since 2.0.0
   * @category setters
   */
  preferPureChangeOutput(prefer: boolean): TransactionBuilderConfigBuilder {
    this.preferPureChange = prefer
    return this
  }

  /**
   * Build the configuration with validation.
   *
   * @since 2.0.0
   * @category builders
   */
  build(): Eff.Effect<TransactionBuilderConfig, TxBuilderConfigError> {
    const missingFields: Array<string> = []

    if (!this.feeAlgo) missingFields.push("feeAlgo")
    if (!this.coinsPerUtxoByte) missingFields.push("coinsPerUtxoByte")
    if (!this.poolDeposit) missingFields.push("poolDeposit")
    if (!this.keyDeposit) missingFields.push("keyDeposit")
    if (this.maxValueSize === undefined) missingFields.push("maxValueSize")
    if (this.maxTxSize === undefined) missingFields.push("maxTxSize")

    if (missingFields.length > 0) {
      return Eff.fail(
        new TxBuilderConfigError({
          message: `Missing required configuration fields: ${missingFields.join(", ")}`,
          missingFields
        })
      )
    }

    return Eff.succeed(
      new TransactionBuilderConfig({
        feeAlgo: this.feeAlgo!,
        coinsPerUtxoByte: this.coinsPerUtxoByte!,
        poolDeposit: this.poolDeposit!,
        keyDeposit: this.keyDeposit!,
        maxValueSize: this.maxValueSize!,
        maxTxSize: this.maxTxSize!,
        utxoCostPerWord: this.utxoCostPerWord,
        exUnitPrices: this.exUnitPrices,
        preferPureChange: this.preferPureChange
      })
    )
  }
}

/**
 * Result of building a signed transaction with body and witness set.
 *
 * @since 2.0.0
 * @category model
 */
export class SignedTxBuilder extends Schema.Class<SignedTxBuilder>("SignedTxBuilder")({
  body: TransactionBody.TransactionBody,
  witnessSet: TransactionWitnessSet.TransactionWitnessSet,
  auxiliaryData: Schema.optional(Schema.Any) // AuxiliaryData when available
}) {
  /**
   * Build the final transaction.
   *
   * @since 2.0.0
   * @category builders
   */
  build(): Transaction.Transaction {
    return new Transaction.Transaction({
      body: this.body,
      witnessSet: this.witnessSet,
      isValid: true,
      auxiliaryData: this.auxiliaryData
    })
  }
}

/**
 * Main transaction builder for constructing Cardano transactions.
 * Handles inputs, outputs, certificates, withdrawals, minting, fees, and witness requirements.
 *
 * @since 2.0.0
 * @category builders
 */
export class TransactionBuilder {
  private inputs: Array<InputBuilderResult> = []
  private outputs: Array<SingleOutputBuilderResult> = []
  private utxos: Array<InputBuilderResult> = []
  private referenceInputs: Array<TransactionUnspentOutput> = []
  private certificates: Array<CertificateBuilderResult> = []
  private withdrawals: Array<WithdrawalBuilderResult> = []
  private mints: Array<MintBuilderResult> = []
  private proposals: Array<ProposalBuilderResult> = []
  private votes: Array<VoteBuilderResult> = []
  private collateral: Array<InputBuilderResult> = []
  private requiredSigners: Set<string> = new Set() // Use hex representation for deduplication
  private fee?: Coin.Coin
  private ttl?: bigint
  private validityStart?: bigint
  private auxiliaryData?: AuxiliaryData.AuxiliaryData
  private networkId?: NetworkId.NetworkId

  constructor(private readonly config: TransactionBuilderConfig) {}

  /**
   * Create a new TransactionBuilder with configuration.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(config: TransactionBuilderConfig): TransactionBuilder {
    return new TransactionBuilder(config)
  }

  // ============================================================================
  // Input/Output Management
  // ============================================================================

  /**
   * Add a transaction input with witness requirements.
   *
   * @since 2.0.0
   * @category inputs
   */
  addInput(result: InputBuilderResult): Eff.Effect<void, TxBuilderError> {
    this.inputs.push(result)
    return Eff.succeed(undefined)
  }

  /**
   * Add a UTXO for coin selection.
   *
   * @since 2.0.0
   * @category inputs
   */
  addUtxo(result: InputBuilderResult): void {
    this.utxos.push(result)
  }

  /**
   * Add a reference input (read-only).
   *
   * @since 2.0.0
   * @category inputs
   */
  addReferenceInput(utxo: TransactionUnspentOutput): void {
    this.referenceInputs.push(utxo)
  }

  /**
   * Add a transaction output.
   *
   * @since 2.0.0
   * @category outputs
   */
  addOutput(result: SingleOutputBuilderResult): Eff.Effect<void, TxBuilderError> {
    // Validate output size doesn't exceed max value size
    if (this.getOutputSize(result) > this.config.maxValueSize) {
      return Eff.fail(
        new TxBuilderError({
          message: `Output exceeds max value size of ${this.config.maxValueSize} bytes`
        })
      )
    }
    this.outputs.push(result)
    return Eff.succeed(undefined)
  }

  // ============================================================================
  // Transaction Components
  // ============================================================================

  /**
   * Add a certificate.
   *
   * @since 2.0.0
   * @category components
   */
  addCert(result: CertificateBuilderResult): void {
    this.certificates.push(result)
  }

  /**
   * Add a withdrawal.
   *
   * @since 2.0.0
   * @category components
   */
  addWithdrawal(result: WithdrawalBuilderResult): void {
    this.withdrawals.push(result)
  }

  /**
   * Add a mint operation.
   *
   * @since 2.0.0
   * @category components
   */
  addMint(result: MintBuilderResult): Eff.Effect<void, TxBuilderError> {
    this.mints.push(result)
    return Eff.succeed(undefined)
  }

  /**
   * Add a governance proposal.
   *
   * @since 2.0.0
   * @category governance
   */
  addProposal(result: ProposalBuilderResult): void {
    this.proposals.push(result)
  }

  /**
   * Add a governance vote.
   *
   * @since 2.0.0
   * @category governance
   */
  addVote(result: VoteBuilderResult): void {
    this.votes.push(result)
  }

  /**
   * Add a collateral input.
   *
   * @since 2.0.0
   * @category collateral
   */
  addCollateral(result: InputBuilderResult): Eff.Effect<void, TxBuilderError> {
    this.collateral.push(result)
    return Eff.succeed(undefined)
  }

  /**
   * Add auxiliary data (metadata).
   *
   * @since 2.0.0
   * @category metadata
   */
  addAuxiliaryData(auxData: AuxiliaryData.AuxiliaryData): void {
    this.auxiliaryData = auxData
  }

  /**
   * Add a required signer.
   *
   * @since 2.0.0
   * @category signers
   */
  addRequiredSigner(keyHash: KeyHash.KeyHash): void {
    this.requiredSigners.add(KeyHash.toHex(keyHash))
  }

  // ============================================================================
  // Fee and Time Management
  // ============================================================================

  /**
   * Set the transaction fee explicitly.
   *
   * @since 2.0.0
   * @category fees
   */
  setFee(fee: Coin.Coin): void {
    this.fee = fee
  }

  /**
   * Set the time-to-live (TTL) for the transaction.
   *
   * @since 2.0.0
   * @category time
   */
  setTtl(ttl: bigint): void {
    this.ttl = ttl
  }

  /**
   * Set the validity start interval.
   *
   * @since 2.0.0
   * @category time
   */
  setValidityStartInterval(start: bigint): void {
    this.validityStart = start
  }

  /**
   * Set the network ID.
   *
   * @since 2.0.0
   * @category network
   */
  setNetworkId(networkId: NetworkId.NetworkId): void {
    this.networkId = networkId
  }

  // ============================================================================
  // Coin Selection
  // ============================================================================

  /**
   * Select UTXOs using the specified coin selection strategy.
   *
   * @since 2.0.0
   * @category selection
   */
  selectUtxos(strategy: CoinSelectionStrategyCIP2): Eff.Effect<void, TxBuilderError> {
    return Eff.gen(
      function* (this: TransactionBuilder) {
        const outputValue = this.calculateOutputValue()
        const requiredValue = Value.add(outputValue, Value.onlyCoin(this.fee || Coin.make(BigInt(0))))

        switch (strategy) {
          case "LargestFirst":
            yield* this.selectLargestFirst(requiredValue)
            break
          case "RandomImprove":
            yield* this.selectRandomImprove(requiredValue)
            break
          case "RandomImproveMultiAsset":
            yield* this.selectRandomImproveMultiAsset(requiredValue)
            break
        }
      }.bind(this)
    )
  }

  // ============================================================================
  // Building
  // ============================================================================

  /**
   * Build the final signed transaction.
   *
   * @since 2.0.0
   * @category builders
   */
  build(
    changeAlgo: ChangeSelectionAlgo,
    changeAddress: AddressEras.AddressEras
  ): Eff.Effect<SignedTxBuilder, TxBuilderError> {
    return Eff.gen(
      function* (this: TransactionBuilder) {
        // Calculate and validate balance
        yield* this.validateBalance()

        // Create change outputs if needed
        const changeOutputs = yield* this.createChangeOutputs(changeAlgo, changeAddress)

        // Build transaction body
        const body = yield* this.buildTransactionBody(changeOutputs)

        // Build witness set
        const witnessSet = yield* this.buildWitnessSet(body)

        return new SignedTxBuilder({
          body,
          witnessSet,
          auxiliaryData: this.auxiliaryData
        })
      }.bind(this)
    )
  }

  /**
   * Calculate minimum fee for the transaction.
   *
   * @since 2.0.0
   * @category fees
   */
  minFee(): Eff.Effect<Coin.Coin, TxBuilderError> {
    return Eff.gen(
      function* (this: TransactionBuilder) {
        // Estimate transaction size with fake witnesses
        const estimatedSize = yield* this.estimateTransactionSize()

        // Calculate linear fee
        const baseFee = Coin.add(this.config.feeAlgo.constant, this.config.feeAlgo.coefficient * BigInt(estimatedSize))

        // Add script execution fees if any
        const scriptFee = yield* this.calculateScriptFees()

        return Coin.add(baseFee, scriptFee)
      }.bind(this)
    )
  }

  // ============================================================================
  // Private Implementation
  // ============================================================================

  private getOutputSize(result: SingleOutputBuilderResult): number {
    // Calculate actual CBOR size of the output
    try {
      const cborBytes = TransactionOutput.toCBORBytes(result.output)
      return cborBytes.length
    } catch {
      // Fall back to conservative estimate if encoding fails
      return 200
    }
  }

  private calculateOutputValue(): Value.Value {
    return this.outputs.reduce(
      (total: Value.Value, output) => Value.add(total, output.output.amount),
      Value.onlyCoin(Coin.make(0n))
    )
  }

  private selectLargestFirst(requiredValue: Value.Value): Eff.Effect<void, TxBuilderError> {
    // Sort UTXOs by coin amount descending
    const sortedUtxos = [...this.utxos].sort((a, b) => {
      const coinA = Value.getAda(a.utxoInfo.amount)
      const coinB = Value.getAda(b.utxoInfo.amount)
      return Coin.compare(coinB, coinA) // Descending order
    })

    let selectedValue: Value.Value = Value.onlyCoin(Coin.make(0n))
    const selectedUtxos: Array<InputBuilderResult> = []

    for (const utxo of sortedUtxos) {
      selectedUtxos.push(utxo)
      selectedValue = Value.add(selectedValue, utxo.utxoInfo.amount)

      if (Value.geq(selectedValue, requiredValue)) {
        break
      }
    }

    if (!Value.geq(selectedValue, requiredValue)) {
      return Eff.fail(
        new TxBuilderError({
          message: "Insufficient funds for transaction"
        })
      )
    }

    this.inputs.push(...selectedUtxos)
    return Eff.succeed(undefined)
  }

  private selectRandomImprove(requiredValue: Value.Value): Eff.Effect<void, TxBuilderError> {
    // Simplified random improve - select randomly first, then improve
    return this.selectLargestFirst(requiredValue)
  }

  private selectRandomImproveMultiAsset(requiredValue: Value.Value): Eff.Effect<void, TxBuilderError> {
    // Simplified multi-asset random improve
    return this.selectLargestFirst(requiredValue)
  }

  private validateBalance(): Eff.Effect<void, TxBuilderError> {
    const inputValue = this.inputs.reduce(
      (total: Value.Value, input) => Value.add(total, input.utxoInfo.amount),
      Value.onlyCoin(Coin.make(0n))
    )

    const outputValue = this.calculateOutputValue()
    const feeValue = Value.onlyCoin(this.fee || Coin.make(0n))
    const requiredValue = Value.add(outputValue, feeValue)

    if (!Value.geq(inputValue, requiredValue)) {
      return Eff.fail(
        new TxBuilderError({
          message: `Insufficient balance. Required: ${requiredValue}, Available: ${inputValue}`
        })
      )
    }

    return Eff.succeed(undefined)
  }

  private createChangeOutputs(
    _algo: ChangeSelectionAlgo,
    changeAddress: AddressEras.AddressEras
  ): Eff.Effect<Array<SingleOutputBuilderResult>, TxBuilderError> {
    // Calculate change amount
    const inputValue = this.inputs.reduce(
      (total: Value.Value, input) => Value.add(total, input.utxoInfo.amount),
      Value.onlyCoin(Coin.make(0n))
    )

    const outputValue = this.calculateOutputValue()
    const feeValue = Value.onlyCoin(this.fee || Coin.make(0n))
    const changeValue = Value.subtract(inputValue, Value.add(outputValue, feeValue))

    // If no change needed, return empty array
    const changeAmount = Value.getAda(changeValue)
    if (Coin.equals(changeAmount, Coin.make(0n))) {
      return Eff.succeed([])
    }

    // Create change output
    const changeOutput = TransactionOutput.makeBabbage({
      address: changeAddress as any, // AddressEras includes reward addresses which aren't valid for outputs
      amount: changeValue,
      datumOption: undefined,
      scriptRef: undefined
    })

    return Eff.succeed([
      {
        output: changeOutput,
        communicationDatum: undefined
      }
    ])
  }

  private buildTransactionBody(
    changeOutputs: Array<SingleOutputBuilderResult>
  ): Eff.Effect<TransactionBody.TransactionBody, TxBuilderError> {
    const allOutputs = [...this.outputs, ...changeOutputs]

    return Eff.succeed(
      new TransactionBody.TransactionBody({
        inputs: this.inputs.map((r) => r.input),
        outputs: allOutputs.map((r) => r.output),
        fee: this.fee || Coin.make(0n),
        ttl: this.ttl,
        certificates: this.certificates.length > 0 ? (this.certificates.map((c) => c.cert) as any) : undefined,
        withdrawals: this.withdrawals.length > 0 ? this.buildWithdrawals() : undefined,
        auxiliaryDataHash: this.auxiliaryData ? Hash.hashAuxiliaryData(this.auxiliaryData) : undefined,
        validityIntervalStart: this.validityStart,
        mint: this.mints.length > 0 ? this.buildMint() : undefined,
        scriptDataHash: undefined, // Will be calculated when script data is available
        collateralInputs:
          this.collateral.length > 0
            ? (this.collateral.map((c) => c.input) as NonEmptyArray<TransactionInput.TransactionInput>)
            : undefined,
        requiredSigners:
          this.requiredSigners.size > 0
            ? (Array.from(this.requiredSigners).map((hex) => KeyHash.fromHex(hex)) as NonEmptyArray<KeyHash.KeyHash>)
            : undefined,
        networkId: this.networkId,
        collateralReturn: undefined, // Would be set if using script collateral
        totalCollateral: undefined, // Would be calculated based on script execution costs
        referenceInputs:
          this.referenceInputs.length > 0
            ? (this.referenceInputs.map((r) => r.input) as NonEmptyArray<TransactionInput.TransactionInput>)
            : undefined,
        votingProcedures: undefined, // Will be implemented when VotingProcedures builder is ready
        proposalProcedures: undefined, // Will be implemented when ProposalProcedures builder is ready
        currentTreasuryValue: undefined,
        donation: undefined
      })
    )
  }

  private buildWithdrawals(): Withdrawals.Withdrawals | undefined {
    if (this.withdrawals.length === 0) {
      return undefined
    }

    // Build withdrawals map from withdrawal builder results
    const withdrawalMap = new Map()
    for (const withdrawal of this.withdrawals) {
      withdrawalMap.set(withdrawal.address, withdrawal.amount)
    }

    return new Withdrawals.Withdrawals({ withdrawals: withdrawalMap })
  }

  private buildMint(): Mint.Mint | undefined {
    if (this.mints.length === 0) {
      return undefined
    }

    // Combine all mint operations into a single Mint
    const mintEntries: Array<[any, any]> = []

    for (const mintResult of this.mints) {
      // Convert assets map to NonZeroInt64 values
      const assetEntries: Array<[any, any]> = []

      for (const [assetName, amount] of mintResult.assets) {
        // Only add non-zero amounts
        if (amount !== 0n) {
          try {
            const nonZeroAmount = NonZeroInt64.make(amount.toString())
            assetEntries.push([assetName, nonZeroAmount])
          } catch {
            // Skip if amount is zero or invalid
            continue
          }
        }
      }

      if (assetEntries.length > 0) {
        mintEntries.push([mintResult.policyId, new Map(assetEntries)])
      }
    }

    return mintEntries.length > 0 ? Mint.fromEntries(mintEntries) : undefined
  }

  private buildWitnessSet(
    _body: TransactionBody.TransactionBody
  ): Eff.Effect<TransactionWitnessSet.TransactionWitnessSet, TxBuilderError> {
    // This would normally collect all witness data from inputs, mints, certificates, etc.
    // For now, return an empty witness set - actual witnesses would be added during signing
    return Eff.succeed(
      new TransactionWitnessSet.TransactionWitnessSet({
        vkeyWitnesses: undefined,
        nativeScripts: undefined,
        bootstrapWitnesses: undefined,
        plutusV1Scripts: undefined,
        plutusData: undefined,
        redeemers: undefined,
        plutusV2Scripts: undefined,
        plutusV3Scripts: undefined
      })
    )
  }

  private estimateTransactionSize(): Eff.Effect<number, TxBuilderError> {
    // Conservative estimate based on typical transaction sizes
    // Base size + input size + output size + witness size
    const baseSize = 1500
    const inputSize = this.inputs.length * 150
    const outputSize = this.outputs.length * 200
    const witnessSize = this.requiredSigners.size * 100

    return Eff.succeed(baseSize + inputSize + outputSize + witnessSize)
  }

  private calculateScriptFees(): Eff.Effect<Coin.Coin, TxBuilderError> {
    // If no ExUnitPrices are configured, no script fees
    if (!this.config.exUnitPrices) {
      return Eff.succeed(Coin.make(0n))
    }

    // For now, return 0 fees - proper implementation would need to:
    // 1. Collect ExUnits from all redeemers (inputs, mints, certificates, withdrawals)
    // 2. Sum up the memory and steps
    // 3. Calculate fee using the price model
    // This requires the redeemer information to be properly tracked
    // which would come from the script execution results

    return Eff.succeed(Coin.make(0n))
  }
}

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 * Returns Effect<Success, Error> for composable error handling.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Create a new TransactionBuilderConfigBuilder using Effect error handling.
   *
   * @since 2.0.0
   * @category constructors
   */
  export const newConfigBuilder = (): Eff.Effect<TransactionBuilderConfigBuilder, never> =>
    Eff.succeed(TransactionBuilderConfigBuilder.new())

  /**
   * Create a new TransactionBuilder using Effect error handling.
   *
   * @since 2.0.0
   * @category constructors
   */
  export const newBuilder = (config: TransactionBuilderConfig): Eff.Effect<TransactionBuilder, never> =>
    Eff.succeed(TransactionBuilder.new(config))

  /**
   * Create a new TransactionUnspentOutput using Effect error handling.
   *
   * @since 2.0.0
   * @category constructors
   */
  export const newUtxo = (
    input: TransactionInput.TransactionInput,
    output: TransactionOutput.TransactionOutput
  ): Eff.Effect<TransactionUnspentOutput, never> => Eff.succeed(TransactionUnspentOutput.new(input, output))
}

// ============================================================================
// Root Namespace Functions (Sync API)
// ============================================================================

/**
 * Create a new TransactionBuilderConfigBuilder.
 *
 * @since 2.0.0
 * @category constructors
 */
export const newConfigBuilder = (): TransactionBuilderConfigBuilder => TransactionBuilderConfigBuilder.new()

/**
 * Create a new TransactionBuilder.
 *
 * @since 2.0.0
 * @category constructors
 */
export const newBuilder = (config: TransactionBuilderConfig): TransactionBuilder => TransactionBuilder.new(config)

/**
 * Create a new TransactionUnspentOutput.
 *
 * @since 2.0.0
 * @category constructors
 */
export const newUtxo = (
  input: TransactionInput.TransactionInput,
  output: TransactionOutput.TransactionOutput
): TransactionUnspentOutput => TransactionUnspentOutput.new(input, output)
