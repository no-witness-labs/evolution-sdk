---
title: SingleHostAddr.ts
nav_order: 80
parent: Modules
---

## SingleHostAddr overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [withBothIPs](#withbothips)
  - [withIPv4](#withipv4)
  - [withIPv6](#withipv6)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [SingleHostAddrError (class)](#singlehostaddrerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [SingleHostAddr (class)](#singlehostaddr-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [predicates](#predicates)
  - [hasIPv4](#hasipv4)
  - [hasIPv6](#hasipv6)
  - [hasPort](#hasport)
- [schemas](#schemas)
  - [FromBytes](#FromBytes)
  - [FromHex](#FromHex)
  - [SingleHostAddrCDDLSchema](#singlehostaddrcddlschema)
- [utils](#utils)
  - [Codec](#codec)

---

# constructors

## withBothIPs

Create a SingleHostAddr with both IPv4 and IPv6 addresses.

**Signature**

```ts
export declare const withBothIPs: (port: Option.Option<Port.Port>, ipv4: IPv4.IPv4, ipv6: IPv6.IPv6) => SingleHostAddr
```

Added in v2.0.0

## withIPv4

Create a SingleHostAddr with IPv4 address.

**Signature**

```ts
export declare const withIPv4: (port: Option.Option<Port.Port>, ipv4: IPv4.IPv4) => SingleHostAddr
```

Added in v2.0.0

## withIPv6

Create a SingleHostAddr with IPv6 address.

**Signature**

```ts
export declare const withIPv6: (port: Option.Option<Port.Port>, ipv6: IPv6.IPv6) => SingleHostAddr
```

Added in v2.0.0

# equality

## equals

Check if two SingleHostAddr instances are equal.

**Signature**

```ts
export declare const equals: (a: SingleHostAddr, b: SingleHostAddr) => boolean
```

Added in v2.0.0

# errors

## SingleHostAddrError (class)

Error class for SingleHostAddr related operations.

**Signature**

```ts
export declare class SingleHostAddrError
```

Added in v2.0.0

# generators

## generator

Generate a random SingleHostAddr.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<SingleHostAddr>
```

Added in v2.0.0

# model

## SingleHostAddr (class)

Schema for SingleHostAddr representing a network host with IP addresses.
single_host_addr = (0, port/ nil, ipv4/ nil, ipv6/ nil)

**Signature**

```ts
export declare class SingleHostAddr
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

# predicates

## hasIPv4

Check if the host address has an IPv4 address.

**Signature**

```ts
export declare const hasIPv4: (hostAddr: SingleHostAddr) => boolean
```

Added in v2.0.0

## hasIPv6

Check if the host address has an IPv6 address.

**Signature**

```ts
export declare const hasIPv6: (hostAddr: SingleHostAddr) => boolean
```

Added in v2.0.0

## hasPort

Check if the host address has a port.

**Signature**

```ts
export declare const hasPort: (hostAddr: SingleHostAddr) => boolean
```

Added in v2.0.0

# schemas

## FromBytes

CBOR bytes transformation schema for SingleHostAddr.

**Signature**

```ts
export declare const FromBytes: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.transformOrFail<
    Schema.Tuple<
      [
        Schema.Literal<[0n]>,
        Schema.NullOr<typeof Schema.BigIntFromSelf>,
        Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
        Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
      ]
    >,
    Schema.SchemaClass<SingleHostAddr, SingleHostAddr, never>,
    never
  >
>
```

Added in v2.0.0

## FromHex

CBOR hex transformation schema for SingleHostAddr.

**Signature**

```ts
export declare const FromHex: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transform<Schema.refine<string, typeof Schema.String>, typeof Schema.Uint8ArrayFromSelf>,
  Schema.transform<
    Schema.transformOrFail<
      typeof Schema.Uint8ArrayFromSelf,
      Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
      never
    >,
    Schema.transformOrFail<
      Schema.Tuple<
        [
          Schema.Literal<[0n]>,
          Schema.NullOr<typeof Schema.BigIntFromSelf>,
          Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
          Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
        ]
      >,
      Schema.SchemaClass<SingleHostAddr, SingleHostAddr, never>,
      never
    >
  >
>
```

Added in v2.0.0

## SingleHostAddrCDDLSchema

CDDL schema for SingleHostAddr.
single_host_addr = (0, port / nil, ipv4 / nil, ipv6 / nil)

**Signature**

```ts
export declare const SingleHostAddrCDDLSchema: Schema.transformOrFail<
  Schema.Tuple<
    [
      Schema.Literal<[0n]>,
      Schema.NullOr<typeof Schema.BigIntFromSelf>,
      Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>,
      Schema.NullOr<typeof Schema.Uint8ArrayFromSelf>
    ]
  >,
  Schema.SchemaClass<SingleHostAddr, SingleHostAddr, never>,
  never
>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: { cborBytes: (input: SingleHostAddr) => any; cborHex: (input: SingleHostAddr) => string }
  Decode: { cborBytes: (input: any) => SingleHostAddr; cborHex: (input: string) => SingleHostAddr }
  EncodeEffect: {
    cborBytes: (input: SingleHostAddr) => Effect.Effect<any, InstanceType<typeof SingleHostAddrError>>
    cborHex: (input: SingleHostAddr) => Effect.Effect<string, InstanceType<typeof SingleHostAddrError>>
  }
  DecodeEffect: {
    cborBytes: (input: any) => Effect.Effect<SingleHostAddr, InstanceType<typeof SingleHostAddrError>>
    cborHex: (input: string) => Effect.Effect<SingleHostAddr, InstanceType<typeof SingleHostAddrError>>
  }
  EncodeEither: {
    cborBytes: (input: SingleHostAddr) => Either<any, InstanceType<typeof SingleHostAddrError>>
    cborHex: (input: SingleHostAddr) => Either<string, InstanceType<typeof SingleHostAddrError>>
  }
  DecodeEither: {
    cborBytes: (input: any) => Either<SingleHostAddr, InstanceType<typeof SingleHostAddrError>>
    cborHex: (input: string) => Either<SingleHostAddr, InstanceType<typeof SingleHostAddrError>>
  }
}
```
