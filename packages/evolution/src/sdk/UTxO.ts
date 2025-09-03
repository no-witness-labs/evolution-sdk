import * as Assets from "./Assets.js"
import type * as Script from "./Script.js"

export type Datum =
  | {
      type: "datumHash"
      hash: string
    }
  | {
      type: "inlineDatum"
      inline: string
    }
  | {
      type: "noDatum"
    }

export interface OutRef {
  txHash: string
  outputIndex: number
}

export interface UTxO {
  txHash: string
  outputIndex: number
  address: string
  assets: Assets.Assets
  datumOption: Datum
  scriptRef?: Script.Script
}

export const hasAssets = (utxo: UTxO): boolean => !Assets.isEmpty(utxo.assets)

export const hasLovelace = (utxo: UTxO): boolean => Assets.getAsset(utxo.assets, "lovelace") > 0n

export const getLovelace = (utxo: UTxO): bigint => Assets.getAsset(utxo.assets, "lovelace")

export const hasNativeTokens = (utxo: UTxO): boolean => {
  const units = Assets.getUnits(utxo.assets)
  return units.length > 1 || (units.length === 1 && units[0] !== "lovelace")
}

export const hasDatum = (utxo: UTxO): boolean => utxo.datumOption !== undefined

export const hasScript = (utxo: UTxO): boolean => utxo.scriptRef !== undefined

// OutRef operations
export const getOutRef = (utxo: UTxO): OutRef => ({
  txHash: utxo.txHash,
  outputIndex: utxo.outputIndex
})

export const outRefEquals = (a: OutRef, b: OutRef): boolean => a.txHash === b.txHash && a.outputIndex === b.outputIndex

export const outRefToString = (outRef: OutRef): string => `${outRef.txHash}#${outRef.outputIndex}`

export const makeOutRef = (txHash: string, outputIndex: number): OutRef => ({
  txHash,
  outputIndex
})

// Datum type guards and utilities
export const isDatumHash = (datum: Datum): datum is { type: "datumHash"; hash: string } =>
  datum !== undefined && "hash" in datum

export const isInlineDatum = (datum: Datum): datum is { type: "inlineDatum"; inline: string } =>
  datum !== undefined && "inline" in datum

export const getDatumHash = (utxo: UTxO): string | undefined =>
  isDatumHash(utxo.datumOption) ? utxo.datumOption.hash : undefined

export const getInlineDatum = (utxo: UTxO): string | undefined =>
  isInlineDatum(utxo.datumOption) ? utxo.datumOption.inline : undefined

// Value operations
export const getValue = (utxo: UTxO): Assets.Assets => utxo.assets

export const withAssets = (utxo: UTxO, assets: Assets.Assets): UTxO => ({
  ...utxo,
  assets
})

export const addAssets = (utxo: UTxO, assets: Assets.Assets): UTxO => withAssets(utxo, Assets.add(utxo.assets, assets))

export const subtractAssets = (utxo: UTxO, assets: Assets.Assets): UTxO =>
  withAssets(utxo, Assets.subtract(utxo.assets, assets))

// Datum operations
export const withDatum = (utxo: UTxO, datumOption: Datum): UTxO => ({
  ...utxo,
  datumOption
})

export const withoutDatum = (utxo: UTxO): UTxO => ({
  ...utxo,
  datumOption: {
    type: "noDatum"
  }
})

// Script operations
export const withScript = (utxo: UTxO, scriptRef: Script.Script): UTxO => ({
  ...utxo,
  scriptRef
})

export const withoutScript = (utxo: UTxO): UTxO => ({
  ...utxo,
  scriptRef: undefined
})

// UTxO Collection utilities
export type UTxOSet = Array<UTxO>

export const fromArray = (utxos: Array<UTxO>): UTxOSet => utxos

export const toArray = (utxoSet: UTxOSet): Array<UTxO> => utxoSet

export const filterByAddress = (utxoSet: UTxOSet, address: string): UTxOSet =>
  utxoSet.filter((utxo) => utxo.address === address)

export const filterByAsset = (utxoSet: UTxOSet, unit: string): UTxOSet =>
  utxoSet.filter((utxo) => Assets.hasAsset(utxo.assets, unit))

export const filterByMinLovelace = (utxoSet: UTxOSet, minLovelace: bigint): UTxOSet =>
  utxoSet.filter((utxo) => getLovelace(utxo) >= minLovelace)

export const filterWithDatum = (utxoSet: UTxOSet): UTxOSet => utxoSet.filter(hasDatum)

export const filterWithScript = (utxoSet: UTxOSet): UTxOSet => utxoSet.filter(hasScript)

export const sortByLovelace = (utxoSet: UTxOSet, ascending = true): UTxOSet =>
  [...utxoSet].sort((a, b) => {
    const diff = getLovelace(a) - getLovelace(b)
    return ascending ? Number(diff) : Number(-diff)
  })

export const getTotalAssets = (utxoSet: UTxOSet): Assets.Assets =>
  utxoSet.reduce((total, utxo) => Assets.add(total, utxo.assets), Assets.empty())

export const getTotalLovelace = (utxoSet: UTxOSet): bigint =>
  utxoSet.reduce((total, utxo) => total + getLovelace(utxo), 0n)

export const findByOutRef = (utxoSet: UTxOSet, outRef: OutRef): UTxO | undefined =>
  utxoSet.find((utxo) => outRefEquals(getOutRef(utxo), outRef))

export const removeByOutRef = (utxoSet: UTxOSet, outRef: OutRef): UTxOSet =>
  utxoSet.filter((utxo) => !outRefEquals(getOutRef(utxo), outRef))

export const isEmpty = (utxoSet: UTxOSet): boolean => utxoSet.length === 0

export const size = (utxoSet: UTxOSet): number => utxoSet.length

// UTxO Set operations
export const union = (setA: UTxOSet, setB: UTxOSet): UTxOSet => {
  const result = [...setA]
  for (const utxo of setB) {
    if (!findByOutRef(result, getOutRef(utxo))) {
      result.push(utxo)
    }
  }
  return result
}

export const intersection = (setA: UTxOSet, setB: UTxOSet): UTxOSet =>
  setA.filter((utxoA) => findByOutRef(setB, getOutRef(utxoA)) !== undefined)

export const difference = (setA: UTxOSet, setB: UTxOSet): UTxOSet =>
  setA.filter((utxoA) => findByOutRef(setB, getOutRef(utxoA)) === undefined)

// Enhanced collection utilities
export const find = (utxos: UTxOSet, predicate: (utxo: UTxO) => boolean): UTxO | undefined => utxos.find(predicate)

export const filter = (utxos: UTxOSet, predicate: (utxo: UTxO) => boolean): UTxOSet => utxos.filter(predicate)

export const map = <T>(utxos: UTxOSet, mapper: (utxo: UTxO) => T): Array<T> => utxos.map(mapper)

export const reduce = <T>(utxos: UTxOSet, reducer: (acc: T, utxo: UTxO) => T, initial: T): T =>
  utxos.reduce(reducer, initial)

// Specialized finders
export const findByAddress = (utxos: UTxOSet, address: string): UTxOSet =>
  filter(utxos, (utxo) => utxo.address === address)

export const findWithDatumHash = (utxos: UTxOSet, hash: string): UTxOSet =>
  filter(utxos, (utxo) => getDatumHash(utxo) === hash)

export const findWithMinLovelace = (utxos: UTxOSet, minLovelace: bigint): UTxOSet =>
  filter(utxos, (utxo) => getLovelace(utxo) >= minLovelace)

// Equals utility
export const equals = (a: UTxO, b: UTxO): boolean => outRefEquals(getOutRef(a), getOutRef(b))
