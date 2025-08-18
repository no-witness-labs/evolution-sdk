---
title: PolicyId.ts
nav_order: 79
parent: Modules
---

## PolicyId overview

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
  - [toHex](#tohex)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [PolicyIdError (class)](#policyiderror-class)
- [model](#model)
  - [PolicyId (class)](#policyid-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
- [parsing](#parsing)
  - [fromBytes](#frombytes)
  - [fromHex](#fromhex)
- [predicates](#predicates)
  - [isPolicyId](#ispolicyid)
- [schemas](#schemas)
  - [FromBytes](#frombytes-1)
  - [FromHex](#fromhex-1)

---

# arbitrary

## arbitrary

FastCheck arbitrary for generating random PolicyId instances.

**Signature**

```ts
export declare const arbitrary: FastCheck.Arbitrary<PolicyId>
```

Added in v2.0.0

# constructors

## make

Smart constructor for PolicyId that validates and applies branding.

**Signature**

```ts
export declare const make: (props: { readonly hash: any }, options?: Schema.MakeOptions | undefined) => PolicyId
```

Added in v2.0.0

# either

## Either (namespace)

Either-based error handling variants for functions that can fail.

Added in v2.0.0

# encoding

## toBytes

Encode PolicyId to bytes.

**Signature**

```ts
export declare const toBytes: (input: PolicyId) => any
```

Added in v2.0.0

## toHex

Encode PolicyId to hex string.

**Signature**

```ts
export declare const toHex: (input: PolicyId) => string
```

Added in v2.0.0

# equality

## equals

Check if two PolicyId instances are equal.

**Signature**

```ts
export declare const equals: (a: PolicyId, b: PolicyId) => boolean
```

Added in v2.0.0

# errors

## PolicyIdError (class)

Error class for PolicyId related operations.

**Signature**

```ts
export declare class PolicyIdError
```

Added in v2.0.0

# model

## PolicyId (class)

PolicyId as a TaggedClass representing a minting policy identifier.
A PolicyId is a script hash (hash28) that identifies a minting policy.

Note: PolicyId is equivalent to ScriptHash as defined in the CDDL:
policy_id = script_hash
script_hash = hash28

**Signature**

```ts
export declare class PolicyId
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

# parsing

## fromBytes

Parse PolicyId from bytes.

**Signature**

```ts
export declare const fromBytes: (input: any) => PolicyId
```

Added in v2.0.0

## fromHex

Parse PolicyId from hex string.

**Signature**

```ts
export declare const fromHex: (input: string) => PolicyId
```

Added in v2.0.0

# predicates

## isPolicyId

Check if the given value is a valid PolicyId

**Signature**

```ts
export declare const isPolicyId: (u: unknown, overrideOptions?: ParseOptions | number) => u is PolicyId
```

Added in v2.0.0

# schemas

## FromBytes

Schema transformer from bytes to PolicyId.

**Signature**

```ts
export declare const FromBytes: Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof PolicyId>
```

Added in v2.0.0

## FromHex

Schema transformer from hex string to PolicyId.

**Signature**

```ts
export declare const FromHex: Schema.transform<
  Schema.transform<Schema.Schema<string, string, never>, Schema.Schema<Uint8Array, Uint8Array, never>>,
  Schema.transform<Schema.filter<typeof Schema.Uint8ArrayFromSelf>, typeof PolicyId>
>
```

Added in v2.0.0
