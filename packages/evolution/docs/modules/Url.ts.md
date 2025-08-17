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
- [constants](#constants)
  - [URL_MAX_LENGTH](#url_max_length)
- [effect](#effect)
  - [Effect (namespace)](#effect-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [UrlError (class)](#urlerror-class)
- [model](#model)
  - [Url](#url)
  - [Url (type alias)](#url-type-alias)
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
export declare const arbitrary: Arbitrary<string & Brand<"Url">>
```

Added in v2.0.0

# constants

## URL_MAX_LENGTH

CDDL specification:
url = text .size (0..128)

**Signature**

```ts
export declare const URL_MAX_LENGTH: 128
```

Added in v2.0.0

# effect

## Effect (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode Url to bytes.

**Signature**

```ts
export declare const toBytes: (url: Url) => Uint8Array
```

Added in v2.0.0

## toHex

Encode Url to hex string.

**Signature**

```ts
export declare const toHex: (url: Url) => string
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

## Url

Schema for Url representing URLs as branded text.
url = text .size (0..128)

**Signature**

```ts
export declare const Url: Schema.brand<
  Schema.refine<
    string,
    Schema.transform<
      Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
      Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
    >
  >,
  "Url"
>
```

Added in v2.0.0

## Url (type alias)

Type alias for Url.

**Signature**

```ts
export type Url = typeof Url.Type
```

Added in v2.0.0

# parsing

## fromBytes

Parse Url from bytes.

**Signature**

```ts
export declare const fromBytes: (bytes: Uint8Array) => Url
```

Added in v2.0.0

## fromHex

Parse Url from hex string.

**Signature**

```ts
export declare const fromHex: (hex: string) => Url
```

Added in v2.0.0

# predicates

## isUrl

Check if the given value is a valid Url

**Signature**

```ts
export declare const isUrl: (u: unknown, overrideOptions?: ParseOptions | number) => u is string & Brand<"Url">
```

Added in v2.0.0

# utils

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.filter<Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>>,
  Schema.brand<
    Schema.refine<
      string,
      Schema.transform<
        Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
        Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
      >
    >,
    "Url"
  >
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<
    string,
    Schema.transform<
      Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
      Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
    >
  >,
  Schema.brand<
    Schema.refine<
      string,
      Schema.transform<
        Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
        Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
      >
    >,
    "Url"
  >
>
```

## make

**Signature**

```ts
export declare const make: (a: string, options?: Schema.MakeOptions) => string & Brand<"Url">
```
