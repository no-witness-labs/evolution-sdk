// EvalRedeemer types and utilities for transaction evaluation

export type EvalRedeemer = {
  readonly ex_units: { readonly mem: number; readonly steps: number }
  readonly redeemer_index: number
  readonly redeemer_tag: "spend" | "mint" | "publish" | "withdraw" | "vote" | "propose"
}
