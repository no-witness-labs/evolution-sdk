---
title: PaymentAddress.ts
nav_order: 75
parent: Modules
---

## PaymentAddress overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [PaymentAddress (type alias)](#paymentaddress-type-alias)
- [predicates](#predicates)
  - [isPaymentAddress](#ispaymentaddress)
- [schemas](#schemas)
  - [PaymentAddress](#paymentaddress)

---

# model

## PaymentAddress (type alias)

Type representing a payment address string in bech32 format

**Signature**

```ts
export type PaymentAddress = Schema.Schema.Type<typeof PaymentAddress>
```

Added in v2.0.0

# predicates

## isPaymentAddress

Check if the given value is a valid PaymentAddress

**Signature**

```ts
export declare const isPaymentAddress: (
  u: unknown,
  overrideOptions?: ParseOptions | number
) => u is string & Brand<"PaymentAddress">
```

Added in v2.0.0

# schemas

## PaymentAddress

Bech32 address format schema (human-readable addresses)
Following CIP-0019 encoding requirements

**Signature**

```ts
export declare const PaymentAddress: Schema.brand<Schema.filter<typeof Schema.String>, "PaymentAddress">
```

Added in v2.0.0
