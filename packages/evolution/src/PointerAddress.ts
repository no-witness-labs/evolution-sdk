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
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "PointerAddress",
      networkId: this.networkId,
      paymentCredential: this.paymentCredential,
      pointer: this.pointer
    }
  }
}

export const FromBytes = Schema.transformOrFail(Schema.Uint8ArrayFromSelf, PointerAddress, {
  strict: true,
  encode: (toI, options, ast, toA) =>
    Eff.gen(function* () {
      const paymentBit = toA.paymentCredential._tag === "KeyHash" ? 0 : 1
      const header = (0b01 << 6) | (0b0 << 5) | (paymentBit << 4) | (toA.networkId & 0b00001111)

      // Get variable length encoded bytes first to determine total size
      const slotBytes = yield* encodeVariableLength(toA.pointer.slot)
      const txIndexBytes = yield* encodeVariableLength(toA.pointer.txIndex)
      const certIndexBytes = yield* encodeVariableLength(toA.pointer.certIndex)

      // Calculate total buffer size: 1 byte header + 28 bytes credential + variable parts
      const totalSize = 1 + 28 + slotBytes.length + txIndexBytes.length + certIndexBytes.length

      // Allocate a buffer with the correct total size
      const result = new Uint8Array(totalSize)

      // Set the header
      result[0] = header

      const paymentCredentialBytes = toA.paymentCredential.hash
      result.set(paymentCredentialBytes, 1)

      // Set the pointer data bytes at the correct position
      let offset = 29 // 1 byte header + 28 bytes credential
      result.set(slotBytes, offset)
      offset += slotBytes.length
      result.set(txIndexBytes, offset)
      offset += txIndexBytes.length
      result.set(certIndexBytes, offset)

      return result
    }),
  decode: (_, __, ast, fromA) =>
    Eff.gen(function* () {
      const header = fromA[0]
      // Extract network ID from the lower 4 bits
      const networkId = header & 0b00001111
      // Extract address type from the upper 4 bits (bits 4-7)
      const addressType = header >> 4

      // Script payment with pointer
      // Check if the address is a pointer address
      const isPaymentKey = (addressType & 0b0001) === 0
      const paymentCredential: Credential.Credential = isPaymentKey
        ? new KeyHash.KeyHash({
            hash: fromA.slice(1, 29)
          })
        : new ScriptHash.ScriptHash({
            hash: fromA.slice(1, 29)
          })

      // After the credential, we have 3 variable-length integers
      let offset = 29

      // Decode the slot, txIndex, and certIndex as variable length integers
      const [slot, slotBytesRead] = yield* decodeVariableLength(fromA, offset)
      offset += slotBytesRead

      const [txIndex, txIndexBytesRead] = yield* decodeVariableLength(fromA, offset)
      offset += txIndexBytesRead

      const [certIndex] = yield* decodeVariableLength(fromA, offset)

      return yield* ParseResult.decode(PointerAddress)({
        _tag: "PointerAddress",
        networkId,
        paymentCredential,
        pointer: Pointer.make(slot, txIndex, certIndex)
      })
    }).pipe(Eff.catchTag("PointerAddressError", (e) => Eff.fail(new ParseResult.Type(ast, fromA, e.message))))
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
 * Encode a number as a variable length integer following the Cardano ledger specification
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const encodeVariableLength = (natural: Natural.Natural) =>
  Eff.gen(function* () {
    // Handle the simple case: values less than 128 (0x80, binary 10000000) fit in a single byte
    // with no continuation bit needed
    if (natural < 128) {
      return new Uint8Array([natural])
    }
    // For larger values, we need to split the number into 7-bit chunks
    const result: Array<number> = []
    let remaining = natural
    // Loop until all bits of the number have been processed
    while (remaining >= 128) {
      // Take the least significant 7 bits (value & 0x7F, binary 01111111)
      // and set the high bit (| 0x80, binary 10000000) to indicate more bytes follow
      result.push((remaining & 0x7f) | 0x80)
      // Shift right by 7 bits (divide by 128) to process the next chunk
      remaining = yield* ParseResult.decode(Natural.Natural)(Math.floor(remaining / 128))
    }
    // Push the final byte (the most significant bits)
    // without setting the high bit, indicating this is the last byte
    result.push(remaining & 0x7f) // Binary: 0xxxxxxx where x are bits from the value
    // Convert the array of bytes to a Uint8Array
    // The bytes are already in little-endian order (least significant byte first)
    return new Uint8Array(result)
  })

/**
 * Decode a variable length integer from a Uint8Array
 * Following the Cardano ledger implementation for variable-length integers
 *
 * @since 2.0.0
 * @category encoding/decoding
 */
export const decodeVariableLength: (
  bytes: Uint8Array,
  offset?: number | undefined
) => Eff.Effect<[Natural.Natural, number], PointerAddressError | ParseResult.ParseIssue> = Eff.fnUntraced(function* (
  bytes: Uint8Array,
  offset = 0
) {
  // The accumulated decoded value
  let number = 0

  // Count of bytes processed so far
  let bytesRead = 0

  // Multiplier for the current byte position (increases by powers of 128)
  // Starts at 1 because the first 7 bits are multiplied by 1
  let multiplier = 1

  while (true) {
    // Check if we've reached the end of the buffer without finding a complete value
    // This is a safeguard against buffer overruns
    if (offset + bytesRead >= bytes.length) {
      yield* new PointerAddressError({
        message: `Buffer overflow: not enough bytes to decode variable length integer at offset ${offset}`
      })
    }

    // Read the current byte
    const b = bytes[offset + bytesRead]
    bytesRead++

    // Extract value bits by masking with 0x7F (binary 01111111)
    // This removes the high continuation bit and keeps only the 7 value bits
    // Then multiply by the current position multiplier and add to accumulated value
    number += (b & 0x7f) * multiplier

    // Check if this is the last byte by testing the high bit (0x80, binary 10000000)
    // If the high bit is 0, we've reached the end of the encoded integer
    if ((b & 0x80) === 0) {
      // Return the decoded value and the count of bytes read
      // const value = yield* Schema.decode(Natural.Natural)({ number });
      const value = yield* ParseResult.decode(Natural.Natural)(number)
      return [value, bytesRead] as const
    }

    // If the high bit is 1, we need to read more bytes
    // Increase the multiplier for the next byte position (each position is worth 128 times more)
    // This is because each byte holds 7 bits of value information
    multiplier *= 128

    // Continue reading bytes until we find one with the high bit set to 0
  }
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
