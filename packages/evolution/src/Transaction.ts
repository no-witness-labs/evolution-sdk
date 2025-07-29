import { Schema } from "effect"

import * as TransactionBody from "./TransactionBody.js"
// import * as TransactionWitnessSet from "./TransactionWitnessSet.js";
// import * as AuxiliaryData from "./AuxiliaryData.js";

/**
 * Transaction based on Conway CDDL specification
 *
 * CDDL: transaction =
 *   [transaction_body, transaction_witness_set, bool, auxiliary_data / nil]
 *
 * @since 2.0.0
 * @category model
 */
//TODO: Implement TransactionWitnessSet and AuxiliaryData when available
export class TransactionClass extends Schema.TaggedClass<TransactionClass>()("Transaction", {
  body: TransactionBody.TransactionBody,
  // witnessSet: TransactionWitnessSet.TransactionWitnessSet,
  isValid: Schema.Boolean
  // auxiliaryData: Schema.Union(
  //   AuxiliaryData.AuxiliaryData,
  //   Schema.Null,
  // ),
}) {}

export type Transaction = Schema.Schema.Type<typeof TransactionClass>
