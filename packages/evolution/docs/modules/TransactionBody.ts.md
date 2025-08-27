---
title: TransactionBody.ts
nav_order: 107
parent: Modules
---

## TransactionBody overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [errors](#errors)
  - [TransactionBodyError (class)](#transactionbodyerror-class)
- [model](#model)
  - [TransactionBody (class)](#transactionbody-class)
    - [toString (method)](#tostring-method)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
- [utils](#utils)
  - [FromCDDL](#fromcddl)
  - [equals](#equals)
  - [isTransactionBody](#istransactionbody)
  - [make](#make)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random TransactionBody instances.
Used for property-based testing to generate valid test data.

Generates basic TransactionBody instances with required fields (inputs, outputs, fee)
and optionally includes some other common fields.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<TransactionBody>
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a TransactionBody to CBOR bytes.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const toCBORBytes: (input: TransactionBody, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a TransactionBody to CBOR hex string.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const toCBORHex: (input: TransactionBody, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# errors

## TransactionBodyError (class)

Error class for TransactionBody related operations.

**Signature**

```ts
export declare class TransactionBodyError
```

Added in v2.0.0

# model

## TransactionBody (class)

TransactionBody

```
transaction_body =
  {   0  : set<transaction_input>
  ,   1  : [* transaction_output]
  ,   2  : coin
  , ? 3  : slot_no
  , ? 4  : certificates
  , ? 5  : withdrawals
  , ? 7  : auxiliary_data_hash
  , ? 8  : slot_no
  , ? 9  : mint
  , ? 11 : script_data_hash
  , ? 13 : nonempty_set<transaction_input>
  , ? 14 : required_signers
  , ? 15 : network_id
  , ? 16 : transaction_output
  , ? 17 : coin
  , ? 18 : nonempty_set<transaction_input>
  , ? 19 : voting_procedures
  , ? 20 : proposal_procedures
  , ? 21 : coin
  , ? 22 : positive_coin
  }
```

**Signature**

```ts
export declare class TransactionBody
```

Added in v2.0.0

### toString (method)

**Signature**

```ts
toString(): string
```

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
[Symbol.for("nodejs.util.inspect.custom")](): string
```

# parsing

## fromCBORBytes

Parse a TransactionBody from CBOR bytes.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => TransactionBody
```

Added in v2.0.0

## fromCBORHex

Parse a TransactionBody from CBOR hex string.
Default options use CML_DEFAULT_OPTIONS for CDDL/CML parity.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => TransactionBody
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for TransactionBody struct structure.

**Signature**

```ts
export declare const CDDLSchema: Schema.MapFromSelf<
  typeof Schema.BigIntFromSelf,
  Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for TransactionBody.
Transforms between CBOR bytes and TransactionBody using Conway CDDL specification.

**Signature**

```ts
export declare const FromCBORBytes: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  any
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for TransactionBody.
Transforms between CBOR hex string and TransactionBody using Conway CDDL specification.

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<
    Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >
  >,
  any
>
```

Added in v2.0.0

# utils

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.MapFromSelf<typeof Schema.BigIntFromSelf, Schema.Schema<CBOR.CBOR, CBOR.CBOR, never>>,
  Schema.SchemaClass<TransactionBody, TransactionBody, never>,
  never
>
```

## equals

**Signature**

```ts
export declare const equals: (self: TransactionBody, that: TransactionBody) => boolean
```

## isTransactionBody

**Signature**

```ts
export declare const isTransactionBody: (u: unknown, overrideOptions?: ParseOptions | number) => u is TransactionBody
```

## make

**Signature**

```ts
export declare const make: (
  props: {
    readonly withdrawals?: Withdrawals.Withdrawals | undefined
    readonly networkId?: (number & Brand<"NetworkId">) | undefined
    readonly mint?: (Map<PolicyId, Map<AssetName, bigint & Brand<"NonZeroInt64">>> & Brand<"Mint">) | undefined
    readonly fee: bigint
    readonly inputs: readonly TransactionInput.TransactionInput[]
    readonly outputs: readonly (
      | TransactionOutput.ShelleyTransactionOutput
      | TransactionOutput.BabbageTransactionOutput
    )[]
    readonly ttl?: bigint | undefined
    readonly certificates?:
      | readonly [
          (
            | Certificate.StakeRegistration
            | Certificate.StakeDeregistration
            | Certificate.StakeDelegation
            | Certificate.PoolRegistration
            | Certificate.PoolRetirement
            | Certificate.RegCert
            | Certificate.UnregCert
            | Certificate.VoteDelegCert
            | Certificate.StakeVoteDelegCert
            | Certificate.StakeRegDelegCert
            | Certificate.VoteRegDelegCert
            | Certificate.StakeVoteRegDelegCert
            | Certificate.AuthCommitteeHotCert
            | Certificate.ResignCommitteeColdCert
            | Certificate.RegDrepCert
            | Certificate.UnregDrepCert
            | Certificate.UpdateDrepCert
          ),
          ...(
            | Certificate.StakeRegistration
            | Certificate.StakeDeregistration
            | Certificate.StakeDelegation
            | Certificate.PoolRegistration
            | Certificate.PoolRetirement
            | Certificate.RegCert
            | Certificate.UnregCert
            | Certificate.VoteDelegCert
            | Certificate.StakeVoteDelegCert
            | Certificate.StakeRegDelegCert
            | Certificate.VoteRegDelegCert
            | Certificate.StakeVoteRegDelegCert
            | Certificate.AuthCommitteeHotCert
            | Certificate.ResignCommitteeColdCert
            | Certificate.RegDrepCert
            | Certificate.UnregDrepCert
            | Certificate.UpdateDrepCert
          )[]
        ]
      | undefined
    readonly auxiliaryDataHash?: AuxiliaryDataHash.AuxiliaryDataHash | undefined
    readonly validityIntervalStart?: bigint | undefined
    readonly scriptDataHash?: ScriptDataHash.ScriptDataHash | undefined
    readonly collateralInputs?:
      | readonly [TransactionInput.TransactionInput, ...TransactionInput.TransactionInput[]]
      | undefined
    readonly requiredSigners?: readonly [KeyHash.KeyHash, ...KeyHash.KeyHash[]] | undefined
    readonly collateralReturn?:
      | TransactionOutput.ShelleyTransactionOutput
      | TransactionOutput.BabbageTransactionOutput
      | undefined
    readonly totalCollateral?: bigint | undefined
    readonly referenceInputs?:
      | readonly [TransactionInput.TransactionInput, ...TransactionInput.TransactionInput[]]
      | undefined
    readonly votingProcedures?: VotingProcedures.VotingProcedures | undefined
    readonly proposalProcedures?: ProposalProcedures.ProposalProcedures | undefined
    readonly currentTreasuryValue?: bigint | undefined
    readonly donation?: bigint | undefined
  },
  options?: Schema.MakeOptions | undefined
) => TransactionBody
```
