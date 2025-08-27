---
title: KeyHash.ts
nav_order: 61
parent: Modules
---

## KeyHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [fromPrivateKey](#fromprivatekey)
  - [fromVKey](#fromvkey)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding/decoding](#encodingdecoding)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [KeyHashError (class)](#keyhasherror-class)
- [model](#model)
  - [KeyHash (class)](#keyhash-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [transformer](#transformer)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random KeyHash instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<KeyHash>
```

Added in v2.0.0

# constructors

## fromPrivateKey

Create a KeyHash from a PrivateKey

**Signature**

```ts
export declare const fromPrivateKey: (privateKey: PrivateKey) => KeyHash
```

Added in v2.0.0

## fromVKey

Create a KeyHash from a VKey

**Signature**

```ts
export declare const fromVKey: (vkey: VKey.VKey) => KeyHash
```

Added in v2.0.0

## make

Smart constructor for KeyHash

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => KeyHash
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding/decoding

## fromBytes

Decode a KeyHash from raw bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => KeyHash
```

Added in v2.0.0

## fromHex

Decode a KeyHash from a hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => KeyHash
```

Added in v2.0.0

## toBytes

Convert a KeyHash to raw bytes.

**Signature**

```ts
export declare const toBytes: (keyhash: KeyHash) => Uint8Array
```

Added in v2.0.0

## toHex

Convert a KeyHash to a hex string.

**Signature**

```ts
export declare const toHex: (keyhash: KeyHash) => string
```

Added in v2.0.0

# equality

## equals

Check if two KeyHash instances are equal.

**Signature**

```ts
export declare const equals: (a: KeyHash, b: KeyHash) => boolean
```

Added in v2.0.0

# errors

## KeyHashError (class)

Error class for KeyHash related operations.

**Signature**

```ts
export declare class KeyHashError
```

Added in v2.0.0

# model

## KeyHash (class)

KeyHash

CDDL:

```
addr_keyhash = hash28
```

**Signature**

```ts
export declare class KeyHash
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

# transformer

## FromBytes

Schema transformer from bytes to KeyHash.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof KeyHash>
```

Added in v2.0.0

## FromHex

Schema transformer from hex string to KeyHash.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof KeyHash>
>
```

Added in v2.0.0
