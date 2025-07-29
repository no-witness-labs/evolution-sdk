---
title: FormatError.ts
nav_order: 43
parent: Modules
---

## FormatError overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [make](#make)
  - [makeFromUnknown](#makefromunknown)

---

# utils

## make

**Signature**

```ts
export declare const make: ({
  cause,
  message
}: {
  message?: string
  cause?: unknown
}) => { message: string; cause?: undefined } | { message: string; cause: unknown }
```

## makeFromUnknown

**Signature**

```ts
export declare const makeFromUnknown: ({
  cause
}: {
  cause: unknown
}) => { message: string; cause: Error } | { message: string; cause?: undefined }
```
