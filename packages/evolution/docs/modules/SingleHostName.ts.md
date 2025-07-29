---
title: SingleHostName.ts
nav_order: 81
parent: Modules
---

## SingleHostName overview

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [withPort](#withport)
  - [withoutPort](#withoutport)
- [equality](#equality)
  - [equals](#equals)
- [errors](#errors)
  - [SingleHostNameError (class)](#singlehostnameerror-class)
- [generators](#generators)
  - [generator](#generator)
- [model](#model)
  - [SingleHostName (class)](#singlehostname-class)
    - [[Symbol.for("nodejs.util.inspect.custom")] (method)](#symbolfornodejsutilinspectcustom-method)
- [predicates](#predicates)
  - [hasPort](#hasport)
- [schemas](#schemas)
  - [CBORBytesSchema](#cborbytesschema)
  - [CBORHexSchema](#cborhexschema)
  - [SingleHostNameCDDLSchema](#singlehostnamecddlschema)
- [transformation](#transformation)
  - [getDnsName](#getdnsname)
  - [getPort](#getport)
- [utils](#utils)
  - [Codec](#codec)

---

# constructors

## withPort

Create a SingleHostName with a port.

**Signature**

```ts
export declare const withPort: (port: Port.Port, dnsName: DnsName.DnsName) => SingleHostName
```

Added in v2.0.0

## withoutPort

Create a SingleHostName without a port.

**Signature**

```ts
export declare const withoutPort: (dnsName: DnsName.DnsName) => SingleHostName
```

Added in v2.0.0

# equality

## equals

Check if two SingleHostName instances are equal.

**Signature**

```ts
export declare const equals: (a: SingleHostName, b: SingleHostName) => boolean
```

Added in v2.0.0

# errors

## SingleHostNameError (class)

Error class for SingleHostName related operations.

**Signature**

```ts
export declare class SingleHostNameError
```

Added in v2.0.0

# generators

## generator

Generate a random SingleHostName.

**Signature**

```ts
export declare const generator: FastCheck.Arbitrary<SingleHostName>
```

Added in v2.0.0

# model

## SingleHostName (class)

Schema for SingleHostName representing a network host with DNS name.
single_host_name = (1, port/ nil, dns_name)

Used for A or AAAA DNS records.

**Signature**

```ts
export declare class SingleHostName
```

Added in v2.0.0

### [Symbol.for("nodejs.util.inspect.custom")] (method)

**Signature**

```ts
;[Symbol.for("nodejs.util.inspect.custom")]()
```

# predicates

## hasPort

Check if the host name has a port.

**Signature**

```ts
export declare const hasPort: (hostName: SingleHostName) => boolean
```

Added in v2.0.0

# schemas

## CBORBytesSchema

CBOR bytes transformation schema for SingleHostName.

**Signature**

```ts
export declare const CBORBytesSchema: (
  options?: CBOR.CodecOptions
) => Schema.transform<
  Schema.transformOrFail<
    typeof Schema.Uint8ArrayFromSelf,
    Schema.declare<CBOR.CBOR, CBOR.CBOR, readonly [], never>,
    never
  >,
  Schema.transformOrFail<
    Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
    Schema.SchemaClass<SingleHostName, SingleHostName, never>,
    never
  >
>
```

Added in v2.0.0

## CBORHexSchema

CBOR hex transformation schema for SingleHostName.

**Signature**

```ts
export declare const CBORHexSchema: (
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
      Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
      Schema.SchemaClass<SingleHostName, SingleHostName, never>,
      never
    >
  >
>
```

Added in v2.0.0

## SingleHostNameCDDLSchema

CDDL schema for SingleHostName.
single_host_name = (1, port / nil, dns_name)

**Signature**

```ts
export declare const SingleHostNameCDDLSchema: Schema.transformOrFail<
  Schema.Tuple<[Schema.Literal<[1n]>, Schema.NullOr<typeof Schema.BigIntFromSelf>, typeof Schema.String]>,
  Schema.SchemaClass<SingleHostName, SingleHostName, never>,
  never
>
```

Added in v2.0.0

# transformation

## getDnsName

Get the DNS name from a SingleHostName.

**Signature**

```ts
export declare const getDnsName: (hostName: SingleHostName) => DnsName.DnsName
```

Added in v2.0.0

## getPort

Get the port from a SingleHostName, if it exists.

**Signature**

```ts
export declare const getPort: (hostName: SingleHostName) => Option.Option<Port.Port>
```

Added in v2.0.0

# utils

## Codec

**Signature**

```ts
export declare const Codec: (options?: CBOR.CodecOptions) => {
  Encode: {
    cborBytes: (a: SingleHostName, overrideOptions?: ParseOptions) => any
    cborHex: (a: SingleHostName, overrideOptions?: ParseOptions) => string
  }
  Decode: {
    cborBytes: (u: unknown, overrideOptions?: ParseOptions) => SingleHostName
    cborHex: (u: unknown, overrideOptions?: ParseOptions) => SingleHostName
  }
  EncodeEither: {
    cborBytes: (a: SingleHostName, overrideOptions?: ParseOptions) => Either<any, ParseResult.ParseError>
    cborHex: (a: SingleHostName, overrideOptions?: ParseOptions) => Either<string, ParseResult.ParseError>
  }
  DecodeEither: {
    cborBytes: (i: any, overrideOptions?: ParseOptions) => Either<SingleHostName, ParseResult.ParseError>
    cborHex: (i: string, overrideOptions?: ParseOptions) => Either<SingleHostName, ParseResult.ParseError>
  }
  EncodeEffect: {
    cborBytes: (a: SingleHostName, overrideOptions?: ParseOptions) => Effect.Effect<any, ParseResult.ParseError, never>
    cborHex: (a: SingleHostName, overrideOptions?: ParseOptions) => Effect.Effect<string, ParseResult.ParseError, never>
  }
  DecodeEffect: {
    cborBytes: (i: any, overrideOptions?: ParseOptions) => Effect.Effect<SingleHostName, ParseResult.ParseError, never>
    cborHex: (i: string, overrideOptions?: ParseOptions) => Effect.Effect<SingleHostName, ParseResult.ParseError, never>
  }
}
```
