---
title: Bytes57.ts
nav_order: 21
parent: Modules
---

## Bytes57 overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [BYTES_LENGTH](#bytes_length)
  - [BytesFromHex](#bytesfromhex)
  - [BytesSchema](#bytesschema)
  - [HEX_LENGTH](#hex_length)
  - [HexSchema](#hexschema)

---

# utils

## BYTES_LENGTH

**Signature**

```ts
export declare const BYTES_LENGTH: 57
```

## BytesFromHex

**Signature**

```ts
export declare const BytesFromHex: Schema.transform<
  Schema.filter<Schema.refine<string, typeof Schema.String>>,
  Schema.filter<typeof Schema.Uint8ArrayFromSelf>
>
```

## BytesSchema

**Signature**

```ts
export declare const BytesSchema: Schema.filter<typeof Schema.Uint8ArrayFromSelf>
```

## HEX_LENGTH

**Signature**

```ts
export declare const HEX_LENGTH: 114
```

## HexSchema

**Signature**

```ts
export declare const HexSchema: Schema.filter<Schema.refine<string, typeof Schema.String>>
```
