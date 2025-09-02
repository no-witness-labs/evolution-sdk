import { pipe } from "effect"

import * as CoreScript from "../core/Script.js"
import * as CoreScriptHash from "../core/ScriptHash.js"
import type * as Credential from "./Credential.js"

export type Native = {
  type: "Native"
  script: string // CBOR hex string
}

export type PlutusV1 = {
  type: "PlutusV1"
  script: string // CBOR hex string
}

export type PlutusV2 = {
  type: "PlutusV2"
  script: string // CBOR hex string
}

export type PlutusV3 = {
  type: "PlutusV3"
  script: string // CBOR hex string
}

export type Script = Native | PlutusV1 | PlutusV2 | PlutusV3

// Additional specific types
export type Validator = Script
export type SpendingValidator = Script
export type MintingPolicy = Script
export type PolicyId = string // hex string

/**
 * Convert user-facing Script to strict Script type for hash computation.
 */
const toCoreScript = (script: Script): CoreScript.Script => {
  const strict = CoreScript.fromCBORHex(script.script)

  switch (script.type) {
    case "Native": {
      // Native scripts are the union members without a `_tag` property
      if ("_tag" in strict) {
        throw new Error("Script type mismatch: expected Native")
      }
      return strict
    }
    case "PlutusV1": {
      if ("_tag" in strict && strict._tag === "PlutusV1") return strict
      break
    }
    case "PlutusV2": {
      if ("_tag" in strict && strict._tag === "PlutusV2") return strict
      break
    }
    case "PlutusV3": {
      if ("_tag" in strict && strict._tag === "PlutusV3") return strict
      break
    }
  }

  throw new Error(`Script type mismatch: expected ${script.type}`)
}

/**
 * Compute the hash of a script.
 *
 * Cardano script hashes use blake2b-224 (28 bytes) with tag prefixes:
 * - Native scripts: tag 0
 * - PlutusV1 scripts: tag 1
 * - PlutusV2 scripts: tag 2
 * - PlutusV3 scripts: tag 3
 */
export const toScriptHash = (script: Script): Credential.ScriptHash =>
  pipe(toCoreScript(script), CoreScriptHash.fromScript, CoreScriptHash.toHex, (hash) => ({
    type: "Script",
    hash
  }))

// Constructor Functions
export const makeNativeScript = (cbor: string): Native => ({
  type: "Native",
  script: cbor
})

export const makePlutusV1Script = (cbor: string): PlutusV1 => ({
  type: "PlutusV1",
  script: cbor
})

export const makePlutusV2Script = (cbor: string): PlutusV2 => ({
  type: "PlutusV2",
  script: cbor
})

export const makePlutusV3Script = (cbor: string): PlutusV3 => ({
  type: "PlutusV3",
  script: cbor
})

export const scriptEquals = (a: Script, b: Script): boolean => a.type === b.type && a.script === b.script

// ============================================================================
// Script Hash Generation
// ============================================================================

/**
 * Compute the policy ID for a minting policy script.
 * The policy ID is identical to the script hash.
 */
export const mintingPolicyToId = (script: Script): Credential.ScriptHash => toScriptHash(script)
