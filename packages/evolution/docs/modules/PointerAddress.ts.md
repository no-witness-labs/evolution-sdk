---
title: PointerAddress.ts
nav_order: 65
parent: Modules
---

## PointerAddress overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [decodeVariableLength](#decodevariablelength)
  - [encodeVariableLength](#encodevariablelength)
- [equality](#equality)
  - [equals](#equals)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [PointerAddressError (class)](#pointeraddresserror-class)
- [schemas](#schemas)
  - [PointerAddress (class)](#pointeraddress-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [utils](#utils)
  - [Codec](#codec)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)

---

# encoding/decoding

## decodeVariableLength

Decode a variable length integer from a Uint8Array
Following the Cardano ledger implementation for variable-length integers

**Signature**

```ts
export declare const decodeVariableLength: (
  bytes: Uint8Array,
  offset?: number | undefined
) => Effect.Effect<[Natural.Natural, number], PointerAddressError | ParseResult.ParseIssue>
```

Added in v2.0.0

## encodeVariableLength

Encode a number as a variable length integer following the Cardano ledger specification

**Signature**

```ts
export declare const encodeVariableLength: (
  natural: Natural.Natural
) => Effect.Effect<Uint8Array, ParseResult.ParseIssue, never>
```

Added in v2.0.0

# equality

## equals

Check if two PointerAddress instances are equal.

**Signature**

```ts
export declare const equals: (a: PointerAddress, b: PointerAddress) => boolean
```

Added in v2.0.0

# generators

## generator

Generate a random PointerAddress.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<PointerAddress>
```

Added in v2.0.0

# model

## PointerAddressError (class)

Error thrown when address operations fail

**Signature**

```ts
export declare class PointerAddressError
```

Added in v2.0.0

# schemas

## PointerAddress (class)

Pointer address with payment credential and pointer to stake registration

**Signature**

```ts
export declare class PointerAddress
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

# utils

## Codec

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: PointerAddress) => any; hex: (input: PointerAddress) => string }
  Decode: { bytes: (input: any) => PointerAddress; hex: (input: string) => PointerAddress }
  EncodeEffect: {
    bytes: (input: PointerAddress) => Effect.Effect<any, InstanceType<typeof PointerAddressError>>
    hex: (input: PointerAddress) => Effect.Effect<string, InstanceType<typeof PointerAddressError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect.Effect<PointerAddress, InstanceType<typeof PointerAddressError>>
    hex: (input: string) => Effect.Effect<PointerAddress, InstanceType<typeof PointerAddressError>>
  }
  EncodeEither: {
    bytes: (input: PointerAddress) => Either<any, InstanceType<typeof PointerAddressError>>
    hex: (input: PointerAddress) => Either<string, InstanceType<typeof PointerAddressError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<PointerAddress, InstanceType<typeof PointerAddressError>>
    hex: (input: string) => Either<PointerAddress, InstanceType<typeof PointerAddressError>>
  }
}
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, typeof PointerAddress, never>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transformOrFail<typeof Schema.Uint8ArrayFromSelf, typeof PointerAddress, never>
>
```
