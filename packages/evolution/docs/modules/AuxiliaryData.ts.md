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
  - [conwayArbitrary](#conwayarbitrary)
- [constructors](#constructors)
  - [conway](#conway)
  - [emptyConwayAuxiliaryData](#emptyconwayauxiliarydata)
  - [shelley](#shelley)
  - [shelleyMA](#shelleyma)
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
  - [AuxiliaryData](#auxiliarydata)
  - [AuxiliaryData (type alias)](#auxiliarydata-type-alias)
  - [ConwayAuxiliaryData (class)](#conwayauxiliarydata-class)
  - [ShelleyAuxiliaryData (class)](#shelleyauxiliarydata-class)
  - [ShelleyMAAuxiliaryData (class)](#shelleymaauxiliarydata-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
- [utils](#utils)
  - [FromCDDL](#fromcddl)
  - [empty](#empty)
  - [shelleyArbitrary](#shelleyarbitrary)
  - [shelleyMAArbitrary](#shelleymaarbitrary)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random AuxiliaryData instances.
Generates all three era formats with equal probability.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData>
```

Added in v2.0.0

## conwayArbitrary

FastCheck arbitrary for generating Conway-era AuxiliaryData instances.
Conway era supports all features: metadata, native scripts, and all Plutus script versions.

**Signature**

```ts
export declare const conwayArbitrary: FastCheck.Arbitrary<ConwayAuxiliaryData>
```

Added in v2.0.0

# constructors

## conway

Create a Conway-era AuxiliaryData instance.

**Signature**

```ts
export declare const conway: (input: {
  metadata?: Metadata.Metadata
  nativeScripts?: Array<NativeScripts.Native>
  plutusV1Scripts?: Array<PlutusV1.PlutusV1>
  plutusV2Scripts?: Array<PlutusV2.PlutusV2>
  plutusV3Scripts?: Array<PlutusV3.PlutusV3>
}) => AuxiliaryData
```

Added in v2.0.0

## emptyConwayAuxiliaryData

Create an empty Conway AuxiliaryData instance.

**Signature**

```ts
export declare const emptyConwayAuxiliaryData: () => AuxiliaryData
```

Added in v2.0.0

## shelley

Create a Shelley-era AuxiliaryData instance.

**Signature**

```ts
export declare const shelley: (input: { metadata: Metadata.Metadata }) => AuxiliaryData
```

Added in v2.0.0

## shelleyMA

Create a ShelleyMA-era AuxiliaryData instance.

**Signature**

```ts
export declare const shelleyMA: (input: {
  metadata?: Metadata.Metadata
  nativeScripts?: Array<NativeScripts.Native>
}) => AuxiliaryData
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
export declare const toCBORBytes: (
  input: ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
  options?: CBOR.CodecOptions
) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode AuxiliaryData to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (
  input: ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
  options?: CBOR.CodecOptions
) => string
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

## AuxiliaryData

Union of all AuxiliaryData era formats.

**Signature**

```ts
export declare const AuxiliaryData: Schema.Union<
  [typeof ConwayAuxiliaryData, typeof ShelleyMAAuxiliaryData, typeof ShelleyAuxiliaryData]
>
```

Added in v2.0.0

## AuxiliaryData (type alias)

Type representing any AuxiliaryData format.

**Signature**

```ts
export type AuxiliaryData = Schema.Schema.Type<typeof AuxiliaryData>
```

Added in v2.0.0

## ConwayAuxiliaryData (class)

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
export declare class ConwayAuxiliaryData
```

Added in v2.0.0

## ShelleyAuxiliaryData (class)

AuxiliaryData for Shelley era (direct metadata).

CDDL (Shelley era):

```
auxiliary_data = metadata
```

**Signature**

```ts
export declare class ShelleyAuxiliaryData
```

Added in v2.0.0

## ShelleyMAAuxiliaryData (class)

AuxiliaryData for ShelleyMA era (array format).

CDDL (ShelleyMA era):

```
auxiliary_data = [ metadata?, [* native_script]? ]
```

**Signature**

```ts
export declare class ShelleyMAAuxiliaryData
```

Added in v2.0.0

# parsing

## fromCBORBytes

Decode AuxiliaryData from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (
  bytes: Uint8Array,
  options?: CBOR.CodecOptions
) => ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData
```

Added in v2.0.0

## fromCBORHex

Decode AuxiliaryData from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (
  hex: string,
  options?: CBOR.CodecOptions
) => ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData
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
    Schema.Union<
      [
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
        Schema.Array$<Schema.suspend<CBOR.CBOR, CBOR.CBOR, never>>,
        Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
      ]
    >,
    Schema.SchemaClass<
      ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
      ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
      never
    >,
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
      Schema.Union<
        [
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
          Schema.Array$<Schema.suspend<CBOR.CBOR, CBOR.CBOR, never>>,
          Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
        ]
      >,
      Schema.SchemaClass<
        ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
        ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
        never
      >,
      never
    >
  >
>
```

Added in v2.0.0

# utils

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
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
      Schema.Array$<Schema.suspend<CBOR.CBOR, CBOR.CBOR, never>>,
      Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CDDLSchema, CDDLSchema, never>>
    ]
  >,
  Schema.SchemaClass<
    ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
    ConwayAuxiliaryData | ShelleyMAAuxiliaryData | ShelleyAuxiliaryData,
    never
  >,
  never
>
```

## empty

Backwards-friendly helper returning empty Conway-format auxiliary data.
Alias kept for ergonomics and CML-compat tests.

**Signature**

```ts
export declare const empty: () => AuxiliaryData
```

## shelleyArbitrary

**Signature**

```ts
export declare const shelleyArbitrary: FastCheck.Arbitrary<ShelleyAuxiliaryData>
```

## shelleyMAArbitrary

**Signature**

```ts
export declare const shelleyMAArbitrary: FastCheck.Arbitrary<ShelleyMAAuxiliaryData>
```
