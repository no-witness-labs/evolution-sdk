---
title: Constitution.ts
nav_order: 36
parent: Modules
---

## Constitution overview

---

<h2 class="text-delta">Table of contents</h2>

- [errors](#errors)
  - [ConstitutionError (class)](#constitutionerror-class)
- [schemas](#schemas)
  - [Constitution (class)](#constitution-class)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)
  - [FromCBORBytes](#fromcborbytes)
  - [FromCBORHex](#fromcborhex)
  - [FromCDDL](#fromcddl)
  - [arbitrary](#arbitrary)
  - [equals](#equals)
  - [fromCBORBytes](#fromcborbytes-1)
  - [fromCBORHex](#fromcborhex-1)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)

---

# errors

## ConstitutionError (class)

Error class for Constitution related operations.

**Signature**

```ts
export declare class ConstitutionError
```

Added in v2.0.0

# schemas

## Constitution (class)

Constitution per CDDL:
constitution = [anchor, script_hash/ nil]

**Signature**

```ts
export declare class Constitution
```

Added in v2.0.0

# utils

## CDDLSchema

CDDL tuple schema for Constitution

**Signature**

```ts
export declare const CDDLSchema: Schema.Tuple2<
  Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
  Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
>
```

## FromCBORBytes

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
    Schema.Tuple2<
      Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
      Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
    >,
    Schema.SchemaClass<Constitution, Constitution, never>,
    never
  >
>
```

## FromCBORHex

**Signature**

```ts
export declare const FromCBORHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<
    Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >
  >,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple2<
        Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
        Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
      >,
      Schema.SchemaClass<Constitution, Constitution, never>,
      never
    >
  >
>
```

## FromCDDL

Transform between CDDL tuple and typed Constitution

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.Tuple2<
    Schema.Tuple2<typeof Schema.String, typeof Schema.Uint8ArrayFromSelf>,
    Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
  >,
  Schema.SchemaClass<Constitution, Constitution, never>,
  never
>
```

## arbitrary

Arbitrary for Constitution

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<Constitution>
```

## equals

Equality for Constitution

**Signature**

```ts
export declare const equals: (a: Constitution, b: Constitution) => boolean
```

## fromCBORBytes

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => Constitution
```

## fromCBORHex

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => Constitution
```

## toCBORBytes

**Signature**

```ts
export declare const toCBORBytes: (input: Constitution, options?: CBOR.CodecOptions) => Uint8Array
```

## toCBORHex

**Signature**

```ts
export declare const toCBORHex: (input: Constitution, options?: CBOR.CodecOptions) => string
```
