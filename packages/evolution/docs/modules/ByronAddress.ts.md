---
title: ByronAddress.ts
nav_order: 14
parent: Modules
---

## ByronAddress overview

---

<h2 class="text-delta">Table of contents</h2>

- [schemas](#schemas)
  - [ByronAddress (class)](#byronaddress-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [utils](#utils)
  - [BytesSchema](#bytesschema)

---

# schemas

## ByronAddress (class)

Byron legacy address format

**Signature**

```ts
export declare class ByronAddress
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

# utils

## BytesSchema

**Signature**

```ts
export declare const BytesSchema: Schema.transform<typeof Schema.Uint8ArrayFromSelf, typeof ByronAddress>
```
