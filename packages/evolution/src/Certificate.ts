import { Data, Schema } from "effect"

// import * as PoolParams from "./PoolParams.js"; // Temporarily disabled
import * as Anchor from "./Anchor.js"
import * as Coin from "./Coin.js"
import * as Credential from "./Credential.js"
import * as DRep from "./DRep.js"
import * as EpochNo from "./EpochNo.js"
import * as PoolKeyHash from "./PoolKeyHash.js"

/**
 * Error class for Certificate related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class CertificateError extends Data.TaggedError("CertificateError")<{
  message?: string
  reason?: "InvalidType" | "UnsupportedCertificate"
}> {}

/**
 * Certificate union schema based on Conway CDDL specification
 *
 * CDDL: certificate =
 *   [
 *   stake_registration
 *   // stake_deregistration
 *   // stake_delegation
 *   // pool_registration
 *   // pool_retirement
 *   // reg_cert
 *   // unreg_cert
 *   // vote_deleg_cert
 *   // stake_vote_deleg_cert
 *   // stake_reg_deleg_cert
 *   // vote_reg_deleg_cert
 *   // stake_vote_reg_deleg_cert
 *   // auth_committee_hot_cert
 *   // resign_committee_cold_cert
 *   // reg_drep_cert
 *   // unreg_drep_cert
 *   // update_drep_cert
 *   ]
 *
 * stake_registration = (0, stake_credential)
 * stake_deregistration = (1, stake_credential)
 * stake_delegation = (2, stake_credential, pool_keyhash)
 * pool_registration = (3, pool_params)
 * pool_retirement = (4, pool_keyhash, epoch_no)
 * reg_cert = (7, stake_credential, coin)
 * unreg_cert = (8, stake_credential, coin)
 * vote_deleg_cert = (9, stake_credential, drep)
 * stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
 * stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
 * vote_reg_deleg_cert = (12, stake_credential, drep, coin)
 * stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
 * auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
 * resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
 * reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
 * unreg_drep_cert = (17, drep_credential, coin)
 * update_drep_cert = (18, drep_credential, anchor/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const Certificate = Schema.Union(
  // 0: stake_registration = (0, stake_credential)
  Schema.TaggedStruct("StakeRegistration", {
    stakeCredential: Credential.Credential
  }),
  // 1: stake_deregistration = (1, stake_credential)
  Schema.TaggedStruct("StakeDeregistration", {
    stakeCredential: Credential.Credential
  }),
  // 2: stake_delegation = (2, stake_credential, pool_keyhash)
  Schema.TaggedStruct("StakeDelegation", {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash
  }),
  // 3: pool_registration = (3, pool_params) - Temporarily disabled
  // Schema.TaggedStruct("PoolRegistration", {
  //   poolParams: PoolParams.PoolParams,
  // }),
  // 4: pool_retirement = (4, pool_keyhash, epoch_no)
  Schema.TaggedStruct("PoolRetirement", {
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    epoch: EpochNo.EpochNoSchema
  }),
  // 7: reg_cert = (7, stake_credential, coin)
  Schema.TaggedStruct("RegCert", {
    stakeCredential: Credential.Credential,
    coin: Coin.CoinSchema
  }),
  // 8: unreg_cert = (8, stake_credential, coin)
  Schema.TaggedStruct("UnregCert", {
    stakeCredential: Credential.Credential,
    coin: Coin.CoinSchema
  }),
  // 9: vote_deleg_cert = (9, stake_credential, drep)
  Schema.TaggedStruct("VoteDelegCert", {
    stakeCredential: Credential.Credential,
    drep: DRep.DRep
  }),
  // 10: stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
  Schema.TaggedStruct("StakeVoteDelegCert", {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep
  }),
  // 11: stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
  Schema.TaggedStruct("StakeRegDelegCert", {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    coin: Coin.CoinSchema
  }),
  // 12: vote_reg_deleg_cert = (12, stake_credential, drep, coin)
  Schema.TaggedStruct("VoteRegDelegCert", {
    stakeCredential: Credential.Credential,
    drep: DRep.DRep,
    coin: Coin.CoinSchema
  }),
  // 13: stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
  Schema.TaggedStruct("StakeVoteRegDelegCert", {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep,
    coin: Coin.CoinSchema
  }),
  // 14: auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
  Schema.TaggedStruct("AuthCommitteeHotCert", {
    committeeColdCredential: Credential.Credential,
    committeeHotCredential: Credential.Credential
  }),
  // 15: resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
  Schema.TaggedStruct("ResignCommitteeColdCert", {
    committeeColdCredential: Credential.Credential,
    anchor: Schema.NullishOr(Anchor.Anchor)
  }),
  // 16: reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
  Schema.TaggedStruct("RegDrepCert", {
    drepCredential: Credential.Credential,
    coin: Coin.CoinSchema,
    anchor: Schema.NullishOr(Anchor.Anchor)
  }),
  // 17: unreg_drep_cert = (17, drep_credential, coin)
  Schema.TaggedStruct("UnregDrepCert", {
    drepCredential: Credential.Credential,
    coin: Coin.CoinSchema
  }),
  // 18: update_drep_cert = (18, drep_credential, anchor/ nil)
  Schema.TaggedStruct("UpdateDrepCert", {
    drepCredential: Credential.Credential,
    anchor: Schema.NullishOr(Anchor.Anchor)
  })
)

/**
 * Type alias for Certificate.
 *
 * @since 2.0.0
 * @category model
 */
export type Certificate = typeof Certificate.Type
