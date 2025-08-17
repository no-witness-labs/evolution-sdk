import { Data, Either as E, Schema } from "effect"

export class BytesError extends Data.TaggedError("BytesError")<{
  message?: string
  cause?: unknown
}> {}

export const isHex = (input: string): boolean => {
  const len = input.length
  if (len === 0) return false
  if (len % 2 !== 0) return false
  for (let i = 0; i < len; i++) {
    const cc = input.charCodeAt(i)
    if (!((cc >= 48 && cc <= 57) || (cc >= 65 && cc <= 70) || (cc >= 97 && cc <= 102))) {
      return false
    }
  }
  return true
}

/**
 * Lenient version of isHex that allows empty strings.
 * Useful for PlutusData where empty byte arrays are valid.
 *
 * @since 2.0.0
 * @category predicates
 */
export const isHexLenient = (input: string): boolean => {
  const len = input.length

  // Empty strings are valid (for empty byte arrays)
  if (len === 0) return true

  // Must have even length
  if (len % 2 !== 0) return false

  // Check each character is valid hex
  for (let i = 0; i < len; i++) {
    const cc = input.charCodeAt(i)
    if (
      !(
        (cc >= 48 && cc <= 57) || // '0'–'9'
        (cc >= 65 && cc <= 70) || // 'A'–'F'
        (cc >= 97 && cc <= 102) // 'a'–'f'
      )
    ) {
      return false
    }
  }
  return true
}

const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"))

// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 } as const

/**
 * Converts an ASCII character code to its base16 (hexadecimal) value.
 * For use with pre-validated hex strings.
 */
const asciiToBase16 = (char: number): number => {
  if (char >= asciis._0 && char <= asciis._9) return char - asciis._0
  if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10)
  if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10)
  // Since Hex is already validated, this should never happen
  // but we return 0 to satisfy TypeScript
  return 0
}

export const equals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Pure conversion function from validated hex string to Uint8Array.
 * Assumes input is already validated hex.
 */
export const fromHexUnsafe = (hex: string): Uint8Array => {
  const array = new Uint8Array(hex.length / 2)
  for (let ai = 0, hi = 0; ai < array.length; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi))
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1))
    array[ai] = n1 * 16 + n2
  }
  return array
}

/**
 * Pure conversion function from validated hex string to Uint8Array (lenient version).
 * Assumes input is already validated hex or empty string.
 */
export const fromHexLenientUnsafe = (hex: string): Uint8Array => {
  if (hex.length === 0) return new Uint8Array(0)
  return fromHexUnsafe(hex)
}

/**
 * Pure conversion function from Uint8Array to hex string.
 */
export const toHexUnsafe = (bytes: Uint8Array): string => {
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]]
  }
  return hex
}

/**
 * Pure conversion function from Uint8Array to hex string (lenient version).
 */
export const toHexLenientUnsafe = (bytes: Uint8Array): string => {
  if (bytes.length === 0) return ""
  return toHexUnsafe(bytes)
}

// Updated factory: accepts a string-side schema (e.g. HexSchema / HexLenientSchema)
interface Uint8ArrayTransformationConfig<I extends string = string> {
  id: string
  stringSchema: Schema.Schema<I, I>
  uint8ArraySchema: Schema.Schema<Uint8Array, Uint8Array>
  decode: (s: I) => Uint8Array
  encode: (u: Uint8Array) => I
}

export const makeBytesTransformation = <I extends string = string>(config: Uint8ArrayTransformationConfig<I>) => {
  const { decode, encode, id, stringSchema, uint8ArraySchema } = config
  return Schema.transform(stringSchema, uint8ArraySchema, {
    strict: true,
    decode: (i) => decode(i),
    encode: (a) => encode(a)
  }).annotations({ identifier: id })
}

export const HexSchema = Schema.String.pipe(
  Schema.filter((a) => isHex(a), {
    message: (issue) => `${issue.actual} must be a valid hex string (0-9, A-F, a-f) and cannot be empty`
  }),
  Schema.annotations({
    identifier: "Bytes.Hex"
  })
)

export const FromHex = makeBytesTransformation({
  id: "Bytes.FromHex",
  stringSchema: HexSchema,
  uint8ArraySchema: Schema.Uint8ArrayFromSelf,
  decode: fromHexUnsafe,
  encode: toHexUnsafe
})

/**
 * Lenient hex schema that allows empty strings.
 * Useful for PlutusData where empty byte arrays are valid.
 *
 * @since 2.0.0
 * @category schemas
 */
export const HexLenientSchema = Schema.String.pipe(
  Schema.filter((a) => isHexLenient(a), {
    message: (issue) => `${issue.actual} must be a valid hex string (0-9, A-F, a-f) or empty string`
  }),
  Schema.annotations({
    identifier: "Bytes.HexLenient"
  })
)

export const BytesFromHexLenient = makeBytesTransformation({
  id: "Bytes.FromHexLenient",
  stringSchema: HexLenientSchema,
  uint8ArraySchema: Schema.Uint8ArrayFromSelf,
  decode: fromHexLenientUnsafe,
  encode: toHexLenientUnsafe
})

// =============================================================================
// Composition Helpers (Curried)
// =============================================================================

/**
 * Creates a curried filter that validates exact byte length (for hex strings).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const hexLengthEquals =
  (byteLength: number, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((hex: string) => hex.length === byteLength * 2, {
        message: (issue) =>
          `${issue.actual} Must be exactly ${byteLength * 2} hex characters (${byteLength} bytes), got ${(issue.actual as string).length}`,

        identifier: `${moduleName}.LengthEquals${byteLength}`
      })
    )

/**
 * Creates a curried filter that validates byte length is within a range (for hex strings).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const hexLengthBetween =
  (minBytes: number, maxBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter(
        (hex: string) => {
          const hexLength = hex.length
          return hexLength >= minBytes * 2 && hexLength <= maxBytes * 2
        },
        {
          message: () =>
            `Must be between ${minBytes} and ${maxBytes} bytes (${minBytes * 2}-${maxBytes * 2} hex characters)`,
          identifier: `${moduleName}.LengthBetween${minBytes}And${maxBytes}`
        }
      )
    )

/**
 * Creates a curried filter that validates minimum byte length (for hex strings).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const hexLengthMin =
  (minBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((hex: string) => hex.length >= minBytes * 2, {
        message: () => `Must be at least ${minBytes} bytes (${minBytes * 2} hex characters)`,
        identifier: `${moduleName}.LengthMin${minBytes}`
      })
    )

/**
 * Creates a curried filter that validates maximum byte length (for hex strings).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const hexLengthMax =
  (maxBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((hex: string) => hex.length <= maxBytes * 2, {
        message: () => `Must be at most ${maxBytes} bytes (${maxBytes * 2} hex characters)`,
        identifier: `${moduleName}.LengthMax${maxBytes}`
      })
    )

/**
 * Creates a curried filter that validates hex starts with specific prefix.
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const hexStartsWithPrefix =
  (prefix: string, moduleName: string) =>
  <S extends Schema.Schema<any, string>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((hex: string) => hex.toLowerCase().startsWith(prefix.toLowerCase()), {
        message: () => `Must start with prefix "${prefix}"`,
        identifier: `${moduleName}.StartsWithPrefix`
      })
    )

// Byte array composition helpers
/**
 * Creates a curried filter that validates exact byte length (for Uint8Array).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const bytesLengthEquals =
  (byteLength: number, moduleName: string) =>
  <S extends Schema.Schema<any, any>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((bytes: Uint8Array) => bytes.length === byteLength, {
        message: (issue) =>
          `${issue.actual} Must be exactly ${byteLength} bytes, got ${(issue.actual as Uint8Array).length}`,
        identifier: `${moduleName}.BytesLengthEquals${byteLength}`
      })
    )

/**
 * Creates a curried filter that validates byte length is within a range (for Uint8Array).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const bytesLengthBetween =
  (minBytes: number, maxBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, Uint8Array>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((bytes: Uint8Array) => bytes.length >= minBytes && bytes.length <= maxBytes, {
        message: () => `Must be between ${minBytes} and ${maxBytes} bytes`,
        identifier: `${moduleName}.BytesLengthBetween${minBytes}And${maxBytes}`
      })
    )

/**
 * Creates a curried filter that validates minimum byte length (for Uint8Array).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const bytesLengthMin =
  (minBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, Uint8Array>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((bytes: Uint8Array) => bytes.length >= minBytes, {
        message: () => `Must be at least ${minBytes} bytes`,
        identifier: `${moduleName}.BytesLengthMin${minBytes}`
      })
    )

/**
 * Creates a curried filter that validates maximum byte length (for Uint8Array).
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const bytesLengthMax =
  (maxBytes: number, moduleName: string) =>
  <S extends Schema.Schema<any, Uint8Array>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter((bytes: Uint8Array) => bytes.length <= maxBytes, {
        message: () => `Must be at most ${maxBytes} bytes`,
        identifier: `${moduleName}.BytesLengthMax${maxBytes}`
      })
    )

/**
 * Creates a curried filter that validates bytes start with specific prefix.
 * Preserves Context inference from the base schema.
 *
 * @since 2.0.0
 * @category composition
 */
export const bytesStartsWithPrefix =
  (prefix: Uint8Array, moduleName: string) =>
  <S extends Schema.Schema<any, Uint8Array>>(baseSchema: S) =>
    baseSchema.pipe(
      Schema.filter(
        (bytes: Uint8Array) => {
          if (bytes.length < prefix.length) return false
          for (let i = 0; i < prefix.length; i++) {
            if (bytes[i] !== prefix[i]) return false
          }
          return true
        },
        {
          message: () => `Must start with prefix [${Array.from(prefix).join(", ")}]`,
          identifier: `${moduleName}.BytesStartsWithPrefix`
        }
      )
    )

// =============================================================================
// Public API
// =============================================================================

/**
 * Convert hex string to Uint8Array. Throws on invalid input.
 *
 * @since 2.0.0
 * @category conversions
 */
export const fromHex = (hex: string): Uint8Array =>
  Either.fromHex(hex).pipe(
    E.getOrThrowWith((error) => {
      throw error
    })
  )

/**
 * Convert Uint8Array to hex string. Never fails.
 *
 * @since 2.0.0
 * @category conversions
 */
export const toHex = (bytes: Uint8Array): string => toHexUnsafe(bytes)

/**
 * Convert hex string to Uint8Array (allows empty strings). Throws on invalid input.
 *
 * @since 2.0.0
 * @category conversions
 */
export const fromHexLenient = (hex: string): Uint8Array =>
  Either.fromHexLenient(hex).pipe(
    E.getOrThrowWith((error) => {
      throw error
    })
  )

/**
 * Convert Uint8Array to hex string (returns empty string for empty arrays). Never fails.
 *
 * @since 2.0.0
 * @category conversions
 */
export const toHexLenient = (bytes: Uint8Array): string => toHexLenientUnsafe(bytes)

/**
 * Safe API that returns Either for error handling instead of throwing.
 *
 * @since 2.0.0
 * @category namespaces
 */
export namespace Either {
  /**
   * Convert hex string to Uint8Array. Returns Either with parse error on invalid input.
   *
   * @since 2.0.0
   * @category conversions
   */
  export const fromHex = (hex: string) =>
    Schema.decodeEither(FromHex)(hex).pipe(
      E.mapLeft((error) => new BytesError({ message: error.message, cause: error }))
    )

  /**
   * Convert Uint8Array to hex string. Always succeeds, wrapped in Either.right.
   *
   * @since 2.0.0
   * @category conversions
   */
  export const toHex = (bytes: Uint8Array) => E.right(toHexUnsafe(bytes))

  /**
   * Convert hex string to Uint8Array (allows empty strings). Returns Either with parse error on invalid input.
   *
   * @since 2.0.0
   * @category conversions
   */
  export const fromHexLenient = (hex: string) =>
    Schema.decodeEither(BytesFromHexLenient)(hex).pipe(
      E.mapLeft((error) => new BytesError({ message: error.message, cause: error }))
    )

  /**
   * Convert Uint8Array to hex string (returns empty string for empty arrays). Always succeeds, wrapped in Either.right.
   *
   * @since 2.0.0
   * @category conversions
   */
  export const toHexLenient = (bytes: Uint8Array) => E.right(toHexLenientUnsafe(bytes))
}
