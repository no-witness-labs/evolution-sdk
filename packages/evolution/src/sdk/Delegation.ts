/**
 * Delegation types and utilities for handling Cardano stake delegation.
 *
 * This module provides types and functions for working with stake delegation
 * information, including pool assignments and reward balances.
 */

export interface Delegation {
  readonly poolId: string | undefined
  readonly rewards: bigint
}

// Constructors
export const make = (poolId: string | undefined, rewards: bigint): Delegation => ({
  poolId,
  rewards
})

export const empty = (): Delegation => make(undefined, 0n)

// Type guards
export const isDelegated = (delegation: Delegation): boolean => delegation.poolId !== undefined

export const hasRewards = (delegation: Delegation): boolean => delegation.rewards > 0n

// Transformations
export const addRewards = (delegation: Delegation, additionalRewards: bigint): Delegation => 
  make(delegation.poolId, delegation.rewards + additionalRewards)

export const subtractRewards = (delegation: Delegation, rewardsToSubtract: bigint): Delegation => {
  const newRewards = delegation.rewards - rewardsToSubtract
  return make(delegation.poolId, newRewards >= 0n ? newRewards : 0n)
}

// Comparisons
export const equals = (a: Delegation, b: Delegation): boolean => 
  a.poolId === b.poolId && a.rewards === b.rewards

export const hasSamePool = (a: Delegation, b: Delegation): boolean => 
  a.poolId === b.poolId

export const compareByRewards = (a: Delegation, b: Delegation): number => {
  const diff = a.rewards - b.rewards
  return diff > 0n ? 1 : diff < 0n ? -1 : 0
}

export const compareByPoolId = (a: Delegation, b: Delegation): number => {
  if (a.poolId === b.poolId) return 0
  if (a.poolId === undefined) return -1
  if (b.poolId === undefined) return 1
  return a.poolId.localeCompare(b.poolId)
}

// Array utilities
export const sortByRewards = (delegations: Array<Delegation>, ascending = true): Array<Delegation> =>
  [...delegations].sort((a, b) => {
    const comparison = compareByRewards(a, b)
    return ascending ? comparison : -comparison
  })

export const sortByPoolId = (delegations: Array<Delegation>): Array<Delegation> =>
  [...delegations].sort(compareByPoolId)

export const filterDelegated = (delegations: Array<Delegation>): Array<Delegation> =>
  delegations.filter(isDelegated)

export const filterUndelegated = (delegations: Array<Delegation>): Array<Delegation> =>
  delegations.filter(d => !isDelegated(d))

export const filterWithRewards = (delegations: Array<Delegation>): Array<Delegation> =>
  delegations.filter(hasRewards)

export const filterByPool = (delegations: Array<Delegation>, poolId: string): Array<Delegation> =>
  delegations.filter(d => d.poolId === poolId)

export const getTotalRewards = (delegations: Array<Delegation>): bigint =>
  delegations.reduce((total, delegation) => total + delegation.rewards, 0n)

export const getUniquePoolIds = (delegations: Array<Delegation>): Array<string> =>
  [...new Set(delegations.map(d => d.poolId).filter((id): id is string => id !== undefined))]

export const groupByPool = (delegations: Array<Delegation>): Record<string, Array<Delegation>> =>
  delegations.reduce((groups, delegation) => {
    const poolId = delegation.poolId || "undelegated"
    if (!groups[poolId]) groups[poolId] = []
    groups[poolId].push(delegation)
    return groups
  }, {} as Record<string, Array<Delegation>>)

// Statistical utilities
export const getAverageRewards = (delegations: Array<Delegation>): bigint => {
  if (delegations.length === 0) return 0n
  return getTotalRewards(delegations) / BigInt(delegations.length)
}

export const getMaxRewards = (delegations: Array<Delegation>): bigint =>
  delegations.reduce((max, delegation) => 
    delegation.rewards > max ? delegation.rewards : max, 0n)

export const getMinRewards = (delegations: Array<Delegation>): bigint =>
  delegations.reduce((min, delegation) => 
    delegation.rewards < min ? delegation.rewards : min, 
    delegations[0]?.rewards || 0n)

// Set operations
export const unique = (delegations: Array<Delegation>): Array<Delegation> =>
  delegations.filter((delegation, index, self) => 
    self.findIndex(d => equals(delegation, d)) === index)

export const find = (delegations: Array<Delegation>, predicate: (delegation: Delegation) => boolean): Delegation | undefined =>
  delegations.find(predicate)

export const findByPool = (delegations: Array<Delegation>, poolId: string): Delegation | undefined =>
  find(delegations, d => d.poolId === poolId)

export const contains = (delegations: Array<Delegation>, target: Delegation): boolean =>
  delegations.some(delegation => equals(delegation, target))
