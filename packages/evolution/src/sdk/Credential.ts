import { Schema } from "effect"

import * as _Credential from "../core/Credential.js"
import type * as _KeyHash from "../core/KeyHash.js"
import type * as _ScriptHash from "../core/ScriptHash.js"

export type ScriptHash = typeof _ScriptHash.ScriptHash.Encoded
export type KeyHash = typeof _KeyHash.KeyHash.Encoded

export type Credential = typeof _Credential.CredentialSchema.Encoded

export const fromCredentialToJson = Schema.encodeSync(_Credential.CredentialSchema)
export const jsonToCredential = Schema.decodeSync(_Credential.CredentialSchema)
