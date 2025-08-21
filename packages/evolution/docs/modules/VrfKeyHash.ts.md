---
title: VrfKeyHash.ts
nav_order: 122
parent: Modules
---

## VrfKeyHash overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [VrfKeyHashError (class)](#vrfkeyhasherror-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [schemas](#schemas)
  - [VrfKeyHash (class)](#vrfkeyhash-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [utils](#utils)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
  - [make](#make)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random VrfKeyHash instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<VrfKeyHash>
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode VrfKeyHash to raw bytes.

**Signature**

```ts
export declare const toBytes: (input: VrfKeyHash) => any
```

Added in v2.0.0

## toHex

Encode VrfKeyHash to hex string.

**Signature**

```ts
export declare const toHex: (input: VrfKeyHash) => string
```

Added in v2.0.0

# equality

## equals

Check if two VrfKeyHash instances are equal.

**Signature**

```ts
export declare const equals: (a: VrfKeyHash, b: VrfKeyHash) => boolean
```

Added in v2.0.0

# errors

## VrfKeyHashError (class)

Error class for VrfKeyHash related operations.

**Signature**

```ts
export declare class VrfKeyHashError
```

Added in v2.0.0

# parsing

## fromBytes

Parse VrfKeyHash from raw bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => VrfKeyHash
```

Added in v2.0.0

## fromHex

Parse VrfKeyHash from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => VrfKeyHash
```

Added in v2.0.0

# schemas

## VrfKeyHash (class)

VrfKeyHash is a 32-byte hash representing a VRF verification key.
vrf_keyhash = Bytes32

**Signature**

```ts
export declare class VrfKeyHash
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

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof VrfKeyHash>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof VrfKeyHash>
>
```

## make

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => VrfKeyHash
```
