---
title: DRep.ts
nav_order: 44
parent: Modules
---

## DRep overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [alwaysAbstain](#alwaysabstain)
  - [alwaysNoConfidence](#alwaysnoconfidence)
  - [fromKeyHash](#fromkeyhash)
  - [fromScriptHash](#fromscripthash)
- [effect](#effect)
  - [Effect (namespace)](#effect-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [DRepError (class)](#dreperror-class)
- [model](#model)
  - [AlwaysAbstainDRep (type alias)](#alwaysabstaindrep-type-alias)
  - [AlwaysNoConfidenceDRep (type alias)](#alwaysnoconfidencedrep-type-alias)
  - [DRep (type alias)](#drep-type-alias)
  - [KeyHashDRep (type alias)](#keyhashdrep-type-alias)
  - [ScriptHashDRep (type alias)](#scripthashdrep-type-alias)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [pattern matching](#pattern-matching)
  - [match](#match)
- [predicates](#predicates)
  - [isDRep](#isdrep)
- [schemas](#schemas)
  - [DRep](#drep)
  - [FromBytes](#frombytes-1)
  - [FromCDDL](#fromcddl)
  - [FromHex](#fromhex-1)
- [type guards](#type-guards)
  - [isAlwaysAbstainDRep](#isalwaysabstaindrep)
  - [isAlwaysNoConfidenceDRep](#isalwaysnoconfidencedrep)
  - [isKeyHashDRep](#iskeyhashdrep)
  - [isScriptHashDRep](#isscripthashdrep)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random DRep instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<
  | { keyHash: KeyHash.KeyHash; _tag: "KeyHashDRep" }
  | { scriptHash: ScriptHash.ScriptHash; _tag: "ScriptHashDRep" }
  | { _tag: "AlwaysAbstainDRep" }
  | { _tag: "AlwaysNoConfidenceDRep" }
>
```

Added in v2.0.0

# constructors

## alwaysAbstain

Create an AlwaysAbstainDRep.

**Signature**

```ts
export declare const alwaysAbstain: () => AlwaysAbstainDRep
```

Added in v2.0.0

## alwaysNoConfidence

Create an AlwaysNoConfidenceDRep.

**Signature**

```ts
export declare const alwaysNoConfidence: () => AlwaysNoConfidenceDRep
```

Added in v2.0.0

## fromKeyHash

Create a KeyHashDRep from a KeyHash.

**Signature**

```ts
export declare const fromKeyHash: (keyHash: KeyHash.KeyHash) => KeyHashDRep
```

Added in v2.0.0

## fromScriptHash

Create a ScriptHashDRep from a ScriptHash.

**Signature**

```ts
export declare const fromScriptHash: (scriptHash: ScriptHash.ScriptHash) => ScriptHashDRep
```

Added in v2.0.0

# effect

## Effect (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode DRep to CBOR bytes.

**Signature**

```ts
export declare const toBytes: (drep: DRep, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toHex

Encode DRep to CBOR hex string.

**Signature**

```ts
export declare const toHex: (drep: DRep, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two DRep instances are equal.

**Signature**

```ts
export declare const equals: (self: DRep, that: DRep) => boolean
```

Added in v2.0.0

# errors

## DRepError (class)

Error class for DRep related operations.

**Signature**

```ts
export declare class DRepError
```

Added in v2.0.0

# model

## AlwaysAbstainDRep (type alias)

Type alias for AlwaysAbstainDRep.

**Signature**

```ts
export type AlwaysAbstainDRep = Extract<DRep, { _tag: "AlwaysAbstainDRep" }>
```

Added in v2.0.0

## AlwaysNoConfidenceDRep (type alias)

Type alias for AlwaysNoConfidenceDRep.

**Signature**

```ts
export type AlwaysNoConfidenceDRep = Extract<DRep, { _tag: "AlwaysNoConfidenceDRep" }>
```

Added in v2.0.0

## DRep (type alias)

Type alias for DRep.

**Signature**

```ts
export type DRep = typeof DRep.Type
```

Added in v2.0.0

## KeyHashDRep (type alias)

Type alias for KeyHashDRep.

**Signature**

```ts
export type KeyHashDRep = Extract<DRep, { _tag: "KeyHashDRep" }>
```

Added in v2.0.0

## ScriptHashDRep (type alias)

Type alias for ScriptHashDRep.

**Signature**

```ts
export type ScriptHashDRep = Extract<DRep, { _tag: "ScriptHashDRep" }>
```

Added in v2.0.0

# parsing

## fromBytes

Parse DRep from CBOR bytes.

**Signature**

```ts
export declare const fromBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => DRep
```

Added in v2.0.0

## fromHex

Parse DRep from CBOR hex string.

**Signature**

```ts
export declare const fromHex: (hex: string, options?: CBOR.CodecOptions) => DRep
```

Added in v2.0.0

# pattern matching

## match

Pattern match over DRep.

**Signature**

```ts
export declare const match: <A>(patterns: {
  KeyHashDRep: (keyHash: KeyHash.KeyHash) => A
  ScriptHashDRep: (scriptHash: ScriptHash.ScriptHash) => A
  AlwaysAbstainDRep: () => A
  AlwaysNoConfidenceDRep: () => A
}) => (drep: DRep) => A
```

Added in v2.0.0

# predicates

## isDRep

Check if the given value is a valid DRep

**Signature**

```ts
export declare const isDRep: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is
  | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
  | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
  | { readonly _tag: "AlwaysAbstainDRep" }
  | { readonly _tag: "AlwaysNoConfidenceDRep" }
```

Added in v2.0.0

# schemas

## DRep

Union schema for DRep representing different DRep types.

drep = [0, addr_keyhash] / [1, script_hash] / [2] / [3]

**Signature**

```ts
export declare const DRep: Schema.Union<
  [
    Schema.TaggedStruct<"KeyHashDRep", { keyHash: typeof KeyHash.KeyHash }>,
    Schema.TaggedStruct<"ScriptHashDRep", { scriptHash: typeof ScriptHash.ScriptHash }>,
    Schema.TaggedStruct<"AlwaysAbstainDRep", {}>,
    Schema.TaggedStruct<"AlwaysNoConfidenceDRep", {}>
  ]
>
```

Added in v2.0.0

## FromBytes

CBOR bytes transformation schema for DRep.

**Signature**

```ts
export declare const FromBytes: (
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
        Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Tuple<[Schema.Literal<[2n]>]>,
        Schema.Tuple<[Schema.Literal<[3n]>]>
      ]
    >,
    Schema.SchemaClass<
      | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
      | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
      | { readonly _tag: "AlwaysAbstainDRep" }
      | { readonly _tag: "AlwaysNoConfidenceDRep" },
      | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
      | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
      | { readonly _tag: "AlwaysAbstainDRep" }
      | { readonly _tag: "AlwaysNoConfidenceDRep" },
      never
    >,
    never
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for DRep with proper transformation.
drep = [0, addr_keyhash] / [1, script_hash] / [2] / [3]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple<[Schema.Literal<[2n]>]>,
      Schema.Tuple<[Schema.Literal<[3n]>]>
    ]
  >,
  Schema.SchemaClass<
    | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
    | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
    | { readonly _tag: "AlwaysAbstainDRep" }
    | { readonly _tag: "AlwaysNoConfidenceDRep" },
    | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
    | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
    | { readonly _tag: "AlwaysAbstainDRep" }
    | { readonly _tag: "AlwaysNoConfidenceDRep" },
    never
  >,
  never
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for DRep.

**Signature**

```ts
export declare const FromHex: (
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
          Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple<[Schema.Literal<[2n]>]>,
          Schema.Tuple<[Schema.Literal<[3n]>]>
        ]
      >,
      Schema.SchemaClass<
        | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
        | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
        | { readonly _tag: "AlwaysAbstainDRep" }
        | { readonly _tag: "AlwaysNoConfidenceDRep" },
        | { readonly _tag: "KeyHashDRep"; readonly keyHash: KeyHash.KeyHash }
        | { readonly _tag: "ScriptHashDRep"; readonly scriptHash: ScriptHash.ScriptHash }
        | { readonly _tag: "AlwaysAbstainDRep" }
        | { readonly _tag: "AlwaysNoConfidenceDRep" },
        never
      >,
      never
    >
  >
>
```

Added in v2.0.0

# type guards

## isAlwaysAbstainDRep

Check if DRep is an AlwaysAbstainDRep.

**Signature**

```ts
export declare const isAlwaysAbstainDRep: (drep: DRep) => drep is AlwaysAbstainDRep
```

Added in v2.0.0

## isAlwaysNoConfidenceDRep

Check if DRep is an AlwaysNoConfidenceDRep.

**Signature**

```ts
export declare const isAlwaysNoConfidenceDRep: (drep: DRep) => drep is AlwaysNoConfidenceDRep
```

Added in v2.0.0

## isKeyHashDRep

Check if DRep is a KeyHashDRep.

**Signature**

```ts
export declare const isKeyHashDRep: (drep: DRep) => drep is KeyHashDRep
```

Added in v2.0.0

## isScriptHashDRep

Check if DRep is a ScriptHashDRep.

**Signature**

```ts
export declare const isScriptHashDRep: (drep: DRep) => drep is ScriptHashDRep
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Union<
  [
    Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.Tuple<[Schema.Literal<[2n]>]>,
    Schema.Tuple<[Schema.Literal<[3n]>]>
  ]
>
```
