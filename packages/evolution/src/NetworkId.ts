import { FastCheck, Schema } from "effect"

export const NetworkId = Schema.NonNegativeInt.pipe(Schema.brand("NetworkId"))

export type NetworkId = typeof NetworkId.Type

export const make = NetworkId.make

export const generator = FastCheck.integer({
  min: 0,
  max: 2
}).map((number) => make(number))
