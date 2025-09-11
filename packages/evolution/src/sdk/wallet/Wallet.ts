// Parent imports (../../)
import * as CoreAddressStructure from "../../core/AddressStructure.js"
import * as Ed25519Signature from "../../core/Ed25519Signature.js"
import * as KeyHash from "../../core/KeyHash.js"
import * as PrivateKey from "../../core/PrivateKey.js"
import * as CoreRewardAccount from "../../core/RewardAccount.js"
import * as Transaction from "../../core/Transaction.js"
import * as TransactionHash from "../../core/TransactionHash.js"
import * as TransactionWitnessSet from "../../core/TransactionWitnessSet.js"
import * as VKey from "../../core/VKey.js"
import { hashTransaction } from "../../utils/Hash.js"
import * as Address from "../Address.js"
import * as Delegation from "../Delegation.js"
import type * as Provider from "../provider/Provider.js"
import * as RewardAddress from "../RewardAddress.js"
import type * as UTxO from "../UTxO.js"
import { walletFromSeed } from "./Derivation.js"

// --- Minimal local types to unblock scaffolding ---

// Payload for message signing (subject to refinement / CIP-8 alignment)
export type Payload = string | Uint8Array

// Signed message result: hex-encoded signature and public key (vkey) hex
export type SignedMessage = { signature: string; key: string }

// Minimal CIP-30 Wallet API surface used by this module (optional factory)
export interface WalletApi {
  getUsedAddresses(): Promise<ReadonlyArray<string>>
  getUnusedAddresses(): Promise<ReadonlyArray<string>>
  getRewardAddresses(): Promise<ReadonlyArray<string>>
  getUtxos(): Promise<ReadonlyArray<string>> // CBOR hex
  signTx(txCborHex: string, partialSign: boolean): Promise<string> // CBOR hex witness set
  signData(addressHex: string, payload: Payload): Promise<SignedMessage>
  submitTx(txCborHex: string): Promise<string>
}

// Public Wallet facade aligned to Promise-based Provider
export interface Wallet {
  // UTxO override controls
  overrideUTxOs(utxos: ReadonlyArray<UTxO.UTxO>): void

  // Addresses
  address(): Promise<Address.Address>
  rewardAddress(): Promise<RewardAddress.RewardAddress | null>

  // Chain queries via Provider
  getUtxos(): Promise<ReadonlyArray<UTxO.UTxO>>
  getUtxosCore?(): Promise<unknown> // optional future: core representation helper
  getDelegation(): Promise<Delegation.Delegation>

  // Signing
  signTx(tx: Transaction.Transaction): Promise<TransactionWitnessSet.TransactionWitnessSet>
  signMessage(address: Address.Address | RewardAddress.RewardAddress, payload: Payload): Promise<SignedMessage>

  // Submission
  submitTx(tx: Transaction.Transaction | string): Promise<string>
}

// --- Factories ---

export type Network = "Mainnet" | "Testnet" | "Custom"

// Internal: pure helper to determine which key hashes (hex) are required to sign a transaction
function computeRequiredKeyHashesSync(params: {
  paymentKhHex?: string
  rewardAddress?: RewardAddress.RewardAddress | null
  stakeKhHex?: string
  tx: Transaction.Transaction
  utxos: ReadonlyArray<UTxO.UTxO>
}): Set<string> {
  const required = new Set<string>()

  // 1) Explicit required signers
  if (params.tx.body.requiredSigners) {
    for (const kh of params.tx.body.requiredSigners) required.add(KeyHash.toHex(kh))
  }

  // Build owned refs from provided UTxOs
  const ownedRefs = new Set<string>(params.utxos.map((u) => `${u.txHash}#${u.outputIndex}`))

  // 2) Inputs owned by us imply payment key signature
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

  // 3) Withdrawals made by our reward account imply stake key signature
  if (params.tx.body.withdrawals && params.rewardAddress && params.stakeKhHex) {
    const ourReward = RewardAddress.toRewardAccount(params.rewardAddress)
    for (const [rewardAcc] of params.tx.body.withdrawals.withdrawals.entries()) {
      if (CoreRewardAccount.equals(ourReward, rewardAcc)) {
        required.add(params.stakeKhHex)
        break
      }
    }
  }

  // 4) Certificates that reference our stake credential imply stake key signature
  if (params.tx.body.certificates && params.stakeKhHex) {
    for (const cert of params.tx.body.certificates) {
      const cred =
        cert._tag === "StakeRegistration" || cert._tag === "StakeDeregistration" || cert._tag === "StakeDelegation"
          ? cert.stakeCredential
          : cert._tag === "RegCert" || cert._tag === "UnregCert"
            ? cert.stakeCredential
            : cert._tag === "StakeVoteDelegCert" ||
                cert._tag === "StakeRegDelegCert" ||
                cert._tag === "StakeVoteRegDelegCert"
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

export function makeWalletFromSeed(
  provider: Provider.Provider,
  network: Network,
  seed: string,
  options?: {
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    password?: string
  }
): Wallet {
  const config = { overriddenUTxOs: [] as Array<UTxO.UTxO> }

  const { address, paymentKey, rewardAddress, stakeKey } = walletFromSeed(seed, {
    addressType: options?.addressType ?? "Base",
    accountIndex: options?.accountIndex ?? 0,
    password: options?.password,
    network
  })

  // Minimal keystore: map KeyHash hex -> PrivateKey
  type KeyStore = Map<string, PrivateKey.PrivateKey>
  const keyStore: KeyStore = new Map()
  const paymentSk = PrivateKey.fromBech32(paymentKey)
  const paymentKh = KeyHash.fromPrivateKey(paymentSk)
  const paymentKhHex = KeyHash.toHex(paymentKh)
  keyStore.set(paymentKhHex, paymentSk)
  let stakeSk: PrivateKey.PrivateKey | undefined
  let stakeKhHex: string | undefined
  if (stakeKey) {
    stakeSk = PrivateKey.fromBech32(stakeKey)
    const stakeKh = KeyHash.fromPrivateKey(stakeSk)
    stakeKhHex = KeyHash.toHex(stakeKh)
    keyStore.set(stakeKhHex, stakeSk)
  }

  return {
    overrideUTxOs: (utxos: ReadonlyArray<UTxO.UTxO>) => {
      config.overriddenUTxOs = [...utxos]
    },
    address: async () => address,
    rewardAddress: async () => rewardAddress ?? null,
    getUtxos: async () => (config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : provider.getUtxos(address)),
    getDelegation: async () => (rewardAddress ? provider.getDelegation(rewardAddress) : Delegation.empty()),
    signTx: async (tx: Transaction.Transaction) => {
      // Build ownedRefs from overrides or fetch current UTxOs
      const utxos: Array<UTxO.UTxO> =
        config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : await provider.getUtxos(address)
      // Determine required key hashes via pure helper
      const required = computeRequiredKeyHashesSync({
        paymentKhHex,
        rewardAddress: rewardAddress ?? null,
        stakeKhHex,
        tx,
        utxos
      })

      // Build witnesses for keys we have
      const txHash = hashTransaction(tx.body)
      const msg = txHash.hash

      const witnesses: Array<TransactionWitnessSet.VKeyWitness> = []
      const seenVKeys = new Set<string>()
      for (const khHex of required) {
        const sk = keyStore.get(khHex)
        if (!sk) continue
        const sig = PrivateKey.sign(sk, msg)
        const vk = VKey.fromPrivateKey(sk)
        const vkHex = VKey.toHex(vk)
        if (seenVKeys.has(vkHex)) continue
        seenVKeys.add(vkHex)
        witnesses.push(new TransactionWitnessSet.VKeyWitness({ vkey: vk, signature: sig }))
      }

      return witnesses.length > 0 ? TransactionWitnessSet.fromVKeyWitnesses(witnesses) : TransactionWitnessSet.empty()
    },
    signMessage: async (addr: Address.Address | RewardAddress.RewardAddress, payload: Payload) => {
      const useStake = typeof addr === "string" && (addr.startsWith("stake1") || addr.startsWith("stake_test1"))
      const sk = useStake ? stakeSk : paymentSk
      if (!sk) throw new Error("Requested key not available in keystore")
      const vk = VKey.fromPrivateKey(sk)
      const bytes = typeof payload === "string" ? new TextEncoder().encode(payload) : payload
      const sig = PrivateKey.sign(sk, bytes)
      return { signature: Ed25519Signature.toHex(sig), key: VKey.toHex(vk) }
    },
    submitTx: async (tx: Transaction.Transaction | string) => {
      // Accept either CBOR hex or Transaction instance (encode to CBOR hex once encoder is wired)
      if (typeof tx === "string") return provider.submitTx(tx)
      const cborHex = Transaction.toCBORHex(tx)
      return provider.submitTx(cborHex)
    }
  }
}

export function makeWalletFromPrivateKey(
  provider: Provider.Provider,
  network: Network,
  privateKeyBech32: string
): Wallet {
  // Build an enterprise (payment-only) wallet from a fully-derived private key
  // 1) Load private key and derive key hash
  const paymentSk = PrivateKey.fromBech32(privateKeyBech32)
  const paymentKh = KeyHash.fromPrivateKey(paymentSk)
  const paymentKhHex = KeyHash.toHex(paymentKh)

  // 2) Construct an enterprise address from payment key hash and network id
  // Address is bech32 string via AddressStructure encoder
  const networkId = network === "Mainnet" ? 1 : network === "Testnet" ? 0 : 0
  const addrStruct = CoreAddressStructure.AddressStructure.make({
    networkId,
    paymentCredential: paymentKh,
    stakingCredential: undefined
  })
  const address = Address.fromAddressStructure(addrStruct)

  // 3) Minimal keystore
  type KeyStore = Map<string, PrivateKey.PrivateKey>
  const keyStore: KeyStore = new Map([[paymentKhHex, paymentSk]])

  const config = { overriddenUTxOs: [] as Array<UTxO.UTxO> }

  return {
    overrideUTxOs: (utxos: ReadonlyArray<UTxO.UTxO>) => {
      config.overriddenUTxOs = [...utxos]
    },
    address: async () => address,
    rewardAddress: async () => null,
    getUtxos: async () => (config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : provider.getUtxos(address)),
    getDelegation: async () => Delegation.empty(),
    signTx: async (tx: Transaction.Transaction) => {
      // Build ownedRefs from overrides or fetch current UTxOs
      const utxos: Array<UTxO.UTxO> =
        config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : await provider.getUtxos(address)
      // Determine required key hashes via pure helper (payment only)
      const required = computeRequiredKeyHashesSync({
        paymentKhHex,
        tx,
        utxos
      })

      // Build witnesses from our keystore
      const txHash = hashTransaction(tx.body)
      const msg = txHash.hash
      const witnesses: Array<TransactionWitnessSet.VKeyWitness> = []
      const seenVKeys = new Set<string>()
      for (const khHex of required) {
        const sk = keyStore.get(khHex)
        if (!sk) continue
        const sig = PrivateKey.sign(sk, msg)
        const vk = VKey.fromPrivateKey(sk)
        const vkHex = VKey.toHex(vk)
        if (seenVKeys.has(vkHex)) continue
        seenVKeys.add(vkHex)
        witnesses.push(new TransactionWitnessSet.VKeyWitness({ vkey: vk, signature: sig }))
      }
      return witnesses.length > 0 ? TransactionWitnessSet.fromVKeyWitnesses(witnesses) : TransactionWitnessSet.empty()
    },
    signMessage: async (_addr: Address.Address | RewardAddress.RewardAddress, payload: Payload) => {
      const vk = VKey.fromPrivateKey(paymentSk)
      const bytes = typeof payload === "string" ? new TextEncoder().encode(payload) : payload
      const sig = PrivateKey.sign(paymentSk, bytes)
      return { signature: Ed25519Signature.toHex(sig), key: VKey.toHex(vk) }
    },
    submitTx: async (tx: Transaction.Transaction | string) => {
      if (typeof tx === "string") return provider.submitTx(tx)
      const cborHex = Transaction.toCBORHex(tx)
      return provider.submitTx(cborHex)
    }
  }
}

export function makeWalletFromAPI(provider: Provider.Provider, api: WalletApi): Wallet {
  const config = { overriddenUTxOs: [] as Array<UTxO.UTxO> }
  let cachedAddress: Address.Address | null = null
  let cachedReward: RewardAddress.RewardAddress | null = null

  const getPrimaryAddress = async (): Promise<Address.Address> => {
    if (cachedAddress) return cachedAddress
    const used = await api.getUsedAddresses()
    const unused = await api.getUnusedAddresses()
    const addr = used[0] ?? unused[0]
    if (!addr) throw new Error("Wallet API returned no addresses")
    cachedAddress = addr
    return addr
  }
  const getPrimaryRewardAddress = async (): Promise<RewardAddress.RewardAddress | null> => {
    if (cachedReward !== null) return cachedReward
    const rewards = await api.getRewardAddresses()
    cachedReward = rewards[0] ?? null
    return cachedReward
  }

  return {
    overrideUTxOs: (utxos: ReadonlyArray<UTxO.UTxO>) => {
      config.overriddenUTxOs = [...utxos]
    },
    address: async () => getPrimaryAddress(),
    rewardAddress: async () => getPrimaryRewardAddress(),
    getUtxos: async () => {
      const addr = await getPrimaryAddress()
      return config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : provider.getUtxos(addr)
    },
    getDelegation: async () => {
      const r = await getPrimaryRewardAddress()
      return r ? provider.getDelegation(r) : Delegation.empty()
    },
    signTx: async (tx: Transaction.Transaction) => {
      const cbor = Transaction.toCBORHex(tx)
      const witnessHex = await api.signTx(cbor, true)
      return TransactionWitnessSet.fromCBORHex(witnessHex)
    },
    signMessage: async (addr: Address.Address | RewardAddress.RewardAddress, payload: Payload) => {
      const signed = await api.signData(addr, payload)
      return signed
    },
    submitTx: async (tx: Transaction.Transaction | string) => {
      const cbor = typeof tx === "string" ? tx : Transaction.toCBORHex(tx)
      return api.submitTx(cbor)
    }
  }
}

export function makeWalletFromAddress(
  provider: Provider.Provider,
  _network: Network,
  address: Address.Address,
  utxos: ReadonlyArray<UTxO.UTxO> = []
): Wallet {
  const config = { overriddenUTxOs: [...utxos] }

  // Derive reward address from base address stake credential (if present)
  let rewardAddr: RewardAddress.RewardAddress | null = null
  try {
    const addrStruct = Address.toAddressStructure(address)
    if (addrStruct.stakingCredential) {
      const rewardAccount = CoreRewardAccount.make({
        networkId: addrStruct.networkId,
        stakeCredential: addrStruct.stakingCredential
      })
      rewardAddr = RewardAddress.fromRewardAccount(rewardAccount)
    }
  } catch {
    // If parsing fails, keep rewardAddr as null for read-only wallet
    rewardAddr = null
  }

  return {
    overrideUTxOs: (newUtxos: ReadonlyArray<UTxO.UTxO>) => {
      config.overriddenUTxOs = [...newUtxos]
    },
    address: async () => address,
    rewardAddress: async () => rewardAddr,
    getUtxos: async () => (config.overriddenUTxOs.length > 0 ? config.overriddenUTxOs : provider.getUtxos(address)),
    getDelegation: async () => (rewardAddr ? provider.getDelegation(rewardAddr) : Delegation.empty()),
    signTx: async (_tx: Transaction.Transaction) => {
      throw new Error("Not implemented for read-only wallet")
    },
    signMessage: async (_addr: Address.Address | RewardAddress.RewardAddress, _payload: Payload) => {
      throw new Error("Not implemented for read-only wallet")
    },
    submitTx: async (tx: Transaction.Transaction | string) => {
      if (typeof tx === "string") return provider.submitTx(tx)
      throw new Error("submitTx for Transaction instance not implemented yet")
    }
  }
}
