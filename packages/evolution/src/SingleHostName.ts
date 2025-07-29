import { Data, Effect, FastCheck, Option, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as DnsName from "./DnsName.js"
import * as Port from "./Port.js"

/**
 * Error class for SingleHostName related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class SingleHostNameError extends Data.TaggedError("SingleHostNameError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for SingleHostName representing a network host with DNS name.
 * single_host_name = (1, port/ nil, dns_name)
 *
 * Used for A or AAAA DNS records.
 *
 * @since 2.0.0
 * @category model
 */
export class SingleHostName extends Schema.TaggedClass<SingleHostName>()("SingleHostName", {
  port: Schema.OptionFromNullOr(Port.PortSchema),
  dnsName: DnsName.DnsName
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "SingleHostName",
      port: this.port,
      dnsName: this.dnsName
    }
  }
}

/**
 * Create a SingleHostName with a port.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withPort = (port: Port.Port, dnsName: DnsName.DnsName): SingleHostName =>
  new SingleHostName({
    port: Option.some(port),
    dnsName
  })

/**
 * Create a SingleHostName without a port.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withoutPort = (dnsName: DnsName.DnsName): SingleHostName =>
  new SingleHostName({
    port: Option.none(),
    dnsName
  })

/**
 * Check if the host name has a port.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasPort = (hostName: SingleHostName): boolean => Option.isSome(hostName.port)

/**
 * Get the DNS name from a SingleHostName.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getDnsName = (hostName: SingleHostName): DnsName.DnsName => hostName.dnsName

/**
 * Get the port from a SingleHostName, if it exists.
 *
 * @since 2.0.0
 * @category transformation
 */
export const getPort = (hostName: SingleHostName): Option.Option<Port.Port> => hostName.port

/**
 * Check if two SingleHostName instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: SingleHostName, b: SingleHostName): boolean =>
  Option.getEquivalence(Port.equals)(a.port, b.port) && DnsName.equals(a.dnsName, b.dnsName)

/**
 * Generate a random SingleHostName.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.record({
  port: FastCheck.option(Port.generator),
  dnsName: DnsName.generator
}).map(
  ({ dnsName, port }) =>
    new SingleHostName({
      port: port ? Option.some(port) : Option.none(),
      dnsName
    })
)

/**
 * CDDL schema for SingleHostName.
 * single_host_name = (1, port / nil, dns_name)
 *
 * @since 2.0.0
 * @category schemas
 */
export const SingleHostNameCDDLSchema = Schema.transformOrFail(
  Schema.Tuple(
    Schema.Literal(1n), // tag (literal 1)
    Schema.NullOr(CBOR.Integer), // port (number or null)
    Schema.String // dns_name (string)
  ),
  Schema.typeSchema(SingleHostName),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const port = Option.isSome(toA.port) ? BigInt(toA.port.value) : null
        const dnsName = yield* ParseResult.encode(DnsName.DnsName)(toA.dnsName)

        return yield* Effect.succeed([1n, port, dnsName] as const)
      }),
    decode: ([, portValue, dnsNameValue]) =>
      Effect.gen(function* () {
        const port =
          portValue === null || portValue === undefined
            ? Option.none()
            : Option.some(yield* ParseResult.decode(Port.PortSchema)(Number(portValue)))

        const dnsName = yield* ParseResult.decode(DnsName.DnsName)(dnsNameValue)

        return yield* Effect.succeed(new SingleHostName({ port, dnsName }))
      })
  }
)

/**
 * CBOR bytes transformation schema for SingleHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORBytesSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    SingleHostNameCDDLSchema // CBOR → SingleHostName
  )

/**
 * CBOR hex transformation schema for SingleHostName.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CBORHexSchema = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    CBORBytesSchema(options) // Uint8Array → SingleHostName
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) => ({
  Encode: {
    cborBytes: Schema.encodeSync(CBORBytesSchema(options)),
    cborHex: Schema.encodeSync(CBORHexSchema(options))
  },
  Decode: {
    cborBytes: Schema.decodeUnknownSync(CBORBytesSchema(options)),
    cborHex: Schema.decodeUnknownSync(CBORHexSchema(options))
  },
  EncodeEither: {
    cborBytes: Schema.encodeEither(CBORBytesSchema(options)),
    cborHex: Schema.encodeEither(CBORHexSchema(options))
  },
  DecodeEither: {
    cborBytes: Schema.decodeEither(CBORBytesSchema(options)),
    cborHex: Schema.decodeEither(CBORHexSchema(options))
  },
  EncodeEffect: {
    cborBytes: Schema.encode(CBORBytesSchema(options)),
    cborHex: Schema.encode(CBORHexSchema(options))
  },
  DecodeEffect: {
    cborBytes: Schema.decode(CBORBytesSchema(options)),
    cborHex: Schema.decode(CBORHexSchema(options))
  }
})
