---
title: Block.ts
nav_order: 10
parent: Modules
---

## Block overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [BlockClass (class)](#blockclass-class)
- [utils](#utils)
  - [Block (type alias)](#block-type-alias)

---

# model

## BlockClass (class)

Block based on Conway CDDL specification

```
CDDL: block =
  [ header
  , transaction_bodies       : [* transaction_body]
  , transaction_witness_sets : [* transaction_witness_set]
  , auxiliary_data_set       : {* transaction_index => auxiliary_data}
  , invalid_transactions     : [* transaction_index]
  ]
```

Valid blocks must also satisfy the following two constraints:

1. the length of transaction_bodies and transaction_witness_sets
   must be the same
2. every transaction_index must be strictly smaller than the
   length of transaction_bodies

**Signature**

```ts
export declare class BlockClass
```

Added in v2.0.0

# utils

## Block (type alias)

**Signature**

```ts
export type Block = Schema.Schema.Type<typeof BlockClass>
```
