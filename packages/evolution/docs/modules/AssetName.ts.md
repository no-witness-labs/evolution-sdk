---
title: AssetName.ts
nav_order: 5
parent: Modules
---

## AssetName overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [AssetNameError (class)](#assetnameerror-class)
- [model](#model)
  - [AssetName (class)](#assetname-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isAssetName](#isassetname)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random AssetName instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<AssetName>
```

Added in v2.0.0

# constructors

## make

Smart constructor for AssetName that validates and applies branding.

**Signature**

```ts
export declare const make: (props: { readonly bytes: any }, options?: Schema.MakeOptions | undefined) => AssetName
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode AssetName to bytes.

**Signature**

```ts
export declare const toBytes: (input: AssetName) => any
```

Added in v2.0.0

## toHex

Encode AssetName to hex string.

**Signature**

```ts
export declare const toHex: (input: AssetName) => string
```

Added in v2.0.0

# equality

## equals

Check if two AssetName instances are equal.

**Signature**

```ts
export declare const equals: (a: AssetName, b: AssetName) => boolean
```

Added in v2.0.0

# errors

## AssetNameError (class)

Error class for AssetName related operations.

**Signature**

```ts
export declare class AssetNameError
```

Added in v2.0.0

# model

## AssetName (class)

Schema for AssetName representing a native asset identifier.
Asset names are limited to 32 bytes (0-64 hex characters).

**Signature**

```ts
export declare class AssetName
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON(): string
```

### toString (method)

**Signature**

```ts
toString(): string
```

# parsing

## fromBytes

Parse AssetName from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => AssetName
```

Added in v2.0.0

## fromHex

Parse AssetName from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => AssetName
```

Added in v2.0.0

# predicates

## isAssetName

Check if the given value is a valid AssetName

**Signature**

```ts
export declare const isAssetName: (u: unknown, overrideOptions?: ParseOptions | number) => u is AssetName
```

Added in v2.0.0

# schemas

## FromBytes

Schema for encoding/decoding AssetName as bytes.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof AssetName>
```

Added in v2.0.0

## FromHex

Schema for encoding/decoding AssetName as hex strings.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof AssetName>
>
```

Added in v2.0.0
