/**
 * DRep Credential module - provides an alias for Credential specialized for DRep usage.
 *
 * In Cardano, drep_credential = credential, representing the same credential structure
 * but used specifically for delegation representatives (DReps).
 *
 * @since 2.0.0
 */

import * as Credential from "./Credential.js"

export const DRepCredential = Credential
