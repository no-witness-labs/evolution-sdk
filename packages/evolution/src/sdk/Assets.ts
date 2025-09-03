export interface Assets {
  lovelace: bigint
  [key: string]: bigint
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

export const isValid = (assets: Assets): boolean => {
  try {
    // Check if it has required lovelace field and all values are bigint
    if (typeof assets.lovelace !== "bigint") return false
    for (const [unit, amount] of Object.entries(assets)) {
      if (unit !== "lovelace" && typeof amount !== "bigint") return false
    }
    return true
  } catch {
    return false
  }
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

// String representation
export const toString = (assets: Assets): string => {
  const tokens = []
  tokens.push(`lovelace: ${assets.lovelace.toString()}`)

  for (const [unit, amount] of Object.entries(assets)) {
    if (unit !== "lovelace") {
      tokens.push(`${unit}: ${amount.toString()}`)
    }
  }

  return `{ ${tokens.join(", ")} }`
}
