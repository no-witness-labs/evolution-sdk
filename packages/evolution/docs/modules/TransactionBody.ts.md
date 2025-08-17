---
title: TransactionBody.ts
nav_order: 102
parent: Modules
---

## TransactionBody overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [errors](#errors)
  - [TransactionBodyError (class)](#transactionbodyerror-class)
- [model](#model)
  - [TransactionBody (class)](#transactionbody-class)
    - [toString (method)](#tostring-method)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
- [utils](#utils)
  - [FromCDDL](#fromcddl)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random TransactionBody instances.
Used for property-based testing to generate valid test data.

Generates basic TransactionBody instances with required fields (inputs, outputs, fee)
and optionally includes some other common fields.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<TransactionBody>
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a TransactionBody to CBOR bytes.
Default options use STRUCT_FRIENDLY_OPTIONS for better readability.

**Signature**

```ts
export declare const toCBORBytes: (input: TransactionBody, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a TransactionBody to CBOR hex string.
Default options use STRUCT_FRIENDLY_OPTIONS for better readability.

**Signature**

```ts
export declare const toCBORHex: (input: TransactionBody, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# errors

## TransactionBodyError (class)

Error class for TransactionBody related operations.

**Signature**

```ts
export declare class TransactionBodyError
```

Added in v2.0.0

# model

## TransactionBody (class)

TransactionBody based on Conway CDDL specification

```
CDDL: transaction_body =
  {   0  : set<transaction_input>
  ,   1  : [* transaction_output]
  ,   2  : coin
  , ? 3  : slot_no
  , ? 4  : certificates
  , ? 5  : withdrawals
  , ? 7  : auxiliary_data_hash
  , ? 8  : slot_no
  , ? 9  : mint
  , ? 11 : script_data_hash
  , ? 13 : nonempty_set<transaction_input>
  , ? 14 : required_signers
  , ? 15 : network_id
  , ? 16 : transaction_output
  , ? 17 : coin
  , ? 18 : nonempty_set<transaction_input>
  , ? 19 : voting_procedures
  , ? 20 : proposal_procedures
  , ? 21 : coin
  , ? 22 : positive_coin
  }
```

**Signature**

```ts
export declare class TransactionBody
```

Added in v2.0.0

### toString (method)

**Signature**

```ts
toString(): string
```

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
[Symbol.for("nodejs.util.inspect.custom")](): string
```

# parsing

## fromCBORBytes

Parse a TransactionBody from CBOR bytes.
Default options use STRUCT_FRIENDLY_OPTIONS for better readability.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => TransactionBody
```

Added in v2.0.0

## fromCBORHex

Parse a TransactionBody from CBOR hex string.
Default options use STRUCT_FRIENDLY_OPTIONS for better readability.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => TransactionBody
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for TransactionBody struct structure.

Maps the TransactionBody fields to their CDDL field numbers according to Conway spec.
Uses Struct with proper CBOR tags for sets (tag 258) for CML compatibility.

**Signature**

```ts
export declare const CDDLSchema: Schema.Struct<{
  0: Schema.TaggedStruct<
    "Tag",
    {
      tag: Schema.Literal<[258]>
      value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
    }
  >
  1: Schema.Array$<
    Schema.Union<
      [
        Schema.Tuple<
          [
            typeof Schema.Uint8ArrayFromSelf,
            Schema.Union<
              [
                typeof Schema.BigIntFromSelf,
                Schema.Tuple2<
                  typeof Schema.BigIntFromSelf,
                  Schema.SchemaClass<
                    ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                    ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                    never
                  >
                >
              ]
            >,
            Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
          ]
        >,
        Schema.Struct<{
          0: typeof Schema.Uint8ArrayFromSelf
          1: Schema.SchemaClass<
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            never
          >
          2: Schema.optional<
            Schema.SchemaClass<
              readonly [0n, any] | readonly [1n, CBOR.CBOR],
              readonly [0n, any] | readonly [1n, CBOR.CBOR],
              never
            >
          >
          3: Schema.optional<
            Schema.SchemaClass<
              { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
              { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
              never
            >
          >
        }>
      ]
    >
  >
  2: typeof Schema.BigIntFromSelf
  3: Schema.optional<typeof Schema.BigIntFromSelf>
  4: Schema.optional<
    Schema.Array$<
      Schema.Union<
        [
          Schema.Tuple2<
            Schema.Literal<[0n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          >,
          Schema.Tuple2<
            Schema.Literal<[1n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          >,
          Schema.Tuple<
            [
              Schema.Literal<[2n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf
            ]
          >,
          Schema.Tuple2<
            Schema.Literal<[3n]>,
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.BigIntFromSelf,
                typeof Schema.BigIntFromSelf,
                Schema.TaggedStruct<
                  "Tag",
                  {
                    tag: Schema.Literal<[30]>
                    value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                  }
                >,
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
                Schema.Array$<
                  Schema.SchemaClass<
                    | readonly [0n, bigint | null, any, any]
                    | readonly [1n, bigint | null, string]
                    | readonly [2n, string],
                    | readonly [0n, bigint | null, any, any]
                    | readonly [1n, bigint | null, string]
                    | readonly [2n, string],
                    never
                  >
                >,
                Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
              ]
            >
          >,
          Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
          Schema.Tuple<
            [
              Schema.Literal<[7n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[8n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[9n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[10n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[11n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[12n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[13n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[14n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[15n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[16n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[17n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[18n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >
        ]
      >
    >
  >
  5: Schema.optional<Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
  7: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
  8: Schema.optional<typeof Schema.BigIntFromSelf>
  9: Schema.optional<
    Schema.SchemaClass<ReadonlyMap<any, ReadonlyMap<any, bigint>>, ReadonlyMap<any, ReadonlyMap<any, bigint>>, never>
  >
  11: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
  13: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
      }
    >
  >
  14: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
  15: Schema.optional<typeof Schema.BigIntFromSelf>
  16: Schema.optional<
    Schema.Union<
      [
        Schema.Tuple<
          [
            typeof Schema.Uint8ArrayFromSelf,
            Schema.Union<
              [
                typeof Schema.BigIntFromSelf,
                Schema.Tuple2<
                  typeof Schema.BigIntFromSelf,
                  Schema.SchemaClass<
                    ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                    ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                    never
                  >
                >
              ]
            >,
            Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
          ]
        >,
        Schema.Struct<{
          0: typeof Schema.Uint8ArrayFromSelf
          1: Schema.SchemaClass<
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            never
          >
          2: Schema.optional<
            Schema.SchemaClass<
              readonly [0n, any] | readonly [1n, CBOR.CBOR],
              readonly [0n, any] | readonly [1n, CBOR.CBOR],
              never
            >
          >
          3: Schema.optional<
            Schema.SchemaClass<
              { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
              { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
              never
            >
          >
        }>
      ]
    >
  >
  17: Schema.optional<typeof Schema.BigIntFromSelf>
  18: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
      }
    >
  >
  19: Schema.optional<
    Schema.SchemaClass<
      ReadonlyMap<
        | readonly [0n, readonly [0n | 1n, any]]
        | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
        | readonly [2n, any],
        ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
      >,
      ReadonlyMap<
        | readonly [0n, readonly [0n | 1n, any]]
        | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
        | readonly [2n, any],
        ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
      >,
      never
    >
  >
  20: Schema.optional<
    Schema.SchemaClass<
      readonly (readonly [
        bigint,
        any,
        (
          | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              readonly (readonly [0n | 1n, any])[],
              ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
          | readonly [6n]
        ),
        readonly [string, any] | null
      ])[],
      readonly (readonly [
        bigint,
        any,
        (
          | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              readonly (readonly [0n | 1n, any])[],
              ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
          | readonly [6n]
        ),
        readonly [string, any] | null
      ])[],
      never
    >
  >
  21: Schema.optional<typeof Schema.BigIntFromSelf>
  22: Schema.optional<typeof Schema.BigIntFromSelf>
}>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for TransactionBody.
Transforms between CBOR bytes and TransactionBody using Conway CDDL specification.

**Signature**

```ts
export declare const FromCBORBytes: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.transformOrFail<
    Schema.Struct<{
      0: Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
        }
      >
      1: Schema.Array$<
        Schema.Union<
          [
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    typeof Schema.BigIntFromSelf,
                    Schema.Tuple2<
                      typeof Schema.BigIntFromSelf,
                      Schema.SchemaClass<
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        never
                      >
                    >
                  ]
                >,
                Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
              ]
            >,
            Schema.Struct<{
              0: typeof Schema.Uint8ArrayFromSelf
              1: Schema.SchemaClass<
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                never
              >
              2: Schema.optional<
                Schema.SchemaClass<
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  never
                >
              >
              3: Schema.optional<
                Schema.SchemaClass<
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  never
                >
              >
            }>
          ]
        >
      >
      2: typeof Schema.BigIntFromSelf
      3: Schema.optional<typeof Schema.BigIntFromSelf>
      4: Schema.optional<
        Schema.Array$<
          Schema.Union<
            [
              Schema.Tuple2<
                Schema.Literal<[0n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
              >,
              Schema.Tuple2<
                Schema.Literal<[1n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[2n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf
                ]
              >,
              Schema.Tuple2<
                Schema.Literal<[3n]>,
                Schema.Tuple<
                  [
                    typeof Schema.Uint8ArrayFromSelf,
                    typeof Schema.Uint8ArrayFromSelf,
                    typeof Schema.BigIntFromSelf,
                    typeof Schema.BigIntFromSelf,
                    Schema.TaggedStruct<
                      "Tag",
                      {
                        tag: Schema.Literal<[30]>
                        value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                      }
                    >,
                    typeof Schema.Uint8ArrayFromSelf,
                    Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Array$<
                      Schema.SchemaClass<
                        | readonly [0n, bigint | null, any, any]
                        | readonly [1n, bigint | null, string]
                        | readonly [2n, string],
                        | readonly [0n, bigint | null, any, any]
                        | readonly [1n, bigint | null, string]
                        | readonly [2n, string],
                        never
                      >
                    >,
                    Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
                  ]
                >
              >,
              Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
              Schema.Tuple<
                [
                  Schema.Literal<[7n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[8n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[9n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[10n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[11n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[12n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[13n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[14n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[15n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[16n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[17n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[18n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >
            ]
          >
        >
      >
      5: Schema.optional<Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
      7: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
      8: Schema.optional<typeof Schema.BigIntFromSelf>
      9: Schema.optional<
        Schema.SchemaClass<
          ReadonlyMap<any, ReadonlyMap<any, bigint>>,
          ReadonlyMap<any, ReadonlyMap<any, bigint>>,
          never
        >
      >
      11: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
      13: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
          }
        >
      >
      14: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
      15: Schema.optional<typeof Schema.BigIntFromSelf>
      16: Schema.optional<
        Schema.Union<
          [
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    typeof Schema.BigIntFromSelf,
                    Schema.Tuple2<
                      typeof Schema.BigIntFromSelf,
                      Schema.SchemaClass<
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        never
                      >
                    >
                  ]
                >,
                Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
              ]
            >,
            Schema.Struct<{
              0: typeof Schema.Uint8ArrayFromSelf
              1: Schema.SchemaClass<
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                never
              >
              2: Schema.optional<
                Schema.SchemaClass<
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  never
                >
              >
              3: Schema.optional<
                Schema.SchemaClass<
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  never
                >
              >
            }>
          ]
        >
      >
      17: Schema.optional<typeof Schema.BigIntFromSelf>
      18: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
          }
        >
      >
      19: Schema.optional<
        Schema.SchemaClass<
          ReadonlyMap<
            | readonly [0n, readonly [0n | 1n, any]]
            | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
            | readonly [2n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          ReadonlyMap<
            | readonly [0n, readonly [0n | 1n, any]]
            | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
            | readonly [2n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          never
        >
      >
      20: Schema.optional<
        Schema.SchemaClass<
          readonly (readonly [
            bigint,
            any,
            (
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n]
            ),
            readonly [string, any] | null
          ])[],
          readonly (readonly [
            bigint,
            any,
            (
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n]
            ),
            readonly [string, any] | null
          ])[],
          never
        >
      >
      21: Schema.optional<typeof Schema.BigIntFromSelf>
      22: Schema.optional<typeof Schema.BigIntFromSelf>
    }>,
    Schema.SchemaClass<TransactionBody, TransactionBody, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for TransactionBody.
Transforms between CBOR hex string and TransactionBody using Conway CDDL specification.

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<
    Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >
  >,
  Schema.transformOrFail<
    Schema.Struct<{
      0: Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
        }
      >
      1: Schema.Array$<
        Schema.Union<
          [
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    typeof Schema.BigIntFromSelf,
                    Schema.Tuple2<
                      typeof Schema.BigIntFromSelf,
                      Schema.SchemaClass<
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        never
                      >
                    >
                  ]
                >,
                Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
              ]
            >,
            Schema.Struct<{
              0: typeof Schema.Uint8ArrayFromSelf
              1: Schema.SchemaClass<
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                never
              >
              2: Schema.optional<
                Schema.SchemaClass<
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  never
                >
              >
              3: Schema.optional<
                Schema.SchemaClass<
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  never
                >
              >
            }>
          ]
        >
      >
      2: typeof Schema.BigIntFromSelf
      3: Schema.optional<typeof Schema.BigIntFromSelf>
      4: Schema.optional<
        Schema.Array$<
          Schema.Union<
            [
              Schema.Tuple2<
                Schema.Literal<[0n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
              >,
              Schema.Tuple2<
                Schema.Literal<[1n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[2n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf
                ]
              >,
              Schema.Tuple2<
                Schema.Literal<[3n]>,
                Schema.Tuple<
                  [
                    typeof Schema.Uint8ArrayFromSelf,
                    typeof Schema.Uint8ArrayFromSelf,
                    typeof Schema.BigIntFromSelf,
                    typeof Schema.BigIntFromSelf,
                    Schema.TaggedStruct<
                      "Tag",
                      {
                        tag: Schema.Literal<[30]>
                        value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                      }
                    >,
                    typeof Schema.Uint8ArrayFromSelf,
                    Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Array$<
                      Schema.SchemaClass<
                        | readonly [0n, bigint | null, any, any]
                        | readonly [1n, bigint | null, string]
                        | readonly [2n, string],
                        | readonly [0n, bigint | null, any, any]
                        | readonly [1n, bigint | null, string]
                        | readonly [2n, string],
                        never
                      >
                    >,
                    Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
                  ]
                >
              >,
              Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
              Schema.Tuple<
                [
                  Schema.Literal<[7n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[8n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[9n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[10n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[11n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[12n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[13n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.Union<
                    [
                      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                      Schema.Tuple<[Schema.Literal<[2n]>]>,
                      Schema.Tuple<[Schema.Literal<[3n]>]>
                    ]
                  >,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[14n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[15n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[16n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[17n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  typeof Schema.BigIntFromSelf
                ]
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[18n]>,
                  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >
            ]
          >
        >
      >
      5: Schema.optional<Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
      7: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
      8: Schema.optional<typeof Schema.BigIntFromSelf>
      9: Schema.optional<
        Schema.SchemaClass<
          ReadonlyMap<any, ReadonlyMap<any, bigint>>,
          ReadonlyMap<any, ReadonlyMap<any, bigint>>,
          never
        >
      >
      11: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
      13: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
          }
        >
      >
      14: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
      15: Schema.optional<typeof Schema.BigIntFromSelf>
      16: Schema.optional<
        Schema.Union<
          [
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    typeof Schema.BigIntFromSelf,
                    Schema.Tuple2<
                      typeof Schema.BigIntFromSelf,
                      Schema.SchemaClass<
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                        never
                      >
                    >
                  ]
                >,
                Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
              ]
            >,
            Schema.Struct<{
              0: typeof Schema.Uint8ArrayFromSelf
              1: Schema.SchemaClass<
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                never
              >
              2: Schema.optional<
                Schema.SchemaClass<
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  readonly [0n, any] | readonly [1n, CBOR.CBOR],
                  never
                >
              >
              3: Schema.optional<
                Schema.SchemaClass<
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                  never
                >
              >
            }>
          ]
        >
      >
      17: Schema.optional<typeof Schema.BigIntFromSelf>
      18: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
          }
        >
      >
      19: Schema.optional<
        Schema.SchemaClass<
          ReadonlyMap<
            | readonly [0n, readonly [0n | 1n, any]]
            | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
            | readonly [2n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          ReadonlyMap<
            | readonly [0n, readonly [0n | 1n, any]]
            | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
            | readonly [2n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          never
        >
      >
      20: Schema.optional<
        Schema.SchemaClass<
          readonly (readonly [
            bigint,
            any,
            (
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n]
            ),
            readonly [string, any] | null
          ])[],
          readonly (readonly [
            bigint,
            any,
            (
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n]
            ),
            readonly [string, any] | null
          ])[],
          never
        >
      >
      21: Schema.optional<typeof Schema.BigIntFromSelf>
      22: Schema.optional<typeof Schema.BigIntFromSelf>
    }>,
    Schema.SchemaClass<TransactionBody, TransactionBody, never>,
    never
  >
>
```

Added in v2.0.0

# utils

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Struct<{
    0: Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
      }
    >
    1: Schema.Array$<
      Schema.Union<
        [
          Schema.Tuple<
            [
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  typeof Schema.BigIntFromSelf,
                  Schema.Tuple2<
                    typeof Schema.BigIntFromSelf,
                    Schema.SchemaClass<
                      ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                      ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                      never
                    >
                  >
                ]
              >,
              Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
            ]
          >,
          Schema.Struct<{
            0: typeof Schema.Uint8ArrayFromSelf
            1: Schema.SchemaClass<
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              never
            >
            2: Schema.optional<
              Schema.SchemaClass<
                readonly [0n, any] | readonly [1n, CBOR.CBOR],
                readonly [0n, any] | readonly [1n, CBOR.CBOR],
                never
              >
            >
            3: Schema.optional<
              Schema.SchemaClass<
                { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                never
              >
            >
          }>
        ]
      >
    >
    2: typeof Schema.BigIntFromSelf
    3: Schema.optional<typeof Schema.BigIntFromSelf>
    4: Schema.optional<
      Schema.Array$<
        Schema.Union<
          [
            Schema.Tuple2<
              Schema.Literal<[0n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
            >,
            Schema.Tuple2<
              Schema.Literal<[1n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
            >,
            Schema.Tuple<
              [
                Schema.Literal<[2n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.Uint8ArrayFromSelf
              ]
            >,
            Schema.Tuple2<
              Schema.Literal<[3n]>,
              Schema.Tuple<
                [
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.BigIntFromSelf,
                  typeof Schema.BigIntFromSelf,
                  Schema.TaggedStruct<
                    "Tag",
                    {
                      tag: Schema.Literal<[30]>
                      value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                    }
                  >,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Array$<
                    Schema.SchemaClass<
                      | readonly [0n, bigint | null, any, any]
                      | readonly [1n, bigint | null, string]
                      | readonly [2n, string],
                      | readonly [0n, bigint | null, any, any]
                      | readonly [1n, bigint | null, string]
                      | readonly [2n, string],
                      never
                    >
                  >,
                  Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
                ]
              >
            >,
            Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
            Schema.Tuple<
              [
                Schema.Literal<[7n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[8n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[9n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Union<
                  [
                    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple<[Schema.Literal<[2n]>]>,
                    Schema.Tuple<[Schema.Literal<[3n]>]>
                  ]
                >
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[10n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple<[Schema.Literal<[2n]>]>,
                    Schema.Tuple<[Schema.Literal<[3n]>]>
                  ]
                >
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[11n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[12n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Union<
                  [
                    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple<[Schema.Literal<[2n]>]>,
                    Schema.Tuple<[Schema.Literal<[3n]>]>
                  ]
                >,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[13n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Union<
                  [
                    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                    Schema.Tuple<[Schema.Literal<[2n]>]>,
                    Schema.Tuple<[Schema.Literal<[3n]>]>
                  ]
                >,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[14n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[15n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[16n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.BigIntFromSelf,
                Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[17n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                typeof Schema.BigIntFromSelf
              ]
            >,
            Schema.Tuple<
              [
                Schema.Literal<[18n]>,
                Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
              ]
            >
          ]
        >
      >
    >
    5: Schema.optional<Schema.MapFromSelf<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
    7: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
    8: Schema.optional<typeof Schema.BigIntFromSelf>
    9: Schema.optional<
      Schema.SchemaClass<ReadonlyMap<any, ReadonlyMap<any, bigint>>, ReadonlyMap<any, ReadonlyMap<any, bigint>>, never>
    >
    11: Schema.optional<typeof Schema.Uint8ArrayFromSelf>
    13: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
        }
      >
    >
    14: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
    15: Schema.optional<typeof Schema.BigIntFromSelf>
    16: Schema.optional<
      Schema.Union<
        [
          Schema.Tuple<
            [
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  typeof Schema.BigIntFromSelf,
                  Schema.Tuple2<
                    typeof Schema.BigIntFromSelf,
                    Schema.SchemaClass<
                      ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                      ReadonlyMap<any, ReadonlyMap<any, bigint>>,
                      never
                    >
                  >
                ]
              >,
              Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
            ]
          >,
          Schema.Struct<{
            0: typeof Schema.Uint8ArrayFromSelf
            1: Schema.SchemaClass<
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              never
            >
            2: Schema.optional<
              Schema.SchemaClass<
                readonly [0n, any] | readonly [1n, CBOR.CBOR],
                readonly [0n, any] | readonly [1n, CBOR.CBOR],
                never
              >
            >
            3: Schema.optional<
              Schema.SchemaClass<
                { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                { readonly _tag: "Tag"; readonly tag: 24; readonly value: any },
                never
              >
            >
          }>
        ]
      >
    >
    17: Schema.optional<typeof Schema.BigIntFromSelf>
    18: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>>
        }
      >
    >
    19: Schema.optional<
      Schema.SchemaClass<
        ReadonlyMap<
          | readonly [0n, readonly [0n | 1n, any]]
          | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
          | readonly [2n, any],
          ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
        >,
        ReadonlyMap<
          | readonly [0n, readonly [0n | 1n, any]]
          | readonly [1n, readonly [0n, any] | readonly [1n, any] | readonly [2n] | readonly [3n]]
          | readonly [2n, any],
          ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
        >,
        never
      >
    >
    20: Schema.optional<
      Schema.SchemaClass<
        readonly (readonly [
          bigint,
          any,
          (
            | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                readonly (readonly [0n | 1n, any])[],
                ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
            | readonly [6n]
          ),
          readonly [string, any] | null
        ])[],
        readonly (readonly [
          bigint,
          any,
          (
            | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                readonly (readonly [0n | 1n, any])[],
                ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
            | readonly [6n]
          ),
          readonly [string, any] | null
        ])[],
        never
      >
    >
    21: Schema.optional<typeof Schema.BigIntFromSelf>
    22: Schema.optional<typeof Schema.BigIntFromSelf>
  }>,
  Schema.SchemaClass<TransactionBody, TransactionBody, never>,
  never
>
```
