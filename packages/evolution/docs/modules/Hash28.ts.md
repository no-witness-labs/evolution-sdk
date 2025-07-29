---
title: Hash28.ts
nav_order: 44
parent: Modules
---

## Hash28 overview

---

<h2 class="text-delta">Table of contents</h2>

- [encoding/decoding](#encodingdecoding)
  - [Codec](#codec)
- [schemas](#schemas)
  - [BytesSchema](#bytesschema)
  - [FromBytes](#frombytes)
  - [FromHex](#fromhex)
  - [FromVariableBytes](#fromvariablebytes)
  - [HexSchema](#hexschema)
  - [VariableBytesSchema](#variablebytesschema)
  - [VariableHexSchema](#variablehexschema)
- [utils](#utils)
  - [HASH28_BYTES_LENGTH](#hash28_bytes_length)
  - [HASH28_HEX_LENGTH](#hash28_hex_length)
  - [Hash28Error (class)](#hash28error-class)

---

# encoding/decoding

## Codec

Codec for Hash28 encoding and decoding operations.

**Signature**

```ts
export declare const Codec: {
  Encode: { bytes: (input: string) => any; variableBytes: (input: string) => any }
  Decode: { bytes: (input: any) => string; variableBytes: (input: any) => string }
  EncodeEffect: {
    bytes: (input: string) => Effect<any, InstanceType<typeof Hash28Error>>
    variableBytes: (input: string) => Effect<any, InstanceType<typeof Hash28Error>>
  }
  DecodeEffect: {
    bytes: (input: any) => Effect<string, InstanceType<typeof Hash28Error>>
    variableBytes: (input: any) => Effect<string, InstanceType<typeof Hash28Error>>
  }
  EncodeEither: {
    bytes: (input: string) => Either<any, InstanceType<typeof Hash28Error>>
    variableBytes: (input: string) => Either<any, InstanceType<typeof Hash28Error>>
  }
  DecodeEither: {
    bytes: (input: any) => Either<string, InstanceType<typeof Hash28Error>>
    variableBytes: (input: any) => Either<string, InstanceType<typeof Hash28Error>>
  }
}
```

Added in v2.0.0

# schemas

## BytesSchema

Schema for Hash28 bytes with 28-byte length validation.

**Signature**

```ts
export declare const BytesSchema: Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>
```

Added in v2.0.0

## FromBytes

Schema transformation that converts from Uint8Array to hex string.
Like Bytes.FromBytes but with Hash28-specific length validation.

**Signature**

```ts
export declare const FromBytes: Schema.transform<
  Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>
>
```

Added in v2.0.0

## FromHex

Schema transformation that converts from hex string to Uint8Array.
Like Bytes.FromHex but with Hash28-specific length validation.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>,
  Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>
>
```

Added in v2.0.0

## FromVariableBytes

Schema transformer for variable-length data that converts between hex strings and byte arrays.
Works with 0 to 28 bytes (0 to 56 hex characters).

**Signature**

```ts
export declare const FromVariableBytes: Schema.transform<
  Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>,
  Schema.refine<string, Schema.refine<string, typeof Schema.String>>
>
```

Added in v2.0.0

## HexSchema

Schema for Hash28 hex strings with 56-character length validation.

**Signature**

```ts
export declare const HexSchema: Schema.refine<string, Schema.refine<string, typeof Schema.String>>
```

Added in v2.0.0

## VariableBytesSchema

Schema for variable-length byte arrays from 0 to 28 bytes.
Useful for asset names and other variable-length data structures.

**Signature**

```ts
export declare const VariableBytesSchema: Schema.refine<any, typeof Schema.Uint8ArrayFromSelf>
```

Added in v2.0.0

## VariableHexSchema

Schema for variable-length hex strings from 0 to 56 characters (0 to 28 bytes).
Useful for asset names and other variable-length data structures.

**Signature**

```ts
export declare const VariableHexSchema: Schema.refine<string, Schema.refine<string, typeof Schema.String>>
```

Added in v2.0.0

# utils

## HASH28_BYTES_LENGTH

**Signature**

```ts
export declare const HASH28_BYTES_LENGTH: 28
```

## HASH28_HEX_LENGTH

**Signature**

```ts
export declare const HASH28_HEX_LENGTH: 56
```

## Hash28Error (class)

**Signature**

```ts
export declare class Hash28Error
```
