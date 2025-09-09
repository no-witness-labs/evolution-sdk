import { Function, Schema } from "effect"

import * as CoreRewardAccount from "../core/RewardAccount.js"

/**
 * Reward address in bech32 format.
 * Mainnet addresses start with "stake1"
 * Testnet addresses start with "stake_test1"
 */
export type RewardAddress = string

export const toRewardAccount = Schema.decodeSync(CoreRewardAccount.FromBech32)
export const fromRewardAccount = Schema.encodeSync(CoreRewardAccount.FromBech32)

export const fromJsonToRewardAccount = Schema.decodeSync(CoreRewardAccount.RewardAccount)
export const fromRewardAccountToJson = Schema.encodeSync(CoreRewardAccount.RewardAccount)

export const rewardAddressToJson = Function.flow(toRewardAccount, fromRewardAccountToJson)
export const jsonToRewardAddress = Function.flow(fromJsonToRewardAccount, fromRewardAccount)
