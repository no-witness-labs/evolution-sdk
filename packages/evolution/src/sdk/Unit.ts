import * as Label from "./Label.js"
import type * as PolicyId from "./PolicyId.js"

export type Unit = string

export interface UnitDetails {
  policyId: PolicyId.PolicyId
  assetName: string | undefined
  name: string | undefined
  label: number | undefined
}

/**
 * Parse a unit string into its components.
 * Returns policy ID, asset name (full hex after policy),
 * name (without label) and label if applicable.
 * name will be returned in Hex.
 */
export const fromUnit = (unit: Unit): UnitDetails => {
  if (unit === "lovelace") {
    return {
      policyId: "",
      assetName: undefined,
      name: undefined,
      label: undefined
    }
  }

  const policyId = unit.slice(0, 56)
  const assetName = unit.slice(56) || undefined

  // Try to parse label from the first 8 characters after policy ID
  const label = assetName && assetName.length >= 8 ? Label.fromLabel(assetName.slice(0, 8)) : undefined

  const name = (() => {
    if (!assetName) return undefined
    // If we found a valid label, the name starts after the 8-character label
    const hexName = Number.isInteger(label) ? assetName.slice(8) : assetName
    return hexName || undefined
  })()

  return { policyId, assetName, name, label }
}

/**
 * Create a unit string from policy ID, name, and optional label.
 */
export const toUnit = (policyId: PolicyId.PolicyId, name?: string | undefined, label?: number | undefined): Unit => {
  // For lovelace (empty policy ID), return "lovelace"
  if (!policyId || policyId === "") {
    return "lovelace"
  }

  // Encode label if provided
  const hexLabel = Number.isInteger(label) ? Label.toLabel(label!) : ""
  const n = name ? name : ""

  return policyId + hexLabel + n
}
