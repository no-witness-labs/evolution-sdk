---
title: Text128.ts
nav_order: 104
parent: Modules
---

## Text128 overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constants](#constants)
  - [TEXT128_MIN_LENGTH](#text128_min_length)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [errors](#errors)
  - [Text128Error (class)](#text128error-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isText128](#istext128)
- [schemas](#schemas)
  - [Text128](#text128)
- [utils](#utils)
  - [FromVariableBytes](#fromvariablebytes)
  - [FromVariableHex](#fromvariablehex)
  - [TEXT128_MAX_LENGTH](#text128_max_length)
  - [Text128 (type alias)](#text128-type-alias)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random Text128 instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<string>
```

Added in v2.0.0

# constants

## TEXT128_MIN_LENGTH

Constants for Text128 validation.
text .size (0 .. 128)

**Signature**

```ts
export declare const TEXT128_MIN_LENGTH: 0
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode Text128 to bytes (unsafe)

**Signature**

```ts
export declare const toBytes: (input: string) => Uint8Array
```

Added in v2.0.0

## toHex

Encode Text128 to hex string (unsafe)

**Signature**

```ts
export declare const toHex: (input: string) => string
```

Added in v2.0.0

# errors

## Text128Error (class)

Error class for Text128 related operations.

**Signature**

```ts
export declare class Text128Error
```

Added in v2.0.0

# parsing

## fromBytes

Parse Text128 from bytes (unsafe)

**Signature**

```ts
export declare const fromBytes: (input: Uint8Array) => string
```

Added in v2.0.0

## fromHex

Parse Text128 from hex string (unsafe)

**Signature**

```ts
export declare const fromHex: (input: string) => string
```

Added in v2.0.0

# predicates

## isText128

Check if the given value is a valid Text128

**Signature**

```ts
export declare const isText128: (u: unknown, overrideOptions?: ParseOptions | number) => u is string
```

Added in v2.0.0

# schemas

## Text128

Schema for Text128 representing a variable-length text string (0-128 chars).
text .size (0 .. 128)
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare const Text128: Schema.filter<typeof Schema.String>
```

Added in v2.0.0

# utils

## FromVariableBytes

**Signature**

```ts
export declare const FromVariableBytes: Schema.transform<
  Schema.Schema<Uint8Array, Uint8Array, never>,
  Schema.Schema<string, string, never>
>
```

## FromVariableHex

**Signature**

```ts
export declare const FromVariableHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.Schema<Uint8Array, Uint8Array, never>, Schema.Schema<string, string, never>>
>
```

## TEXT128_MAX_LENGTH

**Signature**

```ts
export declare const TEXT128_MAX_LENGTH: 128
```

## Text128 (type alias)

**Signature**

```ts
export type Text128 = typeof Text128.Type
```
