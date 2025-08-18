---
title: Function.ts
nav_order: 50
parent: Modules
---

## Function overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [makeCBORDecodeSync](#makecbordecodesync)
  - [makeCBOREncodeSync](#makecborencodesync)
- [utils](#utils)
  - [makeCBORDecodeEither](#makecbordecodeeither)
  - [makeCBORDecodeHexEither](#makecbordecodehexeither)
  - [makeCBORDecodeHexSync](#makecbordecodehexsync)
  - [makeCBOREncodeEither](#makecborencodeeither)
  - [makeCBOREncodeHexEither](#makecborencodehexeither)
  - [makeCBOREncodeHexSync](#makecborencodehexsync)
  - [makeDecodeEither](#makedecodeeither)
  - [makeDecodeSync](#makedecodesync)
  - [makeEncodeEither](#makeencodeeither)
  - [makeEncodeSync](#makeencodesync)

---

# constructors

## makeCBORDecodeSync

Creates a synchronous function that decodes CBOR bytes into a value using a schema.
This pairs with makeCBOREncodeSync and avoids extra FromCBOR\* transformers by using FromCDDL directly.

**Signature**

```ts
export declare const makeCBORDecodeSync: <A, T extends CBOR.CBOR>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
) => (bytes: Uint8Array, options?: CBOR.CodecOptions) => A
```

Added in v2.0.0

## makeCBOREncodeSync

Creates a synchronous function that encodes a value to CBOR bytes.
Combines schema encoding with CBOR serialization in one step.

**Signature**

```ts
export declare const makeCBOREncodeSync: <A, T extends CBOR.CBOR>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
) => (input: A, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

# utils

## makeCBORDecodeEither

Creates a function that decodes CBOR bytes into a value using a schema, returning Either.

**Signature**

```ts
export declare const makeCBORDecodeEither: <A, T extends CBOR.CBOR, TError extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError,
  defaultOptions?: CBOR.CodecOptions
) => (bytes: Uint8Array, options?: CBOR.CodecOptions) => Either.Either<A, TError>
```

## makeCBORDecodeHexEither

Creates a function that decodes CBOR hex string into a value using a schema, returning Either.

**Signature**

```ts
export declare const makeCBORDecodeHexEither: <A, T extends CBOR.CBOR, TError extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError,
  defaultOptions?: CBOR.CodecOptions
) => (hex: string, options?: CBOR.CodecOptions) => Either.Either<A, TError>
```

## makeCBORDecodeHexSync

Creates a synchronous function that decodes a CBOR hex string into a value using a schema.

**Signature**

```ts
export declare const makeCBORDecodeHexSync: <A, T extends CBOR.CBOR>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
) => (hex: string, options?: CBOR.CodecOptions) => A
```

## makeCBOREncodeEither

Creates a function that encodes a value to CBOR bytes using a schema, returning Either.

**Signature**

```ts
export declare const makeCBOREncodeEither: <A, T extends CBOR.CBOR, TError extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError,
  defaultOptions?: CBOR.CodecOptions
) => (input: A, options?: CBOR.CodecOptions) => Either.Either<Uint8Array, TError>
```

## makeCBOREncodeHexEither

Creates a function that encodes a value to CBOR hex string using a schema, returning Either.

**Signature**

```ts
export declare const makeCBOREncodeHexEither: <A, T extends CBOR.CBOR, TError extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError,
  defaultOptions?: CBOR.CodecOptions
) => (input: A, options?: CBOR.CodecOptions) => Either.Either<string, TError>
```

## makeCBOREncodeHexSync

Creates a synchronous function that encodes a value to CBOR hex string.
Uses a schema to encode T -> A then serializes to hex.

**Signature**

```ts
export declare const makeCBOREncodeHexSync: <A, T extends CBOR.CBOR>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
) => (input: A, options?: CBOR.CodecOptions) => string
```

## makeDecodeEither

**Signature**

```ts
export declare const makeDecodeEither: <T, A, TError extends Error>(
  schema: Schema.Schema<T, A>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError
) => (input: A) => Either.Either<T, TError>
```

## makeDecodeSync

Creates a named function with proper stack traces using dynamic object property

**Signature**

```ts
export declare const makeDecodeSync: <T, A>(
  schemaTransformer: Schema.Schema<T, A>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string
) => (input: A) => T
```

## makeEncodeEither

**Signature**

```ts
export declare const makeEncodeEither: <T, A, TError extends Error>(
  schema: Schema.Schema<T, A>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => TError
) => (input: T) => Either.Either<A, TError>
```

## makeEncodeSync

**Signature**

```ts
export declare const makeEncodeSync: <T, A>(
  schemaTransformer: Schema.Schema<T, A>,
  ErrorClass: new (props: { message?: string; cause?: unknown }) => Error,
  functionName: string
) => (input: T) => A
```
