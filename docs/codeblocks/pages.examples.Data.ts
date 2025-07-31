import assert from "assert"
import { Data } from "@evolution-sdk/evolution"

// Create a complex nested data structure with:
// - Constructor with index 1 containing multiple fields
// - Nested constructors with different indices
// - A Map with mixed key-value pairs
// - An array of numbers
const nestedUnsortedData = new Data.Constr({
  index: 1n,
  fields: [
    // Nested constructor: 121_0([123_0([])])
    new Data.Constr({
      index: 0n,
      fields: [
        new Data.Constr({
          index: 2n,
          fields: []
        })
      ]
    }),
    // Map with unsorted keys (will be sorted in canonical mode)
    new Map<Data.Data, Data.Data>([
      ["deadbeef01", new Data.Constr({ index: 0n, fields: [] })],
      ["beef", 19n],
      ["deadbeef03", new Data.Constr({ index: 1n, fields: [] })]
    ]),
    // Array of numbers
    [10n, 5n, 2n, 3n, 1n, 4n]
  ]
})

// Encode using default codec (indefinite-length encoding)
const cborHex = Data.Codec().Encode.cborHex(nestedUnsortedData)
// Output: d87a9fd8799fd87b80ffbf45deadbeef01d8798042beef1345deadbeef03d87a80ff9f0a0502030104ffff

// CBOR diagnostic notation (indefinite-length):
// 122_0([_
//     121_0([_ 123_0([])]),
//     {_
//         h'deadbeef01': 121_0([]),
//         h'beef': 19,
//         h'deadbeef03': 122_0([]),
//     },
//     [_ 10, 5, 2, 3, 1, 4],
// ])
// Visualize at: https://cbor.nemo157.com/

const decodedData = Data.Codec().Decode.cborHex(cborHex)

// Create a canonical codec for deterministic encoding
// This ensures consistent output and sorted map keys
const canonicalCodec = Data.Codec({
  options: {
    mode: "canonical"
  }
})

// Encode using canonical mode (definite-length, sorted keys)
const canonicalCborHex = canonicalCodec.Encode.cborHex(nestedUnsortedData)
// Output: d87a83d87981d87b80a342beef1345deadbeef01d8798045deadbeef03d87a80860a0502030104

// CBOR diagnostic notation (canonical/definite-length):
// 122_0([
//     121_0([123_0([])]),
//     {
//         h'beef': 19,                    ← Keys are now sorted
//         h'deadbeef01': 121_0([]),
//         h'deadbeef03': 122_0([]),
//     },
//     [10, 5, 2, 3, 1, 4],              ← Definite-length array
// ])

// Verify that decoding works correctly
assert.deepStrictEqual(decodedData, nestedUnsortedData, "Decoded data should match original")
