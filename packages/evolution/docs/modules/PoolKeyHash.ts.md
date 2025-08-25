---
title: PoolKeyHash.ts
nav_order: 83
parent: Modules
---

## PoolKeyHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PoolKeyHashError (class)](#poolkeyhasherror-class)
- [model](#model)
  - [PoolKeyHash (class)](#poolkeyhash-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random PoolKeyHash instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<PoolKeyHash>
```

Added in v2.0.0

# constructors

## make

Smart constructor for PoolKeyHash that validates and applies branding.

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => PoolKeyHash
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode PoolKeyHash to bytes.

**Signature**

```ts
export declare const toBytes: (input: PoolKeyHash) => any
```

Added in v2.0.0

## toHex

Encode PoolKeyHash to hex string.

**Signature**

```ts
export declare const toHex: (input: PoolKeyHash) => string
```

Added in v2.0.0

# equality

## equals

Check if two PoolKeyHash instances are equal.

**Signature**

```ts
export declare const equals: (a: PoolKeyHash, b: PoolKeyHash) => boolean
```

Added in v2.0.0

# errors

## PoolKeyHashError (class)

Error class for PoolKeyHash related operations.

**Signature**

```ts
export declare class PoolKeyHashError
```

Added in v2.0.0

# model

## PoolKeyHash (class)

PoolKeyHash as a TaggedClass representing a stake pool's verification key hash.
pool_keyhash = hash28

**Signature**

```ts
export declare class PoolKeyHash
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

Parse PoolKeyHash from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => PoolKeyHash
```

Added in v2.0.0

## fromHex

Parse PoolKeyHash from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => PoolKeyHash
```

Added in v2.0.0

# schemas

## FromBytes

Schema transformer from bytes to PoolKeyHash.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof PoolKeyHash>
```

Added in v2.0.0

## FromHex

Schema transformer from hex string to PoolKeyHash.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof PoolKeyHash>
>
```

Added in v2.0.0
