---
title: VrfCert.ts
nav_order: 98
parent: Modules
---

## VrfCert overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [VrfCertError (class)](#vrfcerterror-class)
- [model](#model)
  - [VRFOutput (type alias)](#vrfoutput-type-alias)
  - [VRFProof (type alias)](#vrfproof-type-alias)
  - [VrfCert (class)](#vrfcert-class)
- [predicates](#predicates)
  - [isVrfCert](#isvrfcert)
- [schemas](#schemas)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [VRFOutput](#vrfoutput)
  - [VRFOutputFromBytes](#vrfoutputfrombytes)
  - [VRFOutputHexSchema](#vrfoutputhexschema)
  - [VRFProof](#vrfproof)
  - [VRFProofFromBytes](#vrfprooffrombytes)
  - [VRFProofHexSchema](#vrfproofhexschema)
  - [VrfCertCDDLSchema](#vrfcertcddlschema)
- [utils](#utils)
  - [Codec](#codec)

---

# constructors

## make

Create a VrfCert from output and proof.

**Signature**

```ts
export declare const make: (output: VRFOutput, proof: VRFProof) => VrfCert
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

## VRFOutput (type alias)

Type alias for VRF output.

**Signature**

```ts
export type VRFOutput = typeof VRFOutput.Type
```

Added in v2.0.0

## VRFProof (type alias)

Type alias for VRF proof.

**Signature**

```ts
export type VRFProof = typeof VRFProof.Type
```

Added in v2.0.0

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

## CBORBytesSchema

CBOR bytes transformation schema for VrfCert.

**Signature**

```ts
export declare const CBORBytesSchema: (
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

## CBORHexSchema

CBOR hex transformation schema for VrfCert.

**Signature**

```ts
export declare const CBORHexSchema: (
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
      Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>,
      Schema.SchemaClass<VrfCert, VrfCert, never>,
      never
    >
  >
>
```

Added in v2.0.0

## VRFOutput

Schema for VRF output (32 bytes).
vrf_output = bytes .size 32

**Signature**

```ts
export declare const VRFOutput: Schema.brand<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  "VrfOutput"
>
```

Added in v2.0.0

## VRFOutputFromBytes

Schema for VRF output as a byte array.
vrf_output = bytes .size 32

**Signature**

```ts
export declare const VRFOutputFromBytes: Schema.transform<
  Schema.transform<
    Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
    Schema.refine<string, Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "VrfOutput">
>
```

Added in v2.0.0

## VRFOutputHexSchema

Schema for VRF output as a hex string.
vrf_output = bytes .size 32

**Signature**

```ts
export declare const VRFOutputHexSchema: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.refine<string, Schema.refine<string, typeof Schema.String>>, "VrfOutput">
>
```

Added in v2.0.0

## VRFProof

Schema for VRF proof (80 bytes).
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VRFProof: Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "VrfProof">
```

Added in v2.0.0

## VRFProofFromBytes

Schema for VRF proof as a byte array.
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VRFProofFromBytes: Schema.transform<
  Schema.transform<
    Schema.filter<typeof Schema.Uint8ArrayFromSelf>,
    Schema.filter<Schema.refine<string, typeof Schema.String>>
  >,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "VrfProof">
>
```

Added in v2.0.0

## VRFProofHexSchema

Schema for VRF proof as a hex string.
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VRFProofHexSchema: Schema.transform<
  Schema.filter<Schema.refine<string, typeof Schema.String>>,
  Schema.brand<Schema.filter<Schema.refine<string, typeof Schema.String>>, "VrfProof">
>
```

Added in v2.0.0

## VrfCertCDDLSchema

CDDL schema for VrfCert as tuple structure.
vrf_cert = [vrf_output, vrf_proof]
vrf_output = bytes .size 32
vrf_proof = bytes .size 80

**Signature**

```ts
export declare const VrfCertCDDLSchema: Schema.transformOrFail<
  Schema.Tuple2<typeof Schema.Uint8ArrayFromSelf, typeof Schema.Uint8ArrayFromSelf>,
  Schema.SchemaClass<VrfCert, VrfCert, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: VrfCert) => any; cborHex: (input: VrfCert) => string }
  Decode: { cborBytes: (input: any) => VrfCert; cborHex: (input: string) => VrfCert }
  EncodeEffect: {
    cborBytes: (input: VrfCert) => Effect.Effect<any, InstanceType<typeof VrfCertError>>
    cborHex: (input: VrfCert) => Effect.Effect<string, InstanceType<typeof VrfCertError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<VrfCert, InstanceType<typeof VrfCertError>>
    cborHex: (input: string) => Effect.Effect<VrfCert, InstanceType<typeof VrfCertError>>
  }
  EncodeEither: {
    cborBytes: (input: VrfCert) => Either<any, InstanceType<typeof VrfCertError>>
    cborHex: (input: VrfCert) => Either<string, InstanceType<typeof VrfCertError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<VrfCert, InstanceType<typeof VrfCertError>>
    cborHex: (input: string) => Either<VrfCert, InstanceType<typeof VrfCertError>>
  }
}
```
