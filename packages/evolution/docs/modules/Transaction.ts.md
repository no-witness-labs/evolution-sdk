---
title: Transaction.ts
nav_order: 101
parent: Modules
---

## Transaction overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [Transaction (class)](#transaction-class)

---

# model

## Transaction (class)

Transaction based on Conway CDDL specification

CDDL: transaction =
[transaction_body, transaction_witness_set, bool, auxiliary_data / nil]

**Signature**

```ts
export declare class Transaction
```

Added in v2.0.0
