import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as KeyHash from "./KeyHash.js"
import * as ScriptHash from "./ScriptHash.js"

/**
 * Extends TaggedError for better error handling and categorization
 *
 * @since 2.0.0
 * @category errors
 */

export class CredentialError extends Data.TaggedError("CredentialError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Credential schema representing either a key hash or script hash
 * credential = [0, addr_keyhash // 1, script_hash]
 * Used to identify ownership of addresses or stake rights
 *
 * @since 2.0.0
 * @category schemas
 */
export const Credential = Schema.Union(
  Schema.TaggedStruct("KeyHash", {
    hash: KeyHash.KeyHash
  }),
  Schema.TaggedStruct("ScriptHash", {
    hash: ScriptHash.ScriptHash
  })
)

/**
 * Type representing a credential that can be either a key hash or script hash
 * Used in various address formats to identify ownership
 *
 * @since 2.0.0
 * @category model
 */
export type Credential = typeof Credential.Type

/**
 * Check if the given value is a valid Credential
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Credential)

export const CDDL = Schema.Tuple(
  Schema.Literal(0n, 1n),
  Schema.Uint8ArrayFromSelf // hash bytes
)

/**
 * CDDL schema for Credential as defined in the specification:
 * credential = [0, addr_keyhash // 1, script_hash]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDL, Schema.typeSchema(Credential), {
  strict: true,
  encode: (toI) =>
    Effect.gen(function* () {
      switch (toI._tag) {
        case "KeyHash": {
          const keyHashBytes = yield* ParseResult.encode(KeyHash.FromBytes)(toI.hash)
          return [0n, keyHashBytes] as const
        }
        case "ScriptHash": {
          const scriptHashBytes = yield* ParseResult.encode(ScriptHash.BytesSchema)(toI.hash)
          return [1n, scriptHashBytes] as const
        }
      }
    }),
  decode: ([tag, hashBytes]) =>
    Effect.gen(function* () {
      switch (tag) {
        case 0n: {
          const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(hashBytes)
          return Credential.members[0].make({ hash: keyHash })
        }
        case 1n: {
          const scriptHash = yield* ParseResult.decode(ScriptHash.BytesSchema)(hashBytes)
          return Credential.members[1].make({ hash: scriptHash })
        }
      }
    })
})

export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Credential
  )

export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Credential
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromCBORBytes(options),
      cborHex: FromCBORHex(options)
    },
    CredentialError
  )

/**
 * Check if two Credential instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Credential, b: Credential): boolean => {
  return a._tag === b._tag && a.hash === b.hash
}

/**
 * Generate a random Credential.
 * Randomly selects between generating a KeyHash or ScriptHash credential.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.oneof(
  FastCheck.record({
    _tag: FastCheck.constant("KeyHash" as const),
    hash: KeyHash.generator
  }),
  FastCheck.record({
    _tag: FastCheck.constant("ScriptHash" as const),
    hash: ScriptHash.generator
  })
)
