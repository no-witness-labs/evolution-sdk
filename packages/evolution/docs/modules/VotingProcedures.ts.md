---
title: VotingProcedures.ts
nav_order: 115
parent: Modules
---

## VotingProcedures overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [abstain](#abstain)
  - [make](#make)
  - [makeCommitteeVoter](#makecommitteevoter)
  - [makeDRepVoter](#makedrepvoter)
  - [makeProcedure](#makeprocedure)
  - [makeStakePoolVoter](#makestakepoolvoter)
  - [no](#no)
  - [yes](#yes)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
  - [voteEquals](#voteequals)
  - [voterEquals](#voterequals)
- [errors](#errors)
  - [VotingProceduresError (class)](#votingprocedureserror-class)
- [model](#model)
  - [VotingProcedures (class)](#votingprocedures-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [pattern matching](#pattern-matching)
  - [matchVote](#matchvote)
  - [matchVoter](#matchvoter)
- [predicates](#predicates)
  - [isAbstainVote](#isabstainvote)
  - [isConstitutionalCommitteeVoter](#isconstitutionalcommitteevoter)
  - [isDRepVoter](#isdrepvoter)
  - [isNoVote](#isnovote)
  - [isStakePoolVoter](#isstakepoolvoter)
  - [isYesVote](#isyesvote)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [ConstitutionalCommitteeVoter (class)](#constitutionalcommitteevoter-class)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [NoVote (class)](#novote-class)
  - [Vote](#vote)
  - [VoteCDDL](#votecddl)
  - [VoteFromCDDL](#votefromcddl)
  - [Voter](#voter)
  - [VoterCDDL](#votercddl)
  - [VoterFromCDDL](#voterfromcddl)
  - [VotingProcedure (class)](#votingprocedure-class)
  - [VotingProcedureCDDL](#votingprocedurecddl)
  - [VotingProcedureFromCDDL](#votingprocedurefromcddl)
- [utils](#utils)
  - [AbstainVote (class)](#abstainvote-class)
  - [DRepVoter (class)](#drepvoter-class)
  - [StakePoolVoter (class)](#stakepoolvoter-class)
  - [Vote (type alias)](#vote-type-alias)
  - [Voter (type alias)](#voter-type-alias)
  - [YesVote (class)](#yesvote-class)

---

# arbitrary

## arbitrary

FastCheck arbitrary for VotingProcedures.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<VotingProcedures>
```

Added in v2.0.0

# constructors

## abstain

Create an Abstain vote.

**Signature**

```ts
export declare const abstain: () => Vote
```

Added in v2.0.0

## make

Create a VotingProcedures instance.

**Signature**

```ts
export declare const make: (
  props: {
    readonly procedures: Map<
      ConstitutionalCommitteeVoter | DRepVoter | StakePoolVoter,
      Map<GovernanceAction.GovActionId, VotingProcedure>
    >
  },
  options?: Schema.MakeOptions | undefined
) => VotingProcedures
```

Added in v2.0.0

## makeCommitteeVoter

Create a Constitutional Committee voter.

**Signature**

```ts
export declare const makeCommitteeVoter: (credential: Credential.Credential) => Voter
```

Added in v2.0.0

## makeDRepVoter

Create a DRep voter.

**Signature**

```ts
export declare const makeDRepVoter: (drep: DRep.DRep) => DRepVoter
```

Added in v2.0.0

## makeProcedure

Create a VotingProcedure instance.

**Signature**

```ts
export declare const makeProcedure: (vote: Vote, anchor?: Anchor.Anchor | null) => VotingProcedure
```

Added in v2.0.0

## makeStakePoolVoter

Create a Stake Pool voter.

**Signature**

```ts
export declare const makeStakePoolVoter: (poolKeyHash: PoolKeyHash.PoolKeyHash) => StakePoolVoter
```

Added in v2.0.0

## no

Create a No vote.

**Signature**

```ts
export declare const no: () => Vote
```

Added in v2.0.0

## yes

Create a Yes vote.

**Signature**

```ts
export declare const yes: () => Vote
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode VotingProcedures to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: VotingProcedures, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode VotingProcedures to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: VotingProcedures, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two VotingProcedures are equal.

**Signature**

```ts
export declare const equals: (a: VotingProcedures, b: VotingProcedures) => boolean
```

Added in v2.0.0

## voteEquals

Check if two Votes are equal.

**Signature**

```ts
export declare const voteEquals: (a: Vote, b: Vote) => boolean
```

Added in v2.0.0

## voterEquals

Check if two Voters are equal.

**Signature**

```ts
export declare const voterEquals: (a: Voter, b: Voter) => boolean
```

Added in v2.0.0

# errors

## VotingProceduresError (class)

Error class for VotingProcedures related operations.

**Signature**

```ts
export declare class VotingProceduresError
```

Added in v2.0.0

# model

## VotingProcedures (class)

VotingProcedures based on Conway CDDL specification.

```
voting_procedures = {+ voter => {+ gov_action_id => voting_procedure}}
```

A nested map structure where voters map to their votes on specific governance actions.

**Signature**

```ts
export declare class VotingProcedures
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse VotingProcedures from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => VotingProcedures
```

Added in v2.0.0

## fromCBORHex

Parse VotingProcedures from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => VotingProcedures
```

Added in v2.0.0

# pattern matching

## matchVote

Pattern match on a Vote.

**Signature**

```ts
export declare const matchVote: <R>(patterns: {
  NoVote: () => R
  YesVote: () => R
  AbstainVote: () => R
}) => (vote: Vote) => R
```

Added in v2.0.0

## matchVoter

Pattern match on a Voter.

**Signature**

```ts
export declare const matchVoter: <R>(patterns: {
  ConstitutionalCommitteeVoter: (credential: Credential.Credential) => R
  DRepVoter: (drep: DRep.DRep) => R
  StakePoolVoter: (poolKeyHash: PoolKeyHash.PoolKeyHash) => R
}) => (voter: Voter) => R
```

Added in v2.0.0

# predicates

## isAbstainVote

Check if a vote is an Abstain vote.

**Signature**

```ts
export declare const isAbstainVote: (vote: Vote) => vote is Schema.Schema.Type<typeof AbstainVote>
```

Added in v2.0.0

## isConstitutionalCommitteeVoter

Check if a voter is a Constitutional Committee voter.

**Signature**

```ts
export declare const isConstitutionalCommitteeVoter: (
  voter: Voter
) => voter is Schema.Schema.Type<typeof ConstitutionalCommitteeVoter>
```

Added in v2.0.0

## isDRepVoter

Check if a voter is a DRep voter.

**Signature**

```ts
export declare const isDRepVoter: (voter: Voter) => voter is Schema.Schema.Type<typeof DRepVoter>
```

Added in v2.0.0

## isNoVote

Check if a vote is a No vote.

**Signature**

```ts
export declare const isNoVote: (vote: Vote) => vote is Schema.Schema.Type<typeof NoVote>
```

Added in v2.0.0

## isStakePoolVoter

Check if a voter is a Stake Pool voter.

**Signature**

```ts
export declare const isStakePoolVoter: (voter: Voter) => voter is Schema.Schema.Type<typeof StakePoolVoter>
```

Added in v2.0.0

## isYesVote

Check if a vote is a Yes vote.

**Signature**

```ts
export declare const isYesVote: (vote: Vote) => vote is Schema.Schema.Type<typeof YesVote>
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for VotingProcedures map structure.

**Signature**

```ts
export declare const CDDLSchema: Schema.MapFromSelf<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
      Schema.Tuple2<
        Schema.Literal<[1n]>,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >
      >,
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
    ]
  >,
  Schema.MapFromSelf<
    Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
    Schema.Tuple2<
      Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
      Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
    >
  >
>
```

Added in v2.0.0

## ConstitutionalCommitteeVoter (class)

Voter types based on Conway CDDL specification.

```
voter =
  [ 0, committee_hot_credential ]  // Constitutional Committee
/ [ 1, drep ]                     // DRep
/ [ 2, pool_keyhash ]             // Stake Pool Operator
```

**Signature**

```ts
export declare class ConstitutionalCommitteeVoter
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for VotingProcedures.

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
    Schema.MapFromSelf<
      Schema.Union<
        [
          Schema.Tuple2<
            Schema.Literal<[0n]>,
            Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
          >,
          Schema.Tuple2<
            Schema.Literal<[1n]>,
            Schema.Union<
              [
                Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                Schema.Tuple<[Schema.Literal<[2n]>]>,
                Schema.Tuple<[Schema.Literal<[3n]>]>
              ]
            >
          >,
          Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
        ]
      >,
      Schema.MapFromSelf<
        Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
        Schema.Tuple2<
          Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
          Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        >
      >
    >,
    Schema.SchemaClass<VotingProcedures, VotingProcedures, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for VotingProcedures.

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
      Schema.MapFromSelf<
        Schema.Union<
          [
            Schema.Tuple2<
              Schema.Literal<[0n]>,
              Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
            >,
            Schema.Tuple2<
              Schema.Literal<[1n]>,
              Schema.Union<
                [
                  Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
                  Schema.Tuple<[Schema.Literal<[2n]>]>,
                  Schema.Tuple<[Schema.Literal<[3n]>]>
                ]
              >
            >,
            Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
          ]
        >,
        Schema.MapFromSelf<
          Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
          Schema.Tuple2<
            Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
            Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
          >
        >
      >,
      Schema.SchemaClass<VotingProcedures, VotingProcedures, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL transformation schema for VotingProcedures.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.MapFromSelf<
    Schema.Union<
      [
        Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
        Schema.Tuple2<
          Schema.Literal<[1n]>,
          Schema.Union<
            [
              Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
              Schema.Tuple<[Schema.Literal<[2n]>]>,
              Schema.Tuple<[Schema.Literal<[3n]>]>
            ]
          >
        >,
        Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
      ]
    >,
    Schema.MapFromSelf<
      Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.BigIntFromSelf>,
      Schema.Tuple2<
        Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
        Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      >
    >
  >,
  Schema.SchemaClass<VotingProcedures, VotingProcedures, never>,
  never
>
```

Added in v2.0.0

## NoVote (class)

Vote types based on Conway CDDL specification.

```
vote = 0 / 1 / 2  ; No / Yes / Abstain
```

**Signature**

```ts
export declare class NoVote
```

Added in v2.0.0

## Vote

Vote union schema.

**Signature**

```ts
export declare const Vote: Schema.Union<[typeof NoVote, typeof YesVote, typeof AbstainVote]>
```

Added in v2.0.0

## VoteCDDL

CDDL schema for Vote.

**Signature**

```ts
export declare const VoteCDDL: Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>
```

Added in v2.0.0

## VoteFromCDDL

CDDL transformation schema for Vote.

**Signature**

```ts
export declare const VoteFromCDDL: Schema.transformOrFail<
  Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
  Schema.SchemaClass<NoVote | YesVote | AbstainVote, NoVote | YesVote | AbstainVote, never>,
  never
>
```

Added in v2.0.0

## Voter

Voter union schema.

**Signature**

```ts
export declare const Voter: Schema.Union<[typeof ConstitutionalCommitteeVoter, typeof DRepVoter, typeof StakePoolVoter]>
```

Added in v2.0.0

## VoterCDDL

CDDL schema for Voter as tuple structure.
Maps to: [voter_type, voter_data]

**Signature**

```ts
export declare const VoterCDDL: Schema.Union<
  [
    Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
    Schema.Tuple2<
      Schema.Literal<[1n]>,
      Schema.Union<
        [
          Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
          Schema.Tuple<[Schema.Literal<[2n]>]>,
          Schema.Tuple<[Schema.Literal<[3n]>]>
        ]
      >
    >,
    Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
  ]
>
```

Added in v2.0.0

## VoterFromCDDL

CDDL transformation schema for Voter.

**Signature**

```ts
export declare const VoterFromCDDL: Schema.transformOrFail<
  Schema.Union<
    [
      Schema.Tuple2<Schema.Literal<[0n]>, Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>>,
      Schema.Tuple2<
        Schema.Literal<[1n]>,
        Schema.Union<
          [
            Schema.Tuple2<Schema.Literal<[0n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple2<Schema.Literal<[1n]>, typeof Schema.Uint8ArrayFromSelf>,
            Schema.Tuple<[Schema.Literal<[2n]>]>,
            Schema.Tuple<[Schema.Literal<[3n]>]>
          ]
        >
      >,
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.Uint8ArrayFromSelf>
    ]
  >,
  Schema.SchemaClass<
    ConstitutionalCommitteeVoter | DRepVoter | StakePoolVoter,
    ConstitutionalCommitteeVoter | DRepVoter | StakePoolVoter,
    never
  >,
  never
>
```

Added in v2.0.0

## VotingProcedure (class)

Voting procedure based on Conway CDDL specification.

```
voting_procedure = [ vote, anchor / null ]
```

**Signature**

```ts
export declare class VotingProcedure
```

Added in v2.0.0

## VotingProcedureCDDL

CDDL schema for VotingProcedure tuple structure.

**Signature**

```ts
export declare const VotingProcedureCDDL: Schema.Tuple2<
  Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
  Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
>
```

Added in v2.0.0

## VotingProcedureFromCDDL

CDDL transformation schema for VotingProcedure.

**Signature**

```ts
export declare const VotingProcedureFromCDDL: Schema.transformOrFail<
  Schema.Tuple2<
    Schema.Union<[Schema.Literal<[0n]>, Schema.Literal<[1n]>, Schema.Literal<[2n]>]>,
    Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
  >,
  Schema.SchemaClass<VotingProcedure, VotingProcedure, never>,
  never
>
```

Added in v2.0.0

# utils

## AbstainVote (class)

**Signature**

```ts
export declare class AbstainVote
```

## DRepVoter (class)

**Signature**

```ts
export declare class DRepVoter
```

## StakePoolVoter (class)

**Signature**

```ts
export declare class StakePoolVoter
```

## Vote (type alias)

**Signature**

```ts
export type Vote = typeof Vote.Type
```

## Voter (type alias)

**Signature**

```ts
export type Voter = typeof Voter.Type
```

## YesVote (class)

**Signature**

```ts
export declare class YesVote
```
