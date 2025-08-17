---
title: OperationalCert.ts
nav_order: 71
parent: Modules
---

## OperationalCert overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [OperationalCertError (class)](#operationalcerterror-class)
- [model](#model)
  - [OperationalCert (class)](#operationalcert-class)
- [parsing](#parsing)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
- [predicates](#predicates)
  - [isOperationalCert](#isoperationalcert)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random OperationalCert instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<OperationalCert>
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toCBORBytes

Encode OperationalCert to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (value: OperationalCert, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode OperationalCert to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (value: OperationalCert, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# equality

## equals

Check if two OperationalCert instances are equal.

**Signature**

```ts
export declare const equals: (a: OperationalCert, b: OperationalCert) => boolean
```

Added in v2.0.0

# errors

## OperationalCertError (class)

Error class for OperationalCert operations

**Signature**

```ts
export declare class OperationalCertError
```

Added in v2.0.0

# model

## OperationalCert (class)

OperationalCert class based on Conway CDDL specification

CDDL:

```
operational_cert = [
  hot_vkey : kes_vkey,
  sequence_number : uint64,
  kes_period : uint64,
  sigma : ed25519_signature
]
```

**Signature**

```ts
export declare class OperationalCert
```

Added in v2.0.0

# parsing

## fromCBORBytes

Parse OperationalCert from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => OperationalCert
```

Added in v2.0.0

## fromCBORHex

Parse OperationalCert from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => OperationalCert
```

Added in v2.0.0

# predicates

## isOperationalCert

Check if the given value is a valid OperationalCert

**Signature**

```ts
export declare const isOperationalCert: (u: unknown, overrideOptions?: ParseOptions | number) => u is OperationalCert
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for OperationalCert.

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
    Schema.Tuple<
      [
        typeof Schema.Uint8ArrayFromSelf,
        typeof Schema.BigIntFromSelf,
        typeof Schema.BigIntFromSelf,
        typeof Schema.Uint8ArrayFromSelf
      ]
    >,
    Schema.SchemaClass<OperationalCert, OperationalCert, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for OperationalCert.

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
      Schema.Tuple<
        [
          typeof Schema.Uint8ArrayFromSelf,
          typeof Schema.BigIntFromSelf,
          typeof Schema.BigIntFromSelf,
          typeof Schema.Uint8ArrayFromSelf
        ]
      >,
      Schema.SchemaClass<OperationalCert, OperationalCert, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for OperationalCert.
operational_cert = [
hot_vkey : kes_vkey,
sequence_number : uint64,
kes_period : uint64,
sigma : ed25519_signature
]

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple<
    [
      typeof Schema.Uint8ArrayFromSelf,
      typeof Schema.BigIntFromSelf,
      typeof Schema.BigIntFromSelf,
      typeof Schema.Uint8ArrayFromSelf
    ]
  >,
  Schema.SchemaClass<OperationalCert, OperationalCert, never>,
  never
>
```

Added in v2.0.0
