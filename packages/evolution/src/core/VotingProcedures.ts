import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Credential from "./Credential.js"
import * as DRep from "./DRep.js"
import * as Function from "./Function.js"
import * as GovernanceAction from "./GovernanceAction.js"
import * as KeyHash from "./KeyHash.js"
import * as PoolKeyHash from "./PoolKeyHash.js"
import * as ScriptHash from "./ScriptHash.js"
import * as TransactionHash from "./TransactionHash.js"
import * as TransactionIndex from "./TransactionIndex.js"

/**
 * Error class for VotingProcedures related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class VotingProceduresError extends Data.TaggedError("VotingProceduresError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Voter types based on Conway CDDL specification.
 *
 * Conway / CML mapping:
 *  - [0, addr_keyhash]   ConstitutionalCommitteeHotKeyHash
 *  - [1, script_hash]    ConstitutionalCommitteeHotScriptHash
 *  - [2, addr_keyhash]   DRepKeyHash
 *  - [3, script_hash]    DRepScriptHash
 *  - [4, pool_keyhash]   StakingPoolKeyHash
 *
 * @since 2.0.0
 * @category schemas
 */
// export const ConstitutionalCommitteeVoter = Schema.TaggedStruct("ConstitutionalCommitteeVoter", {
//   credential: Credential.Credential
// })
export class ConstitutionalCommitteeVoter extends Schema.TaggedClass<ConstitutionalCommitteeVoter>()(
  "ConstitutionalCommitteeVoter",
  {
    credential: Credential.Credential
  }
) {}

export class DRepVoter extends Schema.TaggedClass<DRepVoter>()("DRepVoter", {
  drep: DRep.DRep
}) {}

export class StakePoolVoter extends Schema.TaggedClass<StakePoolVoter>()("StakePoolVoter", {
  poolKeyHash: PoolKeyHash.PoolKeyHash
}) {}

/**
 * Voter union schema.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Voter = Schema.Union(ConstitutionalCommitteeVoter, DRepVoter, StakePoolVoter)

export type Voter = typeof Voter.Type

/**
 * CDDL schema for Voter as tuple structure.
 * Maps to: [voter_type, voter_data]
 *
 * @since 2.0.0
 * @category schemas
 */
// Match CML: split by concrete key/script variants for committee and drep, plus pool keyhash
// 0 = ConstitutionalCommitteeHotKeyHash (addr_keyhash)
// 1 = ConstitutionalCommitteeHotScriptHash (script_hash)
// 2 = DRepKeyHash (addr_keyhash)
// 3 = DRepScriptHash (script_hash)
// 4 = StakingPoolKeyHash (pool_keyhash)
export const VoterCDDL = Schema.Union(
  Schema.Tuple(Schema.Literal(0n), CBOR.ByteArray),
  Schema.Tuple(Schema.Literal(1n), CBOR.ByteArray),
  Schema.Tuple(Schema.Literal(2n), CBOR.ByteArray),
  Schema.Tuple(Schema.Literal(3n), CBOR.ByteArray),
  Schema.Tuple(Schema.Literal(4n), CBOR.ByteArray)
)

/**
 * CDDL transformation schema for Voter.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VoterFromCDDL = Schema.transformOrFail(VoterCDDL, Schema.typeSchema(Voter), {
  strict: true,
  encode: (voter) =>
    Eff.gen(function* () {
      switch (voter._tag) {
        case "ConstitutionalCommitteeVoter": {
          if (voter.credential._tag === "KeyHash") {
            const keyHashBytes = yield* ParseResult.encode(KeyHash.FromBytes)(voter.credential)
            return [0n, keyHashBytes] as const
          } else {
            const scriptHashBytes = yield* ParseResult.encode(ScriptHash.FromBytes)(voter.credential)
            return [1n, scriptHashBytes] as const
          }
        }
        case "DRepVoter": {
          if (voter.drep._tag === "KeyHashDRep") {
            const keyHashBytes = yield* ParseResult.encode(KeyHash.FromBytes)(voter.drep.keyHash)
            return [2n, keyHashBytes] as const
          } else if (voter.drep._tag === "ScriptHashDRep") {
            const scriptHashBytes = yield* ParseResult.encode(ScriptHash.FromBytes)(voter.drep.scriptHash)
            return [3n, scriptHashBytes] as const
          } else {
            return yield* ParseResult.fail(
              new ParseResult.Type(VoterCDDL.ast, voter, "Always* DRep variants are not valid Voter identifiers")
            )
          }
        }
        case "StakePoolVoter": {
          const poolKeyHashBytes = yield* ParseResult.encode(PoolKeyHash.FromBytes)(voter.poolKeyHash)
          return [4n, poolKeyHashBytes] as const
        }
      }
    }),
  decode: (cddl) =>
    Eff.gen(function* () {
      const [voterType, voterData] = cddl
      switch (voterType) {
        case 0n: {
          const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(voterData)
          return new ConstitutionalCommitteeVoter({ credential: keyHash })
        }
        case 1n: {
          const scriptHash = yield* ParseResult.decode(ScriptHash.FromBytes)(voterData)
          return new ConstitutionalCommitteeVoter({ credential: scriptHash })
        }
        case 2n: {
          const keyHash = yield* ParseResult.decode(KeyHash.FromBytes)(voterData)
          return new DRepVoter({ drep: { _tag: "KeyHashDRep", keyHash } as DRep.DRep })
        }
        case 3n: {
          const scriptHash = yield* ParseResult.decode(ScriptHash.FromBytes)(voterData)
          return new DRepVoter({ drep: { _tag: "ScriptHashDRep", scriptHash } as DRep.DRep })
        }
        case 4n: {
          const poolKeyHash = yield* ParseResult.decode(PoolKeyHash.FromBytes)(voterData)
          return new StakePoolVoter({ poolKeyHash })
        }
        default:
          return yield* ParseResult.fail(new ParseResult.Type(VoterCDDL.ast, cddl))
      }
    })
})

/**
 * Vote types based on Conway CDDL specification.
 *
 * ```
 * vote = 0 / 1 / 2  ; No / Yes / Abstain
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class NoVote extends Schema.TaggedClass<NoVote>()("NoVote", {}) {}
export class YesVote extends Schema.TaggedClass<YesVote>()("YesVote", {}) {}
export class AbstainVote extends Schema.TaggedClass<AbstainVote>()("AbstainVote", {}) {}

/**
 * Vote union schema.
 *
 * @since 2.0.0
 * @category schemas
 */
export const Vote = Schema.Union(NoVote, YesVote, AbstainVote)

export type Vote = typeof Vote.Type

/**
 * CDDL schema for Vote.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VoteCDDL = Schema.Union(
  Schema.Literal(0n), // No
  Schema.Literal(1n), // Yes
  Schema.Literal(2n) // Abstain
)

/**
 * CDDL transformation schema for Vote.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VoteFromCDDL = Schema.transformOrFail(VoteCDDL, Schema.typeSchema(Vote), {
  strict: true,
  encode: (vote) =>
    Eff.gen(function* () {
      switch (vote._tag) {
        case "NoVote":
          return 0n as const
        case "YesVote":
          return 1n as const
        case "AbstainVote":
          return 2n as const
      }
    }),
  decode: (cddl) =>
    Eff.gen(function* () {
      switch (cddl) {
        case 0n:
          return new NoVote()
        case 1n:
          return new YesVote()
        case 2n:
          return new AbstainVote()
        default:
          return yield* ParseResult.fail(new ParseResult.Type(VoteCDDL.ast, cddl))
      }
    })
})

/**
 * Voting procedure based on Conway CDDL specification.
 *
 * ```
 * voting_procedure = [ vote, anchor / null ]
 * ```
 *
 * @since 2.0.0
 * @category schemas
 */
export class VotingProcedure extends Schema.Class<VotingProcedure>("VotingProcedure")({
  vote: Vote,
  anchor: Schema.NullOr(Anchor.Anchor)
}) {}

/**
 * CDDL schema for VotingProcedure tuple structure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VotingProcedureCDDL = Schema.Tuple(
  VoteCDDL, // vote
  Schema.NullOr(Anchor.CDDLSchema) // anchor / null
)

/**
 * CDDL transformation schema for VotingProcedure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const VotingProcedureFromCDDL = Schema.transformOrFail(VotingProcedureCDDL, Schema.typeSchema(VotingProcedure), {
  strict: true,
  encode: (procedure) =>
    Eff.gen(function* () {
      const voteCDDL = yield* ParseResult.encode(VoteFromCDDL)(procedure.vote)
      const anchorCDDL = procedure.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(procedure.anchor) : null
      return [voteCDDL, anchorCDDL] as const
    }),
  decode: ([voteCDDL, anchorCDDL]) =>
    Eff.gen(function* () {
      const vote = yield* ParseResult.decode(VoteFromCDDL)(voteCDDL)
      const anchor = anchorCDDL ? yield* ParseResult.decode(Anchor.FromCDDL)(anchorCDDL) : null
      return new VotingProcedure({ vote, anchor })
    })
})

/**
 * VotingProcedures based on Conway CDDL specification.
 *
 * ```
 * voting_procedures = {+ voter => {+ gov_action_id => voting_procedure}}
 * ```
 *
 * A nested map structure where voters map to their votes on specific governance actions.
 *
 * @since 2.0.0
 * @category model
 */
export class VotingProcedures extends Schema.Class<VotingProcedures>("VotingProcedures")({
  procedures: Schema.Map({
    key: Voter,
    value: Schema.Map({
      key: GovernanceAction.GovActionId,
      value: VotingProcedure
    })
  })
}) {}

/**
 * CDDL schema for VotingProcedures map structure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.MapFromSelf({
  key: VoterCDDL, // voter
  value: Schema.MapFromSelf({
    key: GovernanceAction.GovActionIdCDDL, // gov_action_id
    value: VotingProcedureCDDL // voting_procedure
  })
})

/**
 * CDDL transformation schema for VotingProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(VotingProcedures), {
  strict: true,
  encode: (toA) =>
    Eff.gen(function* () {
      const mapEntries = new Map()

      for (const [voter, govActionMap] of toA.procedures) {
        const voterCDDL = yield* ParseResult.encode(VoterFromCDDL)(voter)
        const innerMapEntries = new Map()

        for (const [govActionId, votingProcedure] of govActionMap) {
          const govActionIdCDDL = yield* ParseResult.encode(GovernanceAction.GovActionIdFromCDDL)(govActionId)
          const procedureCDDL = yield* ParseResult.encode(VotingProcedureFromCDDL)(votingProcedure)
          innerMapEntries.set(govActionIdCDDL, procedureCDDL)
        }

        mapEntries.set(voterCDDL, innerMapEntries)
      }

      return mapEntries
    }),
  decode: (fromA) =>
    Eff.gen(function* () {
      const proceduresMap = new Map<Voter, Map<GovernanceAction.GovActionId, VotingProcedure>>()

      for (const [voterCDDL, innerMapCDDL] of fromA) {
        const voter = yield* ParseResult.decode(VoterFromCDDL)(voterCDDL)
        const govActionMap = new Map<GovernanceAction.GovActionId, VotingProcedure>()

        for (const [govActionIdCDDL, procedureCDDL] of innerMapCDDL) {
          const govActionId = yield* ParseResult.decode(GovernanceAction.GovActionIdFromCDDL)(govActionIdCDDL)
          const procedure = yield* ParseResult.decode(VotingProcedureFromCDDL)(procedureCDDL)
          govActionMap.set(govActionId, procedure)
        }

        proceduresMap.set(voter, govActionMap)
      }

      return new VotingProcedures({ procedures: proceduresMap })
    })
})

/**
 * CBOR bytes transformation schema for VotingProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → VotingProcedures
  ).annotations({
    identifier: "VotingProcedures.FromCBORBytes",
    title: "VotingProcedures from CBOR Bytes",
    description: "Transforms CBOR bytes to VotingProcedures"
  })

/**
 * CBOR hex transformation schema for VotingProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → VotingProcedures
  ).annotations({
    identifier: "VotingProcedures.FromCBORHex",
    title: "VotingProcedures from CBOR Hex",
    description: "Transforms CBOR hex string to VotingProcedures"
  })

// ============================================================================
// Constructors
// ============================================================================

/**
 * Create a VotingProcedures instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof VotingProcedures>) => new VotingProcedures(...args)

/**
 * Create a VotingProcedure instance.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeProcedure = (vote: Vote, anchor?: Anchor.Anchor | null): VotingProcedure =>
  new VotingProcedure({ vote, anchor: anchor ?? null })

/**
 * Create a Constitutional Committee voter.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeCommitteeVoter = (credential: Credential.Credential): Voter =>
  new ConstitutionalCommitteeVoter({ credential })

/**
 * Create a DRep voter.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeDRepVoter = (drep: DRep.DRep): DRepVoter => new DRepVoter({ drep })

/**
 * Create a Stake Pool voter.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeStakePoolVoter = (poolKeyHash: PoolKeyHash.PoolKeyHash): StakePoolVoter =>
  new StakePoolVoter({ poolKeyHash })

/**
 * Create a No vote.
 *
 * @since 2.0.0
 * @category constructors
 */
export const no = (): Vote => new NoVote()

/**
 * Create a Yes vote.
 *
 * @since 2.0.0
 * @category constructors
 */
export const yes = (): Vote => new YesVote()

/**
 * Create an Abstain vote.
 *
 * @since 2.0.0
 * @category constructors
 */
export const abstain = (): Vote => new AbstainVote()

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a voter is a Constitutional Committee voter.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isConstitutionalCommitteeVoter = (
  voter: Voter
): voter is Schema.Schema.Type<typeof ConstitutionalCommitteeVoter> => voter._tag === "ConstitutionalCommitteeVoter"

/**
 * Check if a voter is a DRep voter.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isDRepVoter = (voter: Voter): voter is Schema.Schema.Type<typeof DRepVoter> => voter._tag === "DRepVoter"

/**
 * Check if a voter is a Stake Pool voter.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isStakePoolVoter = (voter: Voter): voter is Schema.Schema.Type<typeof StakePoolVoter> =>
  voter._tag === "StakePoolVoter"

/**
 * Check if a vote is a No vote.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isNoVote = (vote: Vote): vote is Schema.Schema.Type<typeof NoVote> => vote._tag === "NoVote"

/**
 * Check if a vote is a Yes vote.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isYesVote = (vote: Vote): vote is Schema.Schema.Type<typeof YesVote> => vote._tag === "YesVote"

/**
 * Check if a vote is an Abstain vote.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isAbstainVote = (vote: Vote): vote is Schema.Schema.Type<typeof AbstainVote> => vote._tag === "AbstainVote"

// ============================================================================
// Pattern Matching
// ============================================================================

/**
 * Pattern match on a Voter.
 *
 * @since 2.0.0
 * @category pattern matching
 */
export const matchVoter =
  <R>(patterns: {
    ConstitutionalCommitteeVoter: (credential: Credential.Credential) => R
    DRepVoter: (drep: DRep.DRep) => R
    StakePoolVoter: (poolKeyHash: PoolKeyHash.PoolKeyHash) => R
  }) =>
  (voter: Voter): R => {
    switch (voter._tag) {
      case "ConstitutionalCommitteeVoter":
        return patterns.ConstitutionalCommitteeVoter(voter.credential)
      case "DRepVoter":
        return patterns.DRepVoter(voter.drep)
      case "StakePoolVoter":
        return patterns.StakePoolVoter(voter.poolKeyHash)
    }
  }

/**
 * Pattern match on a Vote.
 *
 * @since 2.0.0
 * @category pattern matching
 */
export const matchVote =
  <R>(patterns: { NoVote: () => R; YesVote: () => R; AbstainVote: () => R }) =>
  (vote: Vote): R => {
    switch (vote._tag) {
      case "NoVote":
        return patterns.NoVote()
      case "YesVote":
        return patterns.YesVote()
      case "AbstainVote":
        return patterns.AbstainVote()
    }
  }

// ============================================================================
// Equality
// ============================================================================

/**
 * Check if two Voters are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const voterEquals = (a: Voter, b: Voter): boolean => {
  if (a._tag !== b._tag) return false

  switch (a._tag) {
    case "ConstitutionalCommitteeVoter":
      return Credential.equals(a.credential, (b as Schema.Schema.Type<typeof ConstitutionalCommitteeVoter>).credential)
    case "DRepVoter":
      return DRep.equals(a.drep, (b as Schema.Schema.Type<typeof DRepVoter>).drep)
    case "StakePoolVoter":
      return PoolKeyHash.equals(a.poolKeyHash, (b as Schema.Schema.Type<typeof StakePoolVoter>).poolKeyHash)
  }
}

/**
 * Check if two Votes are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const voteEquals = (a: Vote, b: Vote): boolean => a._tag === b._tag

/**
 * Check if two VotingProcedures are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: VotingProcedures, b: VotingProcedures): boolean => {
  if (a.procedures.size !== b.procedures.size) return false

  for (const [voterA, govActionMapA] of a.procedures) {
    let foundMatchingVoter = false

    for (const [voterB, govActionMapB] of b.procedures) {
      if (voterEquals(voterA, voterB)) {
        foundMatchingVoter = true

        if (govActionMapA.size !== govActionMapB.size) return false

        for (const [govActionIdA, procedureA] of govActionMapA) {
          let foundMatchingAction = false

          for (const [govActionIdB, procedureB] of govActionMapB) {
            // Compare GovActionId by value (hash bytes and index), not by reference
            if (
              TransactionHash.equals(govActionIdA.transactionId, govActionIdB.transactionId) &&
              TransactionIndex.equals(govActionIdA.govActionIndex, govActionIdB.govActionIndex)
            ) {
              foundMatchingAction = true

              const votesEqual = voteEquals(procedureA.vote, procedureB.vote)
              const anchorsEqual =
                (procedureA.anchor === null && procedureB.anchor === null) ||
                (procedureA.anchor !== null &&
                  procedureB.anchor !== null &&
                  Anchor.equals(procedureA.anchor, procedureB.anchor))

              if (!votesEqual || !anchorsEqual) return false
              break
            }
          }

          if (!foundMatchingAction) return false
        }

        break
      }
    }

    if (!foundMatchingVoter) return false
  }

  return true
}

/**
 * FastCheck arbitrary for VotingProcedures.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.array(
  FastCheck.tuple(
    // Reuse existing voter arbitraries
    FastCheck.oneof(
      Credential.arbitrary.map((credential) => new ConstitutionalCommitteeVoter({ credential })),
      // Only key/script DRep variants are valid Voter identifiers
      FastCheck.oneof(
        KeyHash.arbitrary.map((keyHash) => ({ _tag: "KeyHashDRep" as const, keyHash })),
        ScriptHash.arbitrary.map((scriptHash) => ({ _tag: "ScriptHashDRep" as const, scriptHash }))
      ).map((drep) => new DRepVoter({ drep })),
      PoolKeyHash.arbitrary.map((poolKeyHash) => new StakePoolVoter({ poolKeyHash }))
    ),
    FastCheck.array(
      FastCheck.tuple(
        // Create GovActionId instances using proper branded types
        FastCheck.tuple(
          FastCheck.hexaString({ minLength: 64, maxLength: 64 }),
          FastCheck.bigInt({ min: 0n, max: 65535n })
        ).map(
          ([transactionId, govActionIndex]) =>
            new GovernanceAction.GovActionId({
              transactionId: TransactionHash.fromHex(transactionId),
              govActionIndex: TransactionIndex.make(govActionIndex)
            })
        ),
        FastCheck.tuple(
          FastCheck.oneof(
            FastCheck.constant(new NoVote()),
            FastCheck.constant(new YesVote()),
            FastCheck.constant(new AbstainVote())
          ),
          FastCheck.option(Anchor.arbitrary, { nil: null })
        ).map(([vote, anchor]) => new VotingProcedure({ vote, anchor }))
      )
    ).map((arr) => new Map(arr))
  )
).map((arr) => new VotingProcedures({ procedures: new Map(arr) }))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse VotingProcedures from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  VotingProceduresError,
  "VotingProcedures.fromCBORBytes"
)

/**
 * Parse VotingProcedures from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  VotingProceduresError,
  "VotingProcedures.fromCBORHex"
)

/**
 * Encode VotingProcedures to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(FromCDDL, VotingProceduresError, "VotingProcedures.toCBORBytes")

/**
 * Encode VotingProcedures to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, VotingProceduresError, "VotingProcedures.toCBORHex")

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Either {
  /**
   * Parse VotingProcedures from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, VotingProceduresError)

  /**
   * Parse VotingProcedures from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, VotingProceduresError)

  /**
   * Encode VotingProcedures to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, VotingProceduresError)

  /**
   * Encode VotingProcedures to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, VotingProceduresError)
}
