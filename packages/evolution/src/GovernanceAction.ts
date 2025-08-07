import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as RewardAccount from "./RewardAccount.js"
import * as ScriptHash from "./ScriptHash.js"
import * as TransactionHash from "./TransactionHash.js"
import * as TransactionIndex from "./TransactionIndex.js"

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
 * According to Conway CDDL: gov_action_id = [transaction_id : transaction_id, gov_action_index : uint .size 2]
 *
 * @since 2.0.0
 * @category schemas
 */
export class GovActionId extends Schema.TaggedClass<GovActionId>()("GovActionId", {
  transactionId: TransactionHash.TransactionHash, // transaction_id (hash32)
  govActionIndex: TransactionIndex.TransactionIndex // uint .size 2 (governance action index)
}) {}

/**
 * CDDL schema for GovActionId tuple structure.
 * For CBOR encoding: [transaction_id: bytes, gov_action_index: uint]
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
export const GovActionIdFromCDDL = Schema.transformOrFail(GovActionIdCDDL, GovActionId, {
  strict: true,
  encode: (_, __, ___, toA) =>
    Eff.gen(function* () {
      // Convert domain types to CBOR types
      const transactionIdBytes = yield* ParseResult.encode(TransactionHash.FromBytes)(toA.transactionId)
      const indexNumber = yield* ParseResult.encode(TransactionIndex.TransactionIndex)(toA.govActionIndex)
      return [transactionIdBytes, BigInt(indexNumber)] as const
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const [transactionIdBytes, govActionIndexNumber] = fromA
      // Convert CBOR types to domain types
      const transactionId = yield* ParseResult.decode(TransactionHash.FromBytes)(transactionIdBytes)
      const govActionIndex = yield* ParseResult.decode(TransactionIndex.TransactionIndex)(Number(govActionIndexNumber))
      return new GovActionId({ transactionId, govActionIndex })
    })
})

/**
 * Parameter change governance action schema.
 * According to Conway CDDL: parameter_change_action =
 *   (0, gov_action_id/ nil, protocol_param_update, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export class ParameterChangeAction extends Schema.TaggedClass<ParameterChangeAction>()("ParameterChangeAction", {
  govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
  protocolParamUpdate: CBOR.RecordSchema, // protocol_param_update as CBOR record
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
  Schema.Literal(0), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  CBOR.RecordSchema, // protocol_param_update
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
        const protocolParamUpdate = yield* ParseResult.encode(CBOR.RecordSchema)(action.protocolParamUpdate)
        const policyHash = action.policyHash ? yield* ParseResult.encode(ScriptHash.FromBytes)(action.policyHash) : null

        // Return as CBOR tuple
        return [0, govActionId, protocolParamUpdate, policyHash] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, protocolParamUpdate, policyHash] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
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
 * According to Conway CDDL: hard_fork_initiation_action =
 *   (1, gov_action_id/ nil, protocol_version, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export class HardForkInitiationAction extends Schema.TaggedClass<HardForkInitiationAction>()(
  "HardForkInitiationAction",
  {
    govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
    protocolVersion: Schema.Tuple(Schema.Number, Schema.Number), // protocol_version = [major, minor]
    policyHash: Schema.NullOr(ScriptHash.ScriptHash) // policy_hash / nil
  }
) {}

/**
 * CDDL schema for HardForkInitiationAction tuple structure.
 * Maps to: (1, gov_action_id/ nil, protocol_version, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const HardForkInitiationActionCDDL = Schema.Tuple(
  Schema.Literal(1), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  Schema.Tuple(CBOR.Integer, CBOR.Integer), // protocol_version = [major, minor]
  Schema.NullOr(CBOR.ByteArray) // policy_hash / nil
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
        const policyHash = action.policyHash ? yield* ParseResult.encode(ScriptHash.FromBytes)(action.policyHash) : null

        // Return as CBOR tuple
        return [
          1,
          govActionId,
          [BigInt(action.protocolVersion[0]), BigInt(action.protocolVersion[1])],
          policyHash
        ] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, protocolVersion, policyHash] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null
        const policyHashValue = policyHash ? yield* ParseResult.decode(ScriptHash.FromBytes)(policyHash) : null

        return new HardForkInitiationAction({
          govActionId,
          protocolVersion: [Number(protocolVersion[0]), Number(protocolVersion[1])],
          policyHash: policyHashValue
        })
      })
  }
)

/**
 * Treasury withdrawals governance action schema.
 * According to Conway CDDL: treasury_withdrawals_action =
 *   (2, { * reward_account => coin }, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export class TreasuryWithdrawalsAction extends Schema.TaggedClass<TreasuryWithdrawalsAction>()(
  "TreasuryWithdrawalsAction",
  {
    withdrawals: Schema.MapFromSelf({
      key: RewardAccount.RewardAccount,
      value: Coin.Coin
    }),
    policyHash: Schema.NullOr(ScriptHash.ScriptHash) // policy_hash / nil
  }
) {}

/**
 * CDDL schema for TreasuryWithdrawalsAction tuple structure.
 * Maps to: (2, { * reward_account => coin }, policy_hash/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const TreasuryWithdrawalsActionCDDL = Schema.Tuple(
  Schema.Literal(2), // action type
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
        return [2, withdrawals, policyHash] as const
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
 * According to Conway CDDL: no_confidence =
 *   (3, gov_action_id/ nil)
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
  Schema.Literal(3), // action type
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
        return [3, govActionId] as const
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
 * According to Conway CDDL: update_committee =
 *   (4, gov_action_id/ nil, set<committee_cold_credential>, { * committee_cold_credential => committee_hot_credential }, unit_interval)
 *
 * @since 2.0.0
 * @category schemas
 */
export class UpdateCommitteeAction extends Schema.TaggedClass<UpdateCommitteeAction>()("UpdateCommitteeAction", {
  govActionId: Schema.NullOr(GovActionId), // gov_action_id / nil
  membersToRemove: Schema.Array(CBOR.CBORSchema), // set<committee_cold_credential>
  membersToAdd: CBOR.MapSchema, // { * committee_cold_credential => committee_hot_credential }
  threshold: CBOR.CBORSchema // unit_interval
}) {}

/**
 * CDDL schema for UpdateCommitteeAction tuple structure.
 * Maps to: (4, gov_action_id/ nil, set<committee_cold_credential>, { * committee_cold_credential => committee_hot_credential }, unit_interval)
 *
 * @since 2.0.0
 * @category schemas
 */
export const UpdateCommitteeActionCDDL = Schema.Tuple(
  Schema.Literal(4), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  Schema.Array(CBOR.CBORSchema), // set<committee_cold_credential>
  CBOR.MapSchema, // { * committee_cold_credential => committee_hot_credential }
  CBOR.CBORSchema // unit_interval
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
        const membersToRemove = yield* ParseResult.encode(Schema.Array(CBOR.CBORSchema))(action.membersToRemove)
        const membersToAdd = yield* ParseResult.encode(CBOR.MapSchema)(action.membersToAdd)
        const threshold = yield* ParseResult.encode(CBOR.CBORSchema)(action.threshold)

        // Return as CBOR tuple
        return [4, govActionId, membersToRemove, membersToAdd, threshold] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, membersToRemove, membersToAdd, threshold] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null

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
  constitution: CBOR.CBORSchema // constitution as CBOR
}) {}

/**
 * CDDL schema for NewConstitutionAction tuple structure.
 * Maps to: (5, gov_action_id/ nil, constitution)
 *
 * @since 2.0.0
 * @category schemas
 */
export const NewConstitutionActionCDDL = Schema.Tuple(
  Schema.Literal(5), // action type
  Schema.NullOr(GovActionIdCDDL), // gov_action_id / nil
  CBOR.CBORSchema // constitution
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
        const constitution = yield* ParseResult.encode(CBOR.CBORSchema)(action.constitution)

        // Return as CBOR tuple
        return [5, govActionId, constitution] as const
      }),
    decode: (cddl) =>
      Eff.gen(function* () {
        const [, govActionIdCDDL, constitution] = cddl
        const govActionId = govActionIdCDDL ? yield* ParseResult.decode(GovActionIdFromCDDL)(govActionIdCDDL) : null

        return new NewConstitutionAction({
          govActionId,
          constitution
        })
      })
  }
)

/**
 * Info governance action schema.
 * According to Conway CDDL: info_action = (6)
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
  Schema.Literal(6) // action type
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
      return [6] as const
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

  switch (a._tag) {
    case "ParameterChangeAction":
      return (
        b._tag === "ParameterChangeAction" &&
        JSON.stringify(a.protocolParamUpdate) === JSON.stringify(b.protocolParamUpdate) &&
        JSON.stringify(a.policyHash) === JSON.stringify(b.policyHash) &&
        JSON.stringify(a.govActionId) === JSON.stringify(b.govActionId)
      )
    case "HardForkInitiationAction":
      return (
        b._tag === "HardForkInitiationAction" &&
        JSON.stringify(a.protocolVersion) === JSON.stringify(b.protocolVersion) &&
        JSON.stringify(a.policyHash) === JSON.stringify(b.policyHash) &&
        JSON.stringify(a.govActionId) === JSON.stringify(b.govActionId)
      )
    case "TreasuryWithdrawalsAction":
      return (
        b._tag === "TreasuryWithdrawalsAction" &&
        JSON.stringify(a.withdrawals) === JSON.stringify(b.withdrawals) &&
        JSON.stringify(a.policyHash) === JSON.stringify(b.policyHash)
      )
    case "NoConfidenceAction":
      return b._tag === "NoConfidenceAction" && JSON.stringify(a.govActionId) === JSON.stringify(b.govActionId)
    case "UpdateCommitteeAction":
      return (
        b._tag === "UpdateCommitteeAction" &&
        JSON.stringify(a.membersToRemove) === JSON.stringify(b.membersToRemove) &&
        JSON.stringify(a.membersToAdd) === JSON.stringify(b.membersToAdd) &&
        JSON.stringify(a.threshold) === JSON.stringify(b.threshold) &&
        JSON.stringify(a.govActionId) === JSON.stringify(b.govActionId)
      )
    case "NewConstitutionAction":
      return (
        b._tag === "NewConstitutionAction" &&
        JSON.stringify(a.constitution) === JSON.stringify(b.constitution) &&
        JSON.stringify(a.govActionId) === JSON.stringify(b.govActionId)
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
  protocolParamUpdate: Record<string, CBOR.CBOR>,
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
  protocolVersion: readonly [number, number],
  policyHash: ScriptHash.ScriptHash | null = null
): HardForkInitiationAction =>
  new HardForkInitiationAction({
    govActionId,
    protocolVersion,
    policyHash
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
  membersToRemove: ReadonlyArray<CBOR.CBOR>,
  membersToAdd: ReadonlyMap<CBOR.CBOR, CBOR.CBOR>,
  threshold: CBOR.CBOR
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
  constitution: CBOR.CBOR
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
export const arbitrary = FastCheck.oneof(
  FastCheck.constant(makeNoConfidence(null)),
  FastCheck.constant(makeInfo())
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
export const isParameterChangeAction = (action: GovernanceAction): action is ParameterChangeAction =>
  action._tag === "ParameterChangeAction"

export const isHardForkInitiationAction = (action: GovernanceAction): action is HardForkInitiationAction =>
  action._tag === "HardForkInitiationAction"

export const isTreasuryWithdrawalsAction = (action: GovernanceAction): action is TreasuryWithdrawalsAction =>
  action._tag === "TreasuryWithdrawalsAction"

export const isNoConfidenceAction = (action: GovernanceAction): action is NoConfidenceAction =>
  action._tag === "NoConfidenceAction"

export const isUpdateCommitteeAction = (action: GovernanceAction): action is UpdateCommitteeAction =>
  action._tag === "UpdateCommitteeAction"

export const isNewConstitutionAction = (action: GovernanceAction): action is NewConstitutionAction =>
  action._tag === "NewConstitutionAction"

export const isInfoAction = (action: GovernanceAction): action is InfoAction => action._tag === "InfoAction"

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
      protocolParams: Record<string, CBOR.CBOR>,
      policyHash: ScriptHash.ScriptHash | null
    ) => R
    HardForkInitiationAction: (
      govActionId: GovActionId | null,
      protocolVersion: readonly [number, number],
      policyHash: ScriptHash.ScriptHash | null
    ) => R
    TreasuryWithdrawalsAction: (
      withdrawals: Map<RewardAccount.RewardAccount, Coin.Coin>,
      policyHash: ScriptHash.ScriptHash | null
    ) => R
    NoConfidenceAction: (govActionId: GovActionId | null) => R
    UpdateCommitteeAction: (
      govActionId: GovActionId | null,
      membersToRemove: ReadonlyArray<CBOR.CBOR>,
      membersToAdd: ReadonlyMap<CBOR.CBOR, CBOR.CBOR>,
      threshold: CBOR.CBOR
    ) => R
    NewConstitutionAction: (govActionId: GovActionId | null, constitution: CBOR.CBOR) => R
    InfoAction: () => R
  }
): R => {
  switch (action._tag) {
    case "ParameterChangeAction":
      return patterns.ParameterChangeAction(action.govActionId, action.protocolParamUpdate, action.policyHash)
    case "HardForkInitiationAction":
      return patterns.HardForkInitiationAction(action.govActionId, action.protocolVersion, action.policyHash)
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
