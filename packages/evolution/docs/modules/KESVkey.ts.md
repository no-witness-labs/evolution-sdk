---
title: KESVkey.ts
nav_order: 60
parent: Modules
---

## KESVkey overview

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
  - [KESVkeyError (class)](#kesvkeyerror-class)
- [model](#model)
  - [KESVkey (class)](#kesvkey-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isKESVkey](#iskesvkey)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
- [utils](#utils)
  - [Either (namespace)](#either-namespace)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random KESVkey instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<KESVkey>
```

Added in v2.0.0

# constructors

## make

Smart constructor for KESVkey.

**Signature**

```ts
export declare const make: (props: { readonly bytes: any }, options?: Schema.MakeOptions | undefined) => KESVkey
```

Added in v2.0.0

# encoding

## toBytes

Encode KESVkey to bytes.

**Signature**

```ts
export declare const toBytes: (input: KESVkey) => any
```

Added in v2.0.0

## toHex

Encode KESVkey to hex string.

**Signature**

```ts
export declare const toHex: (input: KESVkey) => string
```

Added in v2.0.0

# equality

## equals

Check if two KESVkey instances are equal.

**Signature**

```ts
export declare const equals: (a: KESVkey, b: KESVkey) => boolean
```

Added in v2.0.0

# errors

## KESVkeyError (class)

Error class for KESVkey related operations.

**Signature**

```ts
export declare class KESVkeyError
```

Added in v2.0.0

# model

## KESVkey (class)

Schema for KESVkey representing a KES verification key.
kes_vkey = bytes .size 32
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare class KESVkey
```

Added in v2.0.0

# parsing

## fromBytes

Parse KESVkey from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => KESVkey
```

Added in v2.0.0

## fromHex

Parse KESVkey from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => KESVkey
```

Added in v2.0.0

# predicates

## isKESVkey

Check if the given value is a valid KESVkey

**Signature**

```ts
export declare const isKESVkey: (u: unknown, overrideOptions?: ParseOptions | number) => u is KESVkey
```

Added in v2.0.0

# schemas

## FromBytes

Schema for transforming between Uint8Array and KESVkey.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof KESVkey>
```

Added in v2.0.0

## FromHex

Schema for transforming between hex string and KESVkey.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof KESVkey>
>
```

Added in v2.0.0

# utils

## Either (namespace)
