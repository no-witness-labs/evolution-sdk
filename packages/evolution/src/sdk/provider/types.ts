// Lightweight provider-facing types compatible with lucid-evolution

export type TxHash = string
export type Address = string
export type RewardAddress = string
export type Unit = string // policyId + assetName (hex)

export type Assets = { readonly lovelace: bigint } & Record<string, bigint>

export type OutRef = {
  readonly txHash: TxHash
  readonly outputIndex: number
}

export type ScriptRef =
  | { readonly type: "Native"; readonly script: string }
  | { readonly type: "PlutusV1" | "PlutusV2" | "PlutusV3"; readonly script: string }

export type UTxO = {
  readonly txHash: TxHash
  readonly outputIndex: number
  readonly address: Address
  readonly assets: Assets
  readonly datumHash?: string
  readonly datum?: string
  readonly scriptRef?: ScriptRef
}

export type Delegation = {
  readonly poolId: string | undefined
  readonly rewards: bigint
}

export type EvalRedeemer = {
  readonly ex_units: { readonly mem: number; readonly steps: number }
  readonly redeemer_index: number
  readonly redeemer_tag: "spend" | "mint" | "publish" | "withdraw" | "vote" | "propose"
}

export type ProtocolParameters = {
  readonly minFeeA: number
  readonly minFeeB: number
  readonly maxTxSize: number
  readonly maxValSize: number
  readonly keyDeposit: bigint
  readonly poolDeposit: bigint
  readonly drepDeposit: bigint
  readonly govActionDeposit: bigint
  readonly priceMem: number
  readonly priceStep: number
  readonly maxTxExMem: bigint
  readonly maxTxExSteps: bigint
  readonly coinsPerUtxoByte: bigint
  readonly collateralPercentage: number
  readonly maxCollateralInputs: number
  readonly minFeeRefScriptCostPerByte: number
  readonly costModels: {
    readonly PlutusV1: Record<string, number>
    readonly PlutusV2: Record<string, number>
    readonly PlutusV3: Record<string, number>
  }
}

export interface Provider {
  getProtocolParameters(): Promise<ProtocolParameters>
  getUtxos(addressOrCredential: Address | { hash: string }): Promise<Array<UTxO>>
  getUtxosWithUnit(addressOrCredential: Address | { hash: string }, unit: Unit): Promise<Array<UTxO>>
  getUtxoByUnit(unit: Unit): Promise<UTxO>
  getUtxosByOutRef(outRefs: ReadonlyArray<OutRef>): Promise<Array<UTxO>>
  getDelegation(rewardAddress: RewardAddress): Promise<Delegation>
  getDatum(datumHash: string): Promise<string>
  awaitTx(txHash: TxHash, checkInterval?: number): Promise<boolean>
  submitTx(cbor: string): Promise<TxHash>
  evaluateTx(tx: string, additionalUTxOs?: Array<UTxO>): Promise<Array<EvalRedeemer>>
}

// Helpers
export const fromUnit = (unit: string): { policyId: string; assetName: string | undefined } => {
  if (!unit || unit === "lovelace") return { policyId: "", assetName: undefined }
  const policyId = unit.slice(0, 56)
  const assetName = unit.slice(56)
  return { policyId, assetName: assetName.length > 0 ? assetName : undefined }
}
