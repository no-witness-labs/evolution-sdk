---
title: Credential.ts
nav_order: 38
parent: Modules
---

## Credential overview

---

<h2 class="text-delta">Table of contents</h2>

- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [CredentialError (class)](#credentialerror-class)
- [model](#model)
  - [Credential (type alias)](#credential-type-alias)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [Credential](#credential)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)

---

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a Credential to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (
  input: KeyHash.KeyHash | ScriptHash.ScriptHash,
  options?: CBOR.CodecOptions
) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a Credential to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: KeyHash.KeyHash | ScriptHash.ScriptHash, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two Credential instances are equal.

**Signature**

```ts
export declare const equals: (a: Credential, b: Credential) => boolean
```

Added in v2.0.0

# errors

## CredentialError (class)

Extends TaggedError for better error handling and categorization

**Signature**

```ts
export declare class CredentialError
```

Added in v2.0.0

# model

## Credential (type alias)

Type representing a credential that can be either a key hash or script hash
Used in various address formats to identify ownership

**Signature**

```ts
export type Credential = typeof Credential.Type
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse a Credential from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (
  bytes: Uint8Array,
  options?: CBOR.CodecOptions
) => KeyHash.KeyHash | ScriptHash.ScriptHash
```

Added in v2.0.0

## fromCBORHex

Parse a Credential from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => KeyHash.KeyHash | ScriptHash.ScriptHash
```

Added in v2.0.0

# predicates

## is

Check if the given value is a valid Credential

**Signature**

```ts
export declare const is: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is KeyHash.KeyHash | ScriptHash.ScriptHash
```

Added in v2.0.0

# schemas

## Credential

Credential schema representing either a key hash or script hash
credential = [0, addr_keyhash // 1, script_hash]
Used to identify ownership of addresses or stake rights

**Signature**

```ts
export declare const Credential: Schema.Union<[typeof KeyHash.KeyHash, typeof ScriptHash.ScriptHash]>
```

Added in v2.0.0

## FromCDDL

CDDL schema for Credential as defined in the specification:
credential = [0, addr_keyhash // 1, script_hash]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.SchemaClass<KeyHash.KeyHash | ScriptHash.ScriptHash, KeyHash.KeyHash | ScriptHash.ScriptHash, never>,
  never
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for generating random Credential instances.
Randomly selects between generating a KeyHash or ScriptHash credential.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<KeyHash.KeyHash | ScriptHash.ScriptHash>
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
```

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
    Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.SchemaClass<KeyHash.KeyHash | ScriptHash.ScriptHash, KeyHash.KeyHash | ScriptHash.ScriptHash, never>,
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
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.SchemaClass<KeyHash.KeyHash | ScriptHash.ScriptHash, KeyHash.KeyHash | ScriptHash.ScriptHash, never>,
      never
    >
  >
>
```
