import type { Effect } from "effect"
import { Context, Data } from "effect"

import type { AddressEras } from "../../core/AddressEras.js"
import type { TransactionHash } from "../../core/TransactionHash.js"
import type { UTxO } from "../UTxO.js"
import type { ProtocolParameters } from "./types.js"

// Base Provider Error
export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly cause: unknown
  readonly message: string
}> {}

// Provider Service Interface (Context.Tag)
export interface ProviderService {
  readonly getProtocolParameters: Effect.Effect<ProtocolParameters, ProviderError>
  readonly getUtxos: (address: AddressEras) => Effect.Effect<Array<UTxO>, ProviderError>
  readonly submitTx: (tx: string) => Effect.Effect<TransactionHash, ProviderError>
}

// Context.Tag for dependency injection
export const ProviderService: Context.Tag<ProviderService, ProviderService> =
  Context.GenericTag<ProviderService>("@evolution/ProviderService")

// Provider Interface (for Promise-based implementations)
export interface Provider {
  getProtocolParameters(): Promise<ProtocolParameters>
  getUtxos(address: AddressEras): Promise<Array<UTxO>>
  submitTx(tx: string): Promise<TransactionHash>
}
