---
title: PolicyId.ts
nav_order: 66
parent: Modules
---

## PolicyId overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PolicyIdError (class)](#policyiderror-class)
- [generators](#generators)
  - [generator](#generator)
- [schemas](#schemas)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [PolicyId](#policyid)
- [utils](#utils)
  - [PolicyId (type alias)](#policyid-type-alias)

---

# encoding/decoding

## Codec

Codec utilities for PolicyId encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string & Brand<"PolicyId">) => any; hex: (input: string & Brand<"PolicyId">) => string }
  Decode: { bytes: (input: any) => string & Brand<"PolicyId">; hex: (input: string) => string & Brand<"PolicyId"> }
  EncodeEffect: {
    bytes: (input: string & Brand<"PolicyId">) => Effect<any, InstanceType<typeof PolicyIdError>>
    hex: (input: string & Brand<"PolicyId">) => Effect<string, InstanceType<typeof PolicyIdError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string & Brand<"PolicyId">, InstanceType<typeof PolicyIdError>>
    hex: (input: string) => Effect<string & Brand<"PolicyId">, InstanceType<typeof PolicyIdError>>
  }
  EncodeEither: {
    bytes: (input: string & Brand<"PolicyId">) => Either<any, InstanceType<typeof PolicyIdError>>
    hex: (input: string & Brand<"PolicyId">) => Either<string, InstanceType<typeof PolicyIdError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string & Brand<"PolicyId">, InstanceType<typeof PolicyIdError>>
    hex: (input: string) => Either<string & Brand<"PolicyId">, InstanceType<typeof PolicyIdError>>
  }
}
```

Added in v2.0.0

# equality

## equals

Check if two PolicyId instances are equal.

**Signature**

```ts
export declare const equals: (a: PolicyId, b: PolicyId) => boolean
```

Added in v2.0.0

# errors

## PolicyIdError (class)

Error class for PolicyId related operations.

**Signature**

```ts
export declare class PolicyIdError
```

Added in v2.0.0

# generators

## generator

Generate a random PolicyId.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<string & Brand<"PolicyId">>
```

Added in v2.0.0

# schemas

## FromBytes

Schema for transforming between Uint8Array and PolicyId.

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "PolicyId">
>
```

Added in v2.0.0

## FromHex

Schema for transforming between hex string and PolicyId.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "PolicyId">
>
```

Added in v2.0.0

## PolicyId

Schema for PolicyId representing a minting policy identifier.
A PolicyId is a script hash (hash28) that identifies a minting policy.

Note: PolicyId is equivalent to ScriptHash as defined in the CDDL:
policy_id = script_hash
script_hash = hash28

**Signature**

```ts
export declare const PolicyId: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "PolicyId"
>
```

Added in v2.0.0

# utils

## PolicyId (type alias)

**Signature**

```ts
export type PolicyId = typeof PolicyId.Type
```
