---
title: Ed25519Signature.ts
nav_order: 47
parent: Modules
---

## Ed25519Signature overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [Ed25519SignatureError (class)](#ed25519signatureerror-class)
- [model](#model)
  - [Ed25519Signature (class)](#ed25519signature-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
- [utils](#utils)
  - [Either (namespace)](#either-namespace)
  - [make](#make)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random Ed25519Signature instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Ed25519Signature>
```

Added in v2.0.0

# constructors

## fromBytes

Parse Ed25519Signature from bytes (unsafe - throws on error).

**Signature**

```ts
export declare const fromBytes: (input: any) => Ed25519Signature
```

Added in v2.0.0

## fromHex

Parse Ed25519Signature from hex string (unsafe - throws on error).

**Signature**

```ts
export declare const fromHex: (input: string) => Ed25519Signature
```

Added in v2.0.0

# encoding

## toBytes

Get the underlying bytes (returns a copy for safety).

**Signature**

```ts
export declare const toBytes: (input: Ed25519Signature) => any
```

Added in v2.0.0

## toHex

Convert to hex string using optimized lookup table.

**Signature**

```ts
export declare const toHex: (input: Ed25519Signature) => string
```

Added in v2.0.0

# equality

## equals

Check equality with another Ed25519Signature.

**Signature**

```ts
export declare const equals: (a: Ed25519Signature, b: Ed25519Signature) => boolean
```

Added in v2.0.0

# errors

## Ed25519SignatureError (class)

Error class for Ed25519SignatureClass related operations.

**Signature**

```ts
export declare class Ed25519SignatureError
```

Added in v2.0.0

# model

## Ed25519Signature (class)

Class-based Ed25519Signature with compile-time and runtime safety.
ed25519_signature = bytes .size 64
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare class Ed25519Signature
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

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
[Symbol.for("nodejs.util.inspect.custom")](): string
```

# predicates

## is

Check if value is an Ed25519Signature instance.

**Signature**

```ts
export declare const is: (u: unknown, overrideOptions?: ParseOptions | number) => u is Ed25519Signature
```

Added in v2.0.0

# schemas

## FromBytes

Schema transformer from bytes to Ed25519Signature.

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
  typeof Ed25519Signature
>
```

Added in v2.0.0

## FromHex

Schema transformer from hex string to Ed25519Signature.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof Ed25519Signature>
>
```

Added in v2.0.0

# utils

## Either (namespace)

## make

**Signature**

```ts
export declare const make: (
  props: { readonly bytes: any },
  options?: Schema.MakeOptions | undefined
) => Ed25519Signature
```
