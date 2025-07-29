---
title: Relay.ts
nav_order: 74
parent: Modules
---

## Relay overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [fromMultiHostName](#frommultihostname)
  - [fromSingleHostAddr](#fromsinglehostaddr)
  - [fromSingleHostName](#fromsinglehostname)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [RelayError (class)](#relayerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [Relay (type alias)](#relay-type-alias)
- [predicates](#predicates)
  - [isMultiHostName](#ismultihostname)
  - [isSingleHostAddr](#issinglehostaddr)
  - [isSingleHostName](#issinglehostname)
- [schemas](#schemas)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [Relay](#relay)
- [transformation](#transformation)
  - [match](#match)
- [utils](#utils)
  - [Codec](#codec)
  - [FromCDDL](#fromcddl)

---

# constructors

## fromMultiHostName

Create a Relay from a MultiHostName.

**Signature**

```ts
export declare const fromMultiHostName: (multiHostName: MultiHostName.MultiHostName) => Relay
```

Added in v2.0.0

## fromSingleHostAddr

Create a Relay from a SingleHostAddr.

**Signature**

```ts
export declare const fromSingleHostAddr: (singleHostAddr: SingleHostAddr.SingleHostAddr) => Relay
```

Added in v2.0.0

## fromSingleHostName

Create a Relay from a SingleHostName.

**Signature**

```ts
export declare const fromSingleHostName: (singleHostName: SingleHostName.SingleHostName) => Relay
```

Added in v2.0.0

# equality

## equals

Check if two Relay instances are equal.

**Signature**

```ts
export declare const equals: (self: Relay, that: Relay) => boolean
```

Added in v2.0.0

# errors

## RelayError (class)

Error class for Relay related operations.

**Signature**

```ts
export declare class RelayError
```

Added in v2.0.0

# generators

## generator

FastCheck generator for Relay instances.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<
  SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
>
```

Added in v2.0.0

# model

## Relay (type alias)

Type alias for Relay.

**Signature**

```ts
export type Relay = typeof Relay.Type
```

Added in v2.0.0

# predicates

## isMultiHostName

Check if a Relay is a MultiHostName.

**Signature**

```ts
export declare const isMultiHostName: (relay: Relay) => relay is MultiHostName.MultiHostName
```

Added in v2.0.0

## isSingleHostAddr

Check if a Relay is a SingleHostAddr.

**Signature**

```ts
export declare const isSingleHostAddr: (relay: Relay) => relay is SingleHostAddr.SingleHostAddr
```

Added in v2.0.0

## isSingleHostName

Check if a Relay is a SingleHostName.

**Signature**

```ts
export declare const isSingleHostName: (relay: Relay) => relay is SingleHostName.SingleHostName
```

Added in v2.0.0

# schemas

## CBORBytesSchema

CBOR bytes transformation schema for Relay.
For union types, we create a union of the child CBORBytesSchemas
rather than trying to create a complex three-layer transformation.

**Signature**

```ts
export declare const CBORBytesSchema: (
  options?: CBOR.CodecOptions
) => Schema.Union<
  [
    Schema.transform<
      Schema.transformOrFail<
        typeof Schema.Uint8ArrayFromSelf,
        Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
        never
      >,
      Schema.transformOrFail<
        Schema.Tuple<
          [
            Schema.Literal<[0n]>,
            Schema.NullOr<typeof Schema.BigIntFromSelf>,
            Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
            Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
          ]
        >,
        Schema.SchemaClass<SingleHostAddr.SingleHostAddr, SingleHostAddr.SingleHostAddr, never>,
        never
      >
    >,
    Schema.transform<
      Schema.transformOrFail<
        typeof Schema.Uint8ArrayFromSelf,
        Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
        never
      >,
      Schema.transformOrFail<
        Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
        Schema.SchemaClass<SingleHostName.SingleHostName, SingleHostName.SingleHostName, never>,
        never
      >
    >,
    Schema.transform<
      Schema.transformOrFail<
        typeof Schema.Uint8ArrayFromSelf,
        Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
        never
      >,
      Schema.transformOrFail<
        Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
        Schema.SchemaClass<MultiHostName.MultiHostName, MultiHostName.MultiHostName, never>,
        never
      >
    >
  ]
>
```

Added in v2.0.0

## CBORHexSchema

CBOR hex transformation schema for Relay.

**Signature**

```ts
export declare const CBORHexSchema: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.Union<
    [
      Schema.transform<
        Schema.transformOrFail<
          typeof Schema.Uint8ArrayFromSelf,
          Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
          never
        >,
        Schema.transformOrFail<
          Schema.Tuple<
            [
              Schema.Literal<[0n]>,
              Schema.NullOr<typeof Schema.BigIntFromSelf>,
              Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
              Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
            ]
          >,
          Schema.SchemaClass<SingleHostAddr.SingleHostAddr, SingleHostAddr.SingleHostAddr, never>,
          never
        >
      >,
      Schema.transform<
        Schema.transformOrFail<
          typeof Schema.Uint8ArrayFromSelf,
          Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
          never
        >,
        Schema.transformOrFail<
          Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
          Schema.SchemaClass<SingleHostName.SingleHostName, SingleHostName.SingleHostName, never>,
          never
        >
      >,
      Schema.transform<
        Schema.transformOrFail<
          typeof Schema.Uint8ArrayFromSelf,
          Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
          never
        >,
        Schema.transformOrFail<
          Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
          Schema.SchemaClass<MultiHostName.MultiHostName, MultiHostName.MultiHostName, never>,
          never
        >
      >
    ]
  >
>
```

Added in v2.0.0

## Relay

Union schema for Relay representing various relay configurations.
relay = [ single_host_addr // single_host_name // multi_host_name ]

**Signature**

```ts
export declare const Relay: Schema.Union<
  [typeof SingleHostAddr.SingleHostAddr, typeof SingleHostName.SingleHostName, typeof MultiHostName.MultiHostName]
>
```

Added in v2.0.0

# transformation

## match

Pattern match on a Relay to handle different relay types.

**Signature**

```ts
export declare const match: <A, B, C>(
  relay: Relay,
  cases: {
    SingleHostAddr: (addr: SingleHostAddr.SingleHostAddr) => A
    SingleHostName: (name: SingleHostName.SingleHostName) => B
    MultiHostName: (multi: MultiHostName.MultiHostName) => C
  }
) => A | B | C
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => any
    cborHex: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => string
  }
  Decode: {
    cborBytes: (
      input: any
    ) => SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    cborHex: (
      input: string
    ) => SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
  }
  EncodeEffect: {
    cborBytes: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => Effect<any, InstanceType<typeof RelayError>>
    cborHex: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => Effect<string, InstanceType<typeof RelayError>>
  }
  DecodeEffect: {
    cborBytes: (
      input: any
    ) => Effect<
      SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName,
      InstanceType<typeof RelayError>
    >
    cborHex: (
      input: string
    ) => Effect<
      SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName,
      InstanceType<typeof RelayError>
    >
  }
  EncodeEither: {
    cborBytes: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => Either<any, InstanceType<typeof RelayError>>
    cborHex: (
      input: SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName
    ) => Either<string, InstanceType<typeof RelayError>>
  }
  DecodeEither: {
    cborBytes: (
      input: any
    ) => Either<
      SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName,
      InstanceType<typeof RelayError>
    >
    cborHex: (
      input: string
    ) => Either<
      SingleHostName.SingleHostName | SingleHostAddr.SingleHostAddr | MultiHostName.MultiHostName,
      InstanceType<typeof RelayError>
    >
  }
}
```

## FromCDDL

**Signature**

```ts
export declare const FromCDDL: Schema.Union<
  [
    Schema.transformOrFail<
      Schema.Tuple<
        [
          Schema.Literal<[0n]>,
          Schema.NullOr<typeof Schema.BigIntFromSelf>,
          Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
          Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
        ]
      >,
      Schema.SchemaClass<SingleHostAddr.SingleHostAddr, SingleHostAddr.SingleHostAddr, never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
      Schema.SchemaClass<SingleHostName.SingleHostName, SingleHostName.SingleHostName, never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
      Schema.SchemaClass<MultiHostName.MultiHostName, MultiHostName.MultiHostName, never>,
      never
    >
  ]
>
```
