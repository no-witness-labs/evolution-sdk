/**
 * Committee Cold Credential module - provides an alias for Credential specialized for committee cold key usage.
 *
 * In Cardano, committee_cold_credential = credential, representing the same credential structure
 * but used specifically for committee cold keys in governance.
 *
 * @since 2.0.0
 */

import type * as CBOR from "./CBOR.js"
import * as Credential from "./Credential.js"

/**
 * Error class for CommitteeColdCredential operations - re-exports CredentialError.
 *
 * @since 2.0.0
 * @category errors
 */
export const CommitteeColdCredentialError = Credential.CredentialError

/**
 * CommitteeColdCredential schema - alias for the Credential schema.
 * committee_cold_credential = credential
 *
 * @since 2.0.0
 * @category schemas
 */
export const CommitteeColdCredential = Credential.Credential

/**
 * Type representing a committee cold credential - alias for Credential type.
 *
 * @since 2.0.0
 * @category model
 */
export type CommitteeColdCredential = Credential.Credential

/**
 * Re-exported utilities from Credential module.
 *
 * @since 2.0.0
 */
export const is = Credential.is
export const equals = Credential.equals
export const generator = Credential.generator
export const Codec = (options?: CBOR.CodecOptions) => Credential.Codec(options)

/**
 * CBOR encoding/decoding schemas.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = Credential.FromCBORBytes
export const FromCBORHex = Credential.FromCBORHex
