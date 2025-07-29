import { Data, Effect, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as DnsName from "./DnsName.js"

/**
 * Error class for MultiHostName related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class MultiHostNameError extends Data.TaggedError("MultiHostNameError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for MultiHostName representing a multiple host name record.
 * multi_host_name = (2, dns_name)
 *
 * @since 2.0.0
 * @category model
 */
export class MultiHostName extends Schema.TaggedClass<MultiHostName>()("MultiHostName", {
  dnsName: DnsName.DnsName
}) {}

/**
 * CDDL schema for MultiHostName.
 * multi_host_name = (2, dns_name)
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(
  Schema.Tuple(
    Schema.Literal(2n), // tag (literal 2)
    Schema.String // dns_name (string)
  ),
  Schema.typeSchema(MultiHostName),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const dnsName = yield* ParseResult.encode(DnsName.DnsName)(toA.dnsName)
        return yield* Effect.succeed([2n, dnsName] as const)
      }),
    decode: ([, dnsNameValue]) =>
      Effect.gen(function* () {
        const dnsName = yield* ParseResult.decode(DnsName.DnsName)(dnsNameValue)
        return yield* Effect.succeed(new MultiHostName({ dnsName }))
      })
  }
)

/**
 * CBOR bytes transformation schema for MultiHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → MultiHostName
  )

/**
 * CBOR hex transformation schema for MultiHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → MultiHostName
  )

/**
 * Create a MultiHostName instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (dnsName: DnsName.DnsName): MultiHostName => new MultiHostName({ dnsName })

/**
 * Check if two MultiHostName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: MultiHostName, that: MultiHostName): boolean => DnsName.equals(self.dnsName, that.dnsName)

/**
 * FastCheck generator for MultiHostName instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.record({
  dnsName: DnsName.generator
}).map((props) => new MultiHostName(props))

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: CBORBytesSchema(options),
      cborHex: CBORHexSchema(options)
    },
    MultiHostNameError
  )
