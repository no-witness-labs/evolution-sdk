import { Data, Effect as Eff } from "effect"

import type * as Coin from "../../core/Coin.js"
import * as TransactionOutput from "../../core/TransactionOutput.js"
import * as Value from "../../core/Value.js"

/**
 * Error class for MinAda calculation related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MinAdaError extends Data.TaggedError("MinAdaError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Calculate the CBOR encoding size for a coin value.
 * Based on CBOR specification for unsigned integers.
 * This matches the `fit_sz` function in CML Rust implementation.
 *
 * @since 2.0.0
 * @category utils
 */
const getCoinCborSize = (coin: Coin.Coin): number => {
  const value = coin

  // CBOR unsigned integer encoding:
  // - 0-23: direct encoding (1 byte total including type)
  // - 24-255: 1 byte + 1 byte value = 2 bytes
  // - 256-65535: 1 byte + 2 byte value = 3 bytes
  // - 65536-4294967295: 1 byte + 4 byte value = 5 bytes
  // - Above: 1 byte + 8 byte value = 9 bytes
  if (value <= 23n) return 1
  if (value <= 255n) return 2
  if (value <= 65535n) return 3
  if (value <= 4294967295n) return 5
  return 9
}

/**
 * Calculate minimum ADA required for a transaction output.
 * Direct port of the Rust implementation from cardano-multiplatform-lib.
 *
 * Algorithm matches CML's min_ada.rs:
 * 1. Calculate CBOR size of the output
 * 2. Add 160-byte constant overhead (from Babbage spec figure 5)
 * 3. Use iterative approach to handle coin size changes affecting CBOR encoding
 * 4. Multiply total size by coins_per_utxo_byte protocol parameter
 *
 * @since 2.0.0
 * @category calculations
 */
export const minAdaRequired = (
  output: TransactionOutput.TransactionOutput,
  coinsPerUtxoByte: Coin.Coin
): Eff.Effect<Coin.Coin, MinAdaError> =>
  Eff.gen(function* () {
    try {
      // Get CBOR size of the output (matches output.to_cbor_bytes().len())
      const outputCborBytes = yield* Eff.try({
        try: () => TransactionOutput.toCBORBytes(output),
        catch: (cause) =>
          new MinAdaError({
            message: "Failed to serialize output to CBOR",
            cause
          })
      })

      const outputSize = outputCborBytes.length

      // Constant from figure 5 in Babbage spec meant to represent the size the input in a UTXO
      const constantOverhead = 160

      // Extract current coin amount from the output
      const currentCoin = Value.getAda(output.amount)

      // How many bytes the Coin part of the Value will take (matches old_coin_size calculation)
      const oldCoinSize = getCoinCborSize(currentCoin)

      // Most recent estimate of the size in bytes to include the minimum ADA value
      let latestSize = oldCoinSize

      // We calculate min ada in a loop because every time we increase the min ADA,
      // it may increase the CBOR size in bytes
      let tentativeMinAda: Coin.Coin

      while (true) {
        const sizeDiff = latestSize - oldCoinSize

        // Calculate tentative minimum ADA
        const totalSizeForCalc = outputSize + constantOverhead + sizeDiff

        // Check for overflow (matches the Rust checked_mul logic)
        if (totalSizeForCalc < 0 || totalSizeForCalc > Number.MAX_SAFE_INTEGER) {
          return yield* Eff.fail(
            new MinAdaError({
              message: "Integer overflow in minimum ADA calculation"
            })
          )
        }

        tentativeMinAda = BigInt(totalSizeForCalc) * coinsPerUtxoByte

        // Calculate new coin CBOR size (matches new_coin_size calculation)
        const newCoinSize = getCoinCborSize(tentativeMinAda)

        // Check if we've converged
        const isDone = latestSize === newCoinSize
        latestSize = newCoinSize

        if (isDone) {
          break
        }
      }

      // How many bytes the size changed from including the minimum ADA value
      const sizeChange = latestSize - oldCoinSize

      // Final calculation with converged size
      const finalTotalSize = outputSize + constantOverhead + sizeChange

      // Check for overflow again
      if (finalTotalSize < 0 || finalTotalSize > Number.MAX_SAFE_INTEGER) {
        return yield* Eff.fail(
          new MinAdaError({
            message: "Integer overflow in final minimum ADA calculation"
          })
        )
      }

      const adjustedMinAda = BigInt(finalTotalSize) * coinsPerUtxoByte

      return adjustedMinAda
    } catch (error) {
      return yield* Eff.fail(
        new MinAdaError({
          message: "Unexpected error in minimum ADA calculation",
          cause: error
        })
      )
    }
  })

/**
 * Calculate minimum ADA required for a transaction output (sync version).
 *
 * @since 2.0.0
 * @category calculations
 */
export const minAdaRequiredSync = (
  output: TransactionOutput.TransactionOutput,
  coinsPerUtxoByte: Coin.Coin
): Coin.Coin => Eff.runSync(minAdaRequired(output, coinsPerUtxoByte))

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace MinAdaEffect {
  /**
   * Calculate minimum ADA required for a transaction output using Effect error handling.
   *
   * @since 2.0.0
   * @category calculations
   */
  export const minAdaRequired = (
    output: TransactionOutput.TransactionOutput,
    coinsPerUtxoByte: Coin.Coin
  ): Eff.Effect<Coin.Coin, MinAdaError> => minAdaRequired(output, coinsPerUtxoByte)
}
