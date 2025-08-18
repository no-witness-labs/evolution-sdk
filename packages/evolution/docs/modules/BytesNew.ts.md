---
title: BytesNew.ts
nav_order: 29
parent: Modules
---

## BytesNew overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BytesError (class)](#byteserror-class)
  - [BytesFromHex](#bytesfromhex)
  - [decodeSync](#decodesync)
  - [fromHex](#fromhex)
  - [makeUint8ArrayTransformation](#makeuint8arraytransformation)
  - [makeUint8ArrayTransformationNotFail](#makeuint8arraytransformationnotfail)
  - [toHex](#tohex)

---

# utils

## BytesError (class)

Error class for Bytes related operations.

**Signature**

```ts
export declare class BytesError
```

## BytesFromHex

**Signature**

```ts
export declare const BytesFromHex: Schema.transformOrFail<
  Schema.SchemaClass<string, string, never>,
  typeof Schema.Uint8ArrayFromSelf,
  never
>
```

## decodeSync

**Signature**

```ts
export declare const decodeSync: (str: string) => Uint8Array
```

## fromHex

**Signature**

```ts
export declare const fromHex: (input: string) => any
```

## makeUint8ArrayTransformation

**Signature**

```ts
export declare const makeUint8ArrayTransformation: (
  id: string,
  decode: (s: string, ast: SchemaAST.AST) => Either.Either<Uint8Array, ParseResult.ParseIssue>,
  encode: (u: Uint8Array) => string
) => Schema.transformOrFail<Schema.SchemaClass<string, string, never>, typeof Schema.Uint8ArrayFromSelf, never>
```

## makeUint8ArrayTransformationNotFail

**Signature**

```ts
export declare const makeUint8ArrayTransformationNotFail: (
  id: string,
  decode: (s: string) => Uint8Array,
  encode: (u: Uint8Array) => string
) => Schema.transform<Schema.SchemaClass<string, string, never>, typeof Schema.Uint8ArrayFromSelf>
```

## toHex

**Signature**

```ts
export declare const toHex: (bytes: Uint8Array) => string
```
