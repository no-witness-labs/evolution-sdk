import type { SchemaAST } from "effect"
import { Effect, ParseResult, Schema } from "effect"
import type { NonEmptyReadonlyArray } from "effect/Array"

import * as Data from "./Data.js"

/**
 * Schema transformations between TypeScript types and Plutus Data
 *
 * This module provides bidirectional transformations:
 * 1. TypeScript types => Plutus Data type => CBOR hex
 * 2. CBOR hex => Plutus Data type => TypeScript types
 */

/**
 * ByteArray schema (hex string) directly re-exported from Data layer.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ByteArray = Data.ByteArray

/**
 * Integer schema (bigint) directly re-exported from Data layer.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Integer = Data.IntSchema

interface Literal<Literals extends NonEmptyReadonlyArray<SchemaAST.LiteralValue>>
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, Schema.Literal<[...Literals]>> {}

/**
 * Creates a schema for literal types with Plutus Data Constructor transformation
 *
 * @since 2.0.0
 */
export const Literal = <Literals extends NonEmptyReadonlyArray<Exclude<SchemaAST.LiteralValue, null | bigint>>>(
  ...self: Literals
): Literal<Literals> =>
  Schema.transform(Schema.typeSchema(Data.Constr), Schema.Literal(...self), {
    strict: true,
    encode: (value) => new Data.Constr({ index: BigInt(self.indexOf(value)), fields: [] }),
    decode: (value) => self[Number(value.index)]
  })

interface OneLiteral<Single extends Exclude<SchemaAST.LiteralValue, null | bigint>>
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, Schema.Literal<[Single]>> {}

export const OneLiteral = <Single extends Exclude<SchemaAST.LiteralValue, null | bigint>>(
  self: Single
): OneLiteral<Single> =>
  Schema.transform(Schema.typeSchema(Data.Constr), Schema.Literal(self), {
    strict: true,

    encode: (_value) => new Data.Constr({ index: 0n, fields: [] }),

    decode: (_value) => self
  })

interface Array<S extends Schema.Schema.Any> extends Schema.transform<typeof Data.ListSchema, Schema.Array$<S>> {}

/**
 * Creates a schema for arrays with Plutus list type annotation
 *
 * @since 1.0.0
 */
export const Array = <S extends Schema.Schema.Any>(items: S): Array<S> =>
  Schema.transform(Data.ListSchema, Schema.Array(items), {
    strict: false,
    encode: (value) => Data.list([...value] as globalThis.Array<Data.Data>),
    decode: (value) => [...value]
  })

interface Map<K extends Schema.Schema.Any, V extends Schema.Schema.Any>
  extends Schema.transform<
    Schema.SchemaClass<globalThis.Map<Data.Data, Data.Data>, globalThis.Map<Data.Data, Data.Data>, never>,
    Schema.MapFromSelf<K, V>
  > {}

/**
 * Creates a schema for maps with Plutus Map type annotation
 * Maps are represented as a list of constructor pairs, where each pair
 * is a constructor with index 0 and fields [key, value]
 *
 * @since 1.0.0
 */
export const Map = <K extends Schema.Schema.Any, V extends Schema.Schema.Any>(key: K, value: V): Map<K, V> =>
  Schema.transform(Schema.typeSchema(Data.MapSchema), Schema.MapFromSelf({ key, value }), {
    strict: false,
    encode: (tsMap) => {
      // Transform TypeScript Map<K_TS, V_TS> to Data Map<K_Data, V_Data>
      // The individual key/value transformations are handled by the schema framework
      return new globalThis.Map([...tsMap])
    },
    decode: (dataMap) => {
      // Transform Data Map<K_Data, V_Data> to TypeScript Map<K_TS, V_TS>
      // The individual key/value transformations are handled by the schema framework
      return new globalThis.Map([...dataMap])
    }
  })

interface NullOr<S extends Schema.Schema.All>
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, Schema.NullOr<S>> {}

/**
 * Creates a schema for nullable types that transforms to/from Plutus Data Constructor
 * Represents optional values as:
 * - Just(value) with index 0
 * - Nothing with index 1
 *
 * @since 2.0.0
 */
export const NullOr = <S extends Schema.Schema.All>(self: S): NullOr<S> =>
  Schema.transform(Schema.typeSchema(Data.Constr), Schema.NullOr(self), {
    strict: true,
    encode: (value) =>
      value === null ? new Data.Constr({ index: 1n, fields: [] }) : new Data.Constr({ index: 0n, fields: [value] }),
    decode: (value) => (value.index === 1n ? null : (value.fields[0] as Schema.Schema.Type<S>))
  })

interface UndefineOr<S extends Schema.Schema.Any>
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, Schema.UndefinedOr<S>> {}

/**
 * Creates a schema for undefined types that transforms to/from Plutus Data Constructor
 * Represents optional values as:
 * - Just(value) with index 0
 * - Nothing with index 1
 *
 * @since 2.0.0
 */
export const UndefinedOr = <S extends Schema.Schema.Any>(self: S): UndefineOr<S> =>
  Schema.transform(Schema.typeSchema(Data.Constr), Schema.UndefinedOr(self), {
    strict: true,
    encode: (value) =>
      value === undefined
        ? new Data.Constr({ index: 1n, fields: [] })
        : new Data.Constr({ index: 0n, fields: [value] }),
    decode: (value) => (value.index === 1n ? undefined : (value.fields[0] as Schema.Schema.Type<S>))
  })

interface Boolean
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, typeof Schema.Boolean> {}

/**
 * Schema for boolean values using Plutus Data Constructor
 * - False with index 0
 * - True with index 1
 *
 * @since 2.0.0
 */
export const Boolean: Boolean = Schema.transform(
  Schema.typeSchema(Data.Constr),
  Schema.Boolean.annotations({
    identifier: "TSchema.Boolean"
  }),
  {
    strict: true,
    encode: (boolean) =>
      boolean ? new Data.Constr({ index: 1n, fields: [] }) : new Data.Constr({ index: 0n, fields: [] }),
    decode: ({ fields, index }) => {
      if (index !== 0n && index !== 1n) {
        throw new Error(`Expected constructor index to be 0 or 1, got ${index}`)
      }
      if (fields.length !== 0) {
        throw new Error("Expected a constructor with no fields")
      }
      return index === 1n
    }
  }
).annotations({
  identifier: "TSchema.BooleanFromConstr"
})

interface Struct<Fields extends Schema.Struct.Fields>
  extends Schema.transform<Schema.SchemaClass<Data.Constr, Data.Constr, never>, Schema.Struct<Fields>> {}

/**
 * Creates a schema for struct types using Plutus Data Constructor
 * Objects are represented as a constructor with index 0 and fields as an array
 *
 * @since 2.0.0
 */
export const Struct = <Fields extends Schema.Struct.Fields>(fields: Fields): Struct<Fields> =>
  Schema.transform(Schema.typeSchema(Data.Constr), Schema.Struct(fields), {
    strict: false,
    encode: (encodedStruct) => {
      // encodedStruct is the result of Schema.Struct(fields), which has already transformed all fields
      return new Data.Constr({
        index: 0n,
        fields: Object.values(encodedStruct)
      })
    },
    decode: (fromA) => {
      const keys = Object.keys(fields)
      const result = {} as Record<string, Data.Data>
      keys.forEach((key, index) => {
        result[key] = fromA.fields[index]
      })
      return result as { [K in keyof Schema.Struct.Encoded<Fields>]: Schema.Struct.Encoded<Fields>[K] }
    }
  })

interface Union<Members extends ReadonlyArray<Schema.Schema.Any>>
  extends Schema.transformOrFail<
    Schema.SchemaClass<Data.Constr, Data.Constr, never>,
    Schema.SchemaClass<Schema.Schema.Type<[...Members][number]>, Schema.Schema.Type<[...Members][number]>, never>,
    never
  > {}

/**
 * Creates a schema for union types using Plutus Data Constructor
 * Unions are represented as a constructor with index 0 and fields as an array
 *
 * @since 2.0.0
 */
export const Union = <Members extends ReadonlyArray<Schema.Schema.Any>>(...members: Members): Union<Members> => {
  // Get readable names for each member schema for better error messages
  const getMemberNames = () => {
    return members.map((member, index) => {
      const ast = member.ast
      if (ast._tag === "Transformation" && ast.annotations && ast.annotations["identifier"]) {
        const identifier = ast.annotations["identifier"] as string
        return identifier.replace("TSchema.", "").toLowerCase()
      }
      return `option ${index + 1}`
    })
  }

  return Schema.transformOrFail(Schema.typeSchema(Data.Constr), Schema.typeSchema(Schema.Union(...members)), {
    strict: false,
    encode: (value) =>
      Effect.gen(function* () {
        const index = members.findIndex((schema) => Schema.is(schema)(value))

        if (index === -1) {
          const memberNames = getMemberNames()
          const actualType =
            typeof value === "bigint"
              ? "bigint"
              : typeof value === "object" && value !== null && (value as unknown) instanceof Map
                ? "Map"
                : typeof value === "object" && value !== null && globalThis.Array.isArray(value)
                  ? "array"
                  : typeof value

          return yield* Effect.fail(
            new ParseResult.Type(
              Schema.Union(...members).ast,
              value,
              `Invalid value for Union: received ${actualType} (${JSON.stringify(value)}), expected ${memberNames.join(" or ")}`
            )
          )
        }

        const encodedValue = yield* ParseResult.encode(members[index] as Schema.Schema<any, any, never>)(value)

        return new Data.Constr({
          index: BigInt(index),
          fields: [encodedValue]
        })
      }),
    decode: (value, _, ast) => {
      const memberIndex = Number(value.index)
      // Check if index is valid for the members array
      if (memberIndex < 0 || memberIndex >= members.length) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            value,
            `Invalid union index: ${memberIndex}. Expected index between 0 and ${members.length - 1}`
          )
        )
      }
      // Get the member schema for this index
      const member = members[memberIndex] as Schema.Schema<any, any, never>

      // If the member schema expects a Data.Constr (like Boolean),
      // we need to reconstruct the original Constr structure
      // For primitive types, we use the first field
      if (value.fields.length === 0) {
        // This is likely a Boolean-like case where the original Constr had no fields
        // Reconstruct the original Constr structure
        return ParseResult.decode(member)(new Data.Constr({ index: 0n, fields: [] }))
      } else if (value.fields.length === 1) {
        // This could be either a primitive value or a Constr that was flattened
        return ParseResult.decode(member)(value.fields[0])
      } else {
        // Multiple fields - reconstruct as a Constr with index 0
        // This handles cases where the original Constr had multiple fields
        return ParseResult.decode(member)(new Data.Constr({ index: 0n, fields: [...value.fields] }))
      }
    }
  }).annotations({
    identifier: "TSchema.Union",
    message: (issue) => {
      const memberNames = getMemberNames()
      const actual = issue.actual
      const actualType =
        typeof actual === "bigint"
          ? "bigint"
          : typeof actual === "object" && actual !== null && (actual as unknown) instanceof Map
            ? "Map"
            : typeof actual === "object" && actual !== null && globalThis.Array.isArray(actual)
              ? "array"
              : typeof actual

      return `Invalid value for Union: received ${actualType} (${JSON.stringify(actual)}), expected ${memberNames.join(" or ")}`
    }
  })
}

interface Tuple<Elements extends Schema.TupleType.Elements>
  extends Schema.transform<typeof Data.ListSchema, Schema.Tuple<Elements>> {}
/**
 * Creates a schema for tuple types using Plutus Data List transformation
 * Tuples are represented as a constructor with index 0 and fields as an array
 *
 * @since 2.0.0
 */
export const Tuple = <Elements extends Schema.TupleType.Elements>(element: [...Elements]): Tuple<Elements> =>
  Schema.transform(
    Data.ListSchema,
    Schema.Tuple(...element).annotations({
      identifier: "Tuple"
    }),
    {
      strict: false,
      encode: (value) => Data.list([...value] as globalThis.Array<Data.Data>),
      decode: (value) => [...value] as any
    }
  )

export const compose = Schema.compose

export const filter = Schema.filter

export const is = Schema.is
