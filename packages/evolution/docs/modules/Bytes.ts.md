---
title: Bytes.ts
nav_order: 15
parent: Modules
---

## Bytes overview

---

<h2 class="text-delta">Table of contents</h2>

- [predicates](#predicates)
  - [isHexLenient](#ishexlenient)
- [schemas](#schemas)
  - [FromBytesLenient](#frombyteslenient)
  - [HexLenientSchema](#hexlenientschema)
- [utils](#utils)
  - [BytesError (class)](#byteserror-class)
  - [Codec](#codec)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [FromHexLenient](#fromhexlenient)
  - [HexSchema](#hexschema)
  - [isHex](#ishex)

---

# predicates

## isHexLenient

Lenient version of isHex that allows empty strings.
Useful for PlutusData where empty byte arrays are valid.

**Signature**

```ts
export declare const isHexLenient: (input: string) => boolean
```

Added in v2.0.0

# schemas

## FromBytesLenient

Lenient version of FromBytes that allows empty byte arrays.
Useful for PlutusData where empty byte arrays are valid.

**Signature**

```ts
export declare const FromBytesLenient: Schema.transform<
  typeof Schema.Uint8ArrayFromSelf,
  Schema.refine<string, typeof Schema.String>
>
```

Added in v2.0.0

## HexLenientSchema

Lenient hex schema that allows empty strings.
Useful for PlutusData where empty byte arrays are valid.

**Signature**

```ts
export declare const HexLenientSchema: Schema.refine<string, typeof Schema.String>
```

Added in v2.0.0

# utils

## BytesError (class)

**Signature**

```ts
export declare class BytesError
```

## Codec

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string) => any; bytesLenient: (input: string) => any }
  Decode: { bytes: (input: any) => string; bytesLenient: (input: any) => string }
  EncodeEffect: {
    bytes: (input: string) => Effect<any, InstanceType<typeof BytesError>>
    bytesLenient: (input: string) => Effect<any, InstanceType<typeof BytesError>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string, InstanceType<typeof BytesError>>
    bytesLenient: (input: any) => Effect<string, InstanceType<typeof BytesError>>
  }
  EncodeEither: {
    bytes: (input: string) => Either<any, InstanceType<typeof BytesError>>
    bytesLenient: (input: string) => Either<any, InstanceType<typeof BytesError>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string, InstanceType<typeof BytesError>>
    bytesLenient: (input: any) => Either<string, InstanceType<typeof BytesError>>
  }
}
```

## FromBytes

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  typeof Schema.Uint8ArrayFromSelf,
  Schema.refine<string, typeof Schema.String>
>
```

## FromHex

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, typeof Schema.String>,
  typeof Schema.Uint8ArrayFromSelf
>
```

## FromHexLenient

**Signature**

```ts
export declare const FromHexLenient: Schema.transform<
  Schema.refine<string, typeof Schema.String>,
  typeof Schema.Uint8ArrayFromSelf
>
```

## HexSchema

**Signature**

```ts
export declare const HexSchema: Schema.refine<string, typeof Schema.String>
```

## isHex

**Signature**

```ts
export declare const isHex: (input: string) => boolean
```
