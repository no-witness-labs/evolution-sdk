import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as Credential from "./Credential.js"
import * as Function from "./Function.js"
import * as KeyHash from "./KeyHash.js"
import * as Natural from "./Natural.js"
import * as NetworkId from "./NetworkId.js"
import * as Pointer from "./Pointer.js"
import * as ScriptHash from "./ScriptHash.js"

/**
 * Error thrown when address operations fail
 *
 * @since 2.0.0
 * @category model
 */
export class PointerAddressError extends Data.TaggedError("PointerAddressError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Pointer address with payment credential and pointer to stake registration
 *
 * @since 2.0.0
 * @category schemas
 */
export class PointerAddress extends Schema.TaggedClass<PointerAddress>("PointerAddress")("PointerAddress", {
  networkId: NetworkId.NetworkId,
  paymentCredential: Credential.Credential,
  pointer: Pointer.Pointer
}) {
  toString(): string {
    return `PointerAddress { networkId: ${this.networkId}, paymentCredential: ${this.paymentCredential}, pointer: ${this.pointer} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
  }
}

/**
 * Encode a positive integer using Cardano pointer varint (LEB128-like) encoding.
 * - Little-endian base-128: emit 7-bit groups, low to high, set MSB (0x80) on all but last.
 * - Matches decodeVariableLength below and Cardano pointer address spec.
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const encodeVariableLength = (natural: Natural.Natural) =>
  Eff.gen(function* () {
    const value = yield* ParseResult.decode(Natural.Natural)(natural)
    let n = value as number
    const chunks: Array<number> = []

    // Collect 7-bit chunks (LSB first)
    while (n > 0) {
      chunks.push(n & 0x7f)
      n = Math.floor(n / 128)
    }

    // Emit in big-endian order with continuation bit on all but the last
    const out: Array<number> = []
    for (let i = chunks.length - 1; i >= 0; i--) {
      let byte = chunks[i]
      if (i !== 0) byte |= 0x80
      out.push(byte)
    }

    return new Uint8Array(out)
  })

/**
 * Decode a variable length integer from a Uint8Array (LEB128-like)
 * Following the Cardano ledger implementation for variable-length integers
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const decodeVariableLength: (
  bytes: Uint8Array,
  offset?: number | undefined
) => Eff.Effect<[Natural.Natural, number], ParseResult.ParseIssue> = Eff.fnUntraced(function* (
  bytes: Uint8Array,
  offset = 0
) {
  let number = 0
  let bytesRead = 0

  while (true) {
    if (offset + bytesRead >= bytes.length) {
      return yield* ParseResult.fail(
        new ParseResult.Type(Natural.Natural.ast, bytes, `Buffer overflow decoding varint at offset ${offset}`)
      )
    }

    const b = bytes[offset + bytesRead]
    bytesRead++

    // Big-endian base-128 accumulate
    number = (number << 7) | (b & 0x7f)

    if ((b & 0x80) === 0) {
      const value = yield* ParseResult.decode(Natural.Natural)(number)
      return [value, bytesRead] as const
    }
  }
})

export const FromBytes = Schema.transformOrFail(Schema.Uint8ArrayFromSelf, PointerAddress, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b01 << 6) | (0b0 << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)

      // Get variable length encoded bytes first to determine total size
      const slotBytes = yield* encodeVariableLength(toA.pointer.slot)
      const txIndexBytes = yield* encodeVariableLength(toA.pointer.txIndex)
      const certIndexBytes = yield* encodeVariableLength(toA.pointer.certIndex)

      const totalSize = 1 + 28 + slotBytes.length + txIndexBytes.length + certIndexBytes.length
      const result = new Uint8Array(totalSize)
      result[0] = header

      // payment credential
      result.set(toA.paymentCredential.hash, 1)

      // pointer components
      let offset = 29
      result.set(slotBytes, offset)
      offset += slotBytes.length
      result.set(txIndexBytes, offset)
      offset += txIndexBytes.length
      result.set(certIndexBytes, offset)

      return yield* ParseResult.succeed(result)
    }),
  decode: (_, __, ast, fromA) =>
    Eff.gen(function* () {
      if (fromA.length < 30) {
        return yield* ParseResult.fail(new ParseResult.Type(ast, fromA, "PointerAddress: too few bytes"))
      }

      const header = fromA[0]
      const networkId = header & 0b00001111
      const addressType = header >> 4

      // validate pointer address type group: top bits 01 and bit5=0
      const top2 = (header >> 6) & 0b11
      const stakeOrPtrBit = (header >> 5) & 0b1
      if (!(top2 === 0b01 && stakeOrPtrBit === 0b0)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, fromA, "PointerAddress: invalid header for pointer address")
        )
      }

      // payment credential kind
      const isPaymentKey = (addressType & 0b0001) === 0
      const paymentCredential: Credential.Credential = isPaymentKey
        ? new KeyHash.KeyHash({ hash: fromA.slice(1, 29) })
        : new ScriptHash.ScriptHash({ hash: fromA.slice(1, 29) })

      // decode pointer components
      let offset = 29
      const [slot, r1] = yield* decodeVariableLength(fromA, offset)
      offset += r1
      const [txIndex, r2] = yield* decodeVariableLength(fromA, offset)
      offset += r2
      const [certIndex, r3] = yield* decodeVariableLength(fromA, offset)
      offset += r3

      if (offset !== fromA.length) {
        return yield* ParseResult.fail(new ParseResult.Type(ast, fromA, "PointerAddress: unexpected trailing bytes"))
      }

      return yield* ParseResult.decode(PointerAddress)({
        _tag: "PointerAddress",
        networkId,
        paymentCredential,
        pointer: new Pointer.Pointer({ slot, txIndex, certIndex }, { disableValidation: true })
      })
    })
}).annotations({
  identifier: "PointerAddress.FromBytes",
  description: "Transforms raw bytes to PointerAddress"
})

export const FromHex = Schema.compose(
  Bytes.FromHex, // string → Uint8Array
  FromBytes // Uint8Array → PointerAddress
).annotations({
  identifier: "PointerAddress.FromHex",
  description: "Transforms raw hex string to PointerAddress"
})

/**
 * Smart constructor for creating PointerAddress instances
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (props: {
  networkId: NetworkId.NetworkId
  paymentCredential: Credential.Credential
  pointer: Pointer.Pointer
}): PointerAddress => new PointerAddress(props)

/**
 * Check if two PointerAddress instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PointerAddress, b: PointerAddress): boolean => {
  return (
    a.networkId === b.networkId &&
    Credential.equals(a.paymentCredential, b.paymentCredential) &&
    a.pointer.slot === b.pointer.slot &&
    a.pointer.txIndex === b.pointer.txIndex &&
    a.pointer.certIndex === b.pointer.certIndex
  )
}

/**
 * FastCheck arbitrary for generating random PointerAddress instances
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.tuple(NetworkId.arbitrary, Credential.arbitrary, Pointer.arbitrary).map(
  ([networkId, paymentCredential, pointer]) =>
    make({
      networkId,
      paymentCredential,
      pointer
    })
)

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse a PointerAddress from bytes.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromBytes = Function.makeDecodeEither(FromBytes, PointerAddressError)

  /**
   * Parse a PointerAddress from hex string.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromHex = Function.makeDecodeEither(FromHex, PointerAddressError)

  /**
   * Convert a PointerAddress to bytes.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toBytes = Function.makeEncodeEither(FromBytes, PointerAddressError)

  /**
   * Convert a PointerAddress to hex string.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toHex = Function.makeEncodeEither(FromHex, PointerAddressError)
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a PointerAddress from bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromBytes = Function.makeDecodeSync(FromBytes, PointerAddressError, "PointerAddress.fromBytes")

/**
 * Parse a PointerAddress from hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromHex = Function.makeDecodeSync(FromHex, PointerAddressError, "PointerAddress.fromHex")

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a PointerAddress to bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toBytes = Function.makeEncodeSync(FromBytes, PointerAddressError, "PointerAddress.toBytes")

/**
 * Convert a PointerAddress to hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toHex = Function.makeEncodeSync(FromHex, PointerAddressError, "PointerAddress.toHex")
