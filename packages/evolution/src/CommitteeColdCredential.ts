/**
 * Committee Cold Credential module - provides an alias for Credential specialized for committee cold key usage.
 *
 * In Cardano, committee_cold_credential = credential, representing the same credential structure
 * but used specifically for committee cold keys in governance.
 *
 * @since 2.0.0
 */

import * as Credential from "./Credential.js"

export const CommitteeColdCredential = Credential
