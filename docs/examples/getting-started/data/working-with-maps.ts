// @title: Working with Maps
// @description: Create and manipulate Data Maps with key-value pairs.
// #region main
import assert from "node:assert/strict"
import { Data } from "@evolution-sdk/evolution"

// Create a simple map with hex string keys and integer values
const userAges = new Map<Data.Data, Data.Data>([
  ["616c696365", 25n], // 'alice' in hex
  ["626f62", 30n], // 'bob' in hex
  ["636861726c6965", 35n] // 'charlie' in hex
])

console.log("User ages map:", userAges)

// Create a map with constructor keys and hex string values
const statusMap = new Map<Data.Data, Data.Data>([
  [new Data.Constr({ index: 0n, fields: [] }), "70656e64696e67"], // 'pending' in hex
  [new Data.Constr({ index: 1n, fields: [] }), "617070726f766564"], // 'approved' in hex
  [new Data.Constr({ index: 2n, fields: [] }), "72656a6563746564"] // 'rejected' in hex
])

// Demonstrate map usage - Maps are Data types themselves, not constructor fields
console.log("Status for constructor 0:", statusMap.get(new Data.Constr({ index: 0n, fields: [] })))

// Create a constructor that references the maps via indexes or simple structure
const dataRecord = new Data.Constr({
  index: 1n,
  fields: [
    25n, // alice's age directly
    "deadbeef", // some data
    42n // more data
  ]
})

// Verify map operations
assert.equal(userAges.get("616c696365"), 25n) // alice's age
assert.equal(userAges.size, 3)
assert.equal(dataRecord.fields.length, 3)
// #endregion main
