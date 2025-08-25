---
title: ProposalProcedure.ts
nav_order: 89
parent: Modules
---

## ProposalProcedure overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ProposalProcedureError (class)](#proposalprocedureerror-class)
- [model](#model)
  - [ProposalProcedure (class)](#proposalprocedure-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)

---

# constructors

## make

Create a single ProposalProcedure.

**Signature**

```ts
export declare const make: (
  props: {
    readonly anchor: Anchor.Anchor | null
    readonly rewardAccount: RewardAccount.RewardAccount
    readonly deposit: bigint
    readonly governanceAction:
      | GovernanceAction.ParameterChangeAction
      | GovernanceAction.HardForkInitiationAction
      | GovernanceAction.TreasuryWithdrawalsAction
      | GovernanceAction.NoConfidenceAction
      | GovernanceAction.UpdateCommitteeAction
      | GovernanceAction.NewConstitutionAction
      | GovernanceAction.InfoAction
  },
  options?: Schema.MakeOptions | undefined
) => ProposalProcedure
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode individual ProposalProcedure to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: ProposalProcedure, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode individual ProposalProcedure to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: ProposalProcedure, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two ProposalProcedure instances are equal.

**Signature**

```ts
export declare const equals: (a: ProposalProcedure, b: ProposalProcedure) => boolean
```

Added in v2.0.0

# errors

## ProposalProcedureError (class)

Error class for ProposalProcedure related operations.

**Signature**

```ts
export declare class ProposalProcedureError
```

Added in v2.0.0

# model

## ProposalProcedure (class)

Schema for a single proposal procedure based on Conway CDDL specification.

```
proposal_procedure = [
  deposit : coin,
  reward_account : reward_account,
  governance_action : governance_action,
  anchor : anchor / null
]

governance_action = [action_type, action_data]
```

**Signature**

```ts
export declare class ProposalProcedure
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse individual ProposalProcedure from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => ProposalProcedure
```

Added in v2.0.0

## fromCBORHex

Parse individual ProposalProcedure from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => ProposalProcedure
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for ProposalProcedure tuple structure.

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple<
  [
    typeof Schema.BigIntFromSelf,
    typeof Schema.Uint8ArrayFromSelf,
    Schema.SchemaClass<
      | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
      | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
      | readonly [2n, ReadonlyMap<any, bigint>, any]
      | readonly [3n, readonly [any, bigint] | null]
      | readonly [
          4n,
          readonly [any, bigint] | null,
          (
            | readonly (readonly [0n | 1n, any])[]
            | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
          ),
          ReadonlyMap<readonly [0n | 1n, any], bigint>,
          { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
        ]
      | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
      | readonly [6n],
      | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
      | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
      | readonly [2n, ReadonlyMap<any, bigint>, any]
      | readonly [3n, readonly [any, bigint] | null]
      | readonly [
          4n,
          readonly [any, bigint] | null,
          (
            | readonly (readonly [0n | 1n, any])[]
            | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
          ),
          ReadonlyMap<readonly [0n | 1n, any], bigint>,
          { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
        ]
      | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
      | readonly [6n],
      never
    >,
    Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
  ]
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for individual ProposalProcedure.

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
    Schema.Tuple<
      [
        typeof Schema.BigIntFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.SchemaClass<
          | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              (
                | readonly (readonly [0n | 1n, any])[]
                | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
              ),
              ReadonlyMap<readonly [0n | 1n, any], bigint>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
          | readonly [6n],
          | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              (
                | readonly (readonly [0n | 1n, any])[]
                | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
              ),
              ReadonlyMap<readonly [0n | 1n, any], bigint>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
          | readonly [6n],
          never
        >,
        Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      ]
    >,
    Schema.SchemaClass<ProposalProcedure, ProposalProcedure, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for individual ProposalProcedure.

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
      Schema.Tuple<
        [
          typeof Schema.BigIntFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.SchemaClass<
            | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                (
                  | readonly (readonly [0n | 1n, any])[]
                  | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
                ),
                ReadonlyMap<readonly [0n | 1n, any], bigint>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
            | readonly [6n],
            | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                (
                  | readonly (readonly [0n | 1n, any])[]
                  | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
                ),
                ReadonlyMap<readonly [0n | 1n, any], bigint>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
            | readonly [6n],
            never
          >,
          Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        ]
      >,
      Schema.SchemaClass<ProposalProcedure, ProposalProcedure, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL transformation schema for individual ProposalProcedure.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.BigIntFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.SchemaClass<
        | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
        | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
        | readonly [2n, ReadonlyMap<any, bigint>, any]
        | readonly [3n, readonly [any, bigint] | null]
        | readonly [
            4n,
            readonly [any, bigint] | null,
            (
              | readonly (readonly [0n | 1n, any])[]
              | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
            ),
            ReadonlyMap<readonly [0n | 1n, any], bigint>,
            { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
          ]
        | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
        | readonly [6n],
        | readonly [0n, readonly [any, bigint] | null, ReadonlyMap<bigint, CBOR.CBOR>, any]
        | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint]]
        | readonly [2n, ReadonlyMap<any, bigint>, any]
        | readonly [3n, readonly [any, bigint] | null]
        | readonly [
            4n,
            readonly [any, bigint] | null,
            (
              | readonly (readonly [0n | 1n, any])[]
              | { readonly _tag: "Tag"; readonly tag: 258; readonly value: readonly (readonly [0n | 1n, any])[] }
            ),
            ReadonlyMap<readonly [0n | 1n, any], bigint>,
            { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
          ]
        | readonly [5n, readonly [any, bigint] | null, readonly [readonly [string, any], any]]
        | readonly [6n],
        never
      >,
      Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
    ]
  >,
  Schema.SchemaClass<ProposalProcedure, ProposalProcedure, never>,
  never
>
```

Added in v2.0.0
