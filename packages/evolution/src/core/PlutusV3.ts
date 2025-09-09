import { Data, FastCheck, Schema } from "effect"

import * as CBOR from "./CBOR.js"

/**
 * Error class for PlutusV3 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PlutusV3Error extends Data.TaggedError("PlutusV3Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Plutus V3 script wrapper (raw bytes).
 *
 * @since 2.0.0
 * @category model
 */
export class PlutusV3 extends Schema.TaggedClass<PlutusV3>("PlutusV3")("PlutusV3", {
  bytes: Schema.Uint8ArrayFromHex
}) {}

/**
 * CDDL schema for PlutusV3 scripts as raw bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = CBOR.ByteArray

/**
 * CDDL transformation schema for PlutusV3.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(CDDLSchema, Schema.typeSchema(PlutusV3), {
  strict: true,
  encode: (toI) => toI.bytes,
  decode: (fromA) => new PlutusV3({ bytes: fromA })
})

/**
 * Smart constructor for PlutusV3.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PlutusV3.make

/**
 * Check equality of two raw script byte arrays.
 */
const eqBytes = (a: Uint8Array, b: Uint8Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Check if two PlutusV3 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PlutusV3, b: PlutusV3): boolean => eqBytes(a.bytes, b.bytes)

/**
 * FastCheck arbitrary for PlutusV3.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<PlutusV3> = FastCheck.uint8Array({ minLength: 1, maxLength: 512 }).map(
  (bytes) => new PlutusV3({ bytes })
)
