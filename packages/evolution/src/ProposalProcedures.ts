import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as GovernanceAction from "./GovernanceAction.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * Error class for ProposalProcedures related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ProposalProceduresError extends Data.TaggedError("ProposalProceduresError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Schema for a single proposal procedure based on Conway CDDL specification.
 *
 * ```
 * proposal_procedure = [
 *   deposit : coin,
 *   reward_account : reward_account,
 *   governance_action : governance_action,
 *   anchor : anchor / null
 * ]
 *
 * governance_action = [action_type, action_data]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ProposalProcedure extends Schema.Class<ProposalProcedure>("ProposalProcedure")({
  deposit: Coin.Coin,
  rewardAccount: RewardAccount.RewardAccount,
  governanceAction: GovernanceAction.GovernanceAction,
  anchor: Schema.NullOr(Anchor.Anchor)
}) {}

/**
 * ProposalProcedures based on Conway CDDL specification.
 *
 * ```
 * CDDL: proposal_procedures = nonempty_set<proposal_procedure>
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export class ProposalProcedures extends Schema.Class<ProposalProcedures>("ProposalProcedures")({
  procedures: Schema.Array(ProposalProcedure).pipe(
    Schema.filter((arr) => arr.length > 0, {
      message: () => "ProposalProcedures must contain at least one procedure"
    })
  )
}) {}

/**
 * CDDL schema for ProposalProcedure tuple structure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ProposalProcedureCDDLSchema = Schema.Tuple(
  CBOR.Integer, // deposit: coin
  CBOR.ByteArray, // reward_account (raw bytes)
  GovernanceAction.CDDLSchema, // governance_action using proper CDDL schema
  Schema.NullOr(Anchor.CDDLSchema) // anchor / null
)

/**
 * CDDL schema for ProposalProcedures that produces CBOR-compatible types.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Array(ProposalProcedureCDDLSchema)

/**
 * CDDL transformation schema for ProposalProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(ProposalProcedures), {
  strict: true,
  encode: (toA) =>
    Eff.all(
      toA.procedures.map((procedure) =>
        Eff.gen(function* () {
          const depositBigInt = BigInt(procedure.deposit)
          const rewardAccountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(procedure.rewardAccount)
          const governanceActionCDDL = yield* ParseResult.encode(GovernanceAction.FromCDDL)(
            procedure.governanceAction
          )
          const anchorCDDL = procedure.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(procedure.anchor) : null
          return [depositBigInt, rewardAccountBytes, governanceActionCDDL, anchorCDDL] as any
        })
      )
    ),
  decode: (fromA) =>
    Eff.gen(function* () {
      const procedures = yield* Eff.all(
        fromA.map((procedureTuple: any) =>
          Eff.gen(function* () {
            const [depositBigInt, rewardAccountBytes, governanceActionCDDL, anchorCDDL] = procedureTuple
            const deposit = Coin.make(depositBigInt)
            const rewardAccount = yield* ParseResult.decode(RewardAccount.FromBytes)(rewardAccountBytes)
            const governanceAction = yield* ParseResult.decode(GovernanceAction.FromCDDL)(governanceActionCDDL)
            const anchor = anchorCDDL ? yield* ParseResult.decode(Anchor.FromCDDL)(anchorCDDL) : null

            return new ProposalProcedure({
              deposit,
              rewardAccount,
              governanceAction,
              anchor
            })
          })
        )
      )

      return new ProposalProcedures({ procedures })
    })
})

/**
 * CBOR bytes transformation schema for ProposalProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → ProposalProcedures
  ).annotations({
    identifier: "ProposalProcedures.FromCBORBytes",
    title: "ProposalProcedures from CBOR Bytes",
    description: "Transforms CBOR bytes to ProposalProcedures"
  })

/**
 * CBOR hex transformation schema for ProposalProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → ProposalProcedures
  ).annotations({
    identifier: "ProposalProcedures.FromCBORHex",
    title: "ProposalProcedures from CBOR Hex",
    description: "Transforms CBOR hex string to ProposalProcedures"
  })

/**
 * Check if two ProposalProcedures instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ProposalProcedures, b: ProposalProcedures): boolean =>
  a.procedures.length === b.procedures.length &&
  a.procedures.every((procedureA, index) => {
    const procedureB = b.procedures[index]
    return (
      procedureA.deposit === procedureB.deposit &&
      RewardAccount.equals(procedureA.rewardAccount, procedureB.rewardAccount) &&
      GovernanceAction.equals(procedureA.governanceAction, procedureB.governanceAction) &&
      ((procedureA.anchor === null && procedureB.anchor === null) ||
        (procedureA.anchor !== null &&
          procedureB.anchor !== null &&
          Anchor.equals(procedureA.anchor, procedureB.anchor)))
    )
  })

/**
 * Create a ProposalProcedures instance with validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (procedures: Array<ProposalProcedure>): ProposalProcedures => {
  if (procedures.length === 0) {
    throw new Error("ProposalProcedures must contain at least one procedure")
  }
  return new ProposalProcedures({ procedures })
}

/**
 * Create a single ProposalProcedure.
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeProcedure = (params: {
  deposit: Coin.Coin
  rewardAccount: RewardAccount.RewardAccount
  governanceAction: GovernanceAction.GovernanceAction
  anchor?: Anchor.Anchor | null
}): ProposalProcedure =>
  new ProposalProcedure({
    deposit: params.deposit,
    rewardAccount: params.rewardAccount,
    governanceAction: params.governanceAction,
    anchor: params.anchor ?? null
  })

/**
 * FastCheck arbitrary for ProposalProcedures.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary = FastCheck.record({
  procedures: FastCheck.array(
    FastCheck.record({
      deposit: Coin.arbitrary,
      rewardAccount: RewardAccount.arbitrary,
      governanceAction: GovernanceAction.arbitrary,
      anchor: FastCheck.option(Anchor.arbitrary, { nil: null })
    }).map((params) => new ProposalProcedure(params)),
    { minLength: 1, maxLength: 5 }
  )
}).map((params) => new ProposalProcedures(params))

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse ProposalProcedures from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): ProposalProcedures =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options) as any)

/**
 * Parse ProposalProcedures from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): ProposalProcedures =>
  Eff.runSync(Effect.fromCBORHex(hex, options) as any)

/**
 * Encode ProposalProcedures to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (proposalProcedures: ProposalProcedures, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(proposalProcedures, options) as any)

/**
 * Encode ProposalProcedures to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (proposalProcedures: ProposalProcedures, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(proposalProcedures, options) as any)

// ============================================================================
// Effect Namespace
// ============================================================================

/**
 * Effect-based error handling variants for functions that can fail.
 *
 * @since 2.0.0
 * @category effect
 */
export namespace Effect {
  /**
   * Parse ProposalProcedures from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<ProposalProcedures, ProposalProceduresError, any> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProceduresError({
            message: "Failed to parse ProposalProcedures from bytes",
            cause
          })
      )
    )

  /**
   * Parse ProposalProcedures from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<ProposalProcedures, ProposalProceduresError, any> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProceduresError({
            message: "Failed to parse ProposalProcedures from hex",
            cause
          })
      )
    )

  /**
   * Encode ProposalProcedures to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    proposalProcedures: ProposalProcedures,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, ProposalProceduresError, any> =>
    Schema.encode(FromCBORBytes(options))(proposalProcedures).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProceduresError({
            message: "Failed to encode ProposalProcedures to bytes",
            cause
          })
      )
    )

  /**
   * Encode ProposalProcedures to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    proposalProcedures: ProposalProcedures,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, ProposalProceduresError, any> =>
    Schema.encode(FromCBORHex(options))(proposalProcedures).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProceduresError({
            message: "Failed to encode ProposalProcedures to hex",
            cause
          })
      )
    )
}
