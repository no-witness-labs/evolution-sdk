import { Data, FastCheck, Schema } from "effect"

import * as CBOR from "./CBOR.js"

/**
 * Error class for PlutusV2 related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class PlutusV2Error extends Data.TaggedError("PlutusV2Error")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Plutus V2 script wrapper (raw bytes).
 *
 * @since 2.0.0
 * @category model
 */
export class PlutusV2 extends Schema.TaggedClass<PlutusV2>("PlutusV2")("PlutusV2", {
  script: Schema.Uint8ArrayFromSelf
}) {}

/**
 * CDDL schema for PlutusV2 scripts as raw bytes.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = CBOR.ByteArray

/**
 * CDDL transformation schema for PlutusV2.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transform(CDDLSchema, PlutusV2, {
  strict: true,
  encode: (toI) => toI.script,
  decode: (fromA) => new PlutusV2({ script: fromA })
})

/**
 * Smart constructor for PlutusV2.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = PlutusV2.make

/**
 * Check equality of two raw script byte arrays.
 */
const eqBytes = (a: Uint8Array, b: Uint8Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * Check if two PlutusV2 instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: PlutusV2, b: PlutusV2): boolean => eqBytes(a.script, b.script)

/**
 * FastCheck arbitrary for PlutusV2.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<PlutusV2> = FastCheck.uint8Array({ minLength: 1, maxLength: 512 }).map(
  (script) => new PlutusV2({ script })
)
