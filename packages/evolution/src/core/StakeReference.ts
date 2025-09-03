import { Schema } from "effect"

import * as Credential from "./Credential.js"
import * as Pointer from "./Pointer.js"

/**
 * Schema for stake reference that can be either a credential or a pointer
 *
 * @since 2.0.0
 * @category schemas
 */
export const StakeReference = Schema.UndefinedOr(Schema.Union(Credential.Credential, Pointer.Pointer))

/**
 * Type representing a reference to staking information
 * Can be a credential (key hash or script hash) or a pointer
 *
 * @since 2.0.0
 * @category model
 */
export type StakeReference = Schema.Schema.Type<typeof StakeReference>
