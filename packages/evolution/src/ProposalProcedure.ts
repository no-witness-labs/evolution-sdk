import { Data, Effect as Eff, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as GovernanceAction from "./GovernanceAction.js"
import * as RewardAccount from "./RewardAccount.js"

/**
 * Error class for ProposalProcedure related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ProposalProcedureError extends Data.TaggedError("ProposalProcedureError")<{
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
 * CDDL schema for ProposalProcedure tuple structure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Tuple(
  CBOR.Integer, // deposit: coin
  CBOR.ByteArray, // reward_account (raw bytes)
  Schema.encodedSchema(GovernanceAction.CDDLSchema), // governance_action using proper CDDL schema
  Schema.NullOr(Anchor.CDDLSchema) // anchor / null
)

/**
 * CDDL transformation schema for individual ProposalProcedure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(ProposalProcedure), {
  strict: true,
  encode: (procedure) =>
    Eff.gen(function* () {
      const depositBigInt = BigInt(procedure.deposit)
      const rewardAccountBytes = yield* ParseResult.encode(RewardAccount.FromBytes)(procedure.rewardAccount)
      const governanceActionCDDL = yield* ParseResult.encode(GovernanceAction.FromCDDL)(procedure.governanceAction)
      const anchorCDDL = procedure.anchor ? yield* ParseResult.encode(Anchor.FromCDDL)(procedure.anchor) : null
      return [depositBigInt, rewardAccountBytes, governanceActionCDDL, anchorCDDL] as const
    }),
  decode: (procedureTuple) =>
    Eff.gen(function* () {
      const [depositBigInt, rewardAccountBytes, governanceActionCDDL, anchorCDDL] = procedureTuple as any
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
})

/**
 * CBOR bytes transformation schema for individual ProposalProcedure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → ProposalProcedure
  ).annotations({
    identifier: "ProposalProcedure.FromCBORBytes",
    title: "ProposalProcedure from CBOR Bytes",
    description: "Transforms CBOR bytes to ProposalProcedure"
  })

/**
 * CBOR hex transformation schema for individual ProposalProcedure.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Bytes.FromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → ProposalProcedure
  ).annotations({
    identifier: "ProposalProcedure.FromCBORHex",
    title: "ProposalProcedure from CBOR Hex",
    description: "Transforms CBOR hex string to ProposalProcedure"
  })

/**
 * Check if two ProposalProcedure instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: ProposalProcedure, b: ProposalProcedure): boolean =>
  a.deposit === b.deposit &&
  RewardAccount.equals(a.rewardAccount, b.rewardAccount) &&
  GovernanceAction.equals(a.governanceAction, b.governanceAction) &&
  ((a.anchor === null && b.anchor === null) ||
    (a.anchor !== null && b.anchor !== null && Anchor.equals(a.anchor, b.anchor)))

/**
 * Create a single ProposalProcedure.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (params: {
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

// ============================================================================
// Root Functions
// ============================================================================

/**
 * Parse individual ProposalProcedure from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): ProposalProcedure =>
  Eff.runSync(Effect.fromCBORBytes(bytes, options))

/**
 * Parse individual ProposalProcedure from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): ProposalProcedure =>
  Eff.runSync(Effect.fromCBORHex(hex, options))

/**
 * Encode individual ProposalProcedure to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (procedure: ProposalProcedure, options?: CBOR.CodecOptions): Uint8Array =>
  Eff.runSync(Effect.toCBORBytes(procedure, options))

/**
 * Encode individual ProposalProcedure to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (procedure: ProposalProcedure, options?: CBOR.CodecOptions): string =>
  Eff.runSync(Effect.toCBORHex(procedure, options))

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
   * Parse ProposalProcedure from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = (
    bytes: Uint8Array,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<ProposalProcedure, ProposalProcedureError> =>
    Schema.decode(FromCBORBytes(options))(bytes).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProcedureError({
            message: "Failed to parse ProposalProcedure from bytes",
            cause
          })
      )
    )

  /**
   * Parse ProposalProcedure from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = (
    hex: string,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<ProposalProcedure, ProposalProcedureError> =>
    Schema.decode(FromCBORHex(options))(hex).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProcedureError({
            message: "Failed to parse ProposalProcedure from hex",
            cause
          })
      )
    )

  /**
   * Encode ProposalProcedure to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = (
    procedure: ProposalProcedure,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<Uint8Array, ProposalProcedureError> =>
    Schema.encode(FromCBORBytes(options))(procedure).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProcedureError({
            message: "Failed to encode ProposalProcedure to bytes",
            cause
          })
      )
    )

  /**
   * Encode ProposalProcedure to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = (
    procedure: ProposalProcedure,
    options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS
  ): Eff.Effect<string, ProposalProcedureError> =>
    Schema.encode(FromCBORHex(options))(procedure).pipe(
      Eff.mapError(
        (cause) =>
          new ProposalProcedureError({
            message: "Failed to encode ProposalProcedure to hex",
            cause
          })
      )
    )
}
