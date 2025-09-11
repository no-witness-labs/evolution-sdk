import type { Effect } from "effect"
import { Context, Data } from "effect"

import type * as Address from "../Address.js"
import type * as Delegation from "../Delegation.js"
import type { EvalRedeemer } from "../EvalRedeemer.js"
import type * as OutRef from "../OutRef.js"
import type * as ProtocolParameters from "../ProtocolParameters.js"
import type * as RewardAddress from "../RewardAddress.js"
import type { UTxO } from "../UTxO.js"

// Base Provider Error
export class ProviderError extends Data.TaggedError("ProviderError")<{
  readonly cause: unknown
  readonly message: string
}> {}

// Effect oriented

// Provider Service Interface (Context.Tag)
export interface ProviderService {
  readonly getProtocolParameters: Effect.Effect<ProtocolParameters.ProtocolParameters, ProviderError>
  readonly getUtxos: (address: Address.Address) => Effect.Effect<Array<UTxO>, ProviderError>
  readonly getUtxosWithUnit: (
    addressOrCredential: Address.Address | { hash: string },
    unit: string
  ) => Effect.Effect<Array<UTxO>, ProviderError>
  readonly getUtxoByUnit: (unit: string) => Effect.Effect<UTxO, ProviderError>
  readonly getUtxosByOutRef: (outRefs: ReadonlyArray<OutRef.OutRef>) => Effect.Effect<Array<UTxO>, ProviderError>
  readonly getDelegation: (rewardAddress: RewardAddress.RewardAddress) => Effect.Effect<Delegation.Delegation, ProviderError>
  readonly getDatum: (datumHash: string) => Effect.Effect<string, ProviderError>
  readonly awaitTx: (txHash: string, checkInterval?: number) => Effect.Effect<boolean, ProviderError>
  readonly submitTx: (tx: string) => Effect.Effect<string, ProviderError>
  readonly evaluateTx: (tx: string, additionalUTxOs?: Array<UTxO>) => Effect.Effect<Array<EvalRedeemer>, ProviderError>
}

// Context.Tag for dependency injection
export const ProviderService: Context.Tag<ProviderService, ProviderService> =
  Context.GenericTag<ProviderService>("@evolution/ProviderService")

// Non effect oriented, same as the old lucid

// Provider Interface (for Promise-based implementations)

export interface Provider {
  getProtocolParameters(): Promise<ProtocolParameters.ProtocolParameters>
  getUtxos(addressOrCredential: Address.Address | { hash: string }): Promise<Array<UTxO>>
  getUtxosWithUnit(addressOrCredential: Address.Address | { hash: string }, unit: string): Promise<Array<UTxO>>
  getUtxoByUnit(unit: string): Promise<UTxO>
  getUtxosByOutRef(outRefs: ReadonlyArray<OutRef.OutRef>): Promise<Array<UTxO>>
  getDelegation(rewardAddress: RewardAddress.RewardAddress): Promise<Delegation.Delegation>
  getDatum(datumHash: string): Promise<string>
  awaitTx(txHash: string, checkInterval?: number): Promise<boolean>
  submitTx(cbor: string): Promise<string>
  evaluateTx(tx: string, additionalUTxOs?: Array<UTxO>): Promise<Array<EvalRedeemer>>
}