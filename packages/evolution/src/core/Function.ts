import { Either, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"

type ErrorCtor<E extends Error> = new (props: { message?: string; cause?: unknown }) => E

/**
 * Creates a named function with proper stack traces using dynamic object property
 */
export const makeDecodeSync = <T, A, E extends Error>(
  schemaTransformer: Schema.Schema<T, A>,
  ErrorClass: ErrorCtor<E>,
  functionName: string
): ((input: A) => T) => {
  // Pre-create decoder once to avoid per-call allocation/closure overhead
  const decode = Schema.decodeEither(schemaTransformer)
  // Create a named function using object property syntax
  const fn = {
    [functionName](input: A): T {
      const result = decode(input)
      if (result._tag === "Left") {
        const error = new ErrorClass({
          message: `Failed to decode in ${functionName}`,
          cause: result.left
        })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, fn[functionName])
        }
        throw error
      }
      return result.right
    }
  }
  return fn[functionName]
}

export const makeEncodeSync = <T, A, E extends Error>(
  schemaTransformer: Schema.Schema<T, A>,
  ErrorClass: ErrorCtor<E>,
  functionName: string
): ((input: T) => A) => {
  // Pre-create encoder once to avoid per-call allocation/closure overhead
  const encode = Schema.encodeEither(schemaTransformer)
  const fn = {
    [functionName]: (input: T): A => {
      const result = encode(input)
      if (result._tag === "Left") {
        const error = new ErrorClass({
          message: `Failed to encode in ${functionName}`,
          cause: result.left
        })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, fn[functionName])
        }
        throw error
      }
      return result.right
    }
  }
  return fn[functionName]
}

/**
 * Creates a synchronous function that encodes a value to CBOR bytes.
 * Combines schema encoding with CBOR serialization in one step.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeCBOREncodeSync = <A, T extends CBOR.CBOR, E extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: ErrorCtor<E>,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
): ((input: A, options?: CBOR.CodecOptions) => Uint8Array) => {
  // Schema.encodeSync goes from T -> A (opposite direction of the schema)
  const encode = Schema.encodeSync(schemaTransformer)
  const fn = {
    [functionName]: (input: A, options?: CBOR.CodecOptions): Uint8Array => {
      try {
        const cborValue = encode(input)
        return CBOR.internalEncodeSync(cborValue, options || defaultOptions)
      } catch (e) {
        const error = new ErrorClass({ message: `Failed to encode in ${functionName}`, cause: e })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, wrapped)
        }
        throw error
      }
    }
  }
  const wrapped = fn[functionName]
  return wrapped
}

export const makeDecodeEither =
  <T, A, E extends Error>(schema: Schema.Schema<T, A>, ErrorClass: ErrorCtor<E>) =>
  (input: A) =>
    Schema.decodeEither(schema)(input).pipe(
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to decode input", cause: e }))
    )

export const makeEncodeEither =
  <T, A, E extends Error>(schema: Schema.Schema<T, A>, ErrorClass: ErrorCtor<E>) =>
  (input: T) =>
    Schema.encodeEither(schema)(input).pipe(
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to encode input", cause: e }))
    )

/**
 * Creates a synchronous function that decodes CBOR bytes into a value using a schema.
 * This pairs with makeCBOREncodeSync and avoids extra FromCBOR* transformers by using FromCDDL directly.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeCBORDecodeSync = <A, T extends CBOR.CBOR, E extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: ErrorCtor<E>,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
): ((bytes: Uint8Array, options?: CBOR.CodecOptions) => A) => {
  // Pre-create decoder once (T -> A)
  const decode = Schema.decodeSync(schemaTransformer)
  const fn = {
    [functionName]: (bytes: Uint8Array, options?: CBOR.CodecOptions): A => {
      try {
        const cborValue = CBOR.internalDecodeSync(bytes, options || defaultOptions)
        return decode(cborValue as T)
      } catch (e) {
        const error = new ErrorClass({ message: `Failed to decode in ${functionName}`, cause: e })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, wrapped)
        }
        throw error
      }
    }
  }
  const wrapped = fn[functionName]
  return wrapped
}

/**
 * Creates a synchronous function that encodes a value to CBOR hex string.
 * Uses a schema to encode T -> A then serializes to hex.
 */
export const makeCBOREncodeHexSync = <A, T extends CBOR.CBOR, E extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: ErrorCtor<E>,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
): ((input: A, options?: CBOR.CodecOptions) => string) => {
  const encode = Schema.encodeSync(schemaTransformer)
  const fn = {
    [functionName]: (input: A, options?: CBOR.CodecOptions): string => {
      try {
        const cborValue = encode(input)
        const bytes = CBOR.internalEncodeSync(cborValue, options || defaultOptions)
        return Bytes.toHexUnsafe(bytes)
      } catch (e) {
        const error = new ErrorClass({ message: `Failed to encode hex in ${functionName}`, cause: e })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, wrapped)
        }
        throw error
      }
    }
  }
  const wrapped = fn[functionName]
  return wrapped
}

/**
 * Creates a synchronous function that decodes a CBOR hex string into a value using a schema.
 */
export const makeCBORDecodeHexSync = <A, T extends CBOR.CBOR, E extends Error>(
  schemaTransformer: Schema.Schema<A, T>,
  ErrorClass: ErrorCtor<E>,
  functionName: string,
  defaultOptions?: CBOR.CodecOptions
): ((hex: string, options?: CBOR.CodecOptions) => A) => {
  const decode = Schema.decodeSync(schemaTransformer)
  const fn = {
    [functionName]: (hex: string, options?: CBOR.CodecOptions): A => {
      try {
        const bytes = Bytes.fromHex(hex)
        const cborValue = CBOR.internalDecodeSync(bytes, options || defaultOptions)
        return decode(cborValue as T)
      } catch (e) {
        const error = new ErrorClass({ message: `Failed to decode hex in ${functionName}`, cause: e })
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, wrapped)
        }
        throw error
      }
    }
  }
  const wrapped = fn[functionName]
  return wrapped
}

/**
 * Creates a function that decodes CBOR bytes into a value using a schema, returning Either.
 */
export const makeCBORDecodeEither =
  <A, T extends CBOR.CBOR, E extends Error>(
    schemaTransformer: Schema.Schema<A, T>,
    ErrorClass: ErrorCtor<E>,
    defaultOptions?: CBOR.CodecOptions
  ) =>
  (bytes: Uint8Array, options?: CBOR.CodecOptions) =>
    Either.try(() => CBOR.internalDecodeSync(bytes, options || defaultOptions)).pipe(
      Either.flatMap((cbor) => Schema.decodeEither(schemaTransformer)(cbor as T)),
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to decode CBOR bytes", cause: e }))
    )

/**
 * Creates a function that decodes CBOR hex string into a value using a schema, returning Either.
 */
export const makeCBORDecodeHexEither =
  <A, T extends CBOR.CBOR, E extends Error>(
    schemaTransformer: Schema.Schema<A, T>,
    ErrorClass: ErrorCtor<E>,
    defaultOptions?: CBOR.CodecOptions
  ) =>
  (hex: string, options?: CBOR.CodecOptions) =>
    Either.try(() => Bytes.fromHex(hex)).pipe(
      Either.flatMap((bytes) => Either.try(() => CBOR.internalDecodeSync(bytes, options || defaultOptions))),
      Either.flatMap((cbor) => Schema.decodeEither(schemaTransformer)(cbor as T)),
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to decode CBOR hex", cause: e }))
    )

/**
 * Creates a function that encodes a value to CBOR bytes using a schema, returning Either.
 */
export const makeCBOREncodeEither =
  <A, T extends CBOR.CBOR, E extends Error>(
    schemaTransformer: Schema.Schema<A, T>,
    ErrorClass: ErrorCtor<E>,
    defaultOptions?: CBOR.CodecOptions
  ) =>
  (input: A, options?: CBOR.CodecOptions) =>
    Schema.encodeEither(schemaTransformer)(input).pipe(
      Either.flatMap((cborValue) => Either.try(() => CBOR.internalEncodeSync(cborValue, options || defaultOptions))),
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to encode CBOR bytes", cause: e }))
    )

/**
 * Creates a function that encodes a value to CBOR hex string using a schema, returning Either.
 */
export const makeCBOREncodeHexEither =
  <A, T extends CBOR.CBOR, E extends Error>(
    schemaTransformer: Schema.Schema<A, T>,
    ErrorClass: ErrorCtor<E>,
    defaultOptions?: CBOR.CodecOptions
  ) =>
  (input: A, options?: CBOR.CodecOptions) =>
    Schema.encodeEither(schemaTransformer)(input).pipe(
      Either.flatMap((cborValue) => Either.try(() => CBOR.internalEncodeSync(cborValue, options || defaultOptions))),
      Either.map((bytes) => Bytes.toHexUnsafe(bytes)),
      Either.mapLeft((e) => new ErrorClass({ message: "Failed to encode CBOR hex string", cause: e }))
    )
