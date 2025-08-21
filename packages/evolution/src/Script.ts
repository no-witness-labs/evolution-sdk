import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as NativeScripts from "./NativeScripts.js"
import * as PlutusV1 from "./PlutusV1.js"
import * as PlutusV2 from "./PlutusV2.js"
import * as PlutusV3 from "./PlutusV3.js"

/**
 * Error class for Script related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class ScriptError extends Data.TaggedError("ScriptError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Script union type following Conway CDDL specification.
 *
 * CDDL:
 * script =
 *   [ 0, native_script ]
 * / [ 1, plutus_v1_script ]
 * / [ 2, plutus_v2_script ]
 * / [ 3, plutus_v3_script ]
 *
 * @since 2.0.0
 * @category model
 */
export const Script = Schema.Union(
  NativeScripts.Native,
  PlutusV1.PlutusV1,
  PlutusV2.PlutusV2,
  PlutusV3.PlutusV3
).annotations({
  identifier: "Script",
  description: "Script union (native | plutus_v1 | plutus_v2 | plutus_v3)"
})

export type Script = typeof Script.Type

/**
 * CDDL schema for Script as tagged tuples.
 *
 * @since 2.0.0
 * @category schemas
 */
export const ScriptCDDL = Schema.Union(
  Schema.Tuple(Schema.Literal(0n), NativeScripts.CDDLSchema),
  Schema.Tuple(Schema.Literal(1n), CBOR.ByteArray), // plutus_v1_script
  Schema.Tuple(Schema.Literal(2n), CBOR.ByteArray), // plutus_v2_script
  Schema.Tuple(Schema.Literal(3n), CBOR.ByteArray) // plutus_v3_script
).annotations({
  identifier: "Script.CDDL",
  description: "CDDL representation of Script as tagged tuples"
})

export type ScriptCDDL = typeof ScriptCDDL.Type

/**
 * Transformation between CDDL representation and Script union.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(ScriptCDDL, Script, {
  strict: true,
  encode: (value, _, ast) => {
    // Handle native scripts (no _tag property, has type property)
    if ("type" in value) {
      return NativeScripts.internalEncodeCDDL(value as NativeScripts.Native).pipe(
        Eff.map((nativeCDDL) => [0n, nativeCDDL] as const),
        Eff.mapError((cause) => new ParseResult.Type(ast, value, `Failed to encode native script: ${cause}`))
      )
    }

    // Handle Plutus scripts (with _tag property)
    if ("_tag" in value) {
      const plutusScript = value as PlutusV1.PlutusV1 | PlutusV2.PlutusV2 | PlutusV3.PlutusV3
      switch (plutusScript._tag) {
        case "PlutusV1":
          return Eff.succeed([1n, plutusScript.script] as const)
        case "PlutusV2":
          return Eff.succeed([2n, plutusScript.script] as const)
        case "PlutusV3":
          return Eff.succeed([3n, plutusScript.script] as const)
        default:
          return Eff.fail(new ParseResult.Type(ast, value, `Unknown Plutus script type: ${(plutusScript as any)._tag}`))
      }
    }

    return Eff.fail(new ParseResult.Type(ast, value, "Invalid script structure"))
  },
  decode: (tuple, _, ast) => {
    const [tag, data] = tuple
    switch (tag) {
      case 0n:
        // Native script
        return NativeScripts.internalDecodeCDDL(data as NativeScripts.NativeCDDL).pipe(
          Eff.mapError((cause) => new ParseResult.Type(ast, tuple, `Failed to decode native script: ${cause}`))
        )
      case 1n:
        // PlutusV1
        return Eff.succeed(new PlutusV1.PlutusV1({ script: data as Uint8Array }))
      case 2n:
        // PlutusV2
        return Eff.succeed(new PlutusV2.PlutusV2({ script: data as Uint8Array }))
      case 3n:
        // PlutusV3
        return Eff.succeed(new PlutusV3.PlutusV3({ script: data as Uint8Array }))
      default:
        return Eff.fail(new ParseResult.Type(ast, tuple, `Unknown script tag: ${tag}`))
    }
  }
}).annotations({
  identifier: "Script.FromCDDL",
  title: "Script from CDDL",
  description: "Transforms between CDDL tagged tuple and Script union"
})

/**
 * Check if two Script instances are equal.
 *
 * @since 2.0.0
 * @category equality
 */
export const equals = (a: Script, b: Script): boolean => {
  // Handle native scripts (no _tag property, has type property)
  if ("type" in a && "type" in b) {
    // Compare native scripts by type and basic properties
    if (a.type !== b.type) return false
    // For now, assume objects with same type and structure are equal
    // TODO: Implement proper structural comparison for native scripts
    return true
  }

  // Handle Plutus scripts (with _tag property)
  if ("_tag" in a && "_tag" in b) {
    if (a._tag !== b._tag) return false

    switch (a._tag) {
      case "PlutusV1":
        return PlutusV1.equals(a, b as PlutusV1.PlutusV1)
      case "PlutusV2":
        return PlutusV2.equals(a, b as PlutusV2.PlutusV2)
      case "PlutusV3":
        return PlutusV3.equals(a, b as PlutusV3.PlutusV3)
      default:
        return a === b
    }
  }

  return false
}

/**
 * FastCheck arbitrary for Script.
 *
 * @since 2.0.0
 * @category arbitrary
 */
export const arbitrary: FastCheck.Arbitrary<Script> = FastCheck.oneof(
  // Robust native script generator (bounded depth and sizes)
  NativeScripts.arbitrary,
  PlutusV1.arbitrary,
  PlutusV2.arbitrary,
  PlutusV3.arbitrary
)
