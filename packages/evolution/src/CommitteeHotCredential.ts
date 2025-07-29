/**
 * Committee Hot Credential module - provides an alias for Credential specialized for committee hot key usage.
 *
 * In Cardano, committee_hot_credential = credential, representing the same credential structure
 * but used specifically for committee hot keys in governance.
 *
 * @since 2.0.0
 */

import * as Credential from "./Credential.js"

/**
 * Error class for CommitteeHotCredential operations - re-exports CredentialError.
 *
 * @since 2.0.0
 * @category errors
 */
export const CommitteeHotCredentialError = Credential.CredentialError

/**
 * CommitteeHotCredential schema - alias for the Credential schema.
 * committee_hot_credential = credential
 *
 * @since 2.0.0
 * @category schemas
 */
export const CommitteeHotCredential = Credential.Credential

/**
 * Type representing a committee hot credential - alias for Credential type.
 *
 * @since 2.0.0
 * @category model
 */
export type CommitteeHotCredential = Credential.Credential

/**
 * Re-exported utilities from Credential module.
 *
 * @since 2.0.0
 */
export const is = Credential.is
export const equals = Credential.equals
export const generator = Credential.generator
export const Codec = Credential.Codec

/**
 * CBOR encoding/decoding schemas.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = Credential.FromCBORBytes
export const FromCBORHex = Credential.FromCBORHex
