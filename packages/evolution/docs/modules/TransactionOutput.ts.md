---
title: TransactionOutput.ts
nav_order: 91
parent: Modules
---

## TransactionOutput overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [BabbageTransactionOutput (class)](#babbagetransactionoutput-class)
  - [ShelleyTransactionOutput (class)](#shelleytransactionoutput-class)
- [schemas](#schemas)
  - [BabbageTransactionOutputCDDLSchema](#babbagetransactionoutputcddlschema)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [ShelleyTransactionOutputCDDLSchema](#shelleytransactionoutputcddlschema)
  - [TransactionOutput](#transactionoutput)
  - [TransactionOutputCDDLSchema](#transactionoutputcddlschema)
- [utils](#utils)
  - [Codec](#codec)
  - [TransactionOutput (type alias)](#transactionoutput-type-alias)
  - [TransactionOutputError (class)](#transactionoutputerror-class)

---

# model

## BabbageTransactionOutput (class)

Babbage-era transaction output format

```
CDDL: babbage_transaction_output =
  {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
```

**Signature**

```ts
export declare class BabbageTransactionOutput
```

Added in v2.0.0

## ShelleyTransactionOutput (class)

Shelley-era transaction output format

```
CDDL: shelley_transaction_output = [address, amount : value, ? Bytes32]
```

**Signature**

```ts
export declare class ShelleyTransactionOutput
```

Added in v2.0.0

# schemas

## BabbageTransactionOutputCDDLSchema

CDDL schema for Babbage transaction outputs

```
CDDL: babbage_transaction_output = {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
```

**Signature**

```ts
export declare const BabbageTransactionOutputCDDLSchema: Schema.transformOrFail<
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
        { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
        { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
        never
      >
    >
  }>,
  Schema.SchemaClass<BabbageTransactionOutput, BabbageTransactionOutput, never>,
  never
>
```

Added in v2.0.0

## CBORBytesSchema

CBOR bytes transformation schema for TransactionOutput.
Transforms between Uint8Array and TransactionOutput using CBOR encoding.

**Signature**

```ts
export declare const CBORBytesSchema: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.Union<
    [
      Schema.transformOrFail<
        Schema.Tuple<
          [
            typeof Schema.Uint8ArrayFromSelf,
            Schema.SchemaClass<
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
              never
            >,
            Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
          ]
        >,
        Schema.SchemaClass<ShelleyTransactionOutput, ShelleyTransactionOutput, never>,
        never
      >,
      Schema.transformOrFail<
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
              { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
              { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
              never
            >
          >
        }>,
        Schema.SchemaClass<BabbageTransactionOutput, BabbageTransactionOutput, never>,
        never
      >
    ]
  >
>
```

Added in v2.0.0

## CBORHexSchema

CBOR hex transformation schema for TransactionOutput.
Transforms between hex string and TransactionOutput using CBOR encoding.

**Signature**

```ts
export declare const CBORHexSchema: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.Union<
      [
        Schema.transformOrFail<
          Schema.Tuple<
            [
              typeof Schema.Uint8ArrayFromSelf,
              Schema.SchemaClass<
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
                never
              >,
              Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
            ]
          >,
          Schema.SchemaClass<ShelleyTransactionOutput, ShelleyTransactionOutput, never>,
          never
        >,
        Schema.transformOrFail<
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
                { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
                { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
                never
              >
            >
          }>,
          Schema.SchemaClass<BabbageTransactionOutput, BabbageTransactionOutput, never>,
          never
        >
      ]
    >
  >
>
```

Added in v2.0.0

## ShelleyTransactionOutputCDDLSchema

CDDL schema for Shelley transaction outputs

```
CDDL: shelley_transaction_output = [address, amount : value, ? Bytes32]
```

**Signature**

```ts
export declare const ShelleyTransactionOutputCDDLSchema: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.Uint8ArrayFromSelf,
      Schema.SchemaClass<
        bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
        bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
        never
      >,
      Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
    ]
  >,
  Schema.SchemaClass<ShelleyTransactionOutput, ShelleyTransactionOutput, never>,
  never
>
```

Added in v2.0.0

## TransactionOutput

Union type for transaction outputs

```
CDDL: transaction_output = shelley_transaction_output / babbage_transaction_output
```

**Signature**

```ts
export declare const TransactionOutput: Schema.Union<[typeof ShelleyTransactionOutput, typeof BabbageTransactionOutput]>
```

Added in v2.0.0

## TransactionOutputCDDLSchema

CDDL schema for transaction outputs

```
CDDL: transaction_output = shelley_transaction_output / babbage_transaction_output
shelley_transaction_output = [address, amount : value, ? Bytes32]
babbage_transaction_output = {0 : address, 1 : value, ? 2 : datum_option, ? 3 : script_ref}
```

**Signature**

```ts
export declare const TransactionOutputCDDLSchema: Schema.Union<
  [
    Schema.transformOrFail<
      Schema.Tuple<
        [
          typeof Schema.Uint8ArrayFromSelf,
          Schema.SchemaClass<
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            bigint | readonly [bigint, ReadonlyMap<any, ReadonlyMap<any, bigint>>],
            never
          >,
          Schema.Element<typeof Schema.Uint8ArrayFromSelf, "?">
        ]
      >,
      Schema.SchemaClass<ShelleyTransactionOutput, ShelleyTransactionOutput, never>,
      never
    >,
    Schema.transformOrFail<
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
            { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
            { readonly tag: number; readonly value: CBOR.CBOR; readonly _tag: "Tag" },
            never
          >
        >
      }>,
      Schema.SchemaClass<BabbageTransactionOutput, BabbageTransactionOutput, never>,
      never
    >
  ]
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (input: ShelleyTransactionOutput | BabbageTransactionOutput) => any
    cborHex: (input: ShelleyTransactionOutput | BabbageTransactionOutput) => string
  }
  Decode: {
    cborBytes: (input: any) => ShelleyTransactionOutput | BabbageTransactionOutput
    cborHex: (input: string) => ShelleyTransactionOutput | BabbageTransactionOutput
  }
  EncodeEffect: {
    cborBytes: (
      input: ShelleyTransactionOutput | BabbageTransactionOutput
    ) => Effect.Effect<any, InstanceType<typeof TransactionOutputError>>
    cborHex: (
      input: ShelleyTransactionOutput | BabbageTransactionOutput
    ) => Effect.Effect<string, InstanceType<typeof TransactionOutputError>>
  }
  DecodeEffect: {
    cborBytes: (
      input: any
    ) => Effect.Effect<ShelleyTransactionOutput | BabbageTransactionOutput, InstanceType<typeof TransactionOutputError>>
    cborHex: (
      input: string
    ) => Effect.Effect<ShelleyTransactionOutput | BabbageTransactionOutput, InstanceType<typeof TransactionOutputError>>
  }
  EncodeEither: {
    cborBytes: (
      input: ShelleyTransactionOutput | BabbageTransactionOutput
    ) => Either<any, InstanceType<typeof TransactionOutputError>>
    cborHex: (
      input: ShelleyTransactionOutput | BabbageTransactionOutput
    ) => Either<string, InstanceType<typeof TransactionOutputError>>
  }
  DecodeEither: {
    cborBytes: (
      input: any
    ) => Either<ShelleyTransactionOutput | BabbageTransactionOutput, InstanceType<typeof TransactionOutputError>>
    cborHex: (
      input: string
    ) => Either<ShelleyTransactionOutput | BabbageTransactionOutput, InstanceType<typeof TransactionOutputError>>
  }
}
```

## TransactionOutput (type alias)

**Signature**

```ts
export type TransactionOutput = Schema.Schema.Type<typeof TransactionOutput>
```

## TransactionOutputError (class)

**Signature**

```ts
export declare class TransactionOutputError
```
