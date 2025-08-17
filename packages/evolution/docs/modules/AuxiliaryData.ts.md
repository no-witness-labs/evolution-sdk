---
title: AuxiliaryData.ts
nav_order: 6
parent: Modules
---

## AuxiliaryData overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [empty](#empty)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [AuxiliaryDataError (class)](#auxiliarydataerror-class)
- [model](#model)
  - [AuxiliaryData (class)](#auxiliarydata-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random AuxiliaryData instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<AuxiliaryData>
```

Added in v2.0.0

# constructors

## empty

Create an empty AuxiliaryData instance.

**Signature**

```ts
export declare const empty: () => AuxiliaryData
```

Added in v2.0.0

## make

Smart constructor for AuxiliaryData with validation.

**Signature**

```ts
export declare const make: <C>(this: C, ...args: ConstructorParameters<C>) => InstanceType<C>
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode AuxiliaryData to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (value: AuxiliaryData, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode AuxiliaryData to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (value: AuxiliaryData, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two AuxiliaryData instances are equal (deep comparison).

**Signature**

```ts
export declare const equals: (a: AuxiliaryData, b: AuxiliaryData) => boolean
```

Added in v2.0.0

# errors

## AuxiliaryDataError (class)

Error class for AuxiliaryData related operations.

**Signature**

```ts
export declare class AuxiliaryDataError
```

Added in v2.0.0

# model

## AuxiliaryData (class)

AuxiliaryData based on Conway CDDL specification.

CDDL (Conway era):

```
auxiliary_data = {
  ? 0 => metadata           ; transaction_metadata
  ? 1 => [* native_script]  ; native_scripts
  ? 2 => [* plutus_v1_script] ; plutus_v1_scripts
  ? 3 => [* plutus_v2_script] ; plutus_v2_scripts
  ? 4 => [* plutus_v3_script] ; plutus_v3_scripts
}
```

Uses map format with numeric keys as per Conway specification.

**Signature**

```ts
export declare class AuxiliaryData
```

Added in v2.0.0

# parsing

## fromCBORBytes

Decode AuxiliaryData from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => AuxiliaryData
```

Added in v2.0.0

## fromCBORHex

Decode AuxiliaryData from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => AuxiliaryData
```

Added in v2.0.0

# schemas

## CDDLSchema

Tagged CDDL schema for AuxiliaryData (#6.259 wrapping the struct).

**Signature**

```ts
export declare const CDDLSchema: Schema.TaggedStruct<
  "Tag",
  {
    tag: Schema.Literal<[259]>
    value: Schema.Struct<{
      0: Schema.optional<Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>>
      1: Schema.optional<
        Schema.Array$<
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
      >
      2: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
      3: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
      4: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
    }>
  }
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for AuxiliaryData.
Transforms between CBOR bytes and AuxiliaryData using CDDL format.

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
    Schema.TaggedStruct<
      "Tag",
      {
        tag: Schema.Literal<[259]>
        value: Schema.Struct<{
          0: Schema.optional<
            Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
          >
          1: Schema.optional<
            Schema.Array$<
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
          >
          2: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
          3: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
          4: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
        }>
      }
    >,
    Schema.SchemaClass<AuxiliaryData, AuxiliaryData, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for AuxiliaryData.
Transforms between CBOR hex string and AuxiliaryData using CDDL format.

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.TaggedStruct<
        "Tag",
        {
          tag: Schema.Literal<[259]>
          value: Schema.Struct<{
            0: Schema.optional<
              Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
            >
            1: Schema.optional<
              Schema.Array$<
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
            >
            2: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
            3: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
            4: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
          }>
        }
      >,
      Schema.SchemaClass<AuxiliaryData, AuxiliaryData, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

Transform between tagged CDDL (tag 259) and AuxiliaryData class.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.TaggedStruct<
    "Tag",
    {
      tag: Schema.Literal<[259]>
      value: Schema.Struct<{
        0: Schema.optional<
          Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
        >
        1: Schema.optional<
          Schema.Array$<
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
        >
        2: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
        3: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
        4: Schema.optional<Schema.Array$<typeof Schema.Uint8ArrayFromSelf>>
      }>
    }
  >,
  Schema.SchemaClass<AuxiliaryData, AuxiliaryData, never>,
  never
>
```

Added in v2.0.0
