---
title: BootstrapWitness.ts
nav_order: 16
parent: Modules
---

## BootstrapWitness overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BootstrapWitness (class)](#bootstrapwitness-class)
  - [CDDLSchema](#cddlschema)
  - [FromCDDL](#fromcddl)
  - [arbitrary](#arbitrary)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)

---

# utils

## BootstrapWitness (class)

Bootstrap witness for Byron-era addresses.

CDDL:

```
bootstrap_witness = [
  public_key : vkey,
  signature : ed25519_signature,
  chain_code : bytes .size 32,
  attributes : bytes
]
```

**Signature**

```ts
export declare class BootstrapWitness
```

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple<
  [
    typeof Schema.Uint8ArrayFromSelf,
    typeof Schema.Uint8ArrayFromSelf,
    typeof Schema.Uint8ArrayFromSelf,
    typeof Schema.Uint8ArrayFromSelf
  ]
>
```

## FromCDDL

Transform between tuple CDDL shape and class.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.Uint8ArrayFromSelf
    ]
  >,
  Schema.SchemaClass<BootstrapWitness, BootstrapWitness, never>,
  never
>
```

## arbitrary

Arbitrary generator for BootstrapWitness instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<BootstrapWitness>
```

## fromCBORBytes

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => BootstrapWitness
```

## fromCBORHex

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => BootstrapWitness
```

## toCBORBytes

**Signature**

```ts
export declare const toCBORBytes: (input: BootstrapWitness, options?: CBOR.CodecOptions) => Uint8Array
```

## toCBORHex

**Signature**

```ts
export declare const toCBORHex: (input: BootstrapWitness, options?: CBOR.CodecOptions) => string
```
