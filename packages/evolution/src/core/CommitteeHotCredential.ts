/**
 * Committee Hot Credential module - provides an alias for Credential specialized for committee hot key usage.
 *
 * In Cardano, committee_hot_credential = credential, representing the same credential structure
 * but used specifically for committee hot keys in governance.
 *
 * @since 2.0.0
 */

import * as Credential from "./Credential.js"

export const CommitteeHotCredential = Credential
