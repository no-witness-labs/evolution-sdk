import assert from "assert"
import { Data } from "@evolution-sdk/evolution"

// Create a sample data structure with constructor index 0
// and a Map containing key-value pairs
const sampleData = new Data.Constr({
  index: 0n,
  fields: [
    new Map([
      ["deadbeef", 42n],
      ["cafe", 100n], 
      ["beef", 20n]
    ])
  ]
})

// Encode the data to CBOR hex format
const cborHex = Data.Codec().Encode.cborHex(sampleData)
console.log("CBOR Hex:", cborHex)
// Output: d8799fbf44deadbeef182a42cafe186442beef14ffff

// CBOR diagnostic notation: 121_0([_ {_ h'deadbeef': 42_0, h'cafe': 100_0, h'beef': 20}])
// Visualize at: https://cbor.nemo157.com/

// Decode the CBOR hex back to data structure
const decodedData = Data.Codec().Decode.cborHex(cborHex)

// Verify round-trip encoding/decoding works correctly
assert.deepEqual(sampleData, decodedData)
console.log("✅ Round-trip encoding/decoding successful!")
