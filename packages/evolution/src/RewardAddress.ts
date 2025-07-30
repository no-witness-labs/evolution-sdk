import { Schema } from "effect"

/**
 * Reward address format schema (human-readable addresses)
 * Following CIP-0019 encoding requirements
 *
 * @since 2.0.0
 * @category schemas
 */
export const RewardAddress = Schema.String.pipe(Schema.pattern(/^(stake|stake_test)[1][a-z0-9]+$/i)).pipe(
  Schema.brand("RewardAddress")
)

/**
 * Type representing a reward/stake address string in bech32 format
 *
 * @since 2.0.0
 * @category model
 */
export type RewardAddress = Schema.Schema.Type<typeof RewardAddress>

/**
 * Check if the given value is a valid RewardAddress
 *
 * @since 2.0.0
 * @category predicates
 */
export const isRewardAddress = Schema.is(RewardAddress)
