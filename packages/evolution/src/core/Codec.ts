/**
 * Simple codec factory for creating encoding utilities from schema records
 *
 * @since 2.0.0
 * @category utilities
 */

import type { ParseResult } from "effect"
import { Effect, Either, Schema } from "effect"

/**
 * Creates encoding and decoding utilities with custom error mapping
 *
 * @since 2.0.0
 * @category constructors
 */
export const createEncoders = <
  T extends Record<string, Schema.Schema<any, any, any>>,
  ErrorClass extends {
    new (options: { message?: string; cause?: unknown }): unknown
  }
>(
  schemas: T,
  ErrorClass: ErrorClass
) => {
  const createSyncMethods = (fn: any, operationType: "encode" | "decode") =>
    Object.fromEntries(
      Object.entries(schemas).map(([key, schema]) => [
        key,
        (input: any) => {
          try {
            return fn(schema)(input)
          } catch (cause) {
            throw new ErrorClass({
              message: `Failed to ${operationType} ${key}`,
              cause
            })
          }
        }
      ])
    )

  const createEffectMethods = (fn: any, operationType: "encode" | "decode") =>
    Object.fromEntries(
      Object.entries(schemas).map(([key, schema]) => [
        key,
        (input: any) =>
          fn(schema)(input).pipe(
            Effect.mapError(
              (cause: ParseResult.ParseError) =>
                new ErrorClass({
                  message: `Failed to ${operationType} ${key}`,
                  cause
                })
            )
          )
      ])
    )

  const createEitherMethods = (fn: any, operationType: "encode" | "decode") =>
    Object.fromEntries(
      Object.entries(schemas).map(([key, schema]) => [
        key,
        (input: any) =>
          fn(schema)(input).pipe(
            Either.mapLeft(
              (cause: ParseResult.ParseError) =>
                new ErrorClass({
                  message: `Failed to ${operationType} ${key}`,
                  cause
                })
            )
          )
      ])
    )

  const encodeSync = createSyncMethods(Schema.encodeSync, "encode")
  const decodeSync = createSyncMethods(Schema.decodeSync, "decode")
  const encodeEffect = createEffectMethods(Schema.encode, "encode")
  const decodeEffect = createEffectMethods(Schema.decode, "decode")
  const encodeEither = createEitherMethods(Schema.encodeEither, "encode")
  const decodeEither = createEitherMethods(Schema.decodeEither, "decode")

  return {
    Encode: encodeSync as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any> ? (input: A) => I : never
    },
    Decode: decodeSync as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any> ? (input: I) => A : never
    },
    EncodeEffect: encodeEffect as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any>
        ? (input: A) => Effect.Effect<I, InstanceType<ErrorClass>>
        : never
    },
    DecodeEffect: decodeEffect as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any>
        ? (input: I) => Effect.Effect<A, InstanceType<ErrorClass>>
        : never
    },
    EncodeEither: encodeEither as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any>
        ? (input: A) => Either.Either<I, InstanceType<ErrorClass>>
        : never
    },
    DecodeEither: decodeEither as {
      [K in keyof T]: T[K] extends Schema.Schema<infer A, infer I, any>
        ? (input: I) => Either.Either<A, InstanceType<ErrorClass>>
        : never
    }
  }
}
