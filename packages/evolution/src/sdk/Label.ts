import { fromHex } from "../core/Bytes.js"

/**
 * CRC8 implementation for label checksum calculation.
 * Uses polynomial 0x07 (x^8 + x^2 + x + 1) as per CIP-67 specification.
 */
function crc8(data: Uint8Array): number {
  let crc = 0
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x07
      } else {
        crc = crc << 1
      }
    }
  }
  
  return crc & 0xFF
}

/**
 * Generate checksum for a hex-encoded number.
 */
function checksum(num: string): string {
  return crc8(fromHex(num)).toString(16).padStart(2, "0")
}

/**
 * Convert a number to a CIP-67 label format.
 * Creates an 8-character hex string with format: 0[4-digit-hex][2-digit-checksum]0
 */
export function toLabel(num: number): string {
  if (num < 0 || num > 65535) {
    throw new Error(
      `Label ${num} out of range: min label 1 - max label 65535.`
    )
  }
  const numHex = num.toString(16).padStart(4, "0")
  return "0" + numHex + checksum(numHex) + "0"
}

/**
 * Parse a CIP-67 label format back to a number.
 * Returns undefined if the label format is invalid or checksum doesn't match.
 */
export function fromLabel(label: string): number | undefined {
  if (label.length !== 8 || !(label[0] === "0" && label[7] === "0")) {
    return undefined
  }
  const numHex = label.slice(1, 5)
  const num = parseInt(numHex, 16)
  const check = label.slice(5, 7)
  return check === checksum(numHex) ? num : undefined
}
