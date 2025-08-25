// @title: Validate bytes
// @description: Quick check for hex-like bytes strings using Data.isBytes.
// #region main
import assert from "node:assert/strict"
import { Data } from "@evolution-sdk/evolution"

const hex = "deadbeef"
assert.equal(Data.isBytes(hex), true)

const invalid = "not-hex"
assert.equal(Data.isBytes(invalid), false)
// #endregion main
