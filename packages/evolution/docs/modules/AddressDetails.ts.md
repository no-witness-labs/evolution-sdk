---
title: AddressDetails.ts
nav_order: 2
parent: Modules
---

## AddressDetails overview

---

<h2 class="text-delta">Table of contents</h2>

- [schemas](#schemas)
  - [AddressDetails (class)](#addressdetails-class)
- [utils](#utils)
  - [AddressDetailsError (class)](#addressdetailserror-class)
  - [Codec](#codec)
  - [FromBech32](#frombech32)
  - [FromHex](#fromhex)

---

# schemas

## AddressDetails (class)

Pointer address with payment credential and pointer to stake registration

**Signature**

```ts
export declare class AddressDetails
```

Added in v2.0.0

# utils

## AddressDetailsError (class)

**Signature**

```ts
export declare class AddressDetailsError
```

## Codec

**Signature**

```ts
export declare const Codec: {
  Encode: { bech32: (input: AddressDetails) => string & Brand<"Bech32">; hex: (input: AddressDetails) => string }
  Decode: { bech32: (input: string & Brand<"Bech32">) => AddressDetails; hex: (input: string) => AddressDetails }
  EncodeEffect: {
    bech32: (input: AddressDetails) => Effect.Effect<string & Brand<"Bech32">, InstanceType<typeof AddressDetailsError>>
    hex: (input: AddressDetails) => Effect.Effect<string, InstanceType<typeof AddressDetailsError>>
  }
  DecodeEffect: {
    bech32: (input: string & Brand<"Bech32">) => Effect.Effect<AddressDetails, InstanceType<typeof AddressDetailsError>>
    hex: (input: string) => Effect.Effect<AddressDetails, InstanceType<typeof AddressDetailsError>>
  }
  EncodeEither: {
    bech32: (input: AddressDetails) => Either<string & Brand<"Bech32">, InstanceType<typeof AddressDetailsError>>
    hex: (input: AddressDetails) => Either<string, InstanceType<typeof AddressDetailsError>>
  }
  DecodeEither: {
    bech32: (input: string & Brand<"Bech32">) => Either<AddressDetails, InstanceType<typeof AddressDetailsError>>
    hex: (input: string) => Either<AddressDetails, InstanceType<typeof AddressDetailsError>>
  }
}
```

## FromBech32

**Signature**

```ts
export declare const FromBech32: Schema.transformOrFail<
  Schema.SchemaClass<string & Brand<"Bech32">, string & Brand<"Bech32">, never>,
  typeof AddressDetails,
  never
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transformOrFail<
  Schema.refine<string, typeof Schema.String>,
  typeof AddressDetails,
  never
>
```
