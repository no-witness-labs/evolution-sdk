import { mnemonicToEntropy } from "@scure/bip39"
import { wordlist as English } from "@scure/bip39/wordlists/english"

import * as AddressEras from "../../core/AddressEras.js"
import * as BaseAddress from "../../core/BaseAddress.js"
import * as Bip32PrivateKey from "../../core/Bip32PrivateKey.js"
import * as EnterpriseAddress from "../../core/EnterpriseAddress.js"
import * as KeyHash from "../../core/KeyHash.js"
import * as PrivateKey from "../../core/PrivateKey.js"
import * as RewardAccount from "../../core/RewardAccount.js"
import type * as SdkAddress from "../Address.js"
import type * as SdkRewardAddress from "../RewardAddress.js"

/**
 * Result of deriving keys and addresses from a seed or Bip32 root
 * - address: bech32 payment address (addr... / addr_test...)
 * - rewardAddress: bech32 reward address (stake... / stake_test...)
 * - paymentKey / stakeKey: ed25519e_sk bech32 private keys
 */
export type SeedDerivationResult = {
  address: SdkAddress.Address
  rewardAddress: SdkRewardAddress.RewardAddress | undefined
  paymentKey: string
  stakeKey: string | undefined
}

export function walletFromSeed(
  seed: string,
  options: {
    password?: string
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    network?: "Mainnet" | "Testnet" | "Custom"
  } = {}
): SeedDerivationResult {
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
      ? AddressEras.toBech32(
          new BaseAddress.BaseAddress({
            networkId,
            paymentCredential: paymentKeyHash,
            stakeCredential: stakeKeyHash
          })
        )
      : AddressEras.toBech32(
          new EnterpriseAddress.EnterpriseAddress({
            networkId,
            paymentCredential: paymentKeyHash
          })
        )

  const rewardAddress =
    addressType === "Base"
      ? AddressEras.toBech32(
          new RewardAccount.RewardAccount({
            networkId,
            stakeCredential: stakeKeyHash
          })
        )
      : undefined

  return {
    address,
    rewardAddress,
    paymentKey: PrivateKey.toBech32(paymentKey),
    stakeKey: addressType === "Base" ? PrivateKey.toBech32(stakeKey) : undefined
  }
}

/**
 * Derive only the bech32 private keys (ed25519e_sk...) from a seed.
 */
export function keysFromSeed(
  seed: string,
  options: {
    password?: string
    accountIndex?: number
  } = {}
): { paymentKey: string; stakeKey: string } {
  const { accountIndex = 0 } = options
  const entropy = mnemonicToEntropy(seed, English)
  const rootXPrv = Bip32PrivateKey.fromBip39Entropy(entropy, options?.password ?? "")
  const paymentNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.paymentIndices(accountIndex, 0))
  const stakeNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.stakeIndices(accountIndex, 0))
  const paymentKey = Bip32PrivateKey.toPrivateKey(paymentNode)
  const stakeKey = Bip32PrivateKey.toPrivateKey(stakeNode)
  return { paymentKey: PrivateKey.toBech32(paymentKey), stakeKey: PrivateKey.toBech32(stakeKey) }
}

/**
 * Derive only addresses (payment and optional reward) from a seed.
 */
export function addressFromSeed(
  seed: string,
  options: {
    password?: string
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    network?: "Mainnet" | "Testnet" | "Custom"
  } = {}
): { address: SdkAddress.Address; rewardAddress: SdkRewardAddress.RewardAddress | undefined } {
  const { accountIndex = 0, addressType = "Base", network = "Mainnet" } = options
  const entropy = mnemonicToEntropy(seed, English)
  const rootXPrv = Bip32PrivateKey.fromBip39Entropy(entropy, options?.password ?? "")
  const paymentNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.paymentIndices(accountIndex, 0))
  const stakeNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.stakeIndices(accountIndex, 0))
  const paymentKey = Bip32PrivateKey.toPrivateKey(paymentNode)
  const stakeKey = Bip32PrivateKey.toPrivateKey(stakeNode)

  const paymentKeyHash = KeyHash.fromPrivateKey(paymentKey)
  const stakeKeyHash = KeyHash.fromPrivateKey(stakeKey)
  const networkId = network === "Mainnet" ? 1 : 0

  const address =
    addressType === "Base"
      ? AddressEras.toBech32(
          new BaseAddress.BaseAddress({
            networkId,
            paymentCredential: paymentKeyHash,
            stakeCredential: stakeKeyHash
          })
        )
      : AddressEras.toBech32(
          new EnterpriseAddress.EnterpriseAddress({
            networkId,
            paymentCredential: paymentKeyHash
          })
        )

  const rewardAddress =
    addressType === "Base"
      ? AddressEras.toBech32(
          new RewardAccount.RewardAccount({
            networkId,
            stakeCredential: stakeKeyHash
          })
        )
      : undefined

  return { address, rewardAddress }
}

/**
 * Same as walletFromSeed but accepts a Bip32 root key directly.
 */
export function walletFromBip32(
  rootXPrv: Bip32PrivateKey.Bip32PrivateKey,
  options: {
    addressType?: "Base" | "Enterprise"
    accountIndex?: number
    network?: "Mainnet" | "Testnet" | "Custom"
  } = {}
): SeedDerivationResult {
  const { accountIndex = 0, addressType = "Base", network = "Mainnet" } = options
  const paymentNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.paymentIndices(accountIndex, 0))
  const stakeNode = Bip32PrivateKey.derive(rootXPrv, Bip32PrivateKey.CardanoPath.stakeIndices(accountIndex, 0))
  const paymentKey = Bip32PrivateKey.toPrivateKey(paymentNode)
  const stakeKey = Bip32PrivateKey.toPrivateKey(stakeNode)

  const paymentKeyHash = KeyHash.fromPrivateKey(paymentKey)
  const stakeKeyHash = KeyHash.fromPrivateKey(stakeKey)
  const networkId = network === "Mainnet" ? 1 : 0

  const address =
    addressType === "Base"
      ? AddressEras.toBech32(
          new BaseAddress.BaseAddress({
            networkId,
            paymentCredential: paymentKeyHash,
            stakeCredential: stakeKeyHash
          })
        )
      : AddressEras.toBech32(
          new EnterpriseAddress.EnterpriseAddress({
            networkId,
            paymentCredential: paymentKeyHash
          })
        )

  const rewardAddress =
    addressType === "Base"
      ? AddressEras.toBech32(
          new RewardAccount.RewardAccount({
            networkId,
            stakeCredential: stakeKeyHash
          })
        )
      : undefined

  return {
    address,
    rewardAddress,
    paymentKey: PrivateKey.toBech32(paymentKey),
    stakeKey: addressType === "Base" ? PrivateKey.toBech32(stakeKey) : undefined
  }
}

/**
 * Build an address (enterprise by default) from an already-derived payment private key.
 * Optionally provide a stake private key to get a base address + reward address.
 */
export function walletFromPrivateKey(
  paymentKeyBech32: string,
  options: {
    stakeKeyBech32?: string
    addressType?: "Base" | "Enterprise"
    network?: "Mainnet" | "Testnet" | "Custom"
  } = {}
): SeedDerivationResult {
  const { stakeKeyBech32, addressType = stakeKeyBech32 ? "Base" : "Enterprise", network = "Mainnet" } = options
  const paymentKey = PrivateKey.fromBech32(paymentKeyBech32)
  const paymentKeyHash = KeyHash.fromPrivateKey(paymentKey)

  const networkId = network === "Mainnet" ? 1 : 0
  const address =
    addressType === "Base"
      ? (() => {
          if (!stakeKeyBech32) throw new Error("stakeKeyBech32 required for Base address")
          const stakeKey = PrivateKey.fromBech32(stakeKeyBech32)
          const stakeKeyHash = KeyHash.fromPrivateKey(stakeKey)
          return AddressEras.toBech32(
            new BaseAddress.BaseAddress({ networkId, paymentCredential: paymentKeyHash, stakeCredential: stakeKeyHash })
          )
        })()
      : AddressEras.toBech32(
          new EnterpriseAddress.EnterpriseAddress({ networkId, paymentCredential: paymentKeyHash })
        )

  const rewardAddress =
    addressType === "Base" && stakeKeyBech32
      ? (() => {
          const stakeKey = PrivateKey.fromBech32(stakeKeyBech32)
          const stakeKeyHash = KeyHash.fromPrivateKey(stakeKey)
          return AddressEras.toBech32(
            new RewardAccount.RewardAccount({ networkId, stakeCredential: stakeKeyHash })
          )
        })()
      : undefined

  return {
    address,
    rewardAddress,
    paymentKey: paymentKeyBech32,
    stakeKey: stakeKeyBech32
  }
}
