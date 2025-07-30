import { Data, Effect, FastCheck, Option, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as IPv4 from "./IPv4.js"
import * as IPv6 from "./IPv6.js"
import * as Port from "./Port.js"

/**
 * Error class for SingleHostAddr related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class SingleHostAddrError extends Data.TaggedError("SingleHostAddrError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for SingleHostAddr representing a network host with IP addresses.
 * single_host_addr = (0, port/ nil, ipv4/ nil, ipv6/ nil)
 *
 * @since 2.0.0
 * @category model
 */
export class SingleHostAddr extends Schema.TaggedClass<SingleHostAddr>()("SingleHostAddr", {
  port: Schema.OptionFromNullOr(Port.PortSchema),
  ipv4: Schema.OptionFromNullOr(IPv4.IPv4),
  ipv6: Schema.OptionFromNullOr(IPv6.IPv6)
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "SingleHostAddr",
      port: this.port,
      ipv4: this.ipv4,
      ipv6: this.ipv6
    }
  }
}

/**
 * Create a SingleHostAddr with IPv4 address.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withIPv4 = (port: Option.Option<Port.Port>, ipv4: IPv4.IPv4): SingleHostAddr =>
  new SingleHostAddr({
    port,
    ipv4: Option.some(ipv4),
    ipv6: Option.none()
  })

/**
 * Create a SingleHostAddr with IPv6 address.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withIPv6 = (port: Option.Option<Port.Port>, ipv6: IPv6.IPv6): SingleHostAddr =>
  new SingleHostAddr({
    port,
    ipv4: Option.none(),
    ipv6: Option.some(ipv6)
  })

/**
 * Create a SingleHostAddr with both IPv4 and IPv6 addresses.
 *
 * @since 2.0.0
 * @category constructors
 */
export const withBothIPs = (port: Option.Option<Port.Port>, ipv4: IPv4.IPv4, ipv6: IPv6.IPv6): SingleHostAddr =>
  new SingleHostAddr({
    port,
    ipv4: Option.some(ipv4),
    ipv6: Option.some(ipv6)
  })

/**
 * Check if the host address has an IPv4 address.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasIPv4 = (hostAddr: SingleHostAddr): boolean => Option.isSome(hostAddr.ipv4)

/**
 * Check if the host address has an IPv6 address.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasIPv6 = (hostAddr: SingleHostAddr): boolean => Option.isSome(hostAddr.ipv6)

/**
 * Check if the host address has a port.
 *
 * @since 2.0.0
 * @category predicates
 */
export const hasPort = (hostAddr: SingleHostAddr): boolean => Option.isSome(hostAddr.port)

/**
 * Check if two SingleHostAddr instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: SingleHostAddr, b: SingleHostAddr): boolean =>
  Option.getEquivalence(Port.equals)(a.port, b.port) &&
  Option.getEquivalence(IPv4.equals)(a.ipv4, b.ipv4) &&
  Option.getEquivalence(IPv6.equals)(a.ipv6, b.ipv6)

/**
 * Generate a random SingleHostAddr.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.record({
  port: FastCheck.option(Port.generator),
  ipv4: FastCheck.option(IPv4.generator),
  ipv6: FastCheck.option(IPv6.generator)
}).map(
  ({ ipv4, ipv6, port }) =>
    new SingleHostAddr({
      port: port ? Option.some(port) : Option.none(),
      ipv4: ipv4 ? Option.some(ipv4) : Option.none(),
      ipv6: ipv6 ? Option.some(ipv6) : Option.none()
    })
)

/**
 * CDDL schema for SingleHostAddr.
 * single_host_addr = (0, port / nil, ipv4 / nil, ipv6 / nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const SingleHostAddrCDDLSchema = Schema.transformOrFail(
  Schema.Tuple(
    Schema.Literal(0n), // tag (literal 0)
    Schema.NullOr(CBOR.Integer), // port (number or null)
    Schema.NullOr(CBOR.ByteArray), // ipv4 bytes (nullable)
    Schema.NullOr(CBOR.ByteArray) // ipv6 bytes (nullable)
  ),
  Schema.typeSchema(SingleHostAddr),
  {
    strict: true,
    encode: (toA) =>
      Effect.gen(function* () {
        const port = Option.isSome(toA.port) ? BigInt(toA.port.value) : null

        const ipv4 = Option.isSome(toA.ipv4) ? yield* ParseResult.encode(IPv4.FromBytes)(toA.ipv4.value) : null

        const ipv6 = Option.isSome(toA.ipv6) ? yield* ParseResult.encode(IPv6.FromBytes)(toA.ipv6.value) : null

        return yield* Effect.succeed([0n, port, ipv4, ipv6] as const)
      }),
    decode: ([, portValue, ipv4Value, ipv6Value]) =>
      Effect.gen(function* () {
        const port =
          portValue === null || portValue === undefined ? Option.none() : Option.some(Port.make(Number(portValue)))

        const ipv4 =
          ipv4Value === null || ipv4Value === undefined
            ? Option.none()
            : Option.some(yield* ParseResult.decode(IPv4.FromBytes)(ipv4Value))

        const ipv6 =
          ipv6Value === null || ipv6Value === undefined
            ? Option.none()
            : Option.some(yield* ParseResult.decode(IPv6.FromBytes)(ipv6Value))

        return yield* Effect.succeed(new SingleHostAddr({ port, ipv4, ipv6 }))
      })
  }
)

/**
 * CBOR bytes transformation schema for SingleHostAddr.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    SingleHostAddrCDDLSchema // CBOR → SingleHostAddr
  )

/**
 * CBOR hex transformation schema for SingleHostAddr.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → SingleHostAddr
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options)
    },
    SingleHostAddrError
  )
