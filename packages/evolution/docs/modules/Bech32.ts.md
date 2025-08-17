---
title: Bech32.ts
nav_order: 9
parent: Modules
---

## Bech32 overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [Bech32Error (class)](#bech32error-class)
- [utils](#utils)
  - [Bech32 (type alias)](#bech32-type-alias)
  - [Bech32Schema](#bech32schema)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)

---

# model

## Bech32Error (class)

**Signature**

```ts
export declare class Bech32Error
```

Added in v2.0.0

# utils

## Bech32 (type alias)

**Signature**

```ts
export type Bech32 = typeof Bech32Schema.Type
```

## Bech32Schema

**Signature**

```ts
export declare const Bech32Schema: typeof Schema.String
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: (
  prefix?: string
) => Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String, never>
```

## FromHex

**Signature**

```ts
export declare const FromHex: (
  prefix?: string
) => Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String, never>
>
```
