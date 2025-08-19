import { FastCheck, Schema } from "effect"

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
  toString(): string {
    return `Pointer { slot: ${this.slot}, txIndex: ${this.txIndex}, certIndex: ${this.certIndex} }`
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString()
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

/**
 * Check if two Pointer instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Pointer, b: Pointer): boolean => {
  return a.slot === b.slot && a.txIndex === b.txIndex && a.certIndex === b.certIndex
}

/**
 * FastCheck arbitrary for generating random Pointer instances
 *
 * @since 2.0.0
 * @category generators
 */
export const arbitrary = FastCheck.tuple(Natural.arbitrary, Natural.arbitrary, Natural.arbitrary).map(
  ([slot, txIndex, certIndex]) => make(slot, txIndex, certIndex)
)
