import { Data, Effect as Eff, FastCheck, ParseResult, Schema } from "effect"

import * as CBOR from "./CBOR.js"
import * as Function from "./Function.js"
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
 * ```
 * script =
 *   [ 0, native_script ]
 * / [ 1, plutus_v1_script ]
 * / [ 2, plutus_v2_script ]
 * / [ 3, plutus_v3_script ]
 * ```
 *
 * @since 2.0.0
 * @category model
 */
export const Script = Schema.Union(
  NativeScripts.NativeScript,
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
export const FromCDDL = Schema.transformOrFail(ScriptCDDL, Schema.typeSchema(Script), {
  strict: true,
  encode: (script) =>
    Eff.gen(function* () {
      switch (script._tag) {
        // Plutus script cases
        case "PlutusV1":
          return [1n, script.bytes] as const

        case "PlutusV2":
          return [2n, script.bytes] as const

        case "PlutusV3":
          return [3n, script.bytes] as const

        // Native script case (TaggedClass)
        case "NativeScript": {
          const nativeCDDL = yield* ParseResult.encode(NativeScripts.FromCDDL)(script)
          return [0n, nativeCDDL] as const
        }

        default:
          return yield* Eff.fail(
            new ParseResult.Type(Schema.typeSchema(Script).ast, script, `Unknown script type: ${(script as any)._tag}`)
          )
      }
    }),
  decode: (tuple) =>
    Eff.gen(function* () {
      const [tag, data] = tuple
      switch (tag) {
        case 0n:
          // Native script
          return yield* ParseResult.decode(NativeScripts.FromCDDL)(data)
        case 1n:
          // PlutusV1
          return new PlutusV1.PlutusV1({ bytes: data })
        case 2n:
          // PlutusV2
          return new PlutusV2.PlutusV2({ bytes: data })
        case 3n:
          // PlutusV3
          return new PlutusV3.PlutusV3({ bytes: data })
      }
    })
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
  if (a._tag !== b._tag) return false

  switch (a._tag) {
    case "NativeScript":
      return NativeScripts.equals(a, b as NativeScripts.NativeScript)
    case "PlutusV1":
      return PlutusV1.equals(a, b as PlutusV1.PlutusV1)
    case "PlutusV2":
      return PlutusV2.equals(a, b as PlutusV2.PlutusV2)
    case "PlutusV3":
      return PlutusV3.equals(a, b as PlutusV3.PlutusV3)
    default:
      return false
  }
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

export const fromCBOR = Function.makeCBORDecodeSync(FromCDDL, ScriptError, "Script.fromCBOR")
export const fromCBORHex = Function.makeCBORDecodeHexSync(FromCDDL, ScriptError, "Script.fromCBORHex")
export const toCBOR = Function.makeCBOREncodeSync(FromCDDL, ScriptError, "Script.toCBOR")
export const toCBORHex = Function.makeCBOREncodeHexSync(FromCDDL, ScriptError, "Script.toCBORHex")
