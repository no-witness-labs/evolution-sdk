import { Option } from "effect"

import * as AssetName from "../core/AssetName.js"
import * as Coin from "../core/Coin.js"
import * as MultiAsset from "../core/MultiAsset.js"
import * as CorePolicyId from "../core/PolicyId.js"
import * as PositiveCoin from "../core/PositiveCoin.js"
import * as CoreValue from "../core/Value.js"
import * as Unit from "./Unit.js"

export interface Assets {
  lovelace: bigint
  [key: string]: bigint
}

/**
 * Sort assets according to CBOR canonical ordering rules (RFC 7049 section 3.9).
 * Lovelace comes first, then assets sorted by policy ID length, then lexicographically.
 */
export const sortCanonical = (assets: Assets): Assets => {
  const entries = Object.entries(assets).sort(([aUnit], [bUnit]) => {
    const a = Unit.fromUnit(aUnit)
    const b = Unit.fromUnit(bUnit)

    // Compare policy lengths
    // NOTE: all policies have the same length, because they must be 28 bytes
    // but because Lovelace is in the assets we must compare the length
    if (a.policyId.length !== b.policyId.length) {
      return a.policyId.length - b.policyId.length
    }

    // If policy IDs are the same, compare asset names length
    if (a.policyId === b.policyId) {
      const aAssetName = a.assetName || ""
      const bAssetName = b.assetName || ""
      if (aAssetName.length !== bAssetName.length) {
        return aAssetName.length - bAssetName.length
      }
      // If asset names have same length, compare them lexicographically
      return aAssetName.localeCompare(bAssetName)
    }

    // If policy IDs have same length but are different, compare them lexicographically
    return a.policyId.localeCompare(b.policyId)
  })

  return Object.fromEntries(entries) as Assets
}

/**
 * Multiply all asset amounts by a factor.
 * Useful for calculating fees, rewards, or scaling asset amounts.
 */
export const multiply = (assets: Assets, factor: bigint): Assets => {
  const result: Record<string, bigint> = { lovelace: assets.lovelace * factor }

  for (const [unit, amount] of Object.entries(assets)) {
    if (unit !== "lovelace") {
      result[unit] = amount * factor
    }
  }

  return result as Assets
}

/**
 * Negate all asset amounts.
 * Useful for calculating what needs to be subtracted or for representing debts.
 */
export const negate = (assets: Assets): Assets => {
  const result: Record<string, bigint> = { lovelace: -assets.lovelace }

  for (const [unit, amount] of Object.entries(assets)) {
    if (unit !== "lovelace") {
      result[unit] = -amount
    }
  }

  return result as Assets
}

// Constructor and factory functions
export const make = (lovelace: bigint, tokens: Record<string, bigint> = {}): Assets => ({
  lovelace,
  ...tokens
})

export const fromLovelace = (lovelace: bigint): Assets => ({
  lovelace
})

export const empty = (): Assets => ({
  lovelace: 0n
})

// Utility functions
export const add = (a: Assets, b: Assets): Assets => {
  const result: Record<string, bigint> = { lovelace: a.lovelace + b.lovelace }

  // Add all tokens from a
  for (const [unit, amount] of Object.entries(a)) {
    if (unit !== "lovelace") {
      result[unit] = amount
    }
  }

  // Add all tokens from b
  for (const [unit, amount] of Object.entries(b)) {
    if (unit !== "lovelace") {
      result[unit] = (result[unit] || 0n) + amount
    }
  }

  return result as Assets
}

export const subtract = (a: Assets, b: Assets): Assets => {
  const result: Record<string, bigint> = { lovelace: a.lovelace - b.lovelace }

  // Add all tokens from a
  for (const [unit, amount] of Object.entries(a)) {
    if (unit !== "lovelace") {
      result[unit] = amount
    }
  }

  // Subtract all tokens from b
  for (const [unit, amount] of Object.entries(b)) {
    if (unit !== "lovelace") {
      const current = result[unit] || 0n
      const newAmount = current - amount
      if (newAmount > 0n) {
        result[unit] = newAmount
      } else if (newAmount === 0n) {
        delete result[unit]
      } else {
        result[unit] = newAmount // Allow negative for validation purposes
      }
    }
  }

  return result as Assets
}

export const merge = (...assets: Array<Assets>): Assets => assets.reduce(add, empty())

export const filter = (assets: Assets, predicate: (unit: string, amount: bigint) => boolean): Assets => {
  const result: Record<string, bigint> = { lovelace: assets.lovelace }

  for (const [unit, amount] of Object.entries(assets)) {
    if (unit !== "lovelace" && predicate(unit, amount)) {
      result[unit] = amount
    }
  }

  return result as Assets
}

// Conversion and validation helpers
export const getAsset = (assets: Assets, unit: string): bigint => {
  if (unit === "lovelace") return assets.lovelace
  return assets[unit] || 0n
}

export const hasAsset = (assets: Assets, unit: string): boolean => {
  if (unit === "lovelace") return assets.lovelace > 0n
  return unit in assets && assets[unit] > 0n
}

export const isEmpty = (assets: Assets): boolean => {
  if (assets.lovelace > 0n) return false
  for (const [unit, amount] of Object.entries(assets)) {
    if (unit !== "lovelace" && amount > 0n) return false
  }
  return true
}

export const getUnits = (assets: Assets): Array<string> => {
  const units = ["lovelace"]
  for (const unit of Object.keys(assets)) {
    if (unit !== "lovelace") units.push(unit)
  }
  return units
}

/**
 * Convert a core Value to the Assets interface format.
 */
export const valueToAssets = (value: CoreValue.Value): Assets => {
  const assets: Assets = { lovelace: 0n }

  // Add ADA (lovelace) from the Value
  const adaAmount = CoreValue.getAda(value)
  assets.lovelace = BigInt(adaAmount.toString())

  // Get MultiAsset if it exists
  const multiAsset = CoreValue.getAssets(value)
  if (Option.isSome(multiAsset)) {
    // Iterate through all policy IDs
    const policyIds = MultiAsset.getPolicyIds(multiAsset.value)

    for (const policyId of policyIds) {
      const policyIdStr = CorePolicyId.toHex(policyId)
      const assetsByPolicy = MultiAsset.getAssetsByPolicy(multiAsset.value, policyId)

      for (const [assetName, amount] of assetsByPolicy) {
        const assetNameStr = AssetName.toHex(assetName)
        const unit = policyIdStr + assetNameStr
        assets[unit] = BigInt(amount.toString())
      }
    }
  }

  return assets
}

/**
 * Convert Assets interface format to a core Value.
 */
export const assetsToValue = (assets: Assets): CoreValue.Value => {
  // Extract ADA amount (lovelace key)
  const adaAmount = assets.lovelace || BigInt(0)
  const coin = Coin.make(adaAmount)

  // Filter out ADA to get only native assets
  const nativeAssets = Object.entries(assets).filter(([unit]) => unit !== "lovelace")

  if (nativeAssets.length === 0) {
    // Only ADA, return OnlyCoin
    return CoreValue.onlyCoin(coin)
  }

  // Build MultiAsset
  const multiAssetMap = MultiAsset.empty()

  for (const [unit, amount] of nativeAssets) {
    const { assetName, policyId } = Unit.fromUnit(unit)
    const positiveAmount = PositiveCoin.make(amount)

    // Create core policy ID from hex string
    const corePolicyId = CorePolicyId.fromHex(policyId)
    // Create core asset name from hex string (or empty if undefined)
    const coreAssetName = AssetName.fromHex(assetName || "")

    // Get or create policy map
    let policyMap = multiAssetMap.get(corePolicyId)
    if (!policyMap) {
      policyMap = new Map()
      multiAssetMap.set(corePolicyId, policyMap)
    }

    // Add asset to policy map
    policyMap.set(coreAssetName, positiveAmount)
  }

  // Create the MultiAsset using the make function
  const multiAsset = multiAssetMap as MultiAsset.MultiAsset

  return CoreValue.withAssets(coin, multiAsset)
}
