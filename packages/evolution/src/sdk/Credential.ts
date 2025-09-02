import { fromHex } from "../core/Bytes.js"
import * as CoreCredential from "../core/Credential.js"

export type ScriptHash = {
  type: "Script"
  hash: string // hex string
}

export type KeyHash = {
  type: "Key"
  hash: string // hex string
}

export type Credential = ScriptHash | KeyHash

export type Network = "Mainnet" | "Testnet"

export const toCoreCredential = (credential: Credential): CoreCredential.Credential => {
  if (credential.type === "Key") {
    return CoreCredential.Credential.members[0].make({
      hash: fromHex(credential.hash)
    })
  } else {
    return CoreCredential.Credential.members[1].make({
      hash: fromHex(credential.hash)
    })
  }
}

export const fromCoreCredential = (credential: CoreCredential.Credential): Credential => {
  if (credential._tag === "KeyHash") {
    return {
      type: "Key",
      hash: credential.toString()
    }
  } else {
    return {
      type: "Script",
      hash: credential.toString()
    }
  }
}
