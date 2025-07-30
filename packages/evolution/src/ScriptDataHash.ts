import { Schema } from "effect"

import * as Bytes32 from "./Bytes32.js"

/**
 * ScriptDataHash based on Conway CDDL specification
 *
 * CDDL: script_data_hash = Bytes32
 *
 * This is a hash of data which may affect evaluation of a script.
 * This data consists of:
 *   - The redeemers from the transaction_witness_set (the value of field 5).
 *   - The datums from the transaction_witness_set (the value of field 4).
 *   - The value in the cost_models map corresponding to the script's language
 *     (in field 18 of protocol_param_update.)
 *
 * @since 2.0.0
 * @category model
 */
export const ScriptDataHash = Bytes32.HexSchema.pipe(Schema.brand("ScriptDataHash"))

export type ScriptDataHash = Schema.Schema.Type<typeof ScriptDataHash>
