import { mnemonicToEntropy } from "@scure/bip39"
import { wordlist as English } from "@scure/bip39/wordlists/english"

import * as Address from "../AddressEras.js"
import * as BaseAddress from "../BaseAddress.js"
import * as Bip32PrivateKey from "../Bip32PrivateKey.js"
import * as EnterpriseAddress from "../EnterpriseAddress.js"
import * as KeyHash from "../KeyHash.js"
import * as NetworkId from "../NetworkId.js"
import * as PrivateKey from "../PrivateKey.js"
import * as RewardAccount from "../RewardAccount.js"

export type FromSeed = {
  address: string
  rewardAddress: string | null
  paymentKey: string
  stakeKey: string | null
}

export function walletFromSeed(
  seed: string,
  options: {
    password?: string
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    network?: "Mainnet" | "Testnet" | "Custom"
  } = {}
): FromSeed {
  //Set default options
  const { accountIndex = 0, addressType = "Base", network = "Mainnet" } = options

  // Derive extended root from BIP39 entropy using our ed25519-bip32 (V2) implementation
  const entropy = mnemonicToEntropy(seed, English)
  const rootXPrv = Bip32PrivateKey.fromBip39Entropy(entropy, options?.password ?? "")

  // Derive child keys using CIP-1852 indices
  const paymentIndices = Bip32PrivateKey.CardanoPath.paymentIndices(accountIndex, 0)
  const stakeIndices = Bip32PrivateKey.CardanoPath.stakeIndices(accountIndex, 0)
  const paymentNode = Bip32PrivateKey.derive(rootXPrv, paymentIndices)
  const stakeNode = Bip32PrivateKey.derive(rootXPrv, stakeIndices)

  // Convert to standard PrivateKey (64 bytes: scalar+iv)
  const paymentKey = Bip32PrivateKey.toPrivateKey(paymentNode)
  const stakeKey = Bip32PrivateKey.toPrivateKey(stakeNode)

  const paymentKeyHash = KeyHash.fromPrivateKey(paymentKey)
  const stakeKeyHash = KeyHash.fromPrivateKey(stakeKey)

  const networkId = network === "Mainnet" ? 1 : 0

  const address =
    addressType === "Base"
      ? Address.toBech32(
          new BaseAddress.BaseAddress({
            networkId: NetworkId.make(networkId),
            paymentCredential: paymentKeyHash,
            stakeCredential: stakeKeyHash
          })
        )
      : Address.toBech32(
          new EnterpriseAddress.EnterpriseAddress({
            networkId: NetworkId.make(networkId),
            paymentCredential: paymentKeyHash
          })
        )

  const rewardAddress =
    addressType === "Base"
      ? Address.toBech32(
          new RewardAccount.RewardAccount({
            networkId,
            stakeCredential: stakeKeyHash
          })
        )
      : null

  return {
    address,
    rewardAddress,
    paymentKey: PrivateKey.toBech32(paymentKey),
    stakeKey: addressType === "Base" ? PrivateKey.toBech32(stakeKey) : null
  }
}
