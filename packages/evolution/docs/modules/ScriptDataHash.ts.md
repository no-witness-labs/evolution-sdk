---
title: ScriptDataHash.ts
nav_order: 98
parent: Modules
---

## ScriptDataHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ScriptDataHashError (class)](#scriptdatahasherror-class)
- [model](#model)
  - [ScriptDataHash (class)](#scriptdatahash-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isScriptDataHash](#isscriptdatahash)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
- [utils](#utils)
  - [Either (namespace)](#either-namespace)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random ScriptDataHash instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ScriptDataHash>
```

Added in v2.0.0

# constructors

## make

Smart constructor for ScriptDataHash.

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => ScriptDataHash
```

Added in v2.0.0

# encoding

## toBytes

Encode ScriptDataHash to bytes.

**Signature**

```ts
export declare const toBytes: (input: ScriptDataHash) => any
```

Added in v2.0.0

## toHex

Encode ScriptDataHash to hex string.

**Signature**

```ts
export declare const toHex: (input: ScriptDataHash) => string
```

Added in v2.0.0

# equality

## equals

Check if two ScriptDataHash instances are equal.

**Signature**

```ts
export declare const equals: (a: ScriptDataHash, b: ScriptDataHash) => boolean
```

Added in v2.0.0

# errors

## ScriptDataHashError (class)

Error class for ScriptDataHash related operations.

**Signature**

```ts
export declare class ScriptDataHashError
```

Added in v2.0.0

# model

## ScriptDataHash (class)

ScriptDataHash based on Conway CDDL specification

CDDL: script_data_hash = Bytes32

This is a hash of data which may affect evaluation of a script.
This data consists of:

- The redeemers from the transaction_witness_set (the value of field 5).
- The datums from the transaction_witness_set (the value of field 4).
- The value in the cost_models map corresponding to the script's language
  (in field 18 of protocol_param_update.)

**Signature**

```ts
export declare class ScriptDataHash
```

Added in v2.0.0

# parsing

## fromBytes

Parse ScriptDataHash from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => ScriptDataHash
```

Added in v2.0.0

## fromHex

Parse ScriptDataHash from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => ScriptDataHash
```

Added in v2.0.0

# predicates

## isScriptDataHash

Check if the given value is a valid ScriptDataHash

**Signature**

```ts
export declare const isScriptDataHash: (u: unknown, overrideOptions?: ParseOptions | number) => u is ScriptDataHash
```

Added in v2.0.0

# schemas

## FromBytes

Schema for transforming between Uint8Array and ScriptDataHash.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof ScriptDataHash>
```

Added in v2.0.0

## FromHex

Schema for transforming between hex string and ScriptDataHash.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof ScriptDataHash>
>
```

Added in v2.0.0

# utils

## Either (namespace)
