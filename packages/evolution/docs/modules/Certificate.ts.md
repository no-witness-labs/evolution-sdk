---
title: Certificate.ts
nav_order: 30
parent: Modules
---

## Certificate overview

---

<h2 class="text-delta">Table of contents</h2>

- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [CertificateError (class)](#certificateerror-class)
- [model](#model)
  - [Certificate (type alias)](#certificate-type-alias)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [Certificate](#certificate)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)
- [utils](#utils)
  - [AuthCommitteeHotCert (class)](#authcommitteehotcert-class)
  - [CDDLSchema](#cddlschema)
  - [PoolRegistration (class)](#poolregistration-class)
  - [PoolRetirement (class)](#poolretirement-class)
  - [RegCert (class)](#regcert-class)
  - [RegDrepCert (class)](#regdrepcert-class)
  - [ResignCommitteeColdCert (class)](#resigncommitteecoldcert-class)
  - [StakeDelegation (class)](#stakedelegation-class)
  - [StakeDeregistration (class)](#stakederegistration-class)
  - [StakeRegDelegCert (class)](#stakeregdelegcert-class)
  - [StakeRegistration (class)](#stakeregistration-class)
  - [StakeVoteDelegCert (class)](#stakevotedelegcert-class)
  - [StakeVoteRegDelegCert (class)](#stakevoteregdelegcert-class)
  - [UnregCert (class)](#unregcert-class)
  - [UnregDrepCert (class)](#unregdrepcert-class)
  - [UpdateDrepCert (class)](#updatedrepcert-class)
  - [VoteDelegCert (class)](#votedelegcert-class)
  - [VoteRegDelegCert (class)](#voteregdelegcert-class)

---

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Convert a Certificate to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (
  input:
    | StakeRegistration
    | StakeDeregistration
    | StakeDelegation
    | PoolRegistration
    | PoolRetirement
    | RegCert
    | UnregCert
    | VoteDelegCert
    | StakeVoteDelegCert
    | StakeRegDelegCert
    | VoteRegDelegCert
    | StakeVoteRegDelegCert
    | AuthCommitteeHotCert
    | ResignCommitteeColdCert
    | RegDrepCert
    | UnregDrepCert
    | UpdateDrepCert,
  options?: CBOR.CodecOptions
) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert a Certificate to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (
  input:
    | StakeRegistration
    | StakeDeregistration
    | StakeDelegation
    | PoolRegistration
    | PoolRetirement
    | RegCert
    | UnregCert
    | VoteDelegCert
    | StakeVoteDelegCert
    | StakeRegDelegCert
    | VoteRegDelegCert
    | StakeVoteRegDelegCert
    | AuthCommitteeHotCert
    | ResignCommitteeColdCert
    | RegDrepCert
    | UnregDrepCert
    | UpdateDrepCert,
  options?: CBOR.CodecOptions
) => string
```

Added in v2.0.0

# equality

## equals

Check if two Certificate instances are equal.

**Signature**

```ts
export declare const equals: (a: Certificate, b: Certificate) => boolean
```

Added in v2.0.0

# errors

## CertificateError (class)

Error class for Certificate related operations.

**Signature**

```ts
export declare class CertificateError
```

Added in v2.0.0

# model

## Certificate (type alias)

Type alias for Certificate.

**Signature**

```ts
export type Certificate = typeof Certificate.Type
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse a Certificate from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (
  bytes: Uint8Array,
  options?: CBOR.CodecOptions
) =>
  | StakeRegistration
  | StakeDeregistration
  | StakeDelegation
  | PoolRegistration
  | PoolRetirement
  | RegCert
  | UnregCert
  | VoteDelegCert
  | StakeVoteDelegCert
  | StakeRegDelegCert
  | VoteRegDelegCert
  | StakeVoteRegDelegCert
  | AuthCommitteeHotCert
  | ResignCommitteeColdCert
  | RegDrepCert
  | UnregDrepCert
  | UpdateDrepCert
```

Added in v2.0.0

## fromCBORHex

Parse a Certificate from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (
  hex: string,
  options?: CBOR.CodecOptions
) =>
  | StakeRegistration
  | StakeDeregistration
  | StakeDelegation
  | PoolRegistration
  | PoolRetirement
  | RegCert
  | UnregCert
  | VoteDelegCert
  | StakeVoteDelegCert
  | StakeRegDelegCert
  | VoteRegDelegCert
  | StakeVoteRegDelegCert
  | AuthCommitteeHotCert
  | ResignCommitteeColdCert
  | RegDrepCert
  | UnregDrepCert
  | UpdateDrepCert
```

Added in v2.0.0

# predicates

## is

Check if the given value is a valid Certificate.

**Signature**

```ts
export declare const is: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is
  | StakeRegistration
  | StakeDeregistration
  | StakeDelegation
  | PoolRegistration
  | PoolRetirement
  | RegCert
  | UnregCert
  | VoteDelegCert
  | StakeVoteDelegCert
  | StakeRegDelegCert
  | VoteRegDelegCert
  | StakeVoteRegDelegCert
  | AuthCommitteeHotCert
  | ResignCommitteeColdCert
  | RegDrepCert
  | UnregDrepCert
  | UpdateDrepCert
```

Added in v2.0.0

# schemas

## Certificate

Certificate union schema based on Conway CDDL specification

CDDL: certificate =
[
stake_registration
// stake_deregistration
// stake_delegation
// pool_registration
// pool_retirement
// reg_cert
// unreg_cert
// vote_deleg_cert
// stake_vote_deleg_cert
// stake_reg_deleg_cert
// vote_reg_deleg_cert
// stake_vote_reg_deleg_cert
// auth_committee_hot_cert
// resign_committee_cold_cert
// reg_drep_cert
// unreg_drep_cert
// update_drep_cert
]

stake_registration = (0, stake_credential)
stake_deregistration = (1, stake_credential)
stake_delegation = (2, stake_credential, pool_keyhash)
pool_registration = (3, pool_params)
pool_retirement = (4, pool_keyhash, epoch_no)
reg_cert = (7, stake_credential, coin)
unreg_cert = (8, stake_credential, coin)
vote_deleg_cert = (9, stake_credential, drep)
stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
vote_reg_deleg_cert = (12, stake_credential, drep, coin)
stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
unreg_drep_cert = (17, drep_credential, coin)
update_drep_cert = (18, drep_credential, anchor/ nil)

**Signature**

```ts
export declare const Certificate: Schema.Union<
  [
    typeof StakeRegistration,
    typeof StakeDeregistration,
    typeof StakeDelegation,
    typeof PoolRegistration,
    typeof PoolRetirement,
    typeof RegCert,
    typeof UnregCert,
    typeof VoteDelegCert,
    typeof StakeVoteDelegCert,
    typeof StakeRegDelegCert,
    typeof VoteRegDelegCert,
    typeof StakeVoteRegDelegCert,
    typeof AuthCommitteeHotCert,
    typeof ResignCommitteeColdCert,
    typeof RegDrepCert,
    typeof UnregDrepCert,
    typeof UpdateDrepCert
  ]
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for Certificate.

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
  Schema.transformOrFail<
    Schema.Union<
      [
        Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
        Schema.Tuple2<Schema.Literal<[1n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
        Schema.Tuple<
          [
            Schema.Literal<[2n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.Uint8ArrayFromSelf
          ]
        >,
        Schema.Tuple2<
          Schema.Literal<[3n]>,
          Schema.Tuple<
            [
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.BigIntFromSelf,
              typeof Schema.BigIntFromSelf,
              Schema.TaggedStruct<
                "Tag",
                {
                  tag: Schema.Literal<[30]>
                  value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                }
              >,
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
              Schema.Array$<
                Schema.SchemaClass<
                  readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
                  readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
                  never
                >
              >,
              Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
            ]
          >
        >,
        Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
        Schema.Tuple<
          [
            Schema.Literal<[7n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[8n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[9n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple<[Schema.Literal<[2n]>]>,
                Schema.Tuple<[Schema.Literal<[3n]>]>
              ]
            >
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[10n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.Uint8ArrayFromSelf,
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple<[Schema.Literal<[2n]>]>,
                Schema.Tuple<[Schema.Literal<[3n]>]>
              ]
            >
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[11n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.Uint8ArrayFromSelf,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[12n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple<[Schema.Literal<[2n]>]>,
                Schema.Tuple<[Schema.Literal<[3n]>]>
              ]
            >,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[13n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.Uint8ArrayFromSelf,
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple<[Schema.Literal<[2n]>]>,
                Schema.Tuple<[Schema.Literal<[3n]>]>
              ]
            >,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[14n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[15n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[16n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.BigIntFromSelf,
            Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[17n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            typeof Schema.BigIntFromSelf
          ]
        >,
        Schema.Tuple<
          [
            Schema.Literal<[18n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
          ]
        >
      ]
    >,
    Schema.SchemaClass<
      | StakeRegistration
      | StakeDeregistration
      | StakeDelegation
      | PoolRegistration
      | PoolRetirement
      | RegCert
      | UnregCert
      | VoteDelegCert
      | StakeVoteDelegCert
      | StakeRegDelegCert
      | VoteRegDelegCert
      | StakeVoteRegDelegCert
      | AuthCommitteeHotCert
      | ResignCommitteeColdCert
      | RegDrepCert
      | UnregDrepCert
      | UpdateDrepCert,
      | StakeRegistration
      | StakeDeregistration
      | StakeDelegation
      | PoolRegistration
      | PoolRetirement
      | RegCert
      | UnregCert
      | VoteDelegCert
      | StakeVoteDelegCert
      | StakeRegDelegCert
      | VoteRegDelegCert
      | StakeVoteRegDelegCert
      | AuthCommitteeHotCert
      | ResignCommitteeColdCert
      | RegDrepCert
      | UnregDrepCert
      | UpdateDrepCert,
      never
    >,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for Certificate.

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Union<
        [
          Schema.Tuple2<
            Schema.Literal<[0n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          >,
          Schema.Tuple2<
            Schema.Literal<[1n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          >,
          Schema.Tuple<
            [
              Schema.Literal<[2n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf
            ]
          >,
          Schema.Tuple2<
            Schema.Literal<[3n]>,
            Schema.Tuple<
              [
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.Uint8ArrayFromSelf,
                typeof Schema.BigIntFromSelf,
                typeof Schema.BigIntFromSelf,
                Schema.TaggedStruct<
                  "Tag",
                  {
                    tag: Schema.Literal<[30]>
                    value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
                  }
                >,
                typeof Schema.Uint8ArrayFromSelf,
                Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
                Schema.Array$<
                  Schema.SchemaClass<
                    | readonly [0n, bigint | null, any, any]
                    | readonly [1n, bigint | null, string]
                    | readonly [2n, string],
                    | readonly [0n, bigint | null, any, any]
                    | readonly [1n, bigint | null, string]
                    | readonly [2n, string],
                    never
                  >
                >,
                Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
              ]
            >
          >,
          Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
          Schema.Tuple<
            [
              Schema.Literal<[7n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[8n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[9n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[10n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[11n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[12n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[13n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.Uint8ArrayFromSelf,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[14n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[15n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[16n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[17n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              typeof Schema.BigIntFromSelf
            ]
          >,
          Schema.Tuple<
            [
              Schema.Literal<[18n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
            ]
          >
        ]
      >,
      Schema.SchemaClass<
        | StakeRegistration
        | StakeDeregistration
        | StakeDelegation
        | PoolRegistration
        | PoolRetirement
        | RegCert
        | UnregCert
        | VoteDelegCert
        | StakeVoteDelegCert
        | StakeRegDelegCert
        | VoteRegDelegCert
        | StakeVoteRegDelegCert
        | AuthCommitteeHotCert
        | ResignCommitteeColdCert
        | RegDrepCert
        | UnregDrepCert
        | UpdateDrepCert,
        | StakeRegistration
        | StakeDeregistration
        | StakeDelegation
        | PoolRegistration
        | PoolRetirement
        | RegCert
        | UnregCert
        | VoteDelegCert
        | StakeVoteDelegCert
        | StakeRegDelegCert
        | VoteRegDelegCert
        | StakeVoteRegDelegCert
        | AuthCommitteeHotCert
        | ResignCommitteeColdCert
        | RegDrepCert
        | UnregDrepCert
        | UpdateDrepCert,
        never
      >,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for Certificate based on Conway specification.

Transforms between CBOR tuple representation and Certificate union.
Each certificate type is encoded as [type_id, ...fields]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
      Schema.Tuple2<Schema.Literal<[1n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
      Schema.Tuple<
        [
          Schema.Literal<[2n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.Uint8ArrayFromSelf
        ]
      >,
      Schema.Tuple2<
        Schema.Literal<[3n]>,
        Schema.Tuple<
          [
            typeof Schema.Uint8ArrayFromSelf,
            typeof Schema.Uint8ArrayFromSelf,
            typeof Schema.BigIntFromSelf,
            typeof Schema.BigIntFromSelf,
            Schema.TaggedStruct<
              "Tag",
              {
                tag: Schema.Literal<[30]>
                value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
              }
            >,
            typeof Schema.Uint8ArrayFromSelf,
            Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
            Schema.Array$<
              Schema.SchemaClass<
                readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
                readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
                never
              >
            >,
            Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
          ]
        >
      >,
      Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
      Schema.Tuple<
        [
          Schema.Literal<[7n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[8n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[9n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple<[Schema.Literal<[2n]>]>,
              Schema.Tuple<[Schema.Literal<[3n]>]>
            ]
          >
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[10n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple<[Schema.Literal<[2n]>]>,
              Schema.Tuple<[Schema.Literal<[3n]>]>
            ]
          >
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[11n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[12n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple<[Schema.Literal<[2n]>]>,
              Schema.Tuple<[Schema.Literal<[3n]>]>
            ]
          >,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[13n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple<[Schema.Literal<[2n]>]>,
              Schema.Tuple<[Schema.Literal<[3n]>]>
            ]
          >,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[14n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[15n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[16n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.BigIntFromSelf,
          Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[17n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          typeof Schema.BigIntFromSelf
        ]
      >,
      Schema.Tuple<
        [
          Schema.Literal<[18n]>,
          Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        ]
      >
    ]
  >,
  Schema.SchemaClass<
    | StakeRegistration
    | StakeDeregistration
    | StakeDelegation
    | PoolRegistration
    | PoolRetirement
    | RegCert
    | UnregCert
    | VoteDelegCert
    | StakeVoteDelegCert
    | StakeRegDelegCert
    | VoteRegDelegCert
    | StakeVoteRegDelegCert
    | AuthCommitteeHotCert
    | ResignCommitteeColdCert
    | RegDrepCert
    | UnregDrepCert
    | UpdateDrepCert,
    | StakeRegistration
    | StakeDeregistration
    | StakeDelegation
    | PoolRegistration
    | PoolRetirement
    | RegCert
    | UnregCert
    | VoteDelegCert
    | StakeVoteDelegCert
    | StakeRegDelegCert
    | VoteRegDelegCert
    | StakeVoteRegDelegCert
    | AuthCommitteeHotCert
    | ResignCommitteeColdCert
    | RegDrepCert
    | UnregDrepCert
    | UpdateDrepCert,
    never
  >,
  never
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for Certificate instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<
  | StakeRegistration
  | StakeDeregistration
  | StakeDelegation
  | PoolRegistration
  | PoolRetirement
  | RegCert
  | UnregCert
  | VoteDelegCert
  | StakeVoteDelegCert
  | StakeRegDelegCert
  | VoteRegDelegCert
  | StakeVoteRegDelegCert
  | AuthCommitteeHotCert
  | ResignCommitteeColdCert
  | RegDrepCert
  | UnregDrepCert
  | UpdateDrepCert
>
```

Added in v2.0.0

# utils

## AuthCommitteeHotCert (class)

**Signature**

```ts
export declare class AuthCommitteeHotCert
```

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Union<
  [
    Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
    Schema.Tuple2<Schema.Literal<[1n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
    Schema.Tuple<
      [
        Schema.Literal<[2n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.Uint8ArrayFromSelf
      ]
    >,
    Schema.Tuple2<
      Schema.Literal<[3n]>,
      Schema.Tuple<
        [
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.BigIntFromSelf,
          typeof Schema.BigIntFromSelf,
          Schema.TaggedStruct<
            "Tag",
            {
              tag: Schema.Literal<[30]>
              value: Schema.Tuple2<typeof Schema.BigIntFromSelf, typeof Schema.BigIntFromSelf>
            }
          >,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.Array$<typeof Schema.Uint8ArrayFromSelf>,
          Schema.Array$<
            Schema.SchemaClass<
              readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
              readonly [0n, bigint | null, any, any] | readonly [1n, bigint | null, string] | readonly [2n, string],
              never
            >
          >,
          Schema.NullOr<Schema.SchemaClass<readonly [string, any], readonly [string, any], never>>
        ]
      >
    >,
    Schema.Tuple<[Schema.Literal<[4n]>, typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf]>,
    Schema.Tuple<
      [
        Schema.Literal<[7n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[8n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[9n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[10n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[11n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[12n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[13n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[14n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[15n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[16n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.BigIntFromSelf,
        Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[17n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        typeof Schema.BigIntFromSelf
      ]
    >,
    Schema.Tuple<
      [
        Schema.Literal<[18n]>,
        Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
        Schema.NullishOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      ]
    >
  ]
>
```

## PoolRegistration (class)

**Signature**

```ts
export declare class PoolRegistration
```

## PoolRetirement (class)

**Signature**

```ts
export declare class PoolRetirement
```

## RegCert (class)

**Signature**

```ts
export declare class RegCert
```

## RegDrepCert (class)

**Signature**

```ts
export declare class RegDrepCert
```

## ResignCommitteeColdCert (class)

**Signature**

```ts
export declare class ResignCommitteeColdCert
```

## StakeDelegation (class)

**Signature**

```ts
export declare class StakeDelegation
```

## StakeDeregistration (class)

**Signature**

```ts
export declare class StakeDeregistration
```

## StakeRegDelegCert (class)

**Signature**

```ts
export declare class StakeRegDelegCert
```

## StakeRegistration (class)

**Signature**

```ts
export declare class StakeRegistration
```

## StakeVoteDelegCert (class)

**Signature**

```ts
export declare class StakeVoteDelegCert
```

## StakeVoteRegDelegCert (class)

**Signature**

```ts
export declare class StakeVoteRegDelegCert
```

## UnregCert (class)

**Signature**

```ts
export declare class UnregCert
```

## UnregDrepCert (class)

**Signature**

```ts
export declare class UnregDrepCert
```

## UpdateDrepCert (class)

**Signature**

```ts
export declare class UpdateDrepCert
```

## VoteDelegCert (class)

**Signature**

```ts
export declare class VoteDelegCert
```

## VoteRegDelegCert (class)

**Signature**

```ts
export declare class VoteRegDelegCert
```
