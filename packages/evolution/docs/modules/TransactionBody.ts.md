---
title: TransactionBody.ts
nav_order: 106
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
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [FromCDDL](#fromcddl)
  - [isTransactionBody](#istransactionbody)
  - [make](#make)

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
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const toCBORBytes: (input: unknown, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a TransactionBody to CBOR hex string.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const toCBORHex: (input: unknown, options?: CBOR.CodecOptions) => string
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

TransactionBody

```
transaction_body =
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
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => unknown
```

Added in v2.0.0

## fromCBORHex

Parse a TransactionBody from CBOR hex string.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => unknown
```

Added in v2.0.0

# schemas

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
  any
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
  any
>
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Union<
  [
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
                  readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
                  readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
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
              Schema.Tuple<
                [
                  Schema.Literal<[3n]>,
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
                  readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
                  readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
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
            readonly [0n, any] | readonly [1n, any] | readonly [2n, any] | readonly [3n, any] | readonly [4n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          ReadonlyMap<
            readonly [0n, any] | readonly [1n, any] | readonly [2n, any] | readonly [3n, any] | readonly [4n, any],
            ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
          >,
          never
        >
      >
      20: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<
              Schema.Tuple<
                [
                  typeof Schema.BigIntFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  Schema.SchemaClass<
                    | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
                    | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
                    | readonly [2n, ReadonlyMap<any, bigint>, any]
                    | readonly [3n, readonly [any, bigint] | null]
                    | readonly [
                        4n,
                        readonly [any, bigint] | null,
                        (
                          | readonly (readonly [0n | 1n, any])[]
                          | {
                              readonly _tag: "Tag"
                              readonly tag: 258
                              readonly value: readonly (readonly [0n | 1n, any])[]
                            }
                        ),
                        ReadonlyMap<readonly [0n | 1n, any], bigint>,
                        { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                      ]
                    | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
                    | readonly [6n],
                    | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
                    | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
                    | readonly [2n, ReadonlyMap<any, bigint>, any]
                    | readonly [3n, readonly [any, bigint] | null]
                    | readonly [
                        4n,
                        readonly [any, bigint] | null,
                        (
                          | readonly (readonly [0n | 1n, any])[]
                          | {
                              readonly _tag: "Tag"
                              readonly tag: 258
                              readonly value: readonly (readonly [0n | 1n, any])[]
                            }
                        ),
                        ReadonlyMap<readonly [0n | 1n, any], bigint>,
                        { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                      ]
                    | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
                    | readonly [6n],
                    never
                  >,
                  Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                ]
              >
            >
          }
        >
      >
      21: Schema.optional<typeof Schema.BigIntFromSelf>
      22: Schema.optional<typeof Schema.BigIntFromSelf>
    }>,
    Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>>
  ]
>
```

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
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
                    readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
                    readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
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
                Schema.Tuple<
                  [
                    Schema.Literal<[3n]>,
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
                    readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
                    readonly [0n, any] | readonly [1n, { readonly _tag: "Tag"; readonly tag: 24; readonly value: any }],
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
              readonly [0n, any] | readonly [1n, any] | readonly [2n, any] | readonly [3n, any] | readonly [4n, any],
              ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
            >,
            ReadonlyMap<
              readonly [0n, any] | readonly [1n, any] | readonly [2n, any] | readonly [3n, any] | readonly [4n, any],
              ReadonlyMap<readonly [any, bigint], readonly [0n | 1n | 2n, readonly [string, any] | null]>
            >,
            never
          >
        >
        20: Schema.optional<
          Schema.TaggedStruct<
            "Tag",
            {
              tag: Schema.Literal<[258]>
              value: Schema.Array$<
                Schema.Tuple<
                  [
                    typeof Schema.BigIntFromSelf,
                    typeof Schema.Uint8ArrayFromSelf,
                    Schema.SchemaClass<
                      | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
                      | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
                      | readonly [2n, ReadonlyMap<any, bigint>, any]
                      | readonly [3n, readonly [any, bigint] | null]
                      | readonly [
                          4n,
                          readonly [any, bigint] | null,
                          (
                            | readonly (readonly [0n | 1n, any])[]
                            | {
                                readonly _tag: "Tag"
                                readonly tag: 258
                                readonly value: readonly (readonly [0n | 1n, any])[]
                              }
                          ),
                          ReadonlyMap<readonly [0n | 1n, any], bigint>,
                          { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                        ]
                      | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
                      | readonly [6n],
                      | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
                      | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
                      | readonly [2n, ReadonlyMap<any, bigint>, any]
                      | readonly [3n, readonly [any, bigint] | null]
                      | readonly [
                          4n,
                          readonly [any, bigint] | null,
                          (
                            | readonly (readonly [0n | 1n, any])[]
                            | {
                                readonly _tag: "Tag"
                                readonly tag: 258
                                readonly value: readonly (readonly [0n | 1n, any])[]
                              }
                          ),
                          ReadonlyMap<readonly [0n | 1n, any], bigint>,
                          { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                        ]
                      | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
                      | readonly [6n],
                      never
                    >,
                    Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
                  ]
                >
              >
            }
          >
        >
        21: Schema.optional<typeof Schema.BigIntFromSelf>
        22: Schema.optional<typeof Schema.BigIntFromSelf>
      }>,
      Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>>
    ]
  >,
  Schema.SchemaClass<TransactionBody, TransactionBody, never>,
  never
>
```

## isTransactionBody

**Signature**

```ts
export declare const isTransactionBody: (u: unknown, overrideOptions?: ParseOptions | number) => u is TransactionBody
```

## make

**Signature**

```ts
export declare const make: (
  props: {
    readonly withdrawals?: Withdrawals.Withdrawals | undefined
    readonly networkId?: (number & Brand<"NetworkId">) | undefined
    readonly mint?: (Map<PolicyId, Map<AssetName, bigint & Brand<"NonZeroInt64">>> & Brand<"Mint">) | undefined
    readonly fee: bigint
    readonly inputs: readonly TransactionInput.TransactionInput[]
    readonly outputs: readonly (
      | TransactionOutput.ShelleyTransactionOutput
      | TransactionOutput.BabbageTransactionOutput
    )[]
    readonly ttl?: bigint | undefined
    readonly certificates?:
      | readonly [
          (
            | Certificate.StakeRegistration
            | Certificate.StakeDeregistration
            | Certificate.StakeDelegation
            | Certificate.PoolRegistration
            | Certificate.PoolRetirement
            | Certificate.RegCert
            | Certificate.UnregCert
            | Certificate.VoteDelegCert
            | Certificate.StakeVoteDelegCert
            | Certificate.StakeRegDelegCert
            | Certificate.VoteRegDelegCert
            | Certificate.StakeVoteRegDelegCert
            | Certificate.AuthCommitteeHotCert
            | Certificate.ResignCommitteeColdCert
            | Certificate.RegDrepCert
            | Certificate.UnregDrepCert
            | Certificate.UpdateDrepCert
          ),
          ...(
            | Certificate.StakeRegistration
            | Certificate.StakeDeregistration
            | Certificate.StakeDelegation
            | Certificate.PoolRegistration
            | Certificate.PoolRetirement
            | Certificate.RegCert
            | Certificate.UnregCert
            | Certificate.VoteDelegCert
            | Certificate.StakeVoteDelegCert
            | Certificate.StakeRegDelegCert
            | Certificate.VoteRegDelegCert
            | Certificate.StakeVoteRegDelegCert
            | Certificate.AuthCommitteeHotCert
            | Certificate.ResignCommitteeColdCert
            | Certificate.RegDrepCert
            | Certificate.UnregDrepCert
            | Certificate.UpdateDrepCert
          )[]
        ]
      | undefined
    readonly auxiliaryDataHash?: AuxiliaryDataHash.AuxiliaryDataHash | undefined
    readonly validityIntervalStart?: bigint | undefined
    readonly scriptDataHash?: ScriptDataHash.ScriptDataHash | undefined
    readonly collateralInputs?:
      | readonly [TransactionInput.TransactionInput, ...TransactionInput.TransactionInput[]]
      | undefined
    readonly requiredSigners?: readonly [KeyHash.KeyHash, ...KeyHash.KeyHash[]] | undefined
    readonly collateralReturn?:
      | TransactionOutput.ShelleyTransactionOutput
      | TransactionOutput.BabbageTransactionOutput
      | undefined
    readonly totalCollateral?: bigint | undefined
    readonly referenceInputs?:
      | readonly [TransactionInput.TransactionInput, ...TransactionInput.TransactionInput[]]
      | undefined
    readonly votingProcedures?: VotingProcedures.VotingProcedures | undefined
    readonly proposalProcedures?: ProposalProcedures.ProposalProcedures | undefined
    readonly currentTreasuryValue?: bigint | undefined
    readonly donation?: bigint | undefined
  },
  options?: Schema.MakeOptions | undefined
) => TransactionBody
```
