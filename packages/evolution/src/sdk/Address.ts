import { Function, Schema } from "effect"

import * as CoreAddressStructure from "../core/AddressStructure.js"

// bech32
export type Address = string

export const toAddressStructure = Schema.decodeSync(CoreAddressStructure.FromBech32)
export const fromAddressStructure = Schema.encodeSync(CoreAddressStructure.FromBech32)

export const fromJsonToAddressStructure = Schema.decodeSync(CoreAddressStructure.AddressStructure)
export const fromAddressStructureToJson = Schema.encodeSync(CoreAddressStructure.AddressStructure)

export const addressToJson = Function.flow(toAddressStructure, fromAddressStructureToJson)
export const jsonToAddress = Function.flow(fromJsonToAddressStructure, fromAddressStructure)
