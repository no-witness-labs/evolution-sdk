import { Schema } from "effect"

import * as Natural from "./Natural.js"

/**
 * Schema for pointer to a stake registration certificate
 * Contains slot, transaction index, and certificate index information
 *
 * @since 2.0.0
 * @category schemas
 */
export class Pointer extends Schema.TaggedClass<Pointer>("Pointer")("Pointer", {
  slot: Natural.Natural,
  txIndex: Natural.Natural,
  certIndex: Natural.Natural
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "Pointer",
      slot: this.slot,
      txIndex: this.txIndex,
      certIndex: this.certIndex
    }
  }
}

/**
 * Check if the given value is a valid Pointer
 *
 *
 * @since 2.0.0
 * @category predicates
 */
export const isPointer = Schema.is(Pointer)

/**
 * Create a new Pointer instance
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (slot: Natural.Natural, txIndex: Natural.Natural, certIndex: Natural.Natural): Pointer => {
  return new Pointer(
    {
      slot,
      txIndex,
      certIndex
    },
    { disableValidation: true }
  )
}
