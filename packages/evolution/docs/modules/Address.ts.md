---
title: Address.ts
nav_order: 1
parent: Modules
---

## Address overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [model](#model)
  - [Address](#address)
  - [Address (type alias)](#address-type-alias)
  - [AddressError (class)](#addresserror-class)
- [schema](#schema)
  - [FromBech32](#frombech32)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
- [testing](#testing)
  - [generator](#generator)
- [utils](#utils)
  - [equals](#equals)

---

# encoding/decoding

## Codec

Codec utilities for addresses.

**Signature**

```ts
export declare const Codec: {
  Encode: {
    bech32: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => string & Brand<"Bech32">
    hex: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => string
    bytes: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => any
  }
  Decode: {
    bech32: (
      input: string & Brand<"Bech32">
    ) =>
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress
    hex: (
      input: string
    ) =>
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress
    bytes: (
      input: any
    ) =>
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress
  }
  EncodeEffect: {
    bech32: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Effect.Effect<string & Brand<"Bech32">, InstanceType<typeof AddressError>>
    hex: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Effect.Effect<string, InstanceType<typeof AddressError>>
    bytes: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Effect.Effect<any, InstanceType<typeof AddressError>>
  }
  DecodeEffect: {
    bech32: (
      input: string & Brand<"Bech32">
    ) => Effect.Effect<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
    hex: (
      input: string
    ) => Effect.Effect<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
    bytes: (
      input: any
    ) => Effect.Effect<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
  }
  EncodeEither: {
    bech32: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Either<string & Brand<"Bech32">, InstanceType<typeof AddressError>>
    hex: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Either<string, InstanceType<typeof AddressError>>
    bytes: (
      input:
        | RewardAccount.RewardAccount
        | BaseAddress.BaseAddress
        | EnterpriseAddress.EnterpriseAddress
        | PointerAddress.PointerAddress
        | ByronAddress.ByronAddress
    ) => Either<any, InstanceType<typeof AddressError>>
  }
  DecodeEither: {
    bech32: (
      input: string & Brand<"Bech32">
    ) => Either<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
    hex: (
      input: string
    ) => Either<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
    bytes: (
      input: any
    ) => Either<
      | RewardAccount.RewardAccount
      | BaseAddress.BaseAddress
      | EnterpriseAddress.EnterpriseAddress
      | PointerAddress.PointerAddress
      | ByronAddress.ByronAddress,
      InstanceType<typeof AddressError>
    >
  }
}
```

Added in v2.0.0

# model

## Address

Union type representing all possible address types.

**Signature**

```ts
export declare const Address: Schema.Union<
  [
    typeof BaseAddress.BaseAddress,
    typeof EnterpriseAddress.EnterpriseAddress,
    typeof PointerAddress.PointerAddress,
    typeof RewardAccount.RewardAccount,
    typeof ByronAddress.ByronAddress
  ]
>
```

Added in v2.0.0

## Address (type alias)

Type representing an address.

**Signature**

```ts
export type Address = typeof Address.Type
```

Added in v2.0.0

## AddressError (class)

Error thrown when address operations fail

**Signature**

```ts
export declare class AddressError
```

Added in v2.0.0

# schema

## FromBech32

Schema for encoding/decoding addresses as Bech32 strings.

**Signature**

```ts
export declare const FromBech32: Schema.transformOrFail<
  Schema.SchemaClass<string & Brand<"Bech32">, string & Brand<"Bech32">, never>,
  Schema.Union<
    [
      typeof BaseAddress.BaseAddress,
      typeof EnterpriseAddress.EnterpriseAddress,
      typeof PointerAddress.PointerAddress,
      typeof RewardAccount.RewardAccount,
      typeof ByronAddress.ByronAddress
    ]
  >,
  never
>
```

Added in v2.0.0

## FromBytes

Schema for encoding/decoding addresses as bytes.

**Signature**

```ts
export declare const FromBytes: Schema.transformOrFail<
  typeof Schema.Uint8ArrayFromSelf,
  Schema.Union<
    [
      typeof BaseAddress.BaseAddress,
      typeof EnterpriseAddress.EnterpriseAddress,
      typeof PointerAddress.PointerAddress,
      typeof RewardAccount.RewardAccount,
      typeof ByronAddress.ByronAddress
    ]
  >,
  never
>
```

Added in v2.0.0

## FromHex

Schema for encoding/decoding addresses as hex strings.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.Union<
      [
        typeof BaseAddress.BaseAddress,
        typeof EnterpriseAddress.EnterpriseAddress,
        typeof PointerAddress.PointerAddress,
        typeof RewardAccount.RewardAccount,
        typeof ByronAddress.ByronAddress
      ]
    >,
    never
  >
>
```

Added in v2.0.0

# testing

## generator

FastCheck generator for addresses.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<
  | RewardAccount.RewardAccount
  | BaseAddress.BaseAddress
  | EnterpriseAddress.EnterpriseAddress
  | PointerAddress.PointerAddress
>
```

Added in v2.0.0

# utils

## equals

Checks if two addresses are equal.

**Signature**

```ts
export declare const equals: (a: Address, b: Address) => boolean
```

Added in v2.0.0
