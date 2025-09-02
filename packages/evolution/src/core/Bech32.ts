import { bech32 } from "@scure/base"
import { Data, Effect, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"

/**
 * @since 2.0.0
 * @category model
 */
export class Bech32Error extends Data.TaggedError("Bech32Error")<{
  message: string
  cause?: unknown
}> {}

export const Bech32Schema = Schema.String
export type Bech32 = typeof Bech32Schema.Type

export const FromBytes = (prefix: string = "addr") =>
  Schema.transformOrFail(Schema.Uint8ArrayFromSelf, Bech32Schema, {
    strict: true,
    encode: (_, __, ast, toA) =>
      Effect.try({
        try: () => bech32.decodeToBytes(toA).bytes,
        catch: () => new ParseResult.Type(ast, toA, ` ${toA} is not a valid Bech32 address`)
      }),
    decode: (_, __, ___, fromI) => {
      const words = bech32.toWords(fromI)
      return ParseResult.succeed(bech32.encode(prefix, words, false))
    }
  })

export const FromHex = (prefix: string = "addr") =>
  Schema.compose(Bytes.FromHex, FromBytes(prefix)).annotations({
    identifier: "Bech32.FromHex"
  })
