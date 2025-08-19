---
title: ProposalProcedures.ts
nav_order: 86
parent: Modules
---

## ProposalProcedures overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
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
  - [ProposalProceduresError (class)](#proposalprocedureserror-class)
- [model](#model)
  - [ProposalProcedures (class)](#proposalprocedures-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [schemas](#schemas)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)

---

# arbitrary

## arbitrary

FastCheck arbitrary for ProposalProcedures.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ProposalProcedures>
```

Added in v2.0.0

# constructors

## make

Create a ProposalProcedures instance with validation.

**Signature**

```ts
export declare const make: (
  props: { readonly procedures: readonly ProposalProcedure.ProposalProcedure[] },
  options?: Schema.MakeOptions | undefined
) => ProposalProcedures
```

Added in v2.0.0

# effect

## Either (namespace)

Effect-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode ProposalProcedures to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: ProposalProcedures, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode ProposalProcedures to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: ProposalProcedures, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two ProposalProcedures instances are equal.

**Signature**

```ts
export declare const equals: (a: ProposalProcedures, b: ProposalProcedures) => boolean
```

Added in v2.0.0

# errors

## ProposalProceduresError (class)

Error class for ProposalProcedures related operations.

**Signature**

```ts
export declare class ProposalProceduresError
```

Added in v2.0.0

# model

## ProposalProcedures (class)

ProposalProcedures based on Conway CDDL specification.

```
CDDL: proposal_procedures = nonempty_set<proposal_procedure>
```

**Signature**

```ts
export declare class ProposalProcedures
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse ProposalProcedures from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => ProposalProcedures
```

Added in v2.0.0

## fromCBORHex

Parse ProposalProcedures from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => ProposalProcedures
```

Added in v2.0.0

# schemas

## CDDLSchema

CDDL schema for ProposalProcedures that produces CBOR-compatible types.

**Signature**

```ts
export declare const CDDLSchema: Schema.Array$<
  Schema.Tuple<
    [
      typeof Schema.BigIntFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      Schema.SchemaClass<
        | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
        | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
        | readonly [2n, ReadonlyMap<any, bigint>, any]
        | readonly [3n, readonly [any, bigint] | null]
        | readonly [
            4n,
            readonly [any, bigint] | null,
            readonly (readonly [0n | 1n, any])[],
            ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
            { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
          ]
        | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
        | readonly [6n],
        | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
        | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
        | readonly [2n, ReadonlyMap<any, bigint>, any]
        | readonly [3n, readonly [any, bigint] | null]
        | readonly [
            4n,
            readonly [any, bigint] | null,
            readonly (readonly [0n | 1n, any])[],
            ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
            { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
          ]
        | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
        | readonly [6n],
        never
      >,
      Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
    ]
  >
>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for ProposalProcedures.

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
    Schema.Array$<
      Schema.Tuple<
        [
          typeof Schema.BigIntFromSelf,
          typeof Schema.Uint8ArrayFromSelf,
          Schema.SchemaClass<
            | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                readonly (readonly [0n | 1n, any])[],
                ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
            | readonly [6n],
            | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
            | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
            | readonly [2n, ReadonlyMap<any, bigint>, any]
            | readonly [3n, readonly [any, bigint] | null]
            | readonly [
                4n,
                readonly [any, bigint] | null,
                readonly (readonly [0n | 1n, any])[],
                ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
              ]
            | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
            | readonly [6n],
            never
          >,
          Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
        ]
      >
    >,
    Schema.SchemaClass<ProposalProcedures, ProposalProcedures, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for ProposalProcedures.

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
      Schema.Array$<
        Schema.Tuple<
          [
            typeof Schema.BigIntFromSelf,
            typeof Schema.Uint8ArrayFromSelf,
            Schema.SchemaClass<
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n],
              | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
              | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
              | readonly [2n, ReadonlyMap<any, bigint>, any]
              | readonly [3n, readonly [any, bigint] | null]
              | readonly [
                  4n,
                  readonly [any, bigint] | null,
                  readonly (readonly [0n | 1n, any])[],
                  ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
                  { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
                ]
              | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
              | readonly [6n],
              never
            >,
            Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
          ]
        >
      >,
      Schema.SchemaClass<ProposalProcedures, ProposalProcedures, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL transformation schema for ProposalProcedures.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Array$<
    Schema.Tuple<
      [
        typeof Schema.BigIntFromSelf,
        typeof Schema.Uint8ArrayFromSelf,
        Schema.SchemaClass<
          | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              readonly (readonly [0n | 1n, any])[],
              ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
          | readonly [6n],
          | readonly [0n, readonly [any, bigint] | null, { readonly [x: string]: CBOR.CBOR }, any]
          | readonly [1n, readonly [any, bigint] | null, readonly [bigint, bigint], any]
          | readonly [2n, ReadonlyMap<any, bigint>, any]
          | readonly [3n, readonly [any, bigint] | null]
          | readonly [
              4n,
              readonly [any, bigint] | null,
              readonly (readonly [0n | 1n, any])[],
              ReadonlyMap<readonly [0n | 1n, any], readonly [0n | 1n, any]>,
              { readonly _tag: "Tag"; readonly tag: 30; readonly value: readonly [bigint, bigint] }
            ]
          | readonly [5n, readonly [any, bigint] | null, CBOR.CBOR]
          | readonly [6n],
          never
        >,
        Schema.NullOr<Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>>
      ]
    >
  >,
  Schema.SchemaClass<ProposalProcedures, ProposalProcedures, never>,
  never
>
```

Added in v2.0.0
