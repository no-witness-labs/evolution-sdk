---
title: TransactionWitnessSet.ts
nav_order: 113
parent: Modules
---

## TransactionWitnessSet overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [empty](#empty)
  - [fromNativeScripts](#fromnativescripts)
  - [fromVKeyWitnesses](#fromvkeywitnesses)
  - [make](#make)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [TransactionWitnessSetError (class)](#transactionwitnessseterror-class)
- [model](#model)
  - [BootstrapWitness (class)](#bootstrapwitness-class)
  - [PlutusScript](#plutusscript)
  - [TransactionWitnessSet (class)](#transactionwitnessset-class)
  - [VKeyWitness (class)](#vkeywitness-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [PlutusScript (type alias)](#plutusscript-type-alias)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random TransactionWitnessSet instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<TransactionWitnessSet>
```

Added in v2.0.0

# constructors

## empty

Create an empty TransactionWitnessSet.

**Signature**

```ts
export declare const empty: () => TransactionWitnessSet
```

Added in v2.0.0

## fromNativeScripts

Create a TransactionWitnessSet with only native scripts.

**Signature**

```ts
export declare const fromNativeScripts: (scripts: Array<NativeScripts.Native>) => TransactionWitnessSet
```

Added in v2.0.0

## fromVKeyWitnesses

Create a TransactionWitnessSet with only VKey witnesses.

**Signature**

```ts
export declare const fromVKeyWitnesses: (witnesses: Array<VKeyWitness>) => TransactionWitnessSet
```

Added in v2.0.0

## make

Smart constructor for TransactionWitnessSet that validates and applies branding.

**Signature**

```ts
export declare const make: <C>(this: C, ...args: ConstructorParameters<C>) => InstanceType<C>
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a TransactionWitnessSet to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: TransactionWitnessSet, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a TransactionWitnessSet to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: TransactionWitnessSet, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two TransactionWitnessSet instances are equal.

**Signature**

```ts
export declare const equals: (a: TransactionWitnessSet, b: TransactionWitnessSet) => boolean
```

Added in v2.0.0

# errors

## TransactionWitnessSetError (class)

Error class for TransactionWitnessSet related operations.

**Signature**

```ts
export declare class TransactionWitnessSetError
```

Added in v2.0.0

# model

## BootstrapWitness (class)

Bootstrap witness for Byron-era addresses.

CDDL: bootstrap_witness = [
public_key : vkey,
signature : ed25519_signature,
chain_code : bytes .size 32,
attributes : bytes
]

**Signature**

```ts
export declare class BootstrapWitness
```

Added in v2.0.0

## PlutusScript

Plutus script reference with version tag.

```
CDDL: plutus_script =
  [ 0, plutus_v1_script ]
/ [ 1, plutus_v2_script ]
/ [ 2, plutus_v3_script ]
```

**Signature**

```ts
export declare const PlutusScript: Schema.Union<
  [typeof PlutusV1.PlutusV1, typeof PlutusV2.PlutusV2, typeof PlutusV3.PlutusV3]
>
```

Added in v2.0.0

## TransactionWitnessSet (class)

TransactionWitnessSet based on Conway CDDL specification.

```
CDDL: transaction_witness_set = {
  ? 0 : nonempty_set<vkeywitness>
  ? 1 : nonempty_set<native_script>
  ? 2 : nonempty_set<bootstrap_witness>
  ? 3 : nonempty_set<plutus_v1_script>
  ? 4 : nonempty_set<plutus_data>
  ? 5 : redeemers
  ? 6 : nonempty_set<plutus_v2_script>
  ? 7 : nonempty_set<plutus_v3_script>
}

nonempty_set<a0> = #6.258([+ a0])/ [+ a0]
```

**Signature**

```ts
export declare class TransactionWitnessSet
```

Added in v2.0.0

## VKeyWitness (class)

VKey witness for Ed25519 signatures.

CDDL: vkeywitness = [ vkey, ed25519_signature ]

**Signature**

```ts
export declare class VKeyWitness
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse a TransactionWitnessSet from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => TransactionWitnessSet
```

Added in v2.0.0

## fromCBORHex

Parse a TransactionWitnessSet from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => TransactionWitnessSet
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for TransactionWitnessSet as struct/record structure.
Supports both tagged (CBOR tag 258) and untagged arrays for nonempty_set.
Uses number keys to leverage CBOR Record encoding with proper integer key handling.

**Signature**

```ts
export declare const CDDLSchema: Schema.Struct<{
  0: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>>
      }
    >
  >
  1: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<
                Schema.Literal<[1n]>,
                Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
              >,
              Schema.Tuple2<
                Schema.Literal<[2n]>,
                Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
              >,
              Schema.Tuple<
                [
                  Schema.Literal<[3n]>,
                  typeof Schema.BigIntFromSelf,
                  Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                ]
              >,
              Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
              Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
            ]
          >
        >
      }
    >
  >
  2: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[258]>
        value: Schema.Array$<
          Schema.Tuple<
            [
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.Uint8ArrayFromSelf
            ]
          >
        >
      }
    >
  >
  3: Schema.optional<
    Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
  >
  4: Schema.optional<
    Schema.TaggedStruct<
      "Tag",
      { tag: Schema.Literal<[258]>; value: Schema.Array$<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>> }
    >
  >
  5: Schema.optional<
    Schema.Array$<
      Schema.Tuple<
        [
          Schema.SchemaClass<bigint, bigint, never>,
          Schema.SchemaClass<bigint, bigint, never>,
          Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
          Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
        ]
      >
    >
  >
  6: Schema.optional<
    Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
  >
  7: Schema.optional<
    Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
  >
}>
```

Added in v2.0.0

## FromCDDL

CDDL transformation schema for TransactionWitnessSet.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Struct<{
    0: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>>
        }
      >
    >
    1: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<
                  Schema.Literal<[1n]>,
                  Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                >,
                Schema.Tuple2<
                  Schema.Literal<[2n]>,
                  Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                >,
                Schema.Tuple<
                  [
                    Schema.Literal<[3n]>,
                    typeof Schema.BigIntFromSelf,
                    Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                  ]
                >,
                Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
                Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
              ]
            >
          >
        }
      >
    >
    2: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[258]>
          value: Schema.Array$<
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.Uint8ArrayFromSelf
              ]
            >
          >
        }
      >
    >
    3: Schema.optional<
      Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
    >
    4: Schema.optional<
      Schema.TaggedStruct<
        "Tag",
        { tag: Schema.Literal<[258]>; value: Schema.Array$<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>> }
      >
    >
    5: Schema.optional<
      Schema.Array$<
        Schema.Tuple<
          [
            Schema.SchemaClass<bigint, bigint, never>,
            Schema.SchemaClass<bigint, bigint, never>,
            Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
            Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
          ]
        >
      >
    >
    6: Schema.optional<
      Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
    >
    7: Schema.optional<
      Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }>
    >
  }>,
  Schema.SchemaClass<TransactionWitnessSet, TransactionWitnessSet, never>,
  never
>
```

Added in v2.0.0

# utils

## FromCBORBytes

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
      0: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>>
          }
        >
      >
      1: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<
                    Schema.Literal<[1n]>,
                    Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                  >,
                  Schema.Tuple2<
                    Schema.Literal<[2n]>,
                    Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                  >,
                  Schema.Tuple<
                    [
                      Schema.Literal<[3n]>,
                      typeof Schema.BigIntFromSelf,
                      Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                    ]
                  >,
                  Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
                  Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
                ]
              >
            >
          }
        >
      >
      2: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<
              Schema.Tuple<
                [
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf
                ]
              >
            >
          }
        >
      >
      3: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
      4: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>> }
        >
      >
      5: Schema.optional<
        Schema.Array$<
          Schema.Tuple<
            [
              Schema.SchemaClass<bigint, bigint, never>,
              Schema.SchemaClass<bigint, bigint, never>,
              Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
              Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
            ]
          >
        >
      >
      6: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
      7: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
    }>,
    Schema.SchemaClass<TransactionWitnessSet, TransactionWitnessSet, never>,
    never
  >
>
```

## FromCBORHex

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
      0: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>>
          }
        >
      >
      1: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<
                    Schema.Literal<[1n]>,
                    Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                  >,
                  Schema.Tuple2<
                    Schema.Literal<[2n]>,
                    Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                  >,
                  Schema.Tuple<
                    [
                      Schema.Literal<[3n]>,
                      typeof Schema.BigIntFromSelf,
                      Schema.Array$<Schema.suspend<NativeScripts.NativeCDDL, NativeScripts.NativeCDDL, never>>
                    ]
                  >,
                  Schema.Tuple2<Schema.Literal<[4n]>, typeof Schema.BigIntFromSelf>,
                  Schema.Tuple2<Schema.Literal<[5n]>, typeof Schema.BigIntFromSelf>
                ]
              >
            >
          }
        >
      >
      2: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          {
            tag: Schema.Literal<[258]>
            value: Schema.Array$<
              Schema.Tuple<
                [
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf,
                  typeof Schema.Uint8ArrayFromSelf
                ]
              >
            >
          }
        >
      >
      3: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
      4: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>> }
        >
      >
      5: Schema.optional<
        Schema.Array$<
          Schema.Tuple<
            [
              Schema.SchemaClass<bigint, bigint, never>,
              Schema.SchemaClass<bigint, bigint, never>,
              Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>,
              Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
            ]
          >
        >
      >
      6: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
      7: Schema.optional<
        Schema.TaggedStruct<
          "Tag",
          { tag: Schema.Literal<[258]>; value: Schema.Array$<typeof Schema.Uint8ArrayFromSelf> }
        >
      >
    }>,
    Schema.SchemaClass<TransactionWitnessSet, TransactionWitnessSet, never>,
    never
  >
>
```

## PlutusScript (type alias)

**Signature**

```ts
export type PlutusScript = typeof PlutusScript.Type
```
