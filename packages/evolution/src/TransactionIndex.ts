import type { Schema } from "effect"

import * as Numeric from "./Numeric.js"

/**
 * CDDL: transaction_index = uint .size 2
 *
 * @since 2.0.0
 * @category model
 */
export const TransactionIndexSchema = Numeric.Uint16Schema.annotations({
  identifier: "TransactionIndex"
})

export type TransactionIndex = Schema.Schema.Type<typeof TransactionIndexSchema>
