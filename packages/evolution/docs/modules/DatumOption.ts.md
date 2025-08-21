---
title: DatumOption.ts
nav_order: 41
parent: Modules
---

## DatumOption overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [makeDatumHash](#makedatumhash)
  - [makeInlineDatum](#makeinlinedatum)
- [conversion](#conversion)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [DatumOptionError (class)](#datumoptionerror-class)
- [model](#model)
  - [DatumOption (type alias)](#datumoption-type-alias)
- [predicates](#predicates)
  - [isDatumHash](#isdatumhash)
  - [isInlineDatum](#isinlinedatum)
- [schemas](#schemas)
  - [DatumHash (class)](#datumhash-class)
    - [toString (method)](#tostring-method)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
  - [DatumOptionCDDLSchema](#datumoptioncddlschema)
  - [DatumOptionSchema](#datumoptionschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [InlineDatum (class)](#inlinedatum-class)
    - [toString (method)](#tostring-method-1)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method-1)
- [testing](#testing)
  - [arbitrary](#arbitrary)
- [utils](#utils)
  - [DatumHashFromBytes](#datumhashfrombytes)
  - [datumHashArbitrary](#datumhasharbitrary)
  - [inlineDatumArbitrary](#inlinedatumarbitrary)

---

# constructors

## makeDatumHash

Create a DatumOption with a datum hash.

**Signature**

```ts
export declare const makeDatumHash: (
  props: { readonly hash: any },
  options?: Schema.MakeOptions | undefined
) => DatumHash
```

Added in v2.0.0

## makeInlineDatum

Create a DatumOption with inline data.

**Signature**

```ts
export declare const makeInlineDatum: (
  props: { readonly data: PlutusData.Data },
  options?: Schema.MakeOptions | undefined
) => InlineDatum
```

Added in v2.0.0

# conversion

## fromCBORBytes

Convert CBOR bytes to DatumOption (unsafe)

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => DatumHash | InlineDatum
```

Added in v2.0.0

## fromCBORHex

Convert CBOR hex string to DatumOption (unsafe)

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => DatumHash | InlineDatum
```

Added in v2.0.0

# either

## Either (namespace)

Either namespace for DatumOption operations that can fail

Added in v2.0.0

# encoding

## toCBORBytes

Convert DatumOption to CBOR bytes (unsafe).

**Signature**

```ts
export declare const toCBORBytes: (input: DatumHash | InlineDatum, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert DatumOption to CBOR hex (unsafe).

**Signature**

```ts
export declare const toCBORHex: (input: DatumHash | InlineDatum, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two DatumOption instances are equal.

**Signature**

```ts
export declare const equals: (a: DatumOption, b: DatumOption) => boolean
```

Added in v2.0.0

# errors

## DatumOptionError (class)

Error class for DatumOption related operations.

**Signature**

```ts
export declare class DatumOptionError
```

Added in v2.0.0

# model

## DatumOption (type alias)

Type alias for DatumOption representing optional datum information.
Can be either a hash reference to datum data or inline plutus data.

**Signature**

```ts
export type DatumOption = typeof DatumOptionSchema.Type
```

Added in v2.0.0

# predicates

## isDatumHash

Check if a DatumOption is a datum hash.

**Signature**

```ts
export declare const isDatumHash: (u: unknown, overrideOptions?: ParseOptions | number) => u is DatumHash
```

Added in v2.0.0

## isInlineDatum

Check if a DatumOption is inline data.

**Signature**

```ts
export declare const isInlineDatum: (u: unknown, overrideOptions?: ParseOptions | number) => u is InlineDatum
```

Added in v2.0.0

# schemas

## DatumHash (class)

Schema for DatumHash variant of DatumOption.
Represents a reference to datum data stored elsewhere via its hash.

**Signature**

```ts
export declare class DatumHash
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

## DatumOptionCDDLSchema

CDDL schema for DatumOption.
datum_option = [0, Bytes32] / [1, #6.24(bytes)]

Where:

- [0, Bytes32] represents a datum hash (tag 0 with 32-byte hash)
- [1, #6.24(bytes)] represents inline data (tag 1 with CBOR tag 24 containing plutus data as bytes)

**Signature**

```ts
export declare const DatumOptionCDDLSchema: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<
        Schema.Literal<[1n]>,
        Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>
      >
    ]
  >,
  Schema.SchemaClass<DatumHash | InlineDatum, DatumHash | InlineDatum, never>,
  never
>
```

Added in v2.0.0

## DatumOptionSchema

Schema for DatumOption representing optional datum information in transaction outputs.

CDDL: datum_option = [0, Bytes32// 1, data]

Where:

- [0, Bytes32] represents a datum hash reference
- [1, data] represents inline plutus data

**Signature**

```ts
export declare const DatumOptionSchema: Schema.Union<[typeof DatumHash, typeof InlineDatum]>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for DatumOption.
Transforms between Uint8Array and DatumOption using CBOR encoding.

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
        Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Tuple2<
          Schema.Literal<[1n]>,
          Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>
        >
      ]
    >,
    Schema.SchemaClass<DatumHash | InlineDatum, DatumHash | InlineDatum, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for DatumOption.
Transforms between hex string and DatumOption using CBOR encoding.

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
          Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple2<
            Schema.Literal<[1n]>,
            Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>
          >
        ]
      >,
      Schema.SchemaClass<DatumHash | InlineDatum, DatumHash | InlineDatum, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for DatumOption.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<
        Schema.Literal<[1n]>,
        Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>
      >
    ]
  >,
  Schema.SchemaClass<DatumHash | InlineDatum, DatumHash | InlineDatum, never>,
  never
>
```

Added in v2.0.0

## InlineDatum (class)

Schema for InlineDatum variant of DatumOption.
Represents inline plutus data embedded directly in the transaction output.

**Signature**

```ts
export declare class InlineDatum
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

# testing

## arbitrary

FastCheck arbitrary for generating random DatumOption instances

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<DatumHash | InlineDatum>
```

Added in v2.0.0

# utils

## DatumHashFromBytes

**Signature**

```ts
export declare const DatumHashFromBytes: Schema.transform<
  Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
  typeof DatumHash
>
```

## datumHashArbitrary

**Signature**

```ts
export declare const datumHashArbitrary: FastCheck.Arbitrary<DatumHash>
```

## inlineDatumArbitrary

**Signature**

```ts
export declare const inlineDatumArbitrary: FastCheck.Arbitrary<InlineDatum>
```
