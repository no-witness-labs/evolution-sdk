import { Schema } from "effect"

import * as Header from "./Header.js"
import * as TransactionBody from "./TransactionBody.js"
// import * as TransactionWitnessSet from "./TransactionWitnessSet.js";
// import * as AuxiliaryData from "./AuxiliaryData.js";
import * as TransactionIndex from "./TransactionIndex.js"

/**
 * Block based on Conway CDDL specification
 *
 * ```
 * CDDL: block =
 *   [ header
 *   , transaction_bodies       : [* transaction_body]
 *   , transaction_witness_sets : [* transaction_witness_set]
 *   , auxiliary_data_set       : {* transaction_index => auxiliary_data}
 *   , invalid_transactions     : [* transaction_index]
 *   ]
 * ```
 *
 * Valid blocks must also satisfy the following two constraints:
 * 1. the length of transaction_bodies and transaction_witness_sets
 *    must be the same
 * 2. every transaction_index must be strictly smaller than the
 *    length of transaction_bodies
 *
 * @since 2.0.0
 * @category model
 */
export class BlockClass extends Schema.TaggedClass<BlockClass>()("Block", {
  header: Header.Header,
  transactionBodies: Schema.Array(TransactionBody.TransactionBody),
  // transactionWitnessSets: Schema.Array(TransactionWitnessSet.TransactionWitnessSet),
  // auxiliaryDataSet: Schema.Record({
  //   key: TransactionIndex.TransactionIndexSchema,
  //   value: AuxiliaryData.AuxiliaryData,
  // }),
  invalidTransactions: Schema.Array(TransactionIndex.TransactionIndexSchema)
}) {}

export type Block = Schema.Schema.Type<typeof BlockClass>
