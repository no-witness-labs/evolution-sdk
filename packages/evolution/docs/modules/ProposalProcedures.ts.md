---
title: ProposalProcedures.ts
nav_order: 72
parent: Modules
---

## ProposalProcedures overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [ProposalProcedures](#proposalprocedures)
- [utils](#utils)
  - [ProposalProcedures (type alias)](#proposalprocedures-type-alias)

---

# model

## ProposalProcedures

ProposalProcedures based on Conway CDDL specification

```
CDDL: proposal_procedures = nonempty_set<proposal_procedure>
```

This is a non-empty set of proposal procedures.

**Signature**

```ts
export declare const ProposalProcedures: typeof Schema.Unknown
```

Added in v2.0.0

# utils

## ProposalProcedures (type alias)

**Signature**

```ts
export type ProposalProcedures = Schema.Schema.Type<typeof ProposalProcedures>
```
