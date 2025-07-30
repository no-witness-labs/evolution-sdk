---
title: Credential.ts
nav_order: 31
parent: Modules
---

## Credential overview

---

<h2 class="text-delta">Table of contents</h2>

- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [CredentialError (class)](#credentialerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [Credential (type alias)](#credential-type-alias)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [Credential](#credential)
  - [FromCDDL](#fromcddl)
- [utils](#utils)
  - [CDDL](#cddl)
  - [Codec](#codec)
  - [FromCBORBytes](#fromcborbytes)
  - [FromCBORHex](#fromcborhex)

---

# equality

## equals

Check if two Credential instances are equal.

**Signature**

```ts
export declare const equals: (a: Credential, b: Credential) => boolean
```

Added in v2.0.0

# errors

## CredentialError (class)

Extends TaggedError for better error handling and categorization

**Signature**

```ts
export declare class CredentialError
```

Added in v2.0.0

# generators

## generator

Generate a random Credential.
Randomly selects between generating a KeyHash or ScriptHash credential.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<
  { _tag: "KeyHash"; hash: string & Brand<"KeyHash"> } | { _tag: "ScriptHash"; hash: string & Brand<"ScriptHash"> }
>
```

Added in v2.0.0

# model

## Credential (type alias)

Type representing a credential that can be either a key hash or script hash
Used in various address formats to identify ownership

**Signature**

```ts
export type Credential = typeof Credential.Type
```

Added in v2.0.0

# predicates

## is

Check if the given value is a valid Credential

**Signature**

```ts
export declare const is: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is
  | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
  | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
```

Added in v2.0.0

# schemas

## Credential

Credential schema representing either a key hash or script hash
credential = [0, addr_keyhash // 1, script_hash]
Used to identify ownership of addresses or stake rights

**Signature**

```ts
export declare const Credential: Schema.Union<
  [
    Schema.TaggedStruct<
      "KeyHash",
      { hash: Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "KeyHash"> }
    >,
    Schema.TaggedStruct<
      "ScriptHash",
      { hash: Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "ScriptHash"> }
    >
  ]
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for Credential as defined in the specification:
credential = [0, addr_keyhash // 1, script_hash]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.SchemaClass<
    | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
    | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
    | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
    | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
    never
  >,
  never
>
```

Added in v2.0.0

# utils

## CDDL

**Signature**

```ts
export declare const CDDL: Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>
```

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => any
    cborHex: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => string
  }
  Decode: {
    cborBytes: (
      input: any
    ) =>
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    cborHex: (
      input: string
    ) =>
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
  }
  EncodeEffect: {
    cborBytes: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Effect.Effect<any, InstanceType<typeof CredentialError>>
    cborHex: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Effect.Effect<string, InstanceType<typeof CredentialError>>
  }
  DecodeEffect: {
    cborBytes: (
      input: any
    ) => Effect.Effect<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof CredentialError>
    >
    cborHex: (
      input: string
    ) => Effect.Effect<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof CredentialError>
    >
  }
  EncodeEither: {
    cborBytes: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Either<any, InstanceType<typeof CredentialError>>
    cborHex: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Either<string, InstanceType<typeof CredentialError>>
  }
  DecodeEither: {
    cborBytes: (
      input: any
    ) => Either<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof CredentialError>
    >
    cborHex: (
      input: string
    ) => Either<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof CredentialError>
    >
  }
}
```

## FromCBORBytes

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
    Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
    Schema.SchemaClass<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      never
    >,
    never
  >
>
```

## FromCBORHex

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<Schema.Literal<[0n, 1n]>, typeof Schema.Uint8ArrayFromSelf>,
      Schema.SchemaClass<
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
        never
      >,
      never
    >
  >
>
```
