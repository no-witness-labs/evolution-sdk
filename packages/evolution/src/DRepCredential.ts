/**
 * DRep Credential module - provides an alias for Credential specialized for DRep usage.
 *
 * In Cardano, drep_credential = credential, representing the same credential structure
 * but used specifically for delegation representatives (DReps).
 *
 * @since 2.0.0
 */

import * as Credential from "./Credential.js"

/**
 * Error class for DRepCredential operations - re-exports CredentialError.
 *
 * @since 2.0.0
 * @category errors
 */
export const DRepCredentialError = Credential.CredentialError

/**
 * DRepCredential schema - alias for the Credential schema.
 * drep_credential = credential
 *
 * @since 2.0.0
 * @category schemas
 */
export const DRepCredential = Credential.Credential

/**
 * Type representing a DRep credential - alias for Credential type.
 *
 * @since 2.0.0
 * @category model
 */
export type DRepCredential = Credential.Credential

/**
 * Re-exported utilities from Credential module.
 *
 * @since 2.0.0
 */
export const isCredential = Credential.is
export const equals = Credential.equals
export const generator = Credential.generator
export const Codec = Credential.Codec

/**
 * CBOR encoding/decoding schemas.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromBytes = Credential.FromCBORBytes
export const FromHex = Credential.FromCBORHex
