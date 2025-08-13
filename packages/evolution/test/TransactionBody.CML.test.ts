import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as Coin from "../src/Coin.js"
import * as NetworkId from "../src/NetworkId.js"
import * as TransactionBody from "../src/TransactionBody.js"
import * as TransactionHash from "../src/TransactionHash.js"
import * as TransactionInput from "../src/TransactionInput.js"

/**
 * CML compatibility test for TransactionBody CBOR serialization.
 *
 * This test validates that the Evolution SDK produces CBOR that is functionally
 * compatible with the Cardano Multiplatform Library (CML), ensuring byte-for-byte
 * identical encoding for the same transaction body data.
 */
describe("TransactionBody CML Compatibility", () => {
  it("validates minimal transaction body CBOR hex compatibility", () => {
    // Create test data for minimal transaction body (inputs, outputs, fee)
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 100000n

    // Create Evolution SDK TransactionBody
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 0 // Use number instead of bigint
    })
    const evolutionCoin = Coin.make(fee) // Use Coin.make instead of new Coin.Coin

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput],
      outputs: [], // Empty outputs array
      fee: evolutionCoin
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput = CML.TransactionInput.new(cmlTxHash, BigInt(0))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput)

    const cmlOutputList = CML.TransactionOutputList.new() // Empty outputs

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    // Check if they're identical
    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with TTL CBOR hex compatibility", () => {
    // Create test data
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 100000n
    const ttl = 1000000n

    // Create Evolution SDK TransactionBody with TTL
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 0
    })
    const evolutionCoin = Coin.make(fee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput],
      outputs: [],
      fee: evolutionCoin,
      ttl
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput = CML.TransactionInput.new(cmlTxHash, BigInt(0))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)
    cmlTxBody.set_ttl(ttl)

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with multiple inputs CBOR hex compatibility", () => {
    // Create test data for multiple inputs
    const txHashBytes1 = new Uint8Array(32).fill(1)
    const txHashBytes2 = new Uint8Array(32).fill(2)
    const txHashHex1 = Array.from(txHashBytes1, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const txHashHex2 = Array.from(txHashBytes2, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 150000n

    // Create Evolution SDK TransactionBody with multiple inputs
    const evolutionTxHash1 = TransactionHash.make(txHashHex1)
    const evolutionTxHash2 = TransactionHash.make(txHashHex2)
    const evolutionTxInput1 = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash1,
      index: 0
    })
    const evolutionTxInput2 = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash2,
      index: 1
    })
    const evolutionCoin = Coin.make(fee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput1, evolutionTxInput2],
      outputs: [],
      fee: evolutionCoin
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash1 = CML.TransactionHash.from_raw_bytes(txHashBytes1)
    const cmlTxHash2 = CML.TransactionHash.from_raw_bytes(txHashBytes2)
    const cmlTxInput1 = CML.TransactionInput.new(cmlTxHash1, BigInt(0))
    const cmlTxInput2 = CML.TransactionInput.new(cmlTxHash2, BigInt(1))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput1)
    cmlInputList.add(cmlTxInput2)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with network ID CBOR hex compatibility", () => {
    // Create test data
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 100000n
    const networkId = 1 // Mainnet

    // Create Evolution SDK TransactionBody with network ID
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 0
    })
    const evolutionCoin = Coin.make(fee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput],
      outputs: [],
      fee: evolutionCoin,
      networkId: NetworkId.make(networkId)
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput = CML.TransactionInput.new(cmlTxHash, BigInt(0))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)
    cmlTxBody.set_network_id(CML.NetworkId.mainnet())

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with TTL and network ID CBOR hex compatibility", () => {
    // Create test data
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 100000n
    const ttl = 2000000n
    const networkId = 0 // Testnet

    // Create Evolution SDK TransactionBody with TTL and network ID
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 0
    })
    const evolutionCoin = Coin.make(fee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput],
      outputs: [],
      fee: evolutionCoin,
      ttl,
      networkId: NetworkId.make(networkId)
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput = CML.TransactionInput.new(cmlTxHash, BigInt(0))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)
    cmlTxBody.set_ttl(ttl)
    cmlTxBody.set_network_id(CML.NetworkId.testnet())

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with different input indices CBOR hex compatibility", () => {
    // Create test data for different input indices
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const fee = 120000n

    // Create Evolution SDK TransactionBody with different input indices
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput1 = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 5
    })
    const evolutionTxInput2 = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 10
    })
    const evolutionCoin = Coin.make(fee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput1, evolutionTxInput2],
      outputs: [],
      fee: evolutionCoin
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput1 = CML.TransactionInput.new(cmlTxHash, BigInt(5))
    const cmlTxInput2 = CML.TransactionInput.new(cmlTxHash, BigInt(10))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput1)
    cmlInputList.add(cmlTxInput2)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, fee)

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })

  it("validates transaction body with large fee CBOR hex compatibility", () => {
    // Create test data with large fee
    const txHashBytes = new Uint8Array(32).fill(1)
    const txHashHex = Array.from(txHashBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    const largeFee = 10000000000n // 10 billion lovelace

    // Create Evolution SDK TransactionBody
    const evolutionTxHash = TransactionHash.make(txHashHex)
    const evolutionTxInput = new TransactionInput.TransactionInput({
      transactionId: evolutionTxHash,
      index: 0
    })
    const evolutionCoin = Coin.make(largeFee)

    const evolutionTxBody = new TransactionBody.TransactionBody({
      inputs: [evolutionTxInput],
      outputs: [],
      fee: evolutionCoin
    })

    // Create equivalent CML TransactionBody
    const cmlTxHash = CML.TransactionHash.from_raw_bytes(txHashBytes)
    const cmlTxInput = CML.TransactionInput.new(cmlTxHash, BigInt(0))

    const cmlInputList = CML.TransactionInputList.new()
    cmlInputList.add(cmlTxInput)

    const cmlOutputList = CML.TransactionOutputList.new()

    const cmlTxBody = CML.TransactionBody.new(cmlInputList, cmlOutputList, largeFee)

    // Convert both to CBOR and compare
    const evolutionCbor = TransactionBody.toCBORHex(evolutionTxBody)
    const cmlCbor = cmlTxBody.to_cbor_hex()

    expect(evolutionCbor).toBe(cmlCbor)
  })
})
