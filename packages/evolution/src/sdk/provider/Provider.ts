import type { Effect } from "effect"
import { Context, Data } from "effect"

import type * as Address from "../Address.js"
import type { UTxO } from "../UTxO.js"
import type { ProtocolParameters } from "./types.js"

// Base Provider Error
export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly cause: unknown
  readonly message: string
}> {}

// Effect oriented

// Provider Service Interface (Context.Tag)
export interface ProviderService {
  readonly getProtocolParameters: Effect.Effect<ProtocolParameters, ProviderError>
  readonly getUtxos: (address: Address.Address) => Effect.Effect<Array<UTxO>, ProviderError>
  readonly submitTx: (tx: string) => Effect.Effect<string, ProviderError>
}

// Context.Tag for dependency injection
export const ProviderService: Context.Tag<ProviderService, ProviderService> =
  Context.GenericTag<ProviderService>("@evolution/ProviderService")

// Non effect oriented, same as the old lucid

// Provider Interface (for Promise-based implementations)
export interface Provider {
  getProtocolParameters(): Promise<ProtocolParameters>
  getUtxos(address: Address.Address): Promise<Array<UTxO>>
  submitTx(tx: string): Promise<string>
}
