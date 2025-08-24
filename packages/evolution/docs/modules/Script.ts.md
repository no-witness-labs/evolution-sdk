---
title: Script.ts
nav_order: 97
parent: Modules
---

## Script overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ScriptError (class)](#scripterror-class)
- [model](#model)
  - [Script](#script)
- [schemas](#schemas)
  - [FromCDDL](#fromcddl)
  - [ScriptCDDL](#scriptcddl)
- [utils](#utils)
  - [Script (type alias)](#script-type-alias)
  - [ScriptCDDL (type alias)](#scriptcddl-type-alias)

---

# arbitrary

## arbitrary

FastCheck arbitrary for Script.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<
  NativeScripts.Native | PlutusV1.PlutusV1 | PlutusV2.PlutusV2 | PlutusV3.PlutusV3
>
```

Added in v2.0.0

# equality

## equals

Check if two Script instances are equal.

**Signature**

```ts
export declare const equals: (a: Script, b: Script) => boolean
```

Added in v2.0.0

# errors

## ScriptError (class)

Error class for Script related operations.

**Signature**

```ts
export declare class ScriptError
```

Added in v2.0.0

# model

## Script

Script union type following Conway CDDL specification.

CDDL:

```
script =
  [ 0, native_script ]
/ [ 1, plutus_v1_script ]
/ [ 2, plutus_v2_script ]
/ [ 3, plutus_v3_script ]
```

**Signature**

```ts
export declare const Script: Schema.Union<
  [
    Schema.Schema<NativeScripts.Native, NativeScripts.Native, never>,
    typeof PlutusV1.PlutusV1,
    typeof PlutusV2.PlutusV2,
    typeof PlutusV3.PlutusV3
  ]
>
```

Added in v2.0.0

# schemas

## FromCDDL

Transformation between CDDL representation and Script union.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<
        Schema.Literal<[0n]>,
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
      >,
      Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.Tuple2<Schema.Literal<[3n]>, typeof Schema.Uint8ArrayFromSelf>
    ]
  >,
  Schema.Union<
    [
      Schema.Schema<NativeScripts.Native, NativeScripts.Native, never>,
      typeof PlutusV1.PlutusV1,
      typeof PlutusV2.PlutusV2,
      typeof PlutusV3.PlutusV3
    ]
  >,
  never
>
```

Added in v2.0.0

## ScriptCDDL

CDDL schema for Script as tagged tuples.

**Signature**

```ts
export declare const ScriptCDDL: Schema.Union<
  [
    Schema.Tuple2<
      Schema.Literal<[0n]>,
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
    >,
    Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.Tuple2<Schema.Literal<[3n]>, typeof Schema.Uint8ArrayFromSelf>
  ]
>
```

Added in v2.0.0

# utils

## Script (type alias)

**Signature**

```ts
export type Script = typeof Script.Type
```

## ScriptCDDL (type alias)

**Signature**

```ts
export type ScriptCDDL = typeof ScriptCDDL.Type
```
