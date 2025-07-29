---
title: DRepCredential.ts
nav_order: 39
parent: Modules
---

## DRepCredential overview

DRep Credential module - provides an alias for Credential specialized for DRep usage.

In Cardano, drep_credential = credential, representing the same credential structure
but used specifically for delegation representatives (DReps).

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [errors](#errors)
  - [DRepCredentialError](#drepcredentialerror)
- [model](#model)
  - [DRepCredential (type alias)](#drepcredential-type-alias)
- [schemas](#schemas)
  - [FromBytes](#FromBytes)
  - [DRepCredential](#drepcredential)
- [utils](#utils)
  - [FromHex](#FromHex)
  - [Codec](#codec)
  - [equals](#equals)
  - [generator](#generator)
  - [isCredential](#iscredential)

---

# errors

## DRepCredentialError

Error class for DRepCredential operations - re-exports CredentialError.

**Signature**

```ts
export declare const DRepCredentialError: typeof Credential.CredentialError
```

Added in v2.0.0

# model

## DRepCredential (type alias)

Type representing a DRep credential - alias for Credential type.

**Signature**

```ts
export type DRepCredential = Credential.Credential
```

Added in v2.0.0

# schemas

## FromBytes

CBOR encoding/decoding schemas.

**Signature**

```ts
export declare const FromBytes: (
  options?: CodecOptions
) => transform<
  transformOrFail<typeof Uint8ArrayFromSelf, declare<CBOR, CBOR, readonly [], never>, never>,
  transformOrFail<
    Tuple2<Literal<[0n, 1n]>, typeof Uint8ArrayFromSelf>,
    SchemaClass<
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

Added in v2.0.0

## DRepCredential

DRepCredential schema - alias for the Credential schema.
drep_credential = credential

**Signature**

```ts
export declare const DRepCredential: Union<
  [
    TaggedStruct<"KeyHash", { hash: brand<refine<string, refine<string, typeof String>>, "KeyHash"> }>,
    TaggedStruct<"ScriptHash", { hash: brand<refine<string, refine<string, typeof String>>, "ScriptHash"> }>
  ]
>
```

Added in v2.0.0

# utils

## FromHex

**Signature**

```ts
export declare const FromHex: (
  options?: CodecOptions
) => transform<
  transform<refine<string, typeof String>, typeof Uint8ArrayFromSelf>,
  transform<
    transformOrFail<typeof Uint8ArrayFromSelf, declare<CBOR, CBOR, readonly [], never>, never>,
    transformOrFail<
      Tuple2<Literal<[0n, 1n]>, typeof Uint8ArrayFromSelf>,
      SchemaClass<
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

## Codec

**Signature**

```ts
export declare const Codec: (options?: CodecOptions) => {
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
    ) => Effect<any, InstanceType<typeof Credential.CredentialError>>
    cborHex: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Effect<string, InstanceType<typeof Credential.CredentialError>>
  }
  DecodeEffect: {
    cborBytes: (
      input: any
    ) => Effect<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof Credential.CredentialError>
    >
    cborHex: (
      input: string
    ) => Effect<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof Credential.CredentialError>
    >
  }
  EncodeEither: {
    cborBytes: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Either<any, InstanceType<typeof Credential.CredentialError>>
    cborHex: (
      input:
        | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
        | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
    ) => Either<string, InstanceType<typeof Credential.CredentialError>>
  }
  DecodeEither: {
    cborBytes: (
      input: any
    ) => Either<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof Credential.CredentialError>
    >
    cborHex: (
      input: string
    ) => Either<
      | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
      | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> },
      InstanceType<typeof Credential.CredentialError>
    >
  }
}
```

## equals

**Signature**

```ts
export declare const equals: (a: Credential.Credential, b: Credential.Credential) => boolean
```

## generator

**Signature**

```ts
export declare const generator: Arbitrary<
  { _tag: "KeyHash"; hash: string & Brand<"KeyHash"> } | { _tag: "ScriptHash"; hash: string & Brand<"ScriptHash"> }
>
```

## isCredential

Re-exported utilities from Credential module.

**Signature**

```ts
export declare const isCredential: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is
  | { readonly _tag: "KeyHash"; readonly hash: string & Brand<"KeyHash"> }
  | { readonly _tag: "ScriptHash"; readonly hash: string & Brand<"ScriptHash"> }
```

Added in v2.0.0
