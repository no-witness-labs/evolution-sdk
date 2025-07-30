import { Data, FastCheck, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as _Codec from "./Codec.js"
import * as MultiHostName from "./MultiHostName.js"
import * as SingleHostAddr from "./SingleHostAddr.js"
import * as SingleHostName from "./SingleHostName.js"

/**
 * Error class for Relay related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class RelayError extends Data.TaggedError("RelayError")<{
  message?: string
  reason?: "InvalidStructure" | "UnsupportedType"
}> {}

/**
 * Union schema for Relay representing various relay configurations.
 * relay = [ single_host_addr // single_host_name // multi_host_name ]
 *
 * @since 2.0.0
 * @category schemas
 */
export const Relay = Schema.Union(
  SingleHostAddr.SingleHostAddr,
  SingleHostName.SingleHostName,
  MultiHostName.MultiHostName
)

export const FromCDDL = Schema.Union(
  SingleHostAddr.SingleHostAddrCDDLSchema,
  SingleHostName.SingleHostNameCDDLSchema,
  MultiHostName.FromCDDL
)

/**
 * Type alias for Relay.
 *
 * @since 2.0.0
 * @category model
 */
export type Relay = typeof Relay.Type

/**
 * CBOR bytes transformation schema for Relay.
 * For union types, we create a union of the child FromBytess
 * rather than trying to create a complex three-layer transformation.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.Union(SingleHostAddr.FromBytes(options), SingleHostName.FromBytes(options), MultiHostName.FromBytes(options))

/**
 * CBOR hex transformation schema for Relay.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromHex = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromBytes(options) // Uint8Array → Relay
  )

export const Codec = (options: CBOR.CodecOptions = CBOR.DEFAULT_OPTIONS) =>
  _Codec.createEncoders(
    {
      cborBytes: FromBytes(options),
      cborHex: FromHex(options)
    },
    RelayError
  )

/**
 * Pattern match on a Relay to handle different relay types.
 *
 * @since 2.0.0
 * @category transformation
 */
export const match = <A, B, C>(
  relay: Relay,
  cases: {
    SingleHostAddr: (addr: SingleHostAddr.SingleHostAddr) => A
    SingleHostName: (name: SingleHostName.SingleHostName) => B
    MultiHostName: (multi: MultiHostName.MultiHostName) => C
  }
): A | B | C => {
  switch (relay._tag) {
    case "SingleHostAddr":
      return cases.SingleHostAddr(relay)
    case "SingleHostName":
      return cases.SingleHostName(relay)
    case "MultiHostName":
      return cases.MultiHostName(relay)
    default:
      throw new Error(`Exhaustive check failed: Unhandled case '${(relay as { _tag: string })._tag}' encountered.`)
  }
}

/**
 * Check if a Relay is a SingleHostAddr.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isSingleHostAddr = (relay: Relay): relay is SingleHostAddr.SingleHostAddr =>
  relay._tag === "SingleHostAddr"

/**
 * Check if a Relay is a SingleHostName.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isSingleHostName = (relay: Relay): relay is SingleHostName.SingleHostName =>
  relay._tag === "SingleHostName"

/**
 * Check if a Relay is a MultiHostName.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isMultiHostName = (relay: Relay): relay is MultiHostName.MultiHostName => relay._tag === "MultiHostName"

/**
 * FastCheck generator for Relay instances.
 *
 * @since 2.0.0
 * @category generators
 */
export const generator = FastCheck.oneof(SingleHostAddr.generator, SingleHostName.generator, MultiHostName.generator)

/**
 * Check if two Relay instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (self: Relay, that: Relay): boolean => {
  if (self._tag !== that._tag) return false

  switch (self._tag) {
    case "SingleHostAddr":
      return SingleHostAddr.equals(self, that as SingleHostAddr.SingleHostAddr)
    case "SingleHostName":
      return SingleHostName.equals(self, that as SingleHostName.SingleHostName)
    case "MultiHostName":
      return MultiHostName.equals(self, that as MultiHostName.MultiHostName)
    default:
      return false
  }
}

/**
 * Create a Relay from a SingleHostAddr.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromSingleHostAddr = (singleHostAddr: SingleHostAddr.SingleHostAddr): Relay => singleHostAddr

/**
 * Create a Relay from a SingleHostName.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromSingleHostName = (singleHostName: SingleHostName.SingleHostName): Relay => singleHostName

/**
 * Create a Relay from a MultiHostName.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromMultiHostName = (multiHostName: MultiHostName.MultiHostName): Relay => multiHostName
