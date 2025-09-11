/**
 * OutRef types and utilities for handling Cardano transaction output references.
 *
 * This module provides types and functions for working with transaction output references,
 * which uniquely identify UTxOs by their transaction hash and output index.
 */

export interface OutRef {
  txHash: string
  outputIndex: number
}

// Constructors
export const make = (txHash: string, outputIndex: number): OutRef => ({
  txHash,
  outputIndex
})

export const fromTxHashAndIndex = (txHash: string, outputIndex: number): OutRef => make(txHash, outputIndex)

// Comparisons
export const equals = (a: OutRef, b: OutRef): boolean => a.txHash === b.txHash && a.outputIndex === b.outputIndex

export const compare = (a: OutRef, b: OutRef): number => {
  const txHashComparison = a.txHash.localeCompare(b.txHash)
  if (txHashComparison !== 0) return txHashComparison
  return a.outputIndex - b.outputIndex
}

// String operations
export const toString = (outRef: OutRef): string => `${outRef.txHash}#${outRef.outputIndex}`

// Array utilities
export const sort = (outRefs: Array<OutRef>): Array<OutRef> => [...outRefs].sort(compare)

export const sortByTxHash = (outRefs: Array<OutRef>): Array<OutRef> =>
  [...outRefs].sort((a, b) => a.txHash.localeCompare(b.txHash))

export const sortByIndex = (outRefs: Array<OutRef>): Array<OutRef> =>
  [...outRefs].sort((a, b) => a.outputIndex - b.outputIndex)

export const unique = (outRefs: Array<OutRef>): Array<OutRef> =>
  outRefs.filter((outRef, index, self) => self.findIndex((other) => equals(outRef, other)) === index)

export const contains = (outRefs: Array<OutRef>, target: OutRef): boolean =>
  outRefs.some((outRef) => equals(outRef, target))

export const remove = (outRefs: Array<OutRef>, target: OutRef): Array<OutRef> =>
  outRefs.filter((outRef) => !equals(outRef, target))

export const find = (outRefs: Array<OutRef>, predicate: (outRef: OutRef) => boolean): OutRef | undefined =>
  outRefs.find(predicate)

export const filter = (outRefs: Array<OutRef>, predicate: (outRef: OutRef) => boolean): Array<OutRef> =>
  outRefs.filter(predicate)

// Group operations
export const groupByTxHash = (outRefs: Array<OutRef>): Record<string, Array<OutRef>> =>
  outRefs.reduce(
    (groups, outRef) => {
      const txHash = outRef.txHash
      if (!groups[txHash]) groups[txHash] = []
      groups[txHash].push(outRef)
      return groups
    },
    {} as Record<string, Array<OutRef>>
  )

export const getTxHashes = (outRefs: Array<OutRef>): Array<string> => [
  ...new Set(outRefs.map((outRef) => outRef.txHash))
]

export const getIndicesForTx = (outRefs: Array<OutRef>, txHash: string): Array<number> =>
  outRefs.filter((outRef) => outRef.txHash === txHash).map((outRef) => outRef.outputIndex)

// Set operations
export const union = (setA: Array<OutRef>, setB: Array<OutRef>): Array<OutRef> => unique([...setA, ...setB])

export const intersection = (setA: Array<OutRef>, setB: Array<OutRef>): Array<OutRef> =>
  setA.filter((outRefA) => contains(setB, outRefA))

export const difference = (setA: Array<OutRef>, setB: Array<OutRef>): Array<OutRef> =>
  setA.filter((outRefA) => !contains(setB, outRefA))

// Convenience functions
export const isEmpty = (outRefs: Array<OutRef>): boolean => outRefs.length === 0

export const size = (outRefs: Array<OutRef>): number => outRefs.length

export const first = (outRefs: Array<OutRef>): OutRef | undefined => outRefs[0]

export const last = (outRefs: Array<OutRef>): OutRef | undefined =>
  outRefs.length > 0 ? outRefs[outRefs.length - 1] : undefined
