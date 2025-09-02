import { Data, FastCheck, Schema } from "effect"

import * as CBOR from "./CBOR.js"

/**
 * Error class for PlutusV1 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PlutusV1Error extends Data.TaggedError("PlutusV1Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Plutus V1 script wrapper (raw bytes).
 *
 * @since 2.0.0
 * @category model
 */
export class PlutusV1 extends Schema.TaggedClass<PlutusV1>("PlutusV1")("PlutusV1", {
  bytes: Schema.Uint8ArrayFromSelf
}) {}

/**
 * CDDL schema for PlutusV1 scripts as raw bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = CBOR.ByteArray

/**
 * CDDL transformation schema for PlutusV1.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(CDDLSchema, PlutusV1, {
  strict: true,
  encode: (toI) => toI.bytes,
  decode: (fromA) => new PlutusV1({ bytes: fromA })
})

/**
 * Smart constructor for PlutusV1.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PlutusV1.make

/**
 * Check equality of two raw script byte arrays.
 */
const eqBytes = (a: Uint8Array, b: Uint8Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Check if two PlutusV1 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PlutusV1, b: PlutusV1): boolean => eqBytes(a.bytes, b.bytes)

/**
 * FastCheck arbitrary for PlutusV1.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<PlutusV1> = FastCheck.uint8Array({ minLength: 1, maxLength: 512 }).map(
  (script) => new PlutusV1({ bytes: script })
)
