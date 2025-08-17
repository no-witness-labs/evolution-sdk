---
title: DataJson.ts
nav_order: 38
parent: Modules
---

## DataJson overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ByteArray](#bytearray)
  - [ByteArray (interface)](#bytearray-interface)
  - [Constr](#constr)
  - [Constr (interface)](#constr-interface)
  - [Data](#data)
  - [Data (type alias)](#data-type-alias)
  - [Integer](#integer)
  - [Integer (interface)](#integer-interface)
  - [List](#list)
  - [List (interface)](#list-interface)
  - [Map](#map)
  - [Map (type alias)](#map-type-alias)
  - [isByteArray](#isbytearray)
  - [isConstr](#isconstr)
  - [isInteger](#isinteger)
  - [isList](#islist)
  - [isMap](#ismap)
  - [mkConstr (interface)](#mkconstr-interface)

---

# utils

## ByteArray

**Signature**

```ts
export declare const ByteArray: Schema.Struct<{ bytes: Schema.filter<Schema.Schema<string, string, never>> }>
```

## ByteArray (interface)

**Signature**

```ts
export interface ByteArray {
  readonly bytes: string
}
```

## Constr

**Signature**

```ts
export declare const Constr: Schema.Struct<{
  constructor: typeof Schema.Number
  fields: Schema.Array$<Schema.suspend<Data, Data, never>>
}>
```

## Constr (interface)

**Signature**

```ts
export interface Constr {
  readonly constructor: number
  readonly fields: ReadonlyArray<Data>
}
```

## Data

**Signature**

```ts
export declare const Data: Schema.Schema<Data, Data, never>
```

## Data (type alias)

Plutus data types and schemas for serialization/deserialization between
TypeScript types and Cardano's Plutus data format

**Signature**

```ts
export type Data = Integer | ByteArray | List | Map | Constr
```

Added in v1.0.0

## Integer

**Signature**

```ts
export declare const Integer: Schema.Struct<{ int: typeof Schema.Number }>
```

## Integer (interface)

**Signature**

```ts
export interface Integer {
  readonly int: number
}
```

## List

**Signature**

```ts
export declare const List: Schema.Array$<Schema.suspend<Data, Data, never>>
```

## List (interface)

**Signature**

```ts
export interface List extends ReadonlyArray<Data> {}
```

## Map

**Signature**

```ts
export declare const Map: Schema.Record$<typeof Schema.String, Schema.suspend<Data, Data, never>>
```

## Map (type alias)

**Signature**

```ts
export type Map = {
  readonly [key: string]: Data
}
```

## isByteArray

**Signature**

```ts
export declare const isByteArray: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is { readonly bytes: string }
```

## isConstr

**Signature**

```ts
export declare const isConstr: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is { readonly fields: readonly Data[]; readonly constructor: number }
```

## isInteger

**Signature**

```ts
export declare const isInteger: (u: unknown, overrideOptions?: ParseOptions | number) => u is { readonly int: number }
```

## isList

**Signature**

```ts
export declare const isList: (u: unknown, overrideOptions?: ParseOptions | number) => u is readonly Data[]
```

## isMap

**Signature**

```ts
export declare const isMap: (u: unknown, overrideOptions?: ParseOptions | number) => u is { readonly [x: string]: Data }
```

## mkConstr (interface)

**Signature**

```ts
export interface mkConstr<T extends Data> {
  readonly constructor: number
  readonly fields: ReadonlyArray<T>
}
```
