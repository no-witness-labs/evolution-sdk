import { Schema } from "effect"

/**
 * Represents a cardano-cli JSON script syntax
 *
 * Native type follows the standard described in the
 * https://github.com/IntersectMBO/cardano-node/blob/1.26.1-with-cardano-cli/doc/reference/simple-scripts.md#json-script-syntax
 *
 * @since 2.0.0
 * @category model
 */
export type NativeJSON =
  | {
      type: "sig"
      keyHash: string
    }
  | {
      type: "before"
      slot: number
    }
  | {
      type: "after"
      slot: number
    }
  | {
      type: "all"
      scripts: ReadonlyArray<NativeJSON>
    }
  | {
      type: "any"
      scripts: ReadonlyArray<NativeJSON>
    }
  | {
      type: "atLeast"
      required: number
      scripts: ReadonlyArray<NativeJSON>
    }

/**
 * Schema for NativeJSON union type.
 *
 * @since 2.0.0
 * @category schemas
 */
export const NativeJSONSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("sig"),
    keyHash: Schema.String
  }),
  Schema.Struct({
    type: Schema.Literal("before"),
    slot: Schema.Number
  }),
  Schema.Struct({
    type: Schema.Literal("after"),
    slot: Schema.Number
  }),
  Schema.Struct({
    type: Schema.Literal("all"),
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeJSON, NativeJSON> => NativeJSONSchema))
  }),
  Schema.Struct({
    type: Schema.Literal("any"),
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeJSON, NativeJSON> => NativeJSONSchema))
  }),
  Schema.Struct({
    type: Schema.Literal("atLeast"),
    required: Schema.Number,
    scripts: Schema.Array(Schema.suspend((): Schema.Schema<NativeJSON, NativeJSON> => NativeJSONSchema))
  })
).annotations({
  identifier: "NativeJSON"
})
