---
title: VrfCert.ts
nav_order: 117
parent: Modules
---

## VrfCert overview

---

<h2 class="text-delta">Table of contents</h2>

- [Either](#either)
  - [Either (namespace)](#either-namespace)
- [FastCheck](#fastcheck)
  - [arbitrary](#arbitrary)
- [constructors](#constructors)
  - [make](#make)
- [decoding](#decoding)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [VrfCertError (class)](#vrfcerterror-class)
- [model](#model)
  - [VrfCert (class)](#vrfcert-class)
- [predicates](#predicates)
  - [isVrfCert](#isvrfcert)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [VRFOutput (class)](#vrfoutput-class)
  - [VRFOutputFromBytes](#vrfoutputfrombytes)
  - [VRFOutputHexSchema](#vrfoutputhexschema)
  - [VRFProof (class)](#vrfproof-class)
  - [VRFProofFromBytes](#vrfprooffrombytes)
  - [VRFProofHexSchema](#vrfproofhexschema)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# Either

## Either (namespace)

Either namespace containing schema decode and encode operations.

Added in v2.0.0

# FastCheck

## arbitrary

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<VrfCert>
```

Added in v2.0.0

# constructors

## make

Create a VrfCert from output and proof.

**Signature**

```ts
export declare const make: (output: VRFOutput, proof: VRFProof) => VrfCert
```

Added in v2.0.0

# decoding

## fromCBORBytes

Parse VrfCert from CBOR bytes (unsafe).

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => VrfCert
```

Added in v2.0.0

## fromCBORHex

Parse VrfCert from CBOR hex (unsafe).

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => VrfCert
```

Added in v2.0.0

# encoding

## toCBORBytes

Convert VrfCert to CBOR bytes (unsafe).

**Signature**

```ts
export declare const toCBORBytes: (input: VrfCert, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert VrfCert to CBOR hex (unsafe).

**Signature**

```ts
export declare const toCBORHex: (input: VrfCert, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two VrfCert instances are equal.

**Signature**

```ts
export declare const equals: (a: VrfCert, b: VrfCert) => boolean
```

Added in v2.0.0

# errors

## VrfCertError (class)

Error class for VrfCert related operations.

**Signature**

```ts
export declare class VrfCertError
```

Added in v2.0.0

# model

## VrfCert (class)

Schema for VrfCert representing a VRF certificate.
vrf_cert = [vrf_output, vrf_proof]

**Signature**

```ts
export declare class VrfCert
```

Added in v2.0.0

# predicates

## isVrfCert

Check if the given value is a valid VrfCert.

**Signature**

```ts
export declare const isVrfCert: (u: unknown, overrideOptions?: ParseOptions | number) => u is VrfCert
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for VrfCert.

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
    Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>,
    Schema.SchemaClass<VrfCert, VrfCert, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for VrfCert.

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
      Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>,
      Schema.SchemaClass<VrfCert, VrfCert, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for VrfCert as tuple structure.
vrf_cert = [vrf_output, vrf_proof]
vrf_output = bytes .size 32
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>,
  Schema.SchemaClass<VrfCert, VrfCert, never>,
  never
>
```

Added in v2.0.0

## VRFOutput (class)

Schema for VRF output (32 bytes).
vrf_output = bytes .size 32

**Signature**

```ts
export declare class VRFOutput
```

Added in v2.0.0

## VRFOutputFromBytes

Schema for VRF output as a byte array.
vrf_output = bytes .size 32

**Signature**

```ts
export declare const VRFOutputFromBytes: Schema.transform<
  Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
  typeof VRFOutput
>
```

Added in v2.0.0

## VRFOutputHexSchema

Schema for VRF output as a hex string.
vrf_output = bytes .size 32

**Signature**

```ts
export declare const VRFOutputHexSchema: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof VRFOutput>
>
```

Added in v2.0.0

## VRFProof (class)

Schema for VRF proof (80 bytes).
vrf_proof = bytes .size 80

**Signature**

```ts
export declare class VRFProof
```

Added in v2.0.0

## VRFProofFromBytes

Schema for VRF proof as a byte array.
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VRFProofFromBytes: Schema.transform<
  Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
  typeof VRFProof
>
```

Added in v2.0.0

## VRFProofHexSchema

Schema for VRF proof as a hex string.
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VRFProofHexSchema: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof VRFProof>
>
```

Added in v2.0.0

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>
```
