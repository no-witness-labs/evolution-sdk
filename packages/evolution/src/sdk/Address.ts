import * as CoreAddressStructure from "../core/AddressStructure.js"
import * as Credential from "./Credential.js"

// bech32
export type Address = string

export const toCoreAddress = (address: Address): CoreAddressStructure.AddressStructure =>
  CoreAddressStructure.fromBech32(address)

export const fromCoreAddress = (address: CoreAddressStructure.AddressStructure): Address =>
  CoreAddressStructure.toBech32(address)

export const withCredentials = ({
  network,
  paymentCredential,
  stakingCredential
}: {
  network: "Mainnet" | "Testnet"
  paymentCredential: Credential.Credential
  stakingCredential?: Credential.Credential
}) => {
  const coreAddress = new CoreAddressStructure.AddressStructure({
    networkId: network === "Mainnet" ? 1 : 0, // Fix: 1 for Mainnet, 0 for Testnet
    paymentCredential: Credential.toCoreCredential(paymentCredential),
    stakingCredential: stakingCredential ? Credential.toCoreCredential(stakingCredential) : undefined
  })
  return CoreAddressStructure.toBech32(coreAddress)
}

/**
 * Create an enterprise address (payment only) from a payment credential.
 * An enterprise address has only a payment credential and no staking credential.
 *
 * @example
 * ```typescript
 * const credential = { type: "Key", hash: "abcd1234..." }
 * const address = fromPaymentCredential(credential, "Mainnet")
 * // Returns: "addr1w9rlm65wjfkctdlyxl5cw87h9...
 * ```
 */
export const fromPaymentCredential = (
  paymentCredential: Credential.Credential,
  network: Credential.Network = "Mainnet"
): Address => {
  const coreAddress = new CoreAddressStructure.AddressStructure({
    networkId: network === "Mainnet" ? 1 : 0,
    paymentCredential: Credential.toCoreCredential(paymentCredential),
    // No staking credential for enterprise addresses
    stakingCredential: undefined
  })
  return CoreAddressStructure.toBech32(coreAddress)
}
