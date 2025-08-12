import { Schema } from "effect"

import * as AuxiliaryData from "./AuxiliaryData.js";
import * as TransactionBody from "./TransactionBody.js"
import * as TransactionWitnessSet from "./TransactionWitnessSet.js";

/**
 * Transaction based on Conway CDDL specification
 *
 * CDDL: transaction =
 *   [transaction_body, transaction_witness_set, bool, auxiliary_data / nil]
 *
 * @since 2.0.0
 * @category model
 */
export class Transaction extends Schema.TaggedClass<Transaction>()("Transaction", {
  body: TransactionBody.TransactionBody,
  witnessSet: TransactionWitnessSet.TransactionWitnessSet,
  isValid: Schema.Boolean,
  auxiliaryData: Schema.Union(
    AuxiliaryData.AuxiliaryData,
    Schema.Null,
  ),
}) {}

