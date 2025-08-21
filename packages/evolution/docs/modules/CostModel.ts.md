---
title: CostModel.ts
nav_order: 37
parent: Modules
---

## CostModel overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [CostModel (class)](#costmodel-class)
  - [CostModelError (class)](#costmodelerror-class)
  - [CostModels (class)](#costmodels-class)
  - [FromCDDL](#fromcddl)
  - [arbitrary](#arbitrary)
  - [fromCBOR](#fromcbor)
  - [fromCBORHex](#fromcborhex)
  - [languageViewsEncoding](#languageviewsencoding)
  - [toCBOR](#tocbor)
  - [toCBORHex](#tocborhex)

---

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.MapFromSelf<
  typeof Schema.BigIntFromSelf,
  Schema.Array$<typeof Schema.BigIntFromSelf>
>
```

## CostModel (class)

Individual cost model for a specific Plutus language version.
Contains an array of cost parameters.

```
cost_model = [ * uint ]
```

**Signature**

```ts
export declare class CostModel
```

## CostModelError (class)

Error class for CostModel related operations.

**Signature**

```ts
export declare class CostModelError
```

## CostModels (class)

Map of language versions to their corresponding cost models.

```
 cost_models = { * language => cost_model }
```

**Signature**

```ts
export declare class CostModels
```

## FromCDDL

CBOR encoding/decoding for CostModels using language tags as keys.
Only includes languages with non-empty cost arrays to match CML behavior.

**Signature**

```ts
export declare const FromCDDL: Schema.transform<
  Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Array$<typeof Schema.BigIntFromSelf>>,
  Schema.SchemaClass<CostModels, CostModels, never>
>
```

## arbitrary

FastCheck arbitrary for CostModel instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<CostModel>
```

## fromCBOR

CBOR decoding for CostModels.

**Signature**

```ts
export declare const fromCBOR: (bytes: Uint8Array, options?: CBOR.CodecOptions) => CostModels
```

## fromCBORHex

CBOR decoding for CostModels.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => CostModels
```

## languageViewsEncoding

Encode cost models as language_views for script data hash.

```
 { * language => script_integrity_data }

 This must be encoded canonically, using the same scheme as in
 RFC7049 section 3.9:
  - Maps, strings, and bytestrings must use a definite-length encoding
  - Integers must be as small as possible.
  - The expressions for map length, string length, and bytestring length
    must be as short as possible.
  - The keys in the map must be sorted as follows:
     -  If two keys have different lengths, the shorter one sorts earlier.
     -  If two keys have the same length, the one with the lower value
        in (byte-wise) lexical order sorts earlier.

 For PlutusV1 (language id 0), the language view is the following:
   - the value of cost_models map at key 0 (in other words, the script_integrity_data)
     is encoded as an indefinite length list and the result is encoded as a bytestring.
     (our apologies)
     For example, the script_integrity_data corresponding to the all zero costmodel for V1
     would be encoded as (in hex):
     58a89f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff
   - the language ID tag is also encoded twice. first as a uint then as
     a bytestring. (our apologies)
     Concretely, this means that the language version for V1 is encoded as
     4100 in hex.
 For PlutusV2 (language id 1), the language view is the following:
   - the value of cost_models map at key 1 is encoded as an definite length list.
     For example, the script_integrity_data corresponding to the all zero costmodel for V2
     would be encoded as (in hex):
     98af0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
   - the language ID tag is encoded as expected.
     Concretely, this means that the language version for V2 is encoded as
     01 in hex.
 For PlutusV3 (language id 2), the language view is the following:
   - the value of cost_models map at key 2 is encoded as a definite length list.

 Note that each Plutus language represented inside a transaction must have
 a cost model in the cost_models protocol parameter in order to execute,
 regardless of what the script integrity data is.
```

Returns the canonical CBOR encoding of the language views map.

**Signature**

```ts
export declare const languageViewsEncoding: (costModels: CostModels) => Uint8Array
```

## toCBOR

CBOR encoding for CostModels.

**Signature**

```ts
export declare const toCBOR: (input: CostModels, options?: CBOR.CodecOptions) => Uint8Array
```

## toCBORHex

**Signature**

```ts
export declare const toCBORHex: (input: CostModels, options?: CBOR.CodecOptions) => string
```
