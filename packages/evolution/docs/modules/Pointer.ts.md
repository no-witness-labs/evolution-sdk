---
title: Pointer.ts
nav_order: 64
parent: Modules
---

## Pointer overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [predicates](#predicates)
  - [isPointer](#ispointer)
- [schemas](#schemas)
  - [Pointer (class)](#pointer-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)

---

# constructors

## make

Create a new Pointer instance

**Signature**

```ts
export declare const make: (slot: Natural.Natural, txIndex: Natural.Natural, certIndex: Natural.Natural) => Pointer
```

Added in v2.0.0

# predicates

## isPointer

Check if the given value is a valid Pointer

**Signature**

```ts
export declare const isPointer: (u: unknown, overrideOptions?: ParseOptions | number) => u is Pointer
```

Added in v2.0.0

# schemas

## Pointer (class)

Schema for pointer to a stake registration certificate
Contains slot, transaction index, and certificate index information

**Signature**

```ts
export declare class Pointer
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```
