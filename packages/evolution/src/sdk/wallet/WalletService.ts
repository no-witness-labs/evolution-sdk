import { mnemonicToEntropy } from "@scure/bip39"
import { wordlist as English } from "@scure/bip39/wordlists/english"
import { Context, Data, Effect, Layer } from "effect"

import * as AddressEras from "../../core/AddressEras.js"
import * as BaseAddress from "../../core/BaseAddress.js"
import * as Bip32PrivateKey from "../../core/Bip32PrivateKey.js"
import * as Ed25519Signature from "../../core/Ed25519Signature.js"
import * as EnterpriseAddress from "../../core/EnterpriseAddress.js"
import * as KeyHash from "../../core/KeyHash.js"
import * as PrivateKey from "../../core/PrivateKey.js"
import * as CoreRewardAccount from "../../core/RewardAccount.js"
import * as Transaction from "../../core/Transaction.js"
import * as TransactionHash from "../../core/TransactionHash.js"
import * as TransactionWitnessSet from "../../core/TransactionWitnessSet.js"
import * as VKey from "../../core/VKey.js"
import { hashTransaction } from "../../utils/Hash.js"
import type * as Address from "../Address.js"
import * as Delegation from "../Delegation.js"
import * as Provider from "../provider/Provider.js"
import * as RewardAddress from "../RewardAddress.js"
import type * as UTxO from "../UTxO.js"

// Reuse types used by current Promise-based Wallet
export type Payload = string | Uint8Array
export type SignedMessage = { signature: string; key: string }

export class WalletError extends Data.TaggedError("WalletError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export interface WalletService {
  readonly address: Effect.Effect<Address.Address, WalletError>
  readonly rewardAddress: Effect.Effect<RewardAddress.RewardAddress | null, WalletError>

  // UTxO helpers require a Provider in the environment
  readonly getUtxos: Effect.Effect<ReadonlyArray<UTxO.UTxO>, WalletError>
  readonly getDelegation: Effect.Effect<Delegation.Delegation, WalletError>

  readonly signTx: (tx: Transaction.Transaction) => Effect.Effect<TransactionWitnessSet.TransactionWitnessSet, WalletError>
  readonly signMessage: (
    address: Address.Address | RewardAddress.RewardAddress,
    payload: Payload
  ) => Effect.Effect<SignedMessage, WalletError>

  readonly submitTx: (tx: Transaction.Transaction | string) => Effect.Effect<string, WalletError>

  // Override local UTxO snapshot for signing decisions (pure in-memory)
  readonly overrideUTxOs: (utxos: ReadonlyArray<UTxO.UTxO>) => Effect.Effect<void, never>
}

export const WalletService: Context.Tag<WalletService, WalletService> =
  Context.GenericTag<WalletService>("@evolution/WalletService")

// -- internal: compute required key hashes for signing (copy of logic from Wallet.ts)
function computeRequiredKeyHashesSync(params: {
  paymentKhHex?: string
  rewardAddress?: RewardAddress.RewardAddress | null
  stakeKhHex?: string
  tx: Transaction.Transaction
  utxos: ReadonlyArray<UTxO.UTxO>
}): Set<string> {
  const required = new Set<string>()
  if (params.tx.body.requiredSigners) {
    for (const kh of params.tx.body.requiredSigners) required.add(KeyHash.toHex(kh))
  }
  const ownedRefs = new Set<string>(params.utxos.map((u) => `${u.txHash}#${u.outputIndex}`))
  const checkInputs = (inputs?: ReadonlyArray<Transaction.Transaction["body"]["inputs"][number]>) => {
    if (!inputs || !params.paymentKhHex) return
    for (const input of inputs) {
      const txIdHex = TransactionHash.toHex(input.transactionId)
      const key = `${txIdHex}#${Number(input.index)}`
      if (ownedRefs.has(key)) required.add(params.paymentKhHex)
    }
  }
  checkInputs(params.tx.body.inputs)
  if (params.tx.body.collateralInputs) checkInputs(params.tx.body.collateralInputs)
  if (params.tx.body.withdrawals && params.rewardAddress && params.stakeKhHex) {
    const ourReward = RewardAddress.toRewardAccount(params.rewardAddress)
    for (const [rewardAcc] of params.tx.body.withdrawals.withdrawals.entries()) {
      if (CoreRewardAccount.equals(ourReward, rewardAcc)) {
        required.add(params.stakeKhHex)
        break
      }
    }
  }
  if (params.tx.body.certificates && params.stakeKhHex) {
    for (const cert of params.tx.body.certificates) {
      const cred =
        cert._tag === "StakeRegistration" || cert._tag === "StakeDeregistration" || cert._tag === "StakeDelegation"
          ? cert.stakeCredential
          : cert._tag === "RegCert" || cert._tag === "UnregCert"
            ? cert.stakeCredential
            : cert._tag === "StakeVoteDelegCert" || cert._tag === "StakeRegDelegCert" || cert._tag === "StakeVoteRegDelegCert"
              ? cert.stakeCredential
              : undefined
      if (cred && cred._tag === "KeyHash") {
        const khHex = KeyHash.toHex(cred)
        if (khHex === params.stakeKhHex) required.add(params.stakeKhHex)
      }
    }
  }
  return required
}

// Factory: Seed-based wallet service. Requires a Provider for queries.
export const makeSeedWalletLayer = (
  network: "Mainnet" | "Testnet" | "Custom",
  seed: string,
  options?: {
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    password?: string
  }
) => {
  const addressType = options?.addressType ?? "Base"
  const accountIndex = options?.accountIndex ?? 0
  const entropy = mnemonicToEntropy(seed, English)
  const rootXPrv = Bip32PrivateKey.fromBip39Entropy(entropy, options?.password ?? "")
  const paymentNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.paymentIndices(accountIndex, 0))
  const stakeNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.stakeIndices(accountIndex, 0))
  const paymentSk = Bip32PrivateKey.toPrivateKey(paymentNode)
  const stakeSk = Bip32PrivateKey.toPrivateKey(stakeNode)
  const paymentKh = KeyHash.fromPrivateKey(paymentSk)
  const stakeKh = KeyHash.fromPrivateKey(stakeSk)
  const paymentKhHex = KeyHash.toHex(paymentKh)
  const stakeKhHex = KeyHash.toHex(stakeKh)
  const networkId = network === "Mainnet" ? 1 : 0

  const baseAddress = AddressEras.toBech32(
    new BaseAddress.BaseAddress({ networkId, paymentCredential: paymentKh, stakeCredential: stakeKh })
  ) as Address.Address
  const enterpriseAddress = AddressEras.toBech32(
    new EnterpriseAddress.EnterpriseAddress({ networkId, paymentCredential: paymentKh })
  ) as Address.Address
  const reward = AddressEras.toBech32(
    new CoreRewardAccount.RewardAccount({ networkId, stakeCredential: stakeKh })
  ) as RewardAddress.RewardAddress

  const address = addressType === "Base" ? baseAddress : enterpriseAddress
  const rewardAddress = addressType === "Base" ? reward : null

  const keyStore = new Map<string, PrivateKey.PrivateKey>([
    [paymentKhHex, paymentSk],
    [stakeKhHex, stakeSk]
  ])

  // local mutable snapshot for utxos override (in-memory only)
  const cfg = { overriddenUTxOs: [] as Array<UTxO.UTxO> }

  return Layer.effect(
    WalletService,
    Effect.map(Provider.ProviderService, (provider) => {
      const service: WalletService = {
        address: Effect.succeed(address),
        rewardAddress: Effect.succeed(rewardAddress),
        overrideUTxOs: (utxos) => Effect.sync(() => {
          cfg.overriddenUTxOs = [...utxos]
        }),
        getUtxos:
          cfg.overriddenUTxOs.length > 0
            ? Effect.succeed(cfg.overriddenUTxOs as ReadonlyArray<UTxO.UTxO>)
            : provider.getUtxos(address).pipe(
                Effect.mapError((cause) => new WalletError({ message: "Failed to get UTxOs", cause }))
              ),
        getDelegation:
          rewardAddress
            ? provider
                .getDelegation(rewardAddress)
                .pipe(Effect.mapError((cause) => new WalletError({ message: "Failed to get delegation", cause })))
            : Effect.succeed(Delegation.empty()),
        signTx: (tx) =>
          Effect.gen(function* () {
            const utxos =
              cfg.overriddenUTxOs.length > 0
                ? cfg.overriddenUTxOs
                : yield* provider
                    .getUtxos(address)
                    .pipe(Effect.mapError((cause) => new WalletError({ message: "Failed to get UTxOs", cause })))
            const required = computeRequiredKeyHashesSync({
              paymentKhHex,
              rewardAddress,
              stakeKhHex,
              tx,
              utxos
            })
            const txHash = hashTransaction(tx.body).hash
            const witnesses: Array<TransactionWitnessSet.VKeyWitness> = []
            const seen = new Set<string>()
            for (const khHex of required) {
              const sk = keyStore.get(khHex)
              if (!sk) continue
              const sig = PrivateKey.sign(sk, txHash)
              const vk = VKey.fromPrivateKey(sk)
              const vkHex = VKey.toHex(vk)
              if (seen.has(vkHex)) continue
              seen.add(vkHex)
              witnesses.push(new TransactionWitnessSet.VKeyWitness({ vkey: vk, signature: sig }))
            }
            return witnesses.length > 0
              ? TransactionWitnessSet.fromVKeyWitnesses(witnesses)
              : TransactionWitnessSet.empty()
          }),
        signMessage: (addr, payload) =>
          Effect.try({
            try: () => {
              const useStake = typeof addr === "string" && (addr.startsWith("stake1") || addr.startsWith("stake_test1"))
              const sk = useStake ? stakeSk : paymentSk
              const vk = VKey.fromPrivateKey(sk)
              const bytes = typeof payload === "string" ? new TextEncoder().encode(payload) : payload
              const sig = PrivateKey.sign(sk, bytes)
              return { signature: Ed25519Signature.toHex(sig), key: VKey.toHex(vk) }
            },
            catch: (cause) => new WalletError({ message: "Failed to sign message", cause })
          }),
        submitTx: (tx) =>
          (typeof tx === "string" ? provider.submitTx(tx) : provider.submitTx(Transaction.toCBORHex(tx))).pipe(
            Effect.mapError((cause) => new WalletError({ message: "Failed to submit transaction", cause }))
          )
      }

      return service
    })
  )
}
