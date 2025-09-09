import { Data, Effect as Eff, Schema } from "effect"

import type * as AddressEras from "../core/AddressEras.js"
import * as Coin from "../core/Coin.js"
import * as PlutusData from "../core/Data.js"
import type * as DatumOption from "../core/DatumOption.js"
import type * as MultiAsset from "../core/MultiAsset.js"
import type * as ScriptRef from "../core/ScriptRef.js"
import * as TransactionOutput from "../core/TransactionOutput.js"
import * as Value from "../core/Value.js"
import { hashPlutusData } from "../utils/Hash.js"
import * as MinAda from "./utils/MinAda.js"

/**
 * Error class for OutputBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class OutputBuilderError extends Data.TaggedError("OutputBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Result of building a single transaction output with optional communication datum.
 * Communication datum is the full datum that gets included in witness while
 * only its hash goes in the output itself.
 *
 * @since 2.0.0
 * @category model
 */
export class SingleOutputBuilderResult extends Schema.Class<SingleOutputBuilderResult>("SingleOutputBuilderResult")({
  output: TransactionOutput.TransactionOutput,
  communicationDatum: Schema.optional(PlutusData.DataSchema)
}) {
  /**
   * Create a new SingleOutputBuilderResult with just an output.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(output: TransactionOutput.TransactionOutput): SingleOutputBuilderResult {
    return new SingleOutputBuilderResult({
      output,
      communicationDatum: undefined
    })
  }
}

/**
 * Builder for creating transaction outputs - first stage for setting address, datum, and script reference.
 * This builder follows a two-stage pattern where basic fields are set first, then amount is set in the second stage.
 *
 * @since 2.0.0
 * @category builders
 */
export class TransactionOutputBuilder {
  private address?: AddressEras.AddressEras
  private datum?: DatumOption.DatumOption
  private communicationDatum?: PlutusData.Data
  private scriptRef?: ScriptRef.ScriptRef

  /**
   * Create a new TransactionOutputBuilder.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(): TransactionOutputBuilder {
    return new TransactionOutputBuilder()
  }

  /**
   * Set the address for the transaction output.
   *
   * @since 2.0.0
   * @category setters
   */
  withAddress(address: AddressEras.AddressEras): TransactionOutputBuilder {
    this.address = address
    return this
  }

  /**
   * Set a communication datum. This is a datum where the hash goes in the output
   * but the full datum is included in the transaction witness.
   *
   * @since 2.0.0
   * @category setters
   */
  withCommunicationData(datum: PlutusData.Data): TransactionOutputBuilder {
    this.datum = hashPlutusData(datum)
    this.communicationDatum = datum
    return this
  }

  /**
   * Set the datum option directly (hash or inline datum).
   *
   * @since 2.0.0
   * @category setters
   */
  withData(datum: DatumOption.DatumOption): TransactionOutputBuilder {
    this.datum = datum
    this.communicationDatum = undefined
    return this
  }

  /**
   * Set the reference script for the transaction output.
   *
   * @since 2.0.0
   * @category setters
   */
  withReferenceScript(scriptRef: ScriptRef.ScriptRef): TransactionOutputBuilder {
    this.scriptRef = scriptRef
    return this
  }

  /**
   * Move to the next stage of building where amount is set.
   *
   * @since 2.0.0
   * @category transitions
   */
  next(): Eff.Effect<TransactionOutputAmountBuilder, OutputBuilderError> {
    if (!this.address) {
      return Eff.fail(
        new OutputBuilderError({
          message: "Address missing - call withAddress() before next()"
        })
      )
    }

    return Eff.succeed(
      new TransactionOutputAmountBuilder(this.address, this.datum, this.scriptRef, this.communicationDatum)
    )
  }
}

/**
 * Builder for creating transaction outputs - second stage for setting the amount/value.
 * This stage handles the more complex logic around minimum ADA requirements.
 *
 * @since 2.0.0
 * @category builders
 */
export class TransactionOutputAmountBuilder {
  private amount?: Value.Value

  constructor(
    private readonly address: AddressEras.AddressEras,
    private readonly datum?: DatumOption.DatumOption,
    private readonly scriptRef?: ScriptRef.ScriptRef,
    private readonly communicationDatum?: PlutusData.Data
  ) {}

  /**
   * Set the value directly. Can be Coin or Value with assets.
   *
   * @since 2.0.0
   * @category setters
   */
  withValue(amount: Value.Value): TransactionOutputAmountBuilder {
    this.amount = amount
    return this
  }

  /**
   * Set value from coin amount.
   *
   * @since 2.0.0
   * @category setters
   */
  withCoin(coin: Coin.Coin): TransactionOutputAmountBuilder {
    this.amount = Value.onlyCoin(coin)
    return this
  }

  /**
   * Set the assets and calculate minimum required ADA automatically.
   * This ensures the output meets the minimum ADA requirement based on the UTXO size.
   * Based on CML Rust implementation algorithm.
   *
   * @since 2.0.0
   * @category setters
   */
  withAssetAndMinRequiredCoin(
    multiasset: MultiAsset.MultiAsset,
    coinsPerUtxoByte: Coin.Coin
  ): Eff.Effect<TransactionOutputAmountBuilder, OutputBuilderError> {
    return Eff.gen(
      function* (this: TransactionOutputAmountBuilder) {
        // Create a temporary output with zero ADA to get minimum possible size
        const tempOutput = TransactionOutput.makeBabbage({
          address: this.address as any, // TODO: Fix address type validation
          amount: Value.withAssets(Coin.make(0n), multiasset),
          datumOption: this.datum,
          scriptRef: this.scriptRef
        })

        // Calculate minimum possible coin requirement
        const minPossibleCoin = yield* Eff.mapError(
          MinAda.minAdaRequired(tempOutput, coinsPerUtxoByte),
          (cause) =>
            new OutputBuilderError({
              message: "Failed to calculate minimum ADA requirement",
              cause
            })
        )

        // Create test output with calculated minimum to double-check
        const checkOutput = TransactionOutput.makeBabbage({
          address: this.address as any,
          amount: Value.withAssets(minPossibleCoin, multiasset),
          datumOption: this.datum,
          scriptRef: this.scriptRef
        })

        // Recalculate to ensure accuracy (matches Rust implementation)
        const requiredCoin = yield* Eff.mapError(
          MinAda.minAdaRequired(checkOutput, coinsPerUtxoByte),
          (cause) =>
            new OutputBuilderError({
              message: "Failed to recalculate minimum ADA requirement",
              cause
            })
        )

        // Set the final value with the correctly calculated minimum ADA
        this.amount = Value.withAssets(requiredCoin, multiasset)
        return this
      }.bind(this)
    )
  }

  /**
   * Build the final transaction output result.
   *
   * @since 2.0.0
   * @category builders
   */
  build(): Eff.Effect<SingleOutputBuilderResult, OutputBuilderError> {
    if (!this.amount) {
      return Eff.fail(
        new OutputBuilderError({
          message: "Amount missing - call withValue(), withCoin(), or withAssetAndMinRequiredCoin() before build()"
        })
      )
    }

    // Use BabbageTransactionOutput for full feature support
    // Note: In real implementation, should validate address type first
    const output = TransactionOutput.makeBabbage({
      address: this.address as any, // TODO: Add proper address type validation
      amount: this.amount,
      datumOption: this.datum,
      scriptRef: this.scriptRef
    })

    return Eff.succeed(
      new SingleOutputBuilderResult({
        output,
        communicationDatum: this.communicationDatum
      })
    )
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
export namespace OutputBuilderEffect {
  /**
   * Create a new TransactionOutputBuilder using Effect error handling.
   *
   * @since 2.0.0
   * @category constructors
   */
  export const newOutputBuilder = (): Eff.Effect<TransactionOutputBuilder, never> =>
    Eff.succeed(TransactionOutputBuilder.new())

  /**
   * Create a SingleOutputBuilderResult from just an output using Effect error handling.
   *
   * @since 2.0.0
   * @category constructors
   */
  export const newSingleResult = (
    output: TransactionOutput.TransactionOutput
  ): Eff.Effect<SingleOutputBuilderResult, never> => Eff.succeed(SingleOutputBuilderResult.new(output))
}

// ============================================================================
// Root Namespace Functions (Sync API)
// ============================================================================

/**
 * Create a new TransactionOutputBuilder.
 *
 * @since 2.0.0
 * @category constructors
 */
export const newOutputBuilder = (): TransactionOutputBuilder => TransactionOutputBuilder.new()

/**
 * Create a SingleOutputBuilderResult from just an output.
 *
 * @since 2.0.0
 * @category constructors
 */
export const newSingleResult = (output: TransactionOutput.TransactionOutput): SingleOutputBuilderResult =>
  SingleOutputBuilderResult.new(output)
