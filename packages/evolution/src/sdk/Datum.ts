/**
 * Datum types and utilities for handling Cardano transaction data.
 *
 * This module provides types and functions for working with datum values
 * that can be attached to UTxOs in Cardano transactions.
 */

export type Datum =
  | {
      type: "datumHash"
      hash: string
    }
  | {
      type: "inlineDatum"
      inline: string
    }

// Type guards
export const isDatumHash = (datum?: Datum): datum is { type: "datumHash"; hash: string } =>
  datum !== undefined && datum.type === "datumHash"

export const isInlineDatum = (datum?: Datum): datum is { type: "inlineDatum"; inline: string } =>
  datum !== undefined && datum.type === "inlineDatum"

// Constructors
export const makeDatumHash = (hash: string): Datum => ({
  type: "datumHash",
  hash
})

export const makeInlineDatum = (inline: string): Datum => ({
  type: "inlineDatum",
  inline
})

// Utility functions
export const equals = (a: Datum, b: Datum): boolean => {
  if (a.type !== b.type) return false
  if (isDatumHash(a) && isDatumHash(b)) return a.hash === b.hash
  if (isInlineDatum(a) && isInlineDatum(b)) return a.inline === b.inline
  return false
}

// Array utilities
export const filterHashes = (datums: Array<Datum>): Array<{ type: "datumHash"; hash: string }> =>
  datums.filter(isDatumHash)

export const filterInline = (datums: Array<Datum>): Array<{ type: "inlineDatum"; inline: string }> =>
  datums.filter(isInlineDatum)

export const unique = (datums: Array<Datum>): Array<Datum> =>
  datums.filter((datum, index, self) => self.findIndex((d) => equals(datum, d)) === index)

export const groupByType = (
  datums: Array<Datum>
): {
  hashes: Array<{ type: "datumHash"; hash: string }>
  inline: Array<{ type: "inlineDatum"; inline: string }>
} => ({
  hashes: filterHashes(datums),
  inline: filterInline(datums)
})
