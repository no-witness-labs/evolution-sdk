import { pipe, Schema } from "effect"
import type { ParseIssue } from "effect/ParseResult"

import * as Bytes from "./Bytes.js"

/**
 * Plutus data types and schemas for serialization/deserialization between
 * TypeScript types and Cardano's Plutus data format
 *
 * @since 1.0.0
 */
export type Data = Integer | ByteArray | List | Map | Constr

export interface List extends ReadonlyArray<Data> {}

export interface Integer {
  readonly int: number
}

export interface ByteArray {
  readonly bytes: string
}
export interface Constr {
  readonly constructor: number
  readonly fields: ReadonlyArray<Data>
}

export interface mkConstr<T extends Data> {
  readonly constructor: number
  readonly fields: ReadonlyArray<T>
}

export type Map = {
  readonly [key: string]: Data
}

// Schema for Plutus data types

const renderParseIssue = (issue: ParseIssue): string | undefined =>
  typeof issue.actual === "object" ? "[complex value]" : String(issue.actual)

const HexString = <Source extends string, Target>(self: Schema.Schema<Source, Target>) =>
  pipe(
    self,
    Schema.filter((value) => Bytes.isHex(value), {
      message: (issue) => `Expected a hexadecimal string but received: ${issue.actual}.`
    })
  )

export const ByteArray = Schema.Struct({
  bytes: pipe(
    Schema.String,
    Schema.annotations({
      message: (issue: ParseIssue) => ({
        message: `Expected ByteArray but got ${renderParseIssue(issue)}.`,
        override: true
      })
    }),
    HexString
  )
}).annotations({
  identifier: "ByteArray"
})

export const Integer = Schema.Struct({
  int: Schema.Number
}).annotations({
  identifier: "Integer",
  message: (issue: ParseIssue) => {
    return `Expected Integer but got ${renderParseIssue(issue)}.`
  }
})

export const isInteger = Schema.is(Integer)

export const isByteArray = Schema.is(ByteArray)

export const List = Schema.Array(Schema.suspend((): Schema.Schema<Data> => Data)).annotations({
  identifier: "List",
  message: (issue: ParseIssue) => {
    return `Expected List but got ${renderParseIssue(issue)}.`
  }
})

export const isList = Schema.is(List)

export const Map = Schema.Record({
  key: Schema.String,
  value: Schema.suspend((): Schema.Schema<Data> => Data)
}).annotations({
  identifier: "Map",
  message: (issue: ParseIssue) => {
    return `Expected Map but got ${renderParseIssue(issue)}.`
  }
})

export const isMap = Schema.is(Map)

export const Constr = Schema.Struct({
  constructor: Schema.Number,
  fields: Schema.Array(Schema.suspend((): Schema.Schema<Data> => Data))
}).annotations({
  identifier: "Constr",
  message: (issue: ParseIssue) => {
    return `Expected Constr but got ${renderParseIssue(issue)}.`
  }
})

export const isConstr = Schema.is(Constr)

// export const Data = Schema.Union(Integer, ByteArray, List, Map, Constr);
export const Data: Schema.Schema<Data> = Schema.Union(Integer, ByteArray, List, Map, Constr)
