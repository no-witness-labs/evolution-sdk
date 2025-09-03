import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as KeyHash from "../src/core/KeyHash.js"
import * as NetworkId from "../src/core/NetworkId.js"
import * as RewardAccount from "../src/core/RewardAccount.js"

describe("RewardAccount CML Compatibility", () => {
  it("validates hex compatibility with CML", () => {
    // Create test data
    const keyHashBytes = new Uint8Array(28)
    for (let i = 0; i < 28; i++) {
      keyHashBytes[i] = (i + 5) % 256 // Deterministic test data
    }
    const keyHashHex = Buffer.from(keyHashBytes).toString("hex")

    // Test both networks
    const networks = [0, 1] // testnet, mainnet

    networks.forEach((networkValue) => {
      // Create Evolution SDK RewardAccount
      const keyHash = KeyHash.fromBytes(keyHashBytes)
      const networkId = NetworkId.make(networkValue)
      const evolutionRewardAccount = RewardAccount.make({
        networkId,
        stakeCredential: keyHash
      })

      // Create CML RewardAccount - try different API
      const cmlKeyHash = CML.Ed25519KeyHash.from_hex(keyHashHex)
      const cmlCredential = CML.Credential.new_pub_key(cmlKeyHash) // Try this method
      const cmlRewardAccount = CML.RewardAddress.new(networkValue, cmlCredential)

      // Get hex from both (RewardAccount uses raw address bytes, not CBOR)
      const evolutionHex = RewardAccount.toHex(evolutionRewardAccount)
      const cmlHex = cmlRewardAccount.to_address().to_hex()
      // Compare the hex strings
      expect(evolutionHex).toBe(cmlHex)
    })
  })
})
