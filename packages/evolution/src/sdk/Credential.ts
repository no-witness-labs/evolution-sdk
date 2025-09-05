import { Schema } from "effect"

import * as _Credential from "../core/Credential.js"
import type * as _KeyHash from "../core/KeyHash.js"
import type * as _ScriptHash from "../core/ScriptHash.js"

export type ScriptHash = typeof _ScriptHash.ScriptHash.Encoded
export type KeyHash = typeof _KeyHash.KeyHash.Encoded

export type Credential = typeof _Credential.Credential.Encoded

export const toCoreCredential = Schema.decodeSync(_Credential.Credential)
export const fromCoreCredential = Schema.encodeSync(_Credential.Credential)

// export type ScriptHash = {
//   type: "Script"
//   hash: string // hex string
// }

// export type KeyHash = {
//   type: "Key"
//   hash: string // hex string
// }

// export type Credential = ScriptHash | KeyHash

// export type Network = "Mainnet" | "Testnet"

// export const toCoreCredential = (credential: Credential): CoreCredential.Credential => {
//   if (credential.type === "Key") {
//     return CoreCredential.Credential.members[0].make({
//       hash: fromHex(credential.hash)
//     })
//   } else {
//     return CoreCredential.Credential.members[1].make({
//       hash: fromHex(credential.hash)
//     })
//   }
// }

// export const fromCoreCredential = (credential: CoreCredential.Credential): Credential => {
//   if (credential._tag === "KeyHash") {
//     return {
//       type: "Key",
//       hash: credential.toString()
//     }
//   } else {
//     return {
//       type: "Script",
//       hash: credential.toString()
//     }
//   }
// }
