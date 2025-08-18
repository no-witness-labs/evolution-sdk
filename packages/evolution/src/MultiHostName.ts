import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as DnsName from "./DnsName.js"
import * as Function from "./Function.js"

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
      Eff.gen(function* () {
        const dnsName = yield* ParseResult.encode(DnsName.DnsName)(toA.dnsName)
        return yield* Eff.succeed([2n, dnsName] as const)
      }),
    decode: ([, dnsNameValue]) =>
      Eff.gen(function* () {
        const dnsName = yield* ParseResult.decode(DnsName.DnsName)(dnsNameValue)
        return yield* Eff.succeed(new MultiHostName({ dnsName }))
      })
  }
).annotations({
  identifier: "MultiHostName.FromCDDL",
  description: "Transforms CBOR structure to MultiHostName"
})

/**
 * CBOR bytes transformation schema for MultiHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → MultiHostName
  ).annotations({
    identifier: "MultiHostName.FromCBORBytes",
    description: "Transforms CBOR bytes to MultiHostName"
  })

/**
 * CBOR hex transformation schema for MultiHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → MultiHostName
  ).annotations({
    identifier: "MultiHostName.FromCBORHex",
    description: "Transforms CBOR hex string to MultiHostName"
  })

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
 * FastCheck arbitrary for MultiHostName instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.record({
  dnsName: DnsName.arbitrary
}).map((props) => new MultiHostName(props))

/**
 * Effect namespace for MultiHostName operations that can fail
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Convert CBOR bytes to MultiHostName using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, MultiHostNameError)

  /**
   * Convert CBOR hex string to MultiHostName using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, MultiHostNameError)

  /**
   * Convert MultiHostName to CBOR bytes using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, MultiHostNameError)

  /**
   * Convert MultiHostName to CBOR hex string using Effect
   *
   * @since 2.0.0
   * @category conversion
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, MultiHostNameError)
}

/**
 * Convert CBOR bytes to MultiHostName (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(FromCDDL, MultiHostNameError, "MultiHostName.fromCBORBytes")

/**
 * Convert CBOR hex string to MultiHostName (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, MultiHostNameError, "MultiHostName.fromCBORHex")

/**
 * Convert MultiHostName to CBOR bytes (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, MultiHostNameError, "MultiHostName.toCBORBytes")

/**
 * Convert MultiHostName to CBOR hex string (unsafe)
 *
 * @since 2.0.0
 * @category conversion
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, MultiHostNameError, "MultiHostName.toCBORHex")
