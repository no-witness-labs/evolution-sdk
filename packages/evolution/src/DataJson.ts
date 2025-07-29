import * as CML from "@anastasia-labs/cardano-multiplatform-lib-nodejs"
import type { Record, SchemaAST } from "effect"
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

export const mkByteArray = (bytes: string): ByteArray => ByteArray.make({ bytes })

export const mkMap = (map: Record<string, Data>): Readonly<Map> => Map.make(map)

export const mkInteger = (int: number): Integer => Integer.make({ int })

// export const mkConstr = <T extends Data>(
//   constructor: number,
//   fields: readonly T[]
// ): { readonly constructor: number; readonly fields: readonly T[] } => ({
//   constructor,
//   fields
// });
export const mkConstr = <T extends Data>(
  constructor: number,
  fields: ReadonlyArray<T>
): { readonly constructor: number; readonly fields: ReadonlyArray<T> } => ({
  constructor,
  fields
})
/**
 * Converts TypeScript data into CBOR hex string
 *
 * @since 1.0.0
 */
export const toCBOR = <Source, Target extends Data>(
  input: unknown,
  schema?: Schema.Schema<Source, Target>,
  options: {
    canonical?: boolean
    parseOptions?: SchemaAST.ParseOptions
  } = {}
): string => {
  const { canonical = false } = options
  const toCMLPlutusData = (data: Data): CML.PlutusData => {
    if (isInteger(data)) {
      return CML.PlutusData.new_integer(CML.BigInteger.from_str(data.int.toString()))
    } else if (isByteArray(data)) {
      return CML.PlutusData.new_bytes(Bytes.Codec.Encode.bytes(data.bytes))
    } else if (isList(data)) {
      const list = CML.PlutusDataList.new()
      data.forEach((item) => list.add(toCMLPlutusData(item)))
      return CML.PlutusData.new_list(list)
    } else if (isMap(data)) {
      const map = CML.PlutusMap.new()
      Object.entries(data).forEach(([key, value]) => {
        const plutusKey = CML.PlutusData.new_bytes(Bytes.Codec.Encode.bytes(key))
        map.set(plutusKey, toCMLPlutusData(value))
      })
      return CML.PlutusData.new_map(map)
    } else if (isConstr(data)) {
      const fields = CML.PlutusDataList.new()
      data.fields.forEach((item) => fields.add(toCMLPlutusData(item)))
      return CML.PlutusData.new_constr_plutus_data(CML.ConstrPlutusData.new(BigInt(data.constructor), fields))
    } else {
      throw new Error(`Unsupported data type: ${data}`)
    }
  }

  const data: Data = schema ? toData(input, schema, options.parseOptions) : toData(input, Data)
  const cmlPlutusData = toCMLPlutusData(data)
  return canonical ? cmlPlutusData.to_canonical_cbor_hex() : cmlPlutusData.to_cardano_node_format().to_cbor_hex()
}

/**
 * Decodes a CBOR hex string to a TypeScript type
 *
 * @since 1.0.0
 */
export function fromCBOR(input: string): Data
export function fromCBOR<Source, Target extends Data>(input: string, schema: Schema.Schema<Source, Target>): Source
export function fromCBOR<Source, Target extends Data>(
  input: string,
  schema?: Schema.Schema<Source, Target>
): Source | Data {
  const data = resolveCBOR(input)
  return schema ? fromData(data, schema) : data
}

export const resolveCBOR = (input: string): Data => {
  let data: CML.PlutusData
  try {
    data = CML.PlutusData.from_cbor_hex(input)
  } catch {
    throw new Error(`Failed to resolve CBOR input: ${input}`)
  }
  switch (data.kind()) {
    case CML.PlutusDataKind.Integer:
      return Integer.make({ int: Number(data.as_integer()!.to_str()) })
    case CML.PlutusDataKind.Bytes:
      return ByteArray.make({
        bytes: Bytes.Codec.Decode.bytes(data.as_bytes()!)
      })
    case CML.PlutusDataKind.List: {
      const list = data.as_list()!
      const array = []
      for (let i = 0; i < list.len(); i++) {
        array.push(resolveCBOR(list.get(i).to_cbor_hex()))
      }
      return array
    }
    case CML.PlutusDataKind.Map: {
      const plutusMap = data.as_map()!
      const map: Record<string, Data> = {}
      const keys = plutusMap.keys()
      for (let i = 0; i < keys.len(); i++) {
        const keyData = resolveCBOR(keys.get(i).to_cbor_hex())
        const key = isByteArray(keyData) ? keyData.bytes : String(keyData)
        const val = resolveCBOR(plutusMap.get(keys.get(i))!.to_cbor_hex())
        map[key] = val
      }
      return map
    }
    case CML.PlutusDataKind.ConstrPlutusData: {
      const constrData = data.as_constr_plutus_data()!
      const fields = []
      const list = constrData.fields()
      for (let i = 0; i < list.len(); i++) {
        fields.push(resolveCBOR(list.get(i).to_cbor_hex()))
      }
      return Constr.make({
        constructor: Number(constrData.alternative()),
        fields
      })
    }
    default:
      throw new Error(`Unsupported type: ${data.kind()}`)
  }
}

/**
 * Decodes an unknown value from Plutus Data Constructor to a TypeScript type
 *
 * @since 1.0.0
 */
export const fromData = <Source, Target extends Data>(
  input: unknown,
  schema: Schema.Schema<Source, Target>,
  options: SchemaAST.ParseOptions = {}
): Source => Schema.decodeUnknownSync(schema, options)(input)

/**
 * Encodes a TypeScript value to Plutus Data Constructor
 *
 * @since 1.0.0
 */
export const toData = <Source, Target extends Data>(
  input: unknown,
  schema: Schema.Schema<Source, Target>,
  options?: SchemaAST.ParseOptions
): Target => Schema.encodeUnknownSync(schema, options)(input)
