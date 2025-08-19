import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as Anchor from "./Anchor.js"
import * as Bytes from "./Bytes.js"
import * as CBOR from "./CBOR.js"
import * as Coin from "./Coin.js"
import * as Function from "./Function.js"
import * as GovernanceAction from "./GovernanceAction.js"
import * as ProposalProcedure from "./ProposalProcedure.js"
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
  procedures: Schema.Array(ProposalProcedure.ProposalProcedure).pipe(
    Schema.filter((arr) => arr.length > 0, {
      message: () => "ProposalProcedures must contain at least one procedure"
    })
  )
}) {}

/**
 * CDDL schema for ProposalProcedures that produces CBOR-compatible types.
 *
 * @since 2.0.0
 * @category schemas
 */
export const CDDLSchema = Schema.Array(ProposalProcedure.CDDLSchema)

/**
 * CDDL transformation schema for ProposalProcedures.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(ProposalProcedures), {
  strict: true,
  encode: (toA) =>
    Eff.all(toA.procedures.map((procedure) => ParseResult.encode(ProposalProcedure.FromCDDL)(procedure))),
  decode: (fromA) =>
    Eff.gen(function* () {
      const procedures = yield* Eff.all(
        fromA.map((procedureTuple) => ParseResult.decode(ProposalProcedure.FromCDDL)(procedureTuple))
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
    return ProposalProcedure.equals(procedureA, procedureB)
  })

/**
 * Create a ProposalProcedures instance with validation.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...args: ConstructorParameters<typeof ProposalProcedures>) => new ProposalProcedures(...args)

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
    }).map((params) => ProposalProcedure.make(params)),
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
export const fromCBORBytes = Function.makeCBORDecodeSync(
  FromCDDL,
  ProposalProceduresError,
  "ProposalProcedures.fromCBORBytes"
)

/**
 * Parse ProposalProcedures from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = Function.makeCBORDecodeHexSync(
  FromCDDL,
  ProposalProceduresError,
  "ProposalProcedures.fromCBORHex"
)

/**
 * Encode ProposalProcedures to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = Function.makeCBOREncodeSync(
  FromCDDL,
  ProposalProceduresError,
  "ProposalProcedures.toCBORBytes"
)

/**
 * Encode ProposalProcedures to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = Function.makeCBOREncodeHexSync(
  FromCDDL,
  ProposalProceduresError,
  "ProposalProcedures.toCBORHex"
)

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
   * Parse ProposalProcedures from CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORBytes = Function.makeCBORDecodeEither(FromCDDL, ProposalProceduresError)

  /**
   * Parse ProposalProcedures from CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category parsing
   */
  export const fromCBORHex = Function.makeCBORDecodeHexEither(FromCDDL, ProposalProceduresError)

  /**
   * Encode ProposalProcedures to CBOR bytes with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORBytes = Function.makeCBOREncodeEither(FromCDDL, ProposalProceduresError)

  /**
   * Encode ProposalProcedures to CBOR hex string with Effect error handling.
   *
   * @since 2.0.0
   * @category encoding
   */
  export const toCBORHex = Function.makeCBOREncodeHexEither(FromCDDL, ProposalProceduresError)
}
