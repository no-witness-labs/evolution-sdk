---
title: MultiHostName.ts
nav_order: 64
parent: Modules
---

## MultiHostName overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [conversion](#conversion)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
- [effect](#effect)
  - [Either (namespace)](#either-namespace)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [MultiHostNameError (class)](#multihostnameerror-class)
- [model](#model)
  - [MultiHostName (class)](#multihostname-class)
- [schemas](#schemas)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
- [testing](#testing)
  - [arbitrary](#arbitrary)

---

# constructors

## make

Create a MultiHostName instance.

**Signature**

```ts
export declare const make: (dnsName: DnsName.DnsName) => MultiHostName
```

Added in v2.0.0

# conversion

## fromCBORBytes

Convert CBOR bytes to MultiHostName (unsafe)

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => MultiHostName
```

Added in v2.0.0

## fromCBORHex

Convert CBOR hex string to MultiHostName (unsafe)

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => MultiHostName
```

Added in v2.0.0

## toCBORBytes

Convert MultiHostName to CBOR bytes (unsafe)

**Signature**

```ts
export declare const toCBORBytes: (input: MultiHostName, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Convert MultiHostName to CBOR hex string (unsafe)

**Signature**

```ts
export declare const toCBORHex: (input: MultiHostName, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

# effect

## Either (namespace)

Effect namespace for MultiHostName operations that can fail

Added in v2.0.0

# equality

## equals

Check if two MultiHostName instances are equal.

**Signature**

```ts
export declare const equals: (self: MultiHostName, that: MultiHostName) => boolean
```

Added in v2.0.0

# errors

## MultiHostNameError (class)

Error class for MultiHostName related operations.

**Signature**

```ts
export declare class MultiHostNameError
```

Added in v2.0.0

# model

## MultiHostName (class)

Schema for MultiHostName representing a multiple host name record.
multi_host_name = (2, dns_name)

**Signature**

```ts
export declare class MultiHostName
```

Added in v2.0.0

# schemas

## FromCBORBytes

CBOR bytes transformation schema for MultiHostName.

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
    Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
    Schema.SchemaClass<MultiHostName, MultiHostName, never>,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for MultiHostName.

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
      Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
      Schema.SchemaClass<MultiHostName, MultiHostName, never>,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for MultiHostName.
multi_host_name = (2, dns_name)

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<Schema.Literal<[2n]>, typeof Schema.String>,
  Schema.SchemaClass<MultiHostName, MultiHostName, never>,
  never
>
```

Added in v2.0.0

# testing

## arbitrary

FastCheck arbitrary for MultiHostName instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<MultiHostName>
```

Added in v2.0.0
