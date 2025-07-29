---
title: RewardAddress.ts
nav_order: 76
parent: Modules
---

## RewardAddress overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [RewardAddress (type alias)](#rewardaddress-type-alias)
- [predicates](#predicates)
  - [isRewardAddress](#isrewardaddress)
- [schemas](#schemas)
  - [RewardAddress](#rewardaddress)

---

# model

## RewardAddress (type alias)

Type representing a reward/stake address string in bech32 format

**Signature**

```ts
export type RewardAddress = Schema.Schema.Type<typeof RewardAddress>
```

Added in v2.0.0

# predicates

## isRewardAddress

Check if the given value is a valid RewardAddress

**Signature**

```ts
export declare const isRewardAddress: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is string & Brand<"RewardAddress">
```

Added in v2.0.0

# schemas

## RewardAddress

Reward address format schema (human-readable addresses)
Following CIP-0019 encoding requirements

**Signature**

```ts
export declare const RewardAddress: Schema.brand<Schema.filter<typeof Schema.String>, "RewardAddress">
```

Added in v2.0.0
