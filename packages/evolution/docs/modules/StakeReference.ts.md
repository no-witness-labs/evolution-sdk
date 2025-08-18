---
title: StakeReference.ts
nav_order: 99
parent: Modules
---

## StakeReference overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [StakeReference (type alias)](#stakereference-type-alias)
- [schemas](#schemas)
  - [StakeReference](#stakereference)

---

# model

## StakeReference (type alias)

Type representing a reference to staking information
Can be a credential (key hash or script hash) or a pointer

**Signature**

```ts
export type StakeReference = Schema.Schema.Type<typeof StakeReference>
```

Added in v2.0.0

# schemas

## StakeReference

Schema for stake reference that can be either a credential or a pointer

**Signature**

```ts
export declare const StakeReference: Schema.UndefinedOr<
  Schema.Union<[Schema.Union<[typeof KeyHash, typeof ScriptHash]>, typeof Pointer.Pointer]>
>
```

Added in v2.0.0
