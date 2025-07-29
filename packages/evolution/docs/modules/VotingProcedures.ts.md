---
title: VotingProcedures.ts
nav_order: 97
parent: Modules
---

## VotingProcedures overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [VotingProcedures](#votingprocedures)
- [utils](#utils)
  - [VotingProcedures (type alias)](#votingprocedures-type-alias)

---

# model

## VotingProcedures

VotingProcedures based on Conway CDDL specification

CDDL: voting_procedures = {+ voter => {+ gov_action_id => voting_procedure}}

This is a complex nested map structure that we'll implement gradually
as we create the required sub-types.

**Signature**

```ts
export declare const VotingProcedures: typeof Schema.Unknown
```

Added in v2.0.0

# utils

## VotingProcedures (type alias)

**Signature**

```ts
export type VotingProcedures = Schema.Schema.Type<typeof VotingProcedures>
```
