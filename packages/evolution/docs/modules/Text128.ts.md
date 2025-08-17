---
title: Text128.ts
nav_order: 100
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
  - [Effect (namespace)](#effect-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [Text128Error (class)](#text128error-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isText128](#istext128)
- [schemas](#schemas)
  - [FromVariableBytes](#fromvariablebytes)
  - [Text128](#text128)
- [utils](#utils)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)
  - [FromVariableHex](#fromvariablehex)
  - [TEXT128_MAX_LENGTH](#text128_max_length)
  - [Text128 (type alias)](#text128-type-alias)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random Text128 instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<string & Brand<"Text128">>
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

## Effect (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode Text128 to bytes.

**Signature**

```ts
export declare const toBytes: (text: Text128) => Uint8Array
```

Added in v2.0.0

## toHex

Encode Text128 to hex string.

**Signature**

```ts
export declare const toHex: (text: Text128) => string
```

Added in v2.0.0

# equality

## equals

Check if two Text128 instances are equal.

**Signature**

```ts
export declare const equals: (a: Text128, b: Text128) => boolean
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

Parse Text128 from bytes.

**Signature**

```ts
export declare const fromBytes: (bytes: Uint8Array) => Text128
```

Added in v2.0.0

## fromHex

Parse Text128 from hex string.

**Signature**

```ts
export declare const fromHex: (hex: string) => Text128
```

Added in v2.0.0

# predicates

## isText128

Check if the given value is a valid Text128

**Signature**

```ts
export declare const isText128: (u: unknown, overrideOptions?: ParseOptions | number) => u is string & Brand<"Text128">
```

Added in v2.0.0

# schemas

## FromVariableBytes

Schema for validating variable-length text between 0 and 128 characters.
text .size (0 .. 128)

**Signature**

```ts
export declare const FromVariableBytes: Schema.filter<
  Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
>
```

Added in v2.0.0

## Text128

Schema for Text128 representing a variable-length text string (0-128 chars).
text .size (0 .. 128)
Follows the Conway-era CDDL specification.

**Signature**

```ts
export declare const Text128: Schema.brand<
  Schema.refine<
    string,
    Schema.transform<
      Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
      Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
    >
  >,
  "Text128"
>
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
    "Text128"
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
    "Text128"
  >
>
```

## FromVariableHex

**Signature**

```ts
export declare const FromVariableHex: Schema.refine<
  string,
  Schema.transform<
    Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
    Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof Schema.String>
  >
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
