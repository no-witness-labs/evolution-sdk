import { Data, Schema } from "effect"

import * as _Codec from "./Codec.js"

export class BytesError extends Data.TaggedError("BytesError")<{
  message?: string
  cause?: unknown
}> {}

export const isHex = (input: string): boolean => {
  const len = input.length
  if (len === 0) return false

  if (len % 2 !== 0) return false

  for (let i = 0; i < len; i++) {
    const cc = input.charCodeAt(i)
    if (
      !(
        (cc >= 48 && cc <= 57) || // '0'–'9'
        (cc >= 65 && cc <= 70) || // 'A'–'F'
        (cc >= 97 && cc <= 102) // 'a'–'f'
      )
    ) {
      return false
    }
  }
  return true
}

/**
 * Lenient version of isHex that allows empty strings.
 * Useful for PlutusData where empty byte arrays are valid.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isHexLenient = (input: string): boolean => {
  const len = input.length

  // Empty strings are valid (for empty byte arrays)
  if (len === 0) return true

  // Must have even length
  if (len % 2 !== 0) return false

  // Check each character is valid hex
  for (let i = 0; i < len; i++) {
    const cc = input.charCodeAt(i)
    if (
      !(
        (cc >= 48 && cc <= 57) || // '0'–'9'
        (cc >= 65 && cc <= 70) || // 'A'–'F'
        (cc >= 97 && cc <= 102) // 'a'–'f'
      )
    ) {
      return false
    }
  }
  return true
}

const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"))

// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 } as const

/**
 * Converts an ASCII character code to its base16 (hexadecimal) value.
 * For use with pre-validated hex strings.
 */
const asciiToBase16 = (char: number): number => {
  if (char >= asciis._0 && char <= asciis._9) return char - asciis._0
  if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10)
  if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10)
  // Since Hex is already validated, this should never happen
  // but we return 0 to satisfy TypeScript
  return 0
}

export const HexSchema = Schema.String.pipe(
  Schema.filter((a) => isHex(a)),
  Schema.annotations({
    message: (issue) => `${issue.actual} must be a valid hex string (0-9, A-F, a-f) and cannot be empty`,
    identifier: "Bytes.Hex"
  })
)

export const FromHex = Schema.transform(HexSchema, Schema.Uint8ArrayFromSelf, {
  strict: true,
  encode: (toA) => {
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += hexes[toA[i]]
    }
    return hex
  },
  decode: (fromA) => {
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      const n1 = asciiToBase16(fromA.charCodeAt(hi))
      const n2 = asciiToBase16(fromA.charCodeAt(hi + 1))
      array[ai] = n1 * 16 + n2
    }
    return array
  }
}).annotations({
  identifier: "Bytes.FromHex"
})

export const FromBytes = Schema.transform(Schema.Uint8ArrayFromSelf, HexSchema, {
  strict: true,
  decode: (toA) => {
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += hexes[toA[i]]
    }
    return hex
  },
  encode: (fromA) => {
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      array[ai] = parseInt(fromA.slice(hi, hi + 2), 16)
    }
    return array
  }
}).annotations({
  identifier: "Bytes.FromBytes"
})

/**
 * Lenient hex schema that allows empty strings.
 * Useful for PlutusData where empty byte arrays are valid.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexLenientSchema = Schema.String.pipe(
  Schema.filter((a) => isHexLenient(a)),
  Schema.annotations({
    message: (issue) => `${issue.actual} must be a valid hex string (0-9, A-F, a-f) or empty string`,
    identifier: "Bytes.HexLenient"
  })
)

export const FromHexLenient = Schema.transform(HexLenientSchema, Schema.Uint8ArrayFromSelf, {
  strict: true,
  encode: (toA) => {
    if (toA.length === 0) return ""
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += hexes[toA[i]]
    }
    return hex
  },
  decode: (fromA) => {
    if (fromA.length === 0) return new Uint8Array(0)
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      const n1 = asciiToBase16(fromA.charCodeAt(hi))
      const n2 = asciiToBase16(fromA.charCodeAt(hi + 1))
      array[ai] = n1 * 16 + n2
    }
    return array
  }
})

/**
 * Lenient version of FromBytes that allows empty byte arrays.
 * Useful for PlutusData where empty byte arrays are valid.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytesLenient = Schema.transform(Schema.Uint8ArrayFromSelf, HexLenientSchema, {
  strict: true,
  decode: (toA) => {
    if (toA.length === 0) return ""
    let hex = ""
    for (let i = 0; i < toA.length; i++) {
      hex += hexes[toA[i]]
    }
    return hex
  },
  encode: (fromA) => {
    if (fromA.length === 0) return new Uint8Array(0)
    const array = new Uint8Array(fromA.length / 2)
    for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
      array[ai] = parseInt(fromA.slice(hi, hi + 2), 16)
    }
    return array
  }
}).annotations({
  identifier: "Bytes.FromBytesLenient"
})

export const Codec = _Codec.createEncoders(
  {
    bytes: FromBytes,
    bytesLenient: FromBytesLenient
  },
  BytesError
)
