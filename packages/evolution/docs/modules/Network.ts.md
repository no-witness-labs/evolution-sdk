---
title: Network.ts
nav_order: 70
parent: Modules
---

## Network overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [conversion](#conversion)
  - [fromId](#fromid)
  - [toId](#toid)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [NetworkError (class)](#networkerror-class)
- [model](#model)
  - [Network (type alias)](#network-type-alias)
- [predicates](#predicates)
  - [is](#is)
- [schemas](#schemas)
  - [Network](#network)

---

# constructors

## make

Smart constructor for Network that validates and applies branding.

**Signature**

```ts
export declare const make: (
  i: "Mainnet" | "Preview" | "Preprod" | "Custom",
  overrideOptions?: ParseOptions
) => "Mainnet" | "Preview" | "Preprod" | "Custom"
```

Added in v2.0.0

# conversion

## fromId

Converts a NetworkId to Network type.

**Signature**

```ts
export declare const fromId: (id: NetworkId.NetworkId) => Network
```

Added in v2.0.0

## toId

Converts a Network type to NetworkId number.

**Signature**

```ts
export declare const toId: <T extends Network>(network: T) => NetworkId.NetworkId
```

Added in v2.0.0

# equality

## equals

Check if two Network instances are equal.

**Signature**

```ts
export declare const equals: (a: Network, b: Network) => boolean
```

Added in v2.0.0

# errors

## NetworkError (class)

Error class for Network related operations.

**Signature**

```ts
export declare class NetworkError
```

Added in v2.0.0

# model

## Network (type alias)

Type alias for Network representing Cardano network types.

**Signature**

```ts
export type Network = typeof Network.Type
```

Added in v2.0.0

# predicates

## is

Check if a value is a valid Network.

**Signature**

```ts
export declare const is: (value: unknown) => value is Network
```

Added in v2.0.0

# schemas

## Network

Schema for Network representing Cardano network types.
Supports Mainnet, Preview, Preprod, and Custom networks.

**Signature**

```ts
export declare const Network: Schema.Literal<["Mainnet", "Preview", "Preprod", "Custom"]>
```

Added in v2.0.0
