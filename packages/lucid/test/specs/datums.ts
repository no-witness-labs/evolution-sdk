import { paymentCredentialOf, validatorToAddress } from "@evolution-sdk/utils";
import { Effect } from "effect";
import { User } from "./services";
import { handleSignSubmitWithoutValidation, withLogRetry } from "./utils";
import { Data } from "@evolution-sdk/plutus";
import { SpendingValidator } from "@evolution-sdk/core-types";

const alwaysSucceedScript: SpendingValidator = {
  type: "PlutusV2",
  script: "49480100002221200101",
};

export const payWithAsHashDatum = Effect.gen(function* ($) {
  const { user } = yield* User;
  const scriptAddress = validatorToAddress("Preprod", alwaysSucceedScript);
  const signBuilder = yield* user
    .newTx()
    .pay.ToContract(
      scriptAddress,
      { kind: "asHash", value: Data.to("31313131") },
      { lovelace: 5000000n },
    )
    .completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);
