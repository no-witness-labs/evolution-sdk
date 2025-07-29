import { Schema } from "effect"

/**
 * ProposalProcedures based on Conway CDDL specification
 *
 * ```
 * CDDL: proposal_procedures = nonempty_set<proposal_procedure>
 * ```
 *
 * This is a non-empty set of proposal procedures.
 *
 * @since 2.0.0
 * @category model
 */

// TODO: Implement when ProposalProcedure is available
export const ProposalProcedures = Schema.Unknown

export type ProposalProcedures = Schema.Schema.Type<typeof ProposalProcedures>
