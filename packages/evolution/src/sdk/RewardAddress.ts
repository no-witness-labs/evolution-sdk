import * as CoreAddressEras from "../core/AddressEras.js"
import * as CoreRewardAccount from "../core/RewardAccount.js"
import * as Credential from "./Credential.js"

/**
 * Reward address in bech32 format.
 * Mainnet addresses start with "stake1"
 * Testnet addresses start with "stake_test1"
 */
export type RewardAddress = string

/**
 * Convert bech32 reward address to core RewardAccount structure
 */
export const toCoreRewardAccount = (address: RewardAddress): CoreRewardAccount.RewardAccount => {
  const addressEras = CoreAddressEras.fromBech32(address)
  if (addressEras._tag !== "RewardAccount") {
    throw new Error(`Invalid reward address: expected RewardAccount, got ${addressEras._tag}`)
  }
  return addressEras
}

/**
 * Convert core RewardAccount structure to bech32 reward address
 */
export const fromCoreRewardAccount = (account: CoreRewardAccount.RewardAccount): RewardAddress =>
  CoreAddressEras.toBech32(account)

/**
 * Create a reward address from a stake credential.
 * A reward address is used for staking rewards and has only a stake credential.
 *
 * @param stakeCredential - The stake credential (key hash or script hash)
 * @param network - Target network (defaults to "Mainnet")
 * @returns Bech32 reward address string
 *
 * @example
 * ```typescript
 * const credential = { type: "Key", hash: "abcd1234..." }
 * const rewardAddr = fromStakeCredential(credential, "Mainnet")
 * // Returns: "stake1u9rlm65wjfkctdlyxl5cw87h9..."
 *
 * const scriptCredential = { type: "Script", hash: "def5678..." }
 * const testnetAddr = fromStakeCredential(scriptCredential, "Testnet")
 * // Returns: "stake_test1ur9rlm65wjfkctdlyxl5cw87h9..."
 * ```
 */
export const fromStakeCredential = (
  stakeCredential: Credential.Credential,
  network: Credential.Network = "Mainnet"
): RewardAddress => {
  const coreRewardAccount = new CoreRewardAccount.RewardAccount({
    networkId: network === "Mainnet" ? 1 : 0,
    stakeCredential: Credential.toCoreCredential(stakeCredential)
  })
  return CoreAddressEras.toBech32(coreRewardAccount)
}
