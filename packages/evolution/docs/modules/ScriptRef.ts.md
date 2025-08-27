---
title: ScriptRef.ts
nav_order: 100
parent: Modules
---

## ScriptRef overview

---

<h2 class="text-delta">Table of contents</h2>

- [arbitrary](#arbitrary)
  - [arbitrary](#arbitrary-1)
- [constructors](#constructors)
  - [make](#make)
- [either](#either)
  - [Either (namespace)](#either-namespace)
- [encoding](#encoding)
  - [toBytes](#tobytes)
  - [toCBORBytes](#tocborbytes)
  - [toCBORHex](#tocborhex)
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [ScriptRefError (class)](#scriptreferror-class)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromCBORBytes](#fromcborbytes)
  - [fromCBORHex](#fromcborhex)
  - [fromHex](#fromhex)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromCBORBytes](#fromcborbytes-1)
  - [FromCBORHex](#fromcborhex-1)
  - [FromCDDL](#fromcddl)
  - [FromHex](#fromhex-1)
  - [ScriptRef (class)](#scriptref-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [utils](#utils)
  - [CDDLSchema](#cddlschema)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random ScriptRef instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<ScriptRef>
```

Added in v2.0.0

# constructors

## make

Smart constructor for ScriptRef.

**Signature**

```ts
export declare const make: (props: { readonly bytes: any }, options?: Schema.MakeOptions | undefined) => ScriptRef
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode ScriptRef to bytes.

**Signature**

```ts
export declare const toBytes: (input: ScriptRef) => any
```

Added in v2.0.0

## toCBORBytes

Encode ScriptRef to CBOR bytes.

**Signature**

```ts
export declare const toCBORBytes: (input: ScriptRef, options?: CBOR.CodecOptions) => Uint8Array
```

Added in v2.0.0

## toCBORHex

Encode ScriptRef to CBOR hex string.

**Signature**

```ts
export declare const toCBORHex: (input: ScriptRef, options?: CBOR.CodecOptions) => string
```

Added in v2.0.0

## toHex

Encode ScriptRef to hex string.

**Signature**

```ts
export declare const toHex: (input: ScriptRef) => string
```

Added in v2.0.0

# equality

## equals

Check if two ScriptRef instances are equal.

**Signature**

```ts
export declare const equals: (a: ScriptRef, b: ScriptRef) => boolean
```

Added in v2.0.0

# errors

## ScriptRefError (class)

Error class for ScriptRef related operations.

**Signature**

```ts
export declare class ScriptRefError
```

Added in v2.0.0

# parsing

## fromBytes

Parse ScriptRef from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => ScriptRef
```

Added in v2.0.0

## fromCBORBytes

Parse ScriptRef from CBOR bytes.

**Signature**

```ts
export declare const fromCBORBytes: (bytes: Uint8Array, options?: CBOR.CodecOptions) => ScriptRef
```

Added in v2.0.0

## fromCBORHex

Parse ScriptRef from CBOR hex string.

**Signature**

```ts
export declare const fromCBORHex: (hex: string, options?: CBOR.CodecOptions) => ScriptRef
```

Added in v2.0.0

## fromHex

Parse ScriptRef from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => ScriptRef
```

Added in v2.0.0

# schemas

## FromBytes

Schema for transforming from bytes to ScriptRef.

**Signature**

```ts
export declare const FromBytes: Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof ScriptRef>
```

Added in v2.0.0

## FromCBORBytes

CBOR bytes transformation schema for ScriptRef.

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
    Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>,
    typeof ScriptRef,
    never
  >
>
```

Added in v2.0.0

## FromCBORHex

CBOR hex transformation schema for ScriptRef.

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
      Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>,
      typeof ScriptRef,
      never
    >
  >
>
```

Added in v2.0.0

## FromCDDL

CDDL schema for ScriptRef following the Conway specification.

```
script_ref = #6.24(bytes .cbor script)
```

This transforms between CBOR tag 24 structure and ScriptRef model.

**Signature**

```ts
export declare const FromCDDL: Schema.transformOrFail<
  Schema.TaggedStruct<"Tag", { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }>,
  typeof ScriptRef,
  never
>
```

Added in v2.0.0

## FromHex

Schema for transforming from hex to ScriptRef.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof ScriptRef>
>
```

Added in v2.0.0

## ScriptRef (class)

Schema for ScriptRef representing a reference to a script in a transaction output.

```
CDDL: script_ref = #6.24(bytes .cbor script)
```

This represents the CBOR-encoded script bytes.
The script_ref uses CBOR tag 24 to indicate it contains CBOR-encoded script data.

**Signature**

```ts
export declare class ScriptRef
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON(): string
```

### toString (method)

**Signature**

```ts
toString(): string
```

# utils

## CDDLSchema

**Signature**

```ts
export declare const CDDLSchema: Schema.TaggedStruct<
  "Tag",
  { tag: Schema.Literal<[24]>; value: typeof Schema.Uint8ArrayFromSelf }
>
```
