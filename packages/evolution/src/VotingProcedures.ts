import { Schema } from "effect"

/**
 * VotingProcedures based on Conway CDDL specification
 *
 * CDDL: voting_procedures = {+ voter => {+ gov_action_id => voting_procedure}}
 *
 * This is a complex nested map structure that we'll implement gradually
 * as we create the required sub-types.
 *
 * @since 2.0.0
 * @category model
 */

// TODO: Implement when Voter, GovActionId, and VotingProcedure are available
export const VotingProcedures = Schema.Unknown

export type VotingProcedures = Schema.Schema.Type<typeof VotingProcedures>
