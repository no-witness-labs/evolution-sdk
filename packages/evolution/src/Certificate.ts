import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as Credential from "./Credential.js"
import * as DRep from "./DRep.js"
import * as EpochNo from "./EpochNo.js"
import * as PoolKeyHash from "./PoolKeyHash.js"
import * as PoolParams from "./PoolParams.js"

/**
 * Error class for Certificate related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class CertificateError extends Data.TaggedError("CertificateError")<{
  message?: string
  cause?: unknown
}> {}

export class StakeRegistration extends Schema.TaggedClass<StakeRegistration>("StakeRegistration")("StakeRegistration", {
  stakeCredential: Credential.Credential
}) {}

export class StakeDeregistration extends Schema.TaggedClass<StakeDeregistration>("StakeDeregistration")(
  "StakeDeregistration",
  {
    stakeCredential: Credential.Credential
  }
) {}

export class StakeDelegation extends Schema.TaggedClass<StakeDelegation>("StakeDelegation")("StakeDelegation", {
  stakeCredential: Credential.Credential,
  poolKeyHash: PoolKeyHash.PoolKeyHash
}) {}

export class PoolRegistration extends Schema.TaggedClass<PoolRegistration>("PoolRegistration")("PoolRegistration", {
  poolParams: PoolParams.PoolParams
}) {}

export class PoolRetirement extends Schema.TaggedClass<PoolRetirement>("PoolRetirement")("PoolRetirement", {
  poolKeyHash: PoolKeyHash.PoolKeyHash,
  epoch: EpochNo.EpochNoSchema
}) {}

export class RegCert extends Schema.TaggedClass<RegCert>("RegCert")("RegCert", {
  stakeCredential: Credential.Credential,
  coin: Coin.Coin
}) {}

export class UnregCert extends Schema.TaggedClass<UnregCert>("UnregCert")("UnregCert", {
  stakeCredential: Credential.Credential,
  coin: Coin.Coin
}) {}

export class VoteDelegCert extends Schema.TaggedClass<VoteDelegCert>("VoteDelegCert")("VoteDelegCert", {
  stakeCredential: Credential.Credential,
  drep: DRep.DRep
}) {}

export class StakeVoteDelegCert extends Schema.TaggedClass<StakeVoteDelegCert>("StakeVoteDelegCert")(
  "StakeVoteDelegCert",
  {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep
  }
) {}

export class StakeRegDelegCert extends Schema.TaggedClass<StakeRegDelegCert>("StakeRegDelegCert")("StakeRegDelegCert", {
  stakeCredential: Credential.Credential,
  poolKeyHash: PoolKeyHash.PoolKeyHash,
  coin: Coin.Coin
}) {}

export class VoteRegDelegCert extends Schema.TaggedClass<VoteRegDelegCert>("VoteRegDelegCert")("VoteRegDelegCert", {
  stakeCredential: Credential.Credential,
  drep: DRep.DRep,
  coin: Coin.Coin
}) {}

export class StakeVoteRegDelegCert extends Schema.TaggedClass<StakeVoteRegDelegCert>("StakeVoteRegDelegCert")(
  "StakeVoteRegDelegCert",
  {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep,
    coin: Coin.Coin
  }
) {}

export class AuthCommitteeHotCert extends Schema.TaggedClass<AuthCommitteeHotCert>("AuthCommitteeHotCert")(
  "AuthCommitteeHotCert",
  {
    committeeColdCredential: Credential.Credential,
    committeeHotCredential: Credential.Credential
  }
) {}

export class ResignCommitteeColdCert extends Schema.TaggedClass<ResignCommitteeColdCert>("ResignCommitteeColdCert")(
  "ResignCommitteeColdCert",
  {
    committeeColdCredential: Credential.Credential,
    anchor: Schema.NullishOr(Anchor.Anchor)
  }
) {}

export class RegDrepCert extends Schema.TaggedClass<RegDrepCert>("RegDrepCert")("RegDrepCert", {
  drepCredential: Credential.Credential,
  coin: Coin.Coin,
  anchor: Schema.NullishOr(Anchor.Anchor)
}) {}

export class UnregDrepCert extends Schema.TaggedClass<UnregDrepCert>("UnregDrepCert")("UnregDrepCert", {
  drepCredential: Credential.Credential,
  coin: Coin.Coin
}) {}

export class UpdateDrepCert extends Schema.TaggedClass<UpdateDrepCert>("UpdateDrepCert")("UpdateDrepCert", {
  drepCredential: Credential.Credential,
  anchor: Schema.NullishOr(Anchor.Anchor)
}) {}

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
  StakeRegistration,
  // 1: stake_deregistration = (1, stake_credential)
  StakeDeregistration,
  // 2: stake_delegation = (2, stake_credential, pool_keyhash)
  StakeDelegation,
  // 3: pool_registration = (3, pool_params)
  PoolRegistration,
  // 4: pool_retirement = (4, pool_keyhash, epoch_no)
  PoolRetirement,
  // 7: reg_cert = (7, stake_credential, coin)
  RegCert,
  // 8: unreg_cert = (8, stake_credential, coin)
  UnregCert,
  // 9: vote_deleg_cert = (9, stake_credential, drep)
  VoteDelegCert,
  // 10: stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
  StakeVoteDelegCert,
  // 11: stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
  StakeRegDelegCert,
  // 12: vote_reg_deleg_cert = (12, stake_credential, drep, coin)
  VoteRegDelegCert,
  // 13: stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
  StakeVoteRegDelegCert,
  // 14: auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
  AuthCommitteeHotCert,
  // 15: resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
  ResignCommitteeColdCert,
  // 16: reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
  RegDrepCert,
  // 17: unreg_drep_cert = (17, drep_credential, coin)
  UnregDrepCert,
  // 18: update_drep_cert = (18, drep_credential, anchor/ nil)
  UpdateDrepCert
)

export const CDDLSchema = Schema.Union(
  // 0: stake_registration = (0, stake_credential)
  Schema.Tuple(Schema.Literal(0n), Credential.CDDLSchema),
  // 1: stake_deregistration = (1, stake_credential)
  Schema.Tuple(Schema.Literal(1n), Credential.CDDLSchema),
  // 2: stake_delegation = (2, stake_credential, pool_keyhash)
  Schema.Tuple(Schema.Literal(2n), Credential.CDDLSchema, CBOR.ByteArray),
  // 3: pool_registration = (3, pool_params)
  Schema.Tuple(Schema.Literal(3n), PoolParams.CDDLSchema),
  // 4: pool_retirement = (4, pool_keyhash, epoch_no)
  Schema.Tuple(Schema.Literal(4n), CBOR.ByteArray, CBOR.Integer),
  // 7: reg_cert = (7, stake_credential , coin)
  Schema.Tuple(Schema.Literal(7n), Credential.CDDLSchema, CBOR.Integer),
  // 8: unreg_cert = (8, stake_credential, coin)
  Schema.Tuple(Schema.Literal(8n), Credential.CDDLSchema, CBOR.Integer),
  // 9: vote_deleg_cert = (9, stake_credential, drep)
  Schema.Tuple(Schema.Literal(9n), Credential.CDDLSchema, DRep.CDDLSchema),
  // 10: stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
  Schema.Tuple(Schema.Literal(10n), Credential.CDDLSchema, CBOR.ByteArray, DRep.CDDLSchema),
  // 11: stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
  Schema.Tuple(Schema.Literal(11n), Credential.CDDLSchema, CBOR.ByteArray, CBOR.Integer),
  // 12: vote_reg_deleg_cert = (12, stake_credential, drep, coin)
  Schema.Tuple(Schema.Literal(12n), Credential.CDDLSchema, DRep.CDDLSchema, CBOR.Integer),
  // 13: stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
  Schema.Tuple(Schema.Literal(13n), Credential.CDDLSchema, CBOR.ByteArray, DRep.CDDLSchema, CBOR.Integer),
  // 14: auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
  Schema.Tuple(Schema.Literal(14n), Credential.CDDLSchema, Credential.CDDLSchema),
  // 15: resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
  Schema.Tuple(Schema.Literal(15n), Credential.CDDLSchema, Schema.NullishOr(Anchor.CDDLSchema)),
  // 16: reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
  Schema.Tuple(Schema.Literal(16n), Credential.CDDLSchema, CBOR.Integer, Schema.NullishOr(Anchor.CDDLSchema)),
  // 17: unreg_drep_cert = (17, drep_credential, coin)
  Schema.Tuple(Schema.Literal(17n), Credential.CDDLSchema, CBOR.Integer),
  // 18: update_drep_cert = (18, drep_credential, anchor/ nil)
  Schema.Tuple(Schema.Literal(18n), Credential.CDDLSchema, Schema.NullishOr(Anchor.CDDLSchema))
)

/**
 * CDDL schema for Certificate based on Conway specification.
 *
 * Transforms between CBOR tuple representation and Certificate union.
 * Each certificate type is encoded as [type_id, ...fields]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Certificate), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      switch (toA._tag) {
        case "StakeRegistration": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          return [0n, credentialCDDL] as const
        }
        case "StakeDeregistration": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          return [1n, credentialCDDL] as const
        }
        case "StakeDelegation": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [2n, credentialCDDL, poolKeyHashBytes] as const
        }
        case "PoolRegistration": {
          const poolParamsCDDL = yield* ParseResult.encode(PoolParams.FromCDDL)(toA.poolParams)
          return [3n, poolParamsCDDL] as const
        }
        case "PoolRetirement": {
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [4n, poolKeyHashBytes, BigInt(toA.epoch)] as const
        }
        case "RegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          return [7n, credentialCDDL, toA.coin] as const
        }
        case "UnregCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          return [8n, credentialCDDL, toA.coin] as const
        }
        case "VoteDelegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const drepCDDL = yield* ParseResult.encode(DRep.FromCDDL)(toA.drep)
          return [9n, credentialCDDL, drepCDDL] as const
        }
        case "StakeVoteDelegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          const drepCDDL = yield* ParseResult.encode(DRep.FromCDDL)(toA.drep)
          return [10n, credentialCDDL, poolKeyHashBytes, drepCDDL] as const
        }
        case "StakeRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [11n, credentialCDDL, poolKeyHashBytes, toA.coin] as const
        }
        case "VoteRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const drepCDDL = yield* ParseResult.encode(DRep.FromCDDL)(toA.drep)
          return [12n, credentialCDDL, drepCDDL, toA.coin] as const
        }
        case "StakeVoteRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          const drepCDDL = yield* ParseResult.encode(DRep.FromCDDL)(toA.drep)
          return [13n, credentialCDDL, poolKeyHashBytes, drepCDDL, toA.coin] as const
        }
        case "AuthCommitteeHotCert": {
          const coldCredentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.committeeColdCredential)
          const hotCredentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.committeeHotCredential)
          return [14n, coldCredentialCDDL, hotCredentialCDDL] as const
        }
        case "ResignCommitteeColdCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.committeeColdCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(toA.anchor) : null
          return [15n, credentialCDDL, anchorCDDL] as const
        }
        case "RegDrepCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.drepCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(toA.anchor) : null
          return [16n, credentialCDDL, toA.coin, anchorCDDL] as const
        }
        case "UnregDrepCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.drepCredential)
          return [17n, credentialCDDL, toA.coin] as const
        }
        case "UpdateDrepCert": {
          const credentialCDDL = yield* ParseResult.encode(Credential.FromCDDL)(toA.drepCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(toA.anchor) : null
          return [18n, credentialCDDL, anchorCDDL] as const
        }
        // default:
        //   return yield* ParseResult.fail(
        //     new ParseResult.Type(CDDLSchema.ast, toA, `Unsupported certificate type: ${(toA as any)._tag}`)
        //   )
      }
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      // const [typeId, ...fields] = fromA

      switch (fromA[0]) {
        case 0n: {
          // stake_registration = (0, stake_credential)
          // const [credentialCDDL] = fields
          const [, credentialCDDL] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          return yield* ParseResult.decode(Certificate)({ _tag: "StakeRegistration", stakeCredential })
        }
        case 1n: {
          // stake_deregistration = (1, stake_credential)
          const [, credentialCDDL] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          return yield* ParseResult.decode(Certificate)({ _tag: "StakeDeregistration", stakeCredential })
        }
        case 2n: {
          // stake_delegation = (2, stake_credential, pool_keyhash)
          const [, credentialCDDL, poolKeyHashBytes] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          return yield* ParseResult.decode(Certificate)({ _tag: "StakeDelegation", stakeCredential, poolKeyHash })
        }
        case 3n: {
          // pool_registration = (3, pool_params)
          const [, poolParamsCDDL] = fromA
          const poolParams = yield* ParseResult.decode(PoolParams.FromCDDL)(poolParamsCDDL)
          return { _tag: "PoolRegistration", poolParams } as const
        }
        case 4n: {
          // pool_retirement = (4, pool_keyhash, epoch_no)
          const [, poolKeyHashBytes, epochBigInt] = fromA
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const epoch = EpochNo.make(epochBigInt)
          return yield* ParseResult.decode(Certificate)({ _tag: "PoolRetirement", poolKeyHash, epoch })
        }
        case 7n: {
          // reg_cert = (7, stake_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({ _tag: "RegCert", stakeCredential, coin })
        }
        case 8n: {
          // unreg_cert = (8, stake_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({ _tag: "UnregCert", stakeCredential, coin })
        }
        case 9n: {
          // vote_deleg_cert = (9, stake_credential, drep)
          const [, credentialCDDL, drepCDDL] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const drep = yield* ParseResult.decode(DRep.FromCDDL)(drepCDDL)
          return yield* ParseResult.decode(Certificate)({ _tag: "VoteDelegCert", stakeCredential, drep })
        }
        case 10n: {
          // stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
          const [, credentialCDDL, poolKeyHashBytes, drepCDDL] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const drep = yield* ParseResult.decode(DRep.FromCDDL)(drepCDDL)
          return yield* ParseResult.decode(Certificate)({
            _tag: "StakeVoteDelegCert",
            stakeCredential,
            poolKeyHash,
            drep
          })
        }
        case 11n: {
          // stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
          const [, credentialCDDL, poolKeyHashBytes, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({
            _tag: "StakeRegDelegCert",
            stakeCredential,
            poolKeyHash,
            coin
          })
        }
        case 12n: {
          // vote_reg_deleg_cert = (12, stake_credential, drep, coin)
          const [, credentialCDDL, drepCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const drep = yield* ParseResult.decode(DRep.FromCDDL)(drepCDDL)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({ _tag: "VoteRegDelegCert", stakeCredential, drep, coin })
        }
        case 13n: {
          // stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
          const [, credentialCDDL, poolKeyHashBytes, drepCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const drep = yield* ParseResult.decode(DRep.FromCDDL)(drepCDDL)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({
            _tag: "StakeVoteRegDelegCert",
            stakeCredential,
            poolKeyHash,
            drep,
            coin
          })
        }
        case 14n: {
          // auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
          const [, coldCredentialCDDL, hotCredentialCDDL] = fromA
          const committeeColdCredential = yield* ParseResult.decode(Credential.FromCDDL)(coldCredentialCDDL)
          const committeeHotCredential = yield* ParseResult.decode(Credential.FromCDDL)(hotCredentialCDDL)
          return yield* ParseResult.decode(Certificate)({
            _tag: "AuthCommitteeHotCert",
            committeeColdCredential,
            committeeHotCredential
          })
        }
        case 15n: {
          // resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
          const [, credentialCDDL, anchorCDDL] = fromA
          const committeeColdCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const anchor = anchorCDDL ? yield* ParseResult.decode(Anchor.FromCDDL)(anchorCDDL) : undefined
          return yield* ParseResult.decode(Certificate)({
            _tag: "ResignCommitteeColdCert",
            committeeColdCredential,
            anchor
          })
        }
        case 16n: {
          // reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
          const [, credentialCDDL, coinBigInt, anchorCDDL] = fromA
          const drepCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const coin = Coin.make(coinBigInt)
          const anchor = anchorCDDL ? yield* ParseResult.decode(Anchor.FromCDDL)(anchorCDDL) : undefined
          return yield* ParseResult.decode(Certificate)({ _tag: "RegDrepCert", drepCredential, coin, anchor })
        }
        case 17n: {
          // unreg_drep_cert = (17, drep_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const drepCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const coin = Coin.make(coinBigInt)
          return yield* ParseResult.decode(Certificate)({ _tag: "UnregDrepCert", drepCredential, coin })
        }
        case 18n: {
          // update_drep_cert = (18, drep_credential, anchor/ nil)
          const [, credentialCDDL, anchorCDDL] = fromA
          const drepCredential = yield* ParseResult.decode(Credential.FromCDDL)(credentialCDDL)
          const anchor = anchorCDDL ? yield* ParseResult.decode(Anchor.FromCDDL)(anchorCDDL) : undefined
          return yield* ParseResult.decode(Certificate)({ _tag: "UpdateDrepCert", drepCredential, anchor })
        }
        // default:
        //   return yield* ParseResult.fail(
        //     new ParseResult.Type(CDDLSchema.ast, fromA, `Unsupported certificate type ID: ${fromA}`)
        //   )
      }
    })
})

/**
 * CBOR bytes transformation schema for Certificate.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Certificate
  )

/**
 * CBOR hex transformation schema for Certificate.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Certificate
  )

/**
 * Type alias for Certificate.
 *
 * @since 2.0.0
 * @category model
 */
export type Certificate = typeof Certificate.Type

/**
 * Check if the given value is a valid Certificate.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Certificate)

/**
 * FastCheck arbitrary for Certificate instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.oneof(
  // StakeRegistration
  Credential.arbitrary.map((stakeCredential) => new StakeRegistration({ stakeCredential })),
  // StakeDeregistration
  Credential.arbitrary.map((stakeCredential) => new StakeDeregistration({ stakeCredential })),
  // StakeDelegation
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary).map(
    ([stakeCredential, poolKeyHash]) => new StakeDelegation({ stakeCredential, poolKeyHash })
  ),
  // PoolRegistration
  PoolParams.arbitrary.map((poolParams) => new PoolRegistration({ poolParams })),
  // PoolRetirement
  FastCheck.tuple(PoolKeyHash.arbitrary, EpochNo.generator).map(
    ([poolKeyHash, epoch]) => new PoolRetirement({ poolKeyHash, epoch: EpochNo.make(epoch) })
  ),
  // RegCert
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, coin]) => new RegCert({ stakeCredential, coin })
  ),
  // UnregCert
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, coin]) => new UnregCert({ stakeCredential, coin })
  ),
  // VoteDelegCert
  FastCheck.tuple(Credential.arbitrary, DRep.arbitrary).map(
    ([stakeCredential, drep]) => new VoteDelegCert({ stakeCredential, drep })
  ),
  // StakeVoteDelegCert
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, DRep.arbitrary).map(
    ([stakeCredential, poolKeyHash, drep]) => new StakeVoteDelegCert({ stakeCredential, poolKeyHash, drep })
  ),
  // StakeRegDelegCert
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, poolKeyHash, coin]) => new StakeRegDelegCert({ stakeCredential, poolKeyHash, coin })
  ),
  // VoteRegDelegCert
  FastCheck.tuple(Credential.arbitrary, DRep.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, drep, coin]) => new VoteRegDelegCert({ stakeCredential, drep, coin })
  ),
  // StakeVoteRegDelegCert
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, DRep.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, poolKeyHash, drep, coin]) =>
      new StakeVoteRegDelegCert({ stakeCredential, poolKeyHash, drep, coin })
  ),
  // AuthCommitteeHotCert
  FastCheck.tuple(Credential.arbitrary, Credential.arbitrary).map(
    ([committeeColdCredential, committeeHotCredential]) =>
      new AuthCommitteeHotCert({ committeeColdCredential, committeeHotCredential })
  ),
  // ResignCommitteeColdCert
  FastCheck.tuple(Credential.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([committeeColdCredential, anchor]) => new ResignCommitteeColdCert({ committeeColdCredential, anchor })
  ),
  // RegDrepCert
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([drepCredential, coin, anchor]) => new RegDrepCert({ drepCredential, coin, anchor })
  ),
  // UnregDrepCert
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([drepCredential, coin]) => new UnregDrepCert({ drepCredential, coin })
  ),
  // UpdateDrepCert
  FastCheck.tuple(Credential.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([drepCredential, anchor]) => new UpdateDrepCert({ drepCredential, anchor })
  )
)

/**
 * Check if two Certificate instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Certificate, b: Certificate): boolean => {
  if (a._tag !== b._tag) return false

  switch (a._tag) {
    case "StakeRegistration":
      return b._tag === "StakeRegistration" && Credential.equals(a.stakeCredential, b.stakeCredential)
    case "StakeDeregistration":
      return b._tag === "StakeDeregistration" && Credential.equals(a.stakeCredential, b.stakeCredential)
    case "StakeDelegation":
      return (
        b._tag === "StakeDelegation" &&
        Credential.equals(a.stakeCredential, b.stakeCredential) &&
        PoolKeyHash.equals(a.poolKeyHash, b.poolKeyHash)
      )
    case "PoolRetirement":
      return (
        b._tag === "PoolRetirement" &&
        PoolKeyHash.equals(a.poolKeyHash, b.poolKeyHash) &&
        EpochNo.equals(a.epoch, b.epoch)
      )
    case "RegCert":
      return (
        b._tag === "RegCert" && Credential.equals(a.stakeCredential, b.stakeCredential) && Coin.equals(a.coin, b.coin)
      )
    case "UnregCert":
      return (
        b._tag === "UnregCert" && Credential.equals(a.stakeCredential, b.stakeCredential) && Coin.equals(a.coin, b.coin)
      )
    case "VoteDelegCert":
      return (
        b._tag === "VoteDelegCert" &&
        Credential.equals(a.stakeCredential, b.stakeCredential) &&
        DRep.equals(a.drep, b.drep)
      )
    // Add other cases as needed
    default:
      return false
  }
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parse a Certificate from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Certificate =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse a Certificate from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Certificate =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Convert a Certificate to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (certificate: Certificate, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(certificate, options))

/**
 * Convert a Certificate to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (certificate: Certificate, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(certificate, options))

// ============================================================================
// Effect Namespace - Effect-based Error Handling
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse a Certificate from CBOR bytes.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Certificate, CertificateError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (error) =>
          new CertificateError({
            message: "Failed to decode Certificate from CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Parse a Certificate from CBOR hex string.
   *
   * @since 2.0.0
   * @category effect
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Certificate, CertificateError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (error) =>
          new CertificateError({
            message: "Failed to decode Certificate from CBOR hex",
            cause: error
          })
      )
    )

  /**
   * Convert a Certificate to CBOR bytes.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORBytes = (
    certificate: Certificate,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, CertificateError> =>
    Schema.encode(FromCBORBytes(options))(certificate).pipe(
      Eff.mapError(
        (error) =>
          new CertificateError({
            message: "Failed to encode Certificate to CBOR bytes",
            cause: error
          })
      )
    )

  /**
   * Convert a Certificate to CBOR hex string.
   *
   * @since 2.0.0
   * @category effect
   */
  export const toCBORHex = (
    certificate: Certificate,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, CertificateError> =>
    Schema.encode(FromCBORHex(options))(certificate).pipe(
      Eff.mapError(
        (error) =>
          new CertificateError({
            message: "Failed to encode Certificate to CBOR hex",
            cause: error
          })
      )
    )
}
