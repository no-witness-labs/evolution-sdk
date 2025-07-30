---
title: Transaction.ts
nav_order: 85
parent: Modules
---

## Transaction overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [TransactionClass (class)](#transactionclass-class)
- [utils](#utils)
  - [Transaction (type alias)](#transaction-type-alias)

---

# model

## TransactionClass (class)

Transaction based on Conway CDDL specification

CDDL: transaction =
[transaction_body, transaction_witness_set, bool, auxiliary_data / nil]

**Signature**

```ts
export declare class TransactionClass
```

Added in v2.0.0

# utils

## Transaction (type alias)

**Signature**

```ts
export type Transaction = Schema.Schema.Type<typeof TransactionClass>
```
