import { Schema } from "effect"

import * as AuxiliaryDataHash from "./AuxiliaryDataHash.js"
import * as Certificate from "./Certificate.js"
import * as Coin from "./Coin.js"
import * as Hash28 from "./Hash28.js"
import * as Mint from "./Mint.js"
import * as NetworkId from "./NetworkId.js"
import * as PositiveCoin from "./PositiveCoin.js"
import * as ProposalProcedures from "./ProposalProcedures.js"
import * as ScriptDataHash from "./ScriptDataHash.js"
import * as TransactionInput from "./TransactionInput.js"
import * as TransactionOutput from "./TransactionOutput.js"
import * as VotingProcedures from "./VotingProcedures.js"
import * as Withdrawals from "./Withdrawals.js"

/**
 * TransactionBody based on Conway CDDL specification
 *
 * CDDL: transaction_body =
 *   {   0  : set<transaction_input>
 *   ,   1  : [* transaction_output]
 *   ,   2  : coin
 *   , ? 3  : slot_no
 *   , ? 4  : certificates
 *   , ? 5  : withdrawals
 *   , ? 7  : auxiliary_data_hash
 *   , ? 8  : slot_no
 *   , ? 9  : mint
 *   , ? 11 : script_data_hash
 *   , ? 13 : nonempty_set<transaction_input>
 *   , ? 14 : required_signers
 *   , ? 15 : network_id
 *   , ? 16 : transaction_output
 *   , ? 17 : coin
 *   , ? 18 : nonempty_set<transaction_input>
 *   , ? 19 : voting_procedures
 *   , ? 20 : proposal_procedures
 *   , ? 21 : coin
 *   , ? 22 : positive_coin
 *   }
 *
 * @since 2.0.0
 * @category model
 */
export class TransactionBody extends Schema.TaggedClass<TransactionBody>()("TransactionBody", {
  inputs: Schema.NonEmptyArray(TransactionInput.TransactionInput), // 0
  outputs: Schema.Array(TransactionOutput.TransactionOutput), // 1
  fee: Coin.CoinSchema, // 2
  ttl: Schema.optional(Schema.BigIntFromSelf), // 3 - slot_no
  certificates: Schema.optional(Schema.NonEmptyArray(Certificate.Certificate)), // 4
  withdrawals: Schema.optional(Withdrawals.Withdrawals), // 5
  auxiliaryDataHash: Schema.optional(AuxiliaryDataHash.AuxiliaryDataHash), // 7
  validityIntervalStart: Schema.optional(Schema.BigIntFromSelf), // 8 - slot_no
  mint: Schema.optional(Mint.Mint), // 9
  scriptDataHash: Schema.optional(ScriptDataHash.ScriptDataHash), // 11
  collateralInputs: Schema.optional(Schema.NonEmptyArray(TransactionInput.TransactionInput)), // 13
  requiredSigners: Schema.optional(Schema.NonEmptyArray(Hash28.HexSchema)), // 14
  networkId: Schema.optional(NetworkId.NetworkId), // 15
  collateralReturn: Schema.optional(TransactionOutput.TransactionOutput), // 16
  totalCollateral: Schema.optional(Coin.CoinSchema), // 17
  referenceInputs: Schema.optional(Schema.NonEmptyArray(TransactionInput.TransactionInput)), // 18
  votingProcedures: Schema.optional(VotingProcedures.VotingProcedures), // 19
  proposalProcedures: Schema.optional(ProposalProcedures.ProposalProcedures), // 20
  currentTreasuryValue: Schema.optional(Coin.CoinSchema), // 21
  donation: Schema.optional(PositiveCoin.PositiveCoinSchema) // 22
}) {}

//TODO: Implement CBORHexSchema when BytesSchema is complete
