---
title: Url.ts
nav_order: 112
parent: Modules
---

## Url overview

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
  - [UrlError (class)](#urlerror-class)
- [model](#model)
  - [Url (class)](#url-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isUrl](#isurl)
- [utils](#utils)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
  - [make](#make)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random Url instances.

**Signature**

```ts
export declare const arbitrary: Arbitrary<Url>
```

Added in v2.0.0

# effect

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode Url to bytes.

**Signature**

```ts
export declare const toBytes: (input: Url) => Uint8Array
```

Added in v2.0.0

## toHex

Encode Url to hex string.

**Signature**

```ts
export declare const toHex: (input: Url) => string
```

Added in v2.0.0

# equality

## equals

Check if two Url instances are equal.

**Signature**

```ts
export declare const equals: (a: Url, b: Url) => boolean
```

Added in v2.0.0

# errors

## UrlError (class)

Error class for Url related operations.

**Signature**

```ts
export declare class UrlError
```

Added in v2.0.0

# model

## Url (class)

Schema for Url representing URLs as branded text.
url = text .size (0..128)

**Signature**

```ts
export declare class Url
```

Added in v2.0.0

# parsing

## fromBytes

Parse Url from bytes.

**Signature**

```ts
export declare const fromBytes: (input: Uint8Array) => Url
```

Added in v2.0.0

## fromHex

Parse Url from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => Url
```

Added in v2.0.0

# predicates

## isUrl

Check if the given value is a valid Url

**Signature**

```ts
export declare const isUrl: (u: unknown, overrideOptions?: ParseOptions | number) => u is Url
```

Added in v2.0.0

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<Schema.Schema<Uint8Array, Uint8Array, never>, Schema.Schema<string, string, never>>,
  typeof Url
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.transform<Schema.Schema<Uint8Array, Uint8Array, never>, Schema.Schema<string, string, never>>,
    typeof Url
  >
>
```

## make

**Signature**

```ts
export declare const make: (props: { readonly href: string }, options?: Schema.MakeOptions | undefined) => Url
```
