import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as CommiteeColdCredential from "./CommitteeColdCredential.js"
import * as Constituion from "./Constitution.js"
import type { CredentialSchema as CredentialT } from "./Credential.js"
import * as Credential from "./Credential.js"
import * as EpochNo from "./EpochNo.js"
import * as Function from "./Function.js"
import * as ProtocolParamUpdate from "./ProtocolParamUpdate.js"
import * as ProtocolVersion from "./ProtocolVersion.js"
import * as RewardAccount from "./RewardAccount.js"
import * as ScriptHash from "./ScriptHash.js"
import * as TransactionHash from "./TransactionHash.js"
import * as TransactionIndex from "./TransactionIndex.js"
import * as UnitInterval from "./UnitInterval.js"

/**
 * Error class for GovernanceAction related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class GovernanceActionError extends Data.TaggedError("GovernanceActionError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * GovActionId schema representing a governance action identifier.
 * ```
 * According to Conway CDDL: gov_action_id = [transaction_id : transaction_id, gov_action_index : uint .size 2]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class GovActionId extends Schema.TaggedClass<GovActionId>()("GovActionId", {
  transactionId: TransactionHash.TransactionHash, // transaction_id (hash32)
  govActionIndex: TransactionIndex.TransactionIndex // uint .size 2 (governance action index)
}) {}

/**
 * Check if two GovActionId instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const govActionIdEquals = (a: GovActionId, b: GovActionId): boolean =>
  TransactionHash.equals(a.transactionId, b.transactionId) &&
  TransactionIndex.equals(a.govActionIndex, b.govActionIndex)

/**
 * CDDL schema for GovActionId tuple structure.
 * ```
 * For CBOR encoding: [transaction_id: bytes, gov_action_index: uint]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const GovActionIdCDDL = Schema.Tuple(
  CBOR.ByteArray, // transaction_id as bytes
  CBOR.Integer // gov_action_index as uint
)

/**
 * CDDL transformation schema for GovActionId.
 *
 * @since 2.0.0
 * @category schemas
 */
export const GovActionIdFromCDDL = Schema.transformOrFail(GovActionIdCDDL, Schema.typeSchema(GovActionId), {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      // Convert domain types to CBOR types
      const transactionIdBytes = toA.transactionId.hash
      const indexNumber = yield* ParseResult.encode(TransactionIndex.TransactionIndex)(toA.govActionIndex)
      return [transactionIdBytes, BigInt(indexNumber)] as const
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const [transactionIdBytes, govActionIndex] = fromA
      // Convert CBOR types to domain types
      const transactionId = new TransactionHash.TransactionHash({ hash: transactionIdBytes })
      const govActionIndexParsed = yield* ParseResult.decode(Schema.typeSchema(TransactionIndex.TransactionIndex))(
        govActionIndex
      )
      const govActionId = new GovActionId({
        transactionId,
        govActionIndex: govActionIndexParsed
      })
      return govActionId
    })
})

/**
 * Parameter change governance action schema.
 * ```
 * According to Conway CDDL: parameter_change_action =
 *   (0, gov_action_id/ nil, protocol_param_update, policy_hash/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class ParameterChangeAction extends Schema.TaggedClass<ParameterChangeAction>()("ParameterChangeAction", {
  govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
  protocolParamUpdate: ProtocolParamUpdate.ProtocolParamUpdate, // protocol_param_update
  policyHash: Schema.NullOr(ScriptHash.ScriptHash) // policy_hash / nil
}) {}

/**
 * CDDL schema for ParameterChangeAction tuple structure.
 * Maps to: (0, gov_action_id/ nil, protocol_param_update, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const ParameterChangeActionCDDL = Schema.Tuple(
  Schema.Literal(0n), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  ProtocolParamUpdate.CDDLSchema, // protocol_param_update
  Schema.NullOr(CBOR.ByteArray) // policy_hash / nil
)

/**
 * CDDL transformation schema for ParameterChangeAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ParameterChangeActionFromCDDL = Schema.transformOrFail(
  ParameterChangeActionCDDL,
  Schema.typeSchema(ParameterChangeAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const govActionId = action.govActionId
          ? yield* ParseResult.encode(GovActionIdFromCDDL)(action.govActionId)
          : null
        const protocolParamUpdateRO = yield* ParseResult.encode(ProtocolParamUpdate.FromCDDL)(
          action.protocolParamUpdate
        )
        const protocolParamUpdate = new Map<bigint, CBOR.CBOR>()
        for (const [k, v] of protocolParamUpdateRO) protocolParamUpdate.set(k, v)
        const policyHash = action.policyHash ? yield* ParseResult.encode(ScriptHash.FromBytes)(action.policyHash) : null

        // Return as CBOR tuple
        return [0n, govActionId, protocolParamUpdate, policyHash] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, protocolParamUpdateCDDL, policyHash] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
        const protocolParamUpdate = yield* ParseResult.decode(ProtocolParamUpdate.FromCDDL)(protocolParamUpdateCDDL)
        const policyHashValue = policyHash ? yield* ParseResult.decode(ScriptHash.FromBytes)(policyHash) : null

        return new ParameterChangeAction({
          govActionId,
          protocolParamUpdate,
          policyHash: policyHashValue
        })
      })
  }
)

/**
 * Hard fork initiation governance action schema.
 * ```
 * According to Conway CDDL: hard_fork_initiation_action =
 *   (1, gov_action_id/ nil, protocol_version, policy_hash/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class HardForkInitiationAction extends Schema.TaggedClass<HardForkInitiationAction>()(
  "HardForkInitiationAction",
  {
    govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
    protocolVersion: ProtocolVersion.ProtocolVersion // protocol_version = [major, minor]
  }
) {}

/**
 * CDDL schema for HardForkInitiationAction tuple structure.
 * ```
 * Maps to: (1, gov_action_id/ nil, protocol_version, policy_hash/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const HardForkInitiationActionCDDL = Schema.Tuple(
  Schema.Literal(1n), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  ProtocolVersion.CDDLSchema // protocol_version = [major, minor]
)

/**
 * CDDL transformation schema for HardForkInitiationAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HardForkInitiationActionFromCDDL = Schema.transformOrFail(
  HardForkInitiationActionCDDL,
  Schema.typeSchema(HardForkInitiationAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const govActionId = action.govActionId
          ? yield* ParseResult.encode(GovActionIdFromCDDL)(action.govActionId)
          : null
        const protocolVersion = yield* ParseResult.encode(ProtocolVersion.FromCDDL)(action.protocolVersion)

        // Return as CBOR tuple
        return [1n, govActionId, protocolVersion] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, protocolVersion] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
        const protocolVersionValue = yield* ParseResult.decode(ProtocolVersion.FromCDDL)(protocolVersion)

        return new HardForkInitiationAction({
          govActionId,
          protocolVersion: protocolVersionValue
        })
      })
  }
)

/**
 * Treasury withdrawals governance action schema.
 * ```
 * According to Conway CDDL: treasury_withdrawals_action =
 *   (2, { * reward_account => coin }, policy_hash/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class TreasuryWithdrawalsAction extends Schema.TaggedClass<TreasuryWithdrawalsAction>()(
  "TreasuryWithdrawalsAction",
  {
    withdrawals: Schema.Map({
      key: RewardAccount.FromBech32,
      value: Coin.Coin
    }),
    policyHash: Schema.NullOr(ScriptHash.ScriptHash) // policy_hash / nil
  }
) {}

/**
 * CDDL schema for TreasuryWithdrawalsAction tuple structure.
 * ```
 * Maps to: (2, { * reward_account => coin }, policy_hash/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const TreasuryWithdrawalsActionCDDL = Schema.Tuple(
  Schema.Literal(2n), // action type
  Schema.MapFromSelf({
    key: CBOR.ByteArray, // reward_account as bytes
    value: CBOR.Integer // coin as bigint
  }),
  Schema.NullOr(CBOR.ByteArray) // policy_hash / nil
)

/**
 * CDDL transformation schema for TreasuryWithdrawalsAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const TreasuryWithdrawalsActionFromCDDL = Schema.transformOrFail(
  TreasuryWithdrawalsActionCDDL,
  Schema.typeSchema(TreasuryWithdrawalsAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const withdrawals = new Map<Uint8Array, bigint>()
        for (const [rewardAccount, coin] of action.withdrawals) {
          const rewardAccountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(rewardAccount)
          withdrawals.set(rewardAccountBytes, coin)
        }
        const policyHash = action.policyHash ? yield* ParseResult.encode(ScriptHash.FromBytes)(action.policyHash) : null

        // Return as CBOR tuple
        return [2n, withdrawals, policyHash] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, withdrawals, policyHash] = cddl
        const policyHashValue = policyHash ? yield* ParseResult.decode(ScriptHash.FromBytes)(policyHash) : null
        const withdrawalsMap = new Map<RewardAccount.RewardAccount, Coin.Coin>()
        for (const [rewardAccountBytes, coin] of withdrawals) {
          const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(rewardAccountBytes)
          withdrawalsMap.set(rewardAccount, coin)
        }

        return new TreasuryWithdrawalsAction({
          withdrawals: withdrawalsMap,
          policyHash: policyHashValue
        })
      })
  }
)

/**
 * No confidence governance action schema.
 * ```
 * According to Conway CDDL: no_confidence =
 *   (3, gov_action_id/ nil)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class NoConfidenceAction extends Schema.TaggedClass<NoConfidenceAction>()("NoConfidenceAction", {
  govActionId: Schema.NullOr(GovActionId) // gov_action_id / nil
}) {}

/**
 * CDDL schema for NoConfidenceAction tuple structure.
 * Maps to: (3, gov_action_id/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const NoConfidenceActionCDDL = Schema.Tuple(
  Schema.Literal(3n), // action type
  Schema.NullOr(GovActionIdCDDL) // gov_action_id / nil
)

/**
 * CDDL transformation schema for NoConfidenceAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NoConfidenceActionFromCDDL = Schema.transformOrFail(
  NoConfidenceActionCDDL,
  Schema.typeSchema(NoConfidenceAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const govActionId = action.govActionId
          ? yield* ParseResult.encode(GovActionIdFromCDDL)(action.govActionId)
          : null

        // Return as CBOR tuple
        return [3n, govActionId] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null

        return new NoConfidenceAction({
          govActionId
        })
      })
  }
)

/**
 * Update committee governance action schema.
 * ```
 * According to Conway CDDL: update_committee =
 *   (4, gov_action_id/ nil, set<committee_cold_credential>, { * committee_cold_credential => committee_hot_credential }, unit_interval)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class UpdateCommitteeAction extends Schema.TaggedClass<UpdateCommitteeAction>()("UpdateCommitteeAction", {
  govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
  membersToRemove: Schema.Array(CommiteeColdCredential.CommitteeColdCredential.CredentialSchema), // set<committee_cold_credential>
  membersToAdd: Schema.Map({
    key: CommiteeColdCredential.CommitteeColdCredential.CredentialSchema, // committee_cold_credential
    value: EpochNo.EpochNoSchema // epoch_no
  }),
  threshold: UnitInterval.UnitInterval
}) {}

/**
 * CDDL schema for UpdateCommitteeAction tuple structure.
 * ```
 * Maps to: (4, gov_action_id/ nil, set<committee_cold_credential>, { * committee_cold_credential => committee_hot_credential }, unit_interval)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const UpdateCommitteeActionCDDL = Schema.Tuple(
  Schema.Literal(4n), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  // set<committee_cold_credential> = #6.258([* a0]) / [* a0]
  Schema.Union(
    CBOR.tag(258, Schema.Array(CommiteeColdCredential.CommitteeColdCredential.CDDLSchema)),
    Schema.Array(CommiteeColdCredential.CommitteeColdCredential.CDDLSchema)
  ),
  // { * committee_cold_credential => epoch_no }
  Schema.MapFromSelf({
    key: CommiteeColdCredential.CommitteeColdCredential.CDDLSchema,
    value: EpochNo.CDDLSchema
  }),
  UnitInterval.CDDLSchema // unit_interval
)

/**
 * CDDL transformation schema for UpdateCommitteeAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const UpdateCommitteeActionFromCDDL = Schema.transformOrFail(
  UpdateCommitteeActionCDDL,
  Schema.typeSchema(UpdateCommitteeAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const govActionId = action.govActionId
          ? yield* ParseResult.encode(GovActionIdFromCDDL)(action.govActionId)
          : null
        // Encode membersToRemove as tagged set (tag 258) per CDDL
        const removeArr: Array<typeof CommiteeColdCredential.CommitteeColdCredential.CDDLSchema.Type> = []
        for (const cred of action.membersToRemove) {
          const coldCred = yield* ParseResult.encode(CommiteeColdCredential.CommitteeColdCredential.FromCDDL)(cred)
          removeArr.push(coldCred)
        }
        const membersToRemove = CBOR.Tag.make({ tag: 258, value: removeArr }, { disableValidation: true }) as any

        // Encode membersToAdd as map<committee_cold_credential => epoch_no>
        const membersToAdd = new Map<
          typeof CommiteeColdCredential.CommitteeColdCredential.CDDLSchema.Type,
          typeof EpochNo.CDDLSchema.Type
        >()
        for (const [coldCred, epoch] of action.membersToAdd) {
          const coldCredBytes = yield* ParseResult.encode(CommiteeColdCredential.CommitteeColdCredential.FromCDDL)(
            coldCred
          )
          const epochNo = yield* ParseResult.encode(EpochNo.FromCDDL)(epoch)
          membersToAdd.set(coldCredBytes, epochNo)
        }
        // Encode threshold as UnitInterval
        const threshold = yield* ParseResult.encode(UnitInterval.FromCDDL)(action.threshold)

        // Return as CBOR tuple
        return [4n, govActionId, membersToRemove, membersToAdd, threshold] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, membersToRemoveCDDL, membersToAddCDDL, thresholdCDDL] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
        const threshold = yield* ParseResult.decode(UnitInterval.FromCDDL)(thresholdCDDL)
        // Decode set into an array of credentials (accept tag 258 or plain array)
        const membersToRemove: Array<typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type> = []
        const removeArr = CBOR.isTag(membersToRemoveCDDL)
          ? membersToRemoveCDDL.tag === 258
            ? (membersToRemoveCDDL.value as ReadonlyArray<any>)
            : []
          : (membersToRemoveCDDL as ReadonlyArray<any>)
        for (const coldCredCDDL of removeArr) {
          const coldCred = yield* ParseResult.decode(CommiteeColdCredential.CommitteeColdCredential.FromCDDL)(
            coldCredCDDL
          )
          membersToRemove.push(coldCred)
        }
        const membersToAdd = new Map<
          typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type,
          EpochNo.EpochNo
        >()
        for (const [coldCredCDDL, epochNoCDDL] of membersToAddCDDL) {
          const coldCred = yield* ParseResult.decode(CommiteeColdCredential.CommitteeColdCredential.FromCDDL)(
            coldCredCDDL
          )
          const epoch = yield* ParseResult.decode(EpochNo.FromCDDL)(epochNoCDDL)
          membersToAdd.set(coldCred, epoch)
        }

        return new UpdateCommitteeAction({
          govActionId,
          membersToRemove,
          membersToAdd,
          threshold
        })
      })
  }
)

/**
 * New constitution governance action schema.
 * According to Conway CDDL: new_constitution =
 *   (5, gov_action_id/ nil, constitution)
 *
 * @since 2.0.0
 * @category schemas
 */
export class NewConstitutionAction extends Schema.TaggedClass<NewConstitutionAction>()("NewConstitutionAction", {
  govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
  constitution: Constituion.Constitution // constitution as CBOR
}) {}

/**
 * CDDL schema for NewConstitutionAction tuple structure.
 * ```
 * Maps to: (5, gov_action_id/ nil, constitution)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const NewConstitutionActionCDDL = Schema.Tuple(
  Schema.Literal(5n), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  Constituion.CDDLSchema // constitution as CBOR
)

/**
 * CDDL transformation schema for NewConstitutionAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NewConstitutionActionFromCDDL = Schema.transformOrFail(
  NewConstitutionActionCDDL,
  Schema.typeSchema(NewConstitutionAction),
  {
    strict: true,
    encode: (action) =>
      Eff.gen(function* () {
        const govActionId = action.govActionId
          ? yield* ParseResult.encode(GovActionIdFromCDDL)(action.govActionId)
          : null
        const constitution = yield* ParseResult.encode(Constituion.FromCDDL)(action.constitution)

        // Return as CBOR tuple
        return [5n, govActionId, constitution] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, constitutionCDDL] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
        const constitution = yield* ParseResult.decode(Constituion.FromCDDL)(constitutionCDDL)

        return new NewConstitutionAction({
          govActionId,
          constitution
        })
      })
  }
)

/**
 * Info governance action schema.
 * ```
 * According to Conway CDDL: info_action = (6)
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class InfoAction extends Schema.TaggedClass<InfoAction>()("InfoAction", {
  // Info action has no additional data
}) {}

/**
 * CDDL schema for InfoAction tuple structure.
 * Maps to: (6)
 *
 * @since 2.0.0
 * @category schemas
 */
export const InfoActionCDDL = Schema.Tuple(
  Schema.Literal(6n) // action type
)

/**
 * CDDL transformation schema for InfoAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const InfoActionFromCDDL = Schema.transformOrFail(InfoActionCDDL, Schema.typeSchema(InfoAction), {
  strict: true,
  encode: (_action) =>
    Eff.gen(function* () {
      // Return as CBOR tuple
      return [6n] as const
    }),
  decode: (_cddl) =>
    Eff.gen(function* () {
      return new InfoAction({})
    })
})

/**
 * GovernanceAction union schema based on Conway CDDL specification.
 *
 * ```
 * governance_action =
 *   [ 0, parameter_change_action ]
 * / [ 1, hard_fork_initiation_action ]
 * / [ 2, treasury_withdrawals_action ]
 * / [ 3, no_confidence ]
 * / [ 4, update_committee ]
 * / [ 5, new_constitution ]
 * / [ 6, info_action ]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export const GovernanceAction = Schema.Union(
  ParameterChangeAction,
  HardForkInitiationAction,
  TreasuryWithdrawalsAction,
  NoConfidenceAction,
  UpdateCommitteeAction,
  NewConstitutionAction,
  InfoAction
)

/**
 * Type alias for GovernanceAction.
 *
 * @since 2.0.0
 * @category model
 */
export type GovernanceAction = Schema.Schema.Type<typeof GovernanceAction>

/**
 * CDDL schema for GovernanceAction tuple structure.
 * Maps action types to their data according to Conway specification.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Union(
  ParameterChangeActionCDDL,
  HardForkInitiationActionCDDL,
  TreasuryWithdrawalsActionCDDL,
  NoConfidenceActionCDDL,
  UpdateCommitteeActionCDDL,
  NewConstitutionActionCDDL,
  InfoActionCDDL
)

/**
 * CDDL transformation schema for GovernanceAction.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.Union(
  ParameterChangeActionFromCDDL,
  HardForkInitiationActionFromCDDL,
  TreasuryWithdrawalsActionFromCDDL,
  NoConfidenceActionFromCDDL,
  UpdateCommitteeActionFromCDDL,
  NewConstitutionActionFromCDDL,
  InfoActionFromCDDL
)

/**
 * Check if two GovernanceAction instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: GovernanceAction, b: GovernanceAction): boolean => {
  if (a._tag !== b._tag) return false

  const eqGovActionId = (x: GovActionId | null, y: GovActionId | null) =>
    x === y || (x !== null && y !== null && govActionIdEquals(x, y))

  const eqNullableScriptHash = (x: ScriptHash.ScriptHash | null, y: ScriptHash.ScriptHash | null) =>
    x === y || (x !== null && y !== null && ScriptHash.equals(x, y))

  const eqProtocolParamUpdate = (
    x: ProtocolParamUpdate.ProtocolParamUpdate,
    y: ProtocolParamUpdate.ProtocolParamUpdate
  ) => Bytes.equals(ProtocolParamUpdate.toCBORBytes(x), ProtocolParamUpdate.toCBORBytes(y))

  const eqWithdrawals = (
    aMap: ReadonlyMap<RewardAccount.RewardAccount, Coin.Coin>,
    bMap: ReadonlyMap<RewardAccount.RewardAccount, Coin.Coin>
  ): boolean => {
    if (aMap.size !== bMap.size) return false
    // For each entry in aMap, find a key-equal entry in bMap with same coin
    for (const [aKey, aVal] of aMap) {
      let found = false
      for (const [bKey, bVal] of bMap) {
        if (RewardAccount.equals(aKey, bKey)) {
          if (aVal !== bVal) return false
          found = true
          break
        }
      }
      if (!found) return false
    }
    return true
  }

  const eqCredential = (a: CredentialT, b: CredentialT): boolean => a._tag === b._tag && Bytes.equals(a.hash, b.hash)

  const eqCredentialsArray = (xs: ReadonlyArray<CredentialT>, ys: ReadonlyArray<CredentialT>): boolean => {
    if (xs.length !== ys.length) return false
    for (let i = 0; i < xs.length; i++) {
      if (!eqCredential(xs[i], ys[i])) return false
    }
    return true
  }

  const eqCredentialEpochMap = (
    aMap: ReadonlyMap<CredentialT, EpochNo.EpochNo>,
    bMap: ReadonlyMap<CredentialT, EpochNo.EpochNo>
  ): boolean => {
    if (aMap.size !== bMap.size) return false
    for (const [aKey, aVal] of aMap) {
      let matched = false
      for (const [bKey, bVal] of bMap) {
        if (eqCredential(aKey, bKey)) {
          if (aVal !== bVal) return false
          matched = true
          break
        }
      }
      if (!matched) return false
    }
    return true
  }

  switch (a._tag) {
    case "ParameterChangeAction":
      return (
        b._tag === "ParameterChangeAction" &&
        eqProtocolParamUpdate(a.protocolParamUpdate, b.protocolParamUpdate) &&
        eqNullableScriptHash(a.policyHash, b.policyHash) &&
        eqGovActionId(a.govActionId, b.govActionId)
      )
    case "HardForkInitiationAction":
      return (
        b._tag === "HardForkInitiationAction" &&
        ProtocolVersion.equals(a.protocolVersion, b.protocolVersion) &&
        eqGovActionId(a.govActionId, b.govActionId)
      )
    case "TreasuryWithdrawalsAction":
      return (
        b._tag === "TreasuryWithdrawalsAction" &&
        eqWithdrawals(a.withdrawals, b.withdrawals) &&
        eqNullableScriptHash(a.policyHash, b.policyHash)
      )
    case "NoConfidenceAction":
      return b._tag === "NoConfidenceAction" && eqGovActionId(a.govActionId, b.govActionId)
    case "UpdateCommitteeAction":
      return (
        b._tag === "UpdateCommitteeAction" &&
        eqCredentialsArray(a.membersToRemove, b.membersToRemove) &&
        eqCredentialEpochMap(a.membersToAdd, b.membersToAdd) &&
        UnitInterval.equals(a.threshold, b.threshold) &&
        eqGovActionId(a.govActionId, b.govActionId)
      )
    case "NewConstitutionAction":
      return (
        b._tag === "NewConstitutionAction" &&
        Constituion.equals(a.constitution, b.constitution) &&
        eqGovActionId(a.govActionId, b.govActionId)
      )
    case "InfoAction":
      return b._tag === "InfoAction"
  }
}

/**
 * Create a parameter change governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeParameterChange = (
  govActionId: GovActionId | null,
  protocolParamUpdate: ProtocolParamUpdate.ProtocolParamUpdate,
  policyHash: ScriptHash.ScriptHash | null = null
): ParameterChangeAction =>
  new ParameterChangeAction({
    govActionId,
    protocolParamUpdate,
    policyHash
  })

/**
 * Create a hard fork initiation governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeHardForkInitiation = (
  govActionId: GovActionId | null,
  protocolVersion: ProtocolVersion.ProtocolVersion
): HardForkInitiationAction =>
  new HardForkInitiationAction({
    govActionId,
    protocolVersion
  })

/**
 * Create a treasury withdrawals governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeTreasuryWithdrawals = (
  withdrawals: Map<RewardAccount.RewardAccount, Coin.Coin>,
  policyHash: ScriptHash.ScriptHash | null = null
): TreasuryWithdrawalsAction =>
  new TreasuryWithdrawalsAction({
    withdrawals,
    policyHash
  })

/**
 * Create a no confidence governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeNoConfidence = (govActionId: GovActionId | null): NoConfidenceAction =>
  new NoConfidenceAction({
    govActionId
  })

/**
 * Create an update committee governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeUpdateCommittee = (
  govActionId: GovActionId | null,
  membersToRemove: ReadonlyArray<typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type>,
  membersToAdd: Map<typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type, EpochNo.EpochNo>,
  threshold: UnitInterval.UnitInterval
): UpdateCommitteeAction =>
  new UpdateCommitteeAction({
    govActionId,
    membersToRemove,
    membersToAdd,
    threshold
  })

/**
 * Create a new constitution governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeNewConstitution = (
  govActionId: GovActionId | null,
  constitution: Constituion.Constitution
): NewConstitutionAction =>
  new NewConstitutionAction({
    govActionId,
    constitution
  })

/**
 * Create an info governance action.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeInfo = (): InfoAction => new InfoAction({})

/**
 * FastCheck arbitrary for GovernanceAction.
 *
 * @since 2.0.0
 * @category arbitrary
 */
// Per-variant arbitraries and main arbitrary

export const infoArbitrary: FastCheck.Arbitrary<InfoAction> = FastCheck.constant(new InfoAction({}))

export const govActionIdArbitrary: FastCheck.Arbitrary<GovActionId> = FastCheck.tuple(
  TransactionHash.arbitrary,
  TransactionIndex.arbitrary
).map(([transactionId, govActionIndex]) => new GovActionId({ transactionId, govActionIndex }))

export const parameterChangeArbitrary: FastCheck.Arbitrary<ParameterChangeAction> = FastCheck.tuple(
  FastCheck.option(govActionIdArbitrary, { nil: null }),
  ProtocolParamUpdate.arbitrary,
  FastCheck.option(ScriptHash.arbitrary, { nil: null })
).map(
  ([govActionId, protocolParamUpdate, policyHash]) =>
    new ParameterChangeAction({ govActionId, protocolParamUpdate, policyHash })
)

export const hardForkInitiationArbitrary: FastCheck.Arbitrary<HardForkInitiationAction> = FastCheck.tuple(
  FastCheck.option(govActionIdArbitrary, { nil: null }),
  ProtocolVersion.arbitrary
).map(([govActionId, protocolVersion]) => new HardForkInitiationAction({ govActionId, protocolVersion }))

const withdrawalsMapArbitrary: FastCheck.Arbitrary<Map<RewardAccount.RewardAccount, Coin.Coin>> = FastCheck.uniqueArray(
  RewardAccount.arbitrary,
  {
    maxLength: 5,
    selector: (ra) => RewardAccount.toHex(ra)
  }
).chain((accounts) =>
  FastCheck.array(Coin.arbitrary, { minLength: accounts.length, maxLength: accounts.length }).map(
    (coins) => new Map(accounts.map((a, i) => [a, coins[i]] as const))
  )
)

export const treasuryWithdrawalsArbitrary: FastCheck.Arbitrary<TreasuryWithdrawalsAction> = FastCheck.tuple(
  withdrawalsMapArbitrary,
  FastCheck.option(ScriptHash.arbitrary, { nil: null })
).map(([withdrawals, policyHash]) => new TreasuryWithdrawalsAction({ withdrawals, policyHash }))

export const noConfidenceArbitrary: FastCheck.Arbitrary<NoConfidenceAction> = FastCheck.option(govActionIdArbitrary, {
  nil: null
}).map((govActionId) => new NoConfidenceAction({ govActionId }))

const uniqueCredArray: FastCheck.Arbitrary<ReadonlyArray<Credential.CredentialSchema>> = FastCheck.uniqueArray(
  Credential.arbitrary,
  {
    maxLength: 5,
    selector: (c) => `${c._tag}:${Bytes.toHex(c.hash)}`
  }
)

const membersToAddMapArbitrary: FastCheck.Arbitrary<Map<Credential.CredentialSchema, EpochNo.EpochNo>> =
  uniqueCredArray.chain((colds) =>
    FastCheck.array(EpochNo.arbitrary, {
      minLength: colds.length,
      maxLength: colds.length
    }).map((epochsRaw) => {
      const epochs = epochsRaw.map((e) => EpochNo.make(e))
      const m = new Map<Credential.CredentialSchema, EpochNo.EpochNo>()
      for (let i = 0; i < colds.length; i++) m.set(colds[i], epochs[i])
      return m
    })
  )

export const updateCommitteeArbitrary: FastCheck.Arbitrary<UpdateCommitteeAction> = FastCheck.tuple(
  FastCheck.option(govActionIdArbitrary, { nil: null }),
  uniqueCredArray,
  membersToAddMapArbitrary,
  UnitInterval.arbitrary
).map(
  ([govActionId, membersToRemove, membersToAdd, threshold]) =>
    new UpdateCommitteeAction({ govActionId, membersToRemove, membersToAdd, threshold })
)

export const newConstitutionArbitrary: FastCheck.Arbitrary<NewConstitutionAction> = FastCheck.tuple(
  FastCheck.option(govActionIdArbitrary, { nil: null }),
  Constituion.arbitrary
).map(([govActionId, constitution]) => new NewConstitutionAction({ govActionId, constitution }))

export const arbitrary: FastCheck.Arbitrary<GovernanceAction> = FastCheck.oneof(
  parameterChangeArbitrary,
  hardForkInitiationArbitrary,
  updateCommitteeArbitrary,
  treasuryWithdrawalsArbitrary,
  noConfidenceArbitrary,
  newConstitutionArbitrary,
  infoArbitrary
)

/**
 * Check if a value is a valid GovernanceAction.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(GovernanceAction)

/**
 * Type guards for each governance action variant.
 *
 * @since 2.0.0
 * @category type guards
 */
export const isParameterChangeAction = Schema.is(ParameterChangeAction)

export const isHardForkInitiationAction = Schema.is(HardForkInitiationAction)

export const isTreasuryWithdrawalsAction = Schema.is(TreasuryWithdrawalsAction)

export const isNoConfidenceAction = Schema.is(NoConfidenceAction)

export const isUpdateCommitteeAction = Schema.is(UpdateCommitteeAction)

export const isNewConstitutionAction = Schema.is(NewConstitutionAction)

export const isInfoAction = Schema.is(InfoAction)

/**
 * Pattern matching utility for GovernanceAction.
 *
 * @since 2.0.0
 * @category pattern matching
 */
export const match = <R>(
  action: GovernanceAction,
  patterns: {
    ParameterChangeAction: (
      govActionId: GovActionId | null,
      protocolParams: ProtocolParamUpdate.ProtocolParamUpdate,
      policyHash: ScriptHash.ScriptHash | null
    ) => R
    HardForkInitiationAction: (govActionId: GovActionId | null, protocolVersion: ProtocolVersion.ProtocolVersion) => R
    TreasuryWithdrawalsAction: (
      withdrawals: Map<RewardAccount.RewardAccount, Coin.Coin>,
      policyHash: ScriptHash.ScriptHash | null
    ) => R
    NoConfidenceAction: (govActionId: GovActionId | null) => R
    UpdateCommitteeAction: (
      govActionId: GovActionId | null,
      membersToRemove: ReadonlyArray<typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type>,
      membersToAdd: ReadonlyMap<
        typeof CommiteeColdCredential.CommitteeColdCredential.CredentialSchema.Type,
        EpochNo.EpochNo
      >,
      threshold: UnitInterval.UnitInterval
    ) => R
    NewConstitutionAction: (govActionId: GovActionId | null, constitution: Constituion.Constitution) => R
    InfoAction: () => R
  }
): R => {
  switch (action._tag) {
    case "ParameterChangeAction":
      return patterns.ParameterChangeAction(action.govActionId, action.protocolParamUpdate, action.policyHash)
    case "HardForkInitiationAction":
      return patterns.HardForkInitiationAction(action.govActionId, action.protocolVersion)
    case "TreasuryWithdrawalsAction":
      return patterns.TreasuryWithdrawalsAction(action.withdrawals, action.policyHash)
    case "NoConfidenceAction":
      return patterns.NoConfidenceAction(action.govActionId)
    case "UpdateCommitteeAction":
      return patterns.UpdateCommitteeAction(
        action.govActionId,
        action.membersToRemove,
        action.membersToAdd,
        action.threshold
      )
    case "NewConstitutionAction":
      return patterns.NewConstitutionAction(action.govActionId, action.constitution)
    case "InfoAction":
      return patterns.InfoAction()
  }
}

export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL as unknown as Schema.Schema<any, any, never>,
  GovernanceActionError,
  "GovernanceAction.fromCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL as unknown as Schema.Schema<any, any, never>,
  GovernanceActionError,
  "GovernanceAction.toCBORHex",
  CBOR.CML_DEFAULT_OPTIONS
)
export const fromCBOR = Function.makeCBORDecodeSync(
  FromCDDL as unknown as Schema.Schema<any, any, never>,
  GovernanceActionError,
  "GovernanceAction.fromCBORBytes",
  CBOR.CML_DEFAULT_OPTIONS
)
export const toCBOR = Function.makeCBOREncodeSync(
  FromCDDL as unknown as Schema.Schema<any, any, never>,
  GovernanceActionError,
  "GovernanceAction.toCBORBytes",
  CBOR.CML_DEFAULT_OPTIONS
)
