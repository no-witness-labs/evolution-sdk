import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { mnemonicToEntropy } from "bip39"
import { beforeEach, describe, expect, it } from "vitest"

import { Bip32PrivateKey, Bip32PublicKey, PrivateKey } from "../src/index.js"

/**
 * Comprehensive CML compatibility tests for Bip32PrivateKey module.
 * Tests all major operations against CML reference implementation.
 */
describe("Bip32PrivateKey CML Compatibility", () => {
  // Test data
  const testMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
  const testPassword = ""
  const testEntropy = Buffer.from(mnemonicToEntropy(testMnemonic), "hex")

  // Helper function to harden indices (same as reference)
  function harden(num: number): number {
    if (typeof num !== "number") throw new Error("Type number required here!")
    return 0x80000000 + num
  }

  describe("Master Key Generation", () => {
    it("should generate identical master keys from BIP39 entropy", () => {
      // CML approach
      const cmlRootKey = CML.Bip32PrivateKey.from_bip39_entropy(
        new Uint8Array(testEntropy),
        testPassword ? new TextEncoder().encode(testPassword) : new Uint8Array()
      )

      // Evolution SDK approach
      const evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)

      // Compare raw bytes
      const cmlRootBytes = cmlRootKey.to_raw_bytes()
      const evolutionRootBytes = Bip32PrivateKey.toBytes(evolutionRootKey)

      expect(Buffer.from(cmlRootBytes)).toEqual(Buffer.from(evolutionRootBytes))
    })

    it("should generate identical master keys with password", () => {
      const password = "test-password-123"

      // CML approach
      const cmlRootKey = CML.Bip32PrivateKey.from_bip39_entropy(
        new Uint8Array(testEntropy),
        new TextEncoder().encode(password)
      )

      // Evolution SDK approach
      const evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), password)

      // Compare raw bytes
      const cmlRootBytes = cmlRootKey.to_raw_bytes()
      const evolutionRootBytes = Bip32PrivateKey.toBytes(evolutionRootKey)

      expect(Buffer.from(cmlRootBytes)).toEqual(Buffer.from(evolutionRootBytes))
    })
  })

  describe("Key Derivation", () => {
    let cmlRootKey: CML.Bip32PrivateKey
    let evolutionRootKey: Bip32PrivateKey.Bip32PrivateKey

    beforeEach(() => {
      cmlRootKey = CML.Bip32PrivateKey.from_bip39_entropy(new Uint8Array(testEntropy), new Uint8Array())
      evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)
    })

    it("should derive identical hardened child keys", () => {
      const index = harden(1852)

      // CML derivation
      const cmlChild = cmlRootKey.derive(index)

      // Evolution SDK derivation
      const evolutionChild = Bip32PrivateKey.derive(evolutionRootKey, [index])

      // Compare raw bytes
      const cmlChildBytes = cmlChild.to_raw_bytes()
      const evolutionChildBytes = Bip32PrivateKey.toBytes(evolutionChild)

      expect(Buffer.from(cmlChildBytes)).toEqual(Buffer.from(evolutionChildBytes))
    })

    it("should derive identical soft child keys", () => {
      const index = 0 // Soft derivation

      // CML derivation
      const cmlChild = cmlRootKey.derive(index)

      // Evolution SDK derivation
      const evolutionChild = Bip32PrivateKey.derive(evolutionRootKey, [index])

      // Compare raw bytes
      const cmlChildBytes = cmlChild.to_raw_bytes()
      const evolutionChildBytes = Bip32PrivateKey.toBytes(evolutionChild)

      expect(Buffer.from(cmlChildBytes)).toEqual(Buffer.from(evolutionChildBytes))
    })

    it("should derive identical Cardano account keys (m/1852'/1815'/0')", () => {
      // CML approach
      const cmlAccountKey = cmlRootKey
        .derive(harden(1852)) // purpose
        .derive(harden(1815)) // coin_type
        .derive(harden(0)) // account

      // Evolution SDK approach
      const evolutionAccountKey = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0)])

      // Compare raw bytes
      const cmlAccountBytes = cmlAccountKey.to_raw_bytes()
      const evolutionAccountBytes = Bip32PrivateKey.toBytes(evolutionAccountKey)

      expect(Buffer.from(cmlAccountBytes)).toEqual(Buffer.from(evolutionAccountBytes))
    })

    it("should derive identical payment keys (account/0/0)", () => {
      // Derive account key first
      const cmlAccountKey = cmlRootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0))

      const evolutionAccountKey = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0)])

      // Derive payment keys
      const cmlPaymentKey = cmlAccountKey.derive(0).derive(0) // role=0, index=0
      const evolutionPaymentKey = Bip32PrivateKey.derive(evolutionAccountKey, [0, 0]) // role=0, index=0

      // Compare raw bytes
      const cmlPaymentBytes = cmlPaymentKey.to_raw_bytes()
      const evolutionPaymentBytes = Bip32PrivateKey.toBytes(evolutionPaymentKey)

      expect(Buffer.from(cmlPaymentBytes)).toEqual(Buffer.from(evolutionPaymentBytes))
    })

    it("should derive identical stake keys (account/2/0)", () => {
      // Derive account key first
      const cmlAccountKey = cmlRootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0))

      const evolutionAccountKey = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0)])

      // Derive stake keys
      const cmlStakeKey = cmlAccountKey.derive(2).derive(0) // role=2, index=0
      const evolutionStakeKey = Bip32PrivateKey.derive(evolutionAccountKey, [2, 0]) // role=2, index=0

      // Compare raw bytes
      const cmlStakeBytes = cmlStakeKey.to_raw_bytes()
      const evolutionStakeBytes = Bip32PrivateKey.toBytes(evolutionStakeKey)

      expect(Buffer.from(cmlStakeBytes)).toEqual(Buffer.from(evolutionStakeBytes))
    })

    it("should derive using multiple indices (array)", () => {
      const indices = [harden(1852), harden(1815), harden(0), 0, 0]

      // CML approach (step by step)
      let cmlKey = cmlRootKey
      for (const index of indices) {
        cmlKey = cmlKey.derive(index)
      }

      // Evolution SDK approach (using derive method)
      const evolutionKey = Bip32PrivateKey.derive(evolutionRootKey, indices)

      // Compare raw bytes
      const cmlKeyBytes = cmlKey.to_raw_bytes()
      const evolutionKeyBytes = Bip32PrivateKey.toBytes(evolutionKey)

      expect(Buffer.from(cmlKeyBytes)).toEqual(Buffer.from(evolutionKeyBytes))
    })

    it("should derive using path string", () => {
      const path = "m/1852'/1815'/0'/0/0"
      const indices = [harden(1852), harden(1815), harden(0), 0, 0]

      // CML approach (step by step)
      let cmlKey = cmlRootKey
      for (const index of indices) {
        cmlKey = cmlKey.derive(index)
      }

      // Evolution SDK approach (using derivePath method)
      const evolutionKey = Bip32PrivateKey.derivePath(evolutionRootKey, path)

      // Compare raw bytes
      const cmlKeyBytes = cmlKey.to_raw_bytes()
      const evolutionKeyBytes = Bip32PrivateKey.toBytes(evolutionKey)

      expect(Buffer.from(cmlKeyBytes)).toEqual(Buffer.from(evolutionKeyBytes))
    })
  })

  describe("Public Key Derivation", () => {
    let cmlRootKey: any
    let evolutionRootKey: Bip32PrivateKey.Bip32PrivateKey

    beforeEach(() => {
      cmlRootKey = CML.Bip32PrivateKey.from_bip39_entropy(new Uint8Array(testEntropy), new Uint8Array())
      evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)
    })

    it("should derive identical public keys from private keys", () => {
      // Derive payment key
      const cmlAccountKey = cmlRootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0))
      const cmlPaymentKey = cmlAccountKey.derive(0).derive(0)

      const evolutionAccountKey = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0)])
      const evolutionPaymentKey = Bip32PrivateKey.derive(evolutionAccountKey, [0, 0])

      // Get raw private keys for comparison
      const cmlPaymentRaw = cmlPaymentKey.to_raw_key()
      const evolutionPaymentPrivateKey = Bip32PrivateKey.toPrivateKey(evolutionPaymentKey)

      // Compare raw private key bytes
      const cmlPaymentRawBytes = cmlPaymentRaw.to_raw_bytes()
      const evolutionPaymentRawBytes = PrivateKey.toBytes(evolutionPaymentPrivateKey)

      expect(Buffer.from(cmlPaymentRawBytes)).toEqual(Buffer.from(evolutionPaymentRawBytes))

      // Get public keys
      const cmlPublicKey = cmlPaymentRaw.to_public()
      const evolutionPublicKey = Bip32PrivateKey.toPublicKey(evolutionPaymentKey)

      // Compare public key bytes (raw 32-byte key part)
      const cmlPublicBytes = cmlPublicKey.to_raw_bytes()
      const evolutionPublicBytes = Bip32PublicKey.toRawBytes(evolutionPublicKey)

      expect(Buffer.from(cmlPublicBytes)).toEqual(Buffer.from(evolutionPublicBytes))
    })

    it("should support public key derivation path matching", () => {
      // Create account keys
      const cmlAccountKey = cmlRootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0))

      const evolutionAccountKey = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0)])

      // Derive payment key via private key derivation
      const cmlPaymentKey = cmlAccountKey.derive(0).derive(0)
      const evolutionPaymentKey = Bip32PrivateKey.derive(evolutionAccountKey, [0, 0])

      // Get public keys from private keys
      const cmlPaymentRaw = cmlPaymentKey.to_raw_key()
      const cmlPublicKey = cmlPaymentRaw.to_public()
      const evolutionPublicKey = Bip32PrivateKey.toPublicKey(evolutionPaymentKey)

      // Compare public key bytes
      const cmlPublicBytes = cmlPublicKey.to_raw_bytes()
      const evolutionPublicBytes = Bip32PublicKey.toRawBytes(evolutionPublicKey)

      expect(Buffer.from(cmlPublicBytes)).toEqual(Buffer.from(evolutionPublicBytes))

      // Test public key derivation path (if we can derive the same keys using public key derivation)
      const evolutionAccountPubKey = Bip32PrivateKey.toPublicKey(evolutionAccountKey)
      const evolutionAccountKeyBytes = Bip32PrivateKey.toBytes(evolutionAccountKey)
      const evolutionAccountChainCode = evolutionAccountKeyBytes.slice(64, 96)

      // Get the raw bytes from the account public key
      const evolutionAccountPubKeyRaw = Bip32PublicKey.toRawBytes(evolutionAccountPubKey)

      const combined = new Uint8Array(64)
      combined.set(evolutionAccountPubKeyRaw, 0)
      combined.set(evolutionAccountChainCode, 32)
      const evolutionAccountBip32Pub = Bip32PublicKey.fromBytes(combined)

      // Derive payment key via public key derivation
      const paymentRoleKey = Bip32PublicKey.deriveChild(evolutionAccountBip32Pub, 0)
      const evolutionPaymentViaPub = Bip32PublicKey.deriveChild(paymentRoleKey, 0)

      const evolutionPaymentViaPubKey = Bip32PublicKey.toRawBytes(evolutionPaymentViaPub)

      // Both derivation methods should produce the same public key
      expect(Buffer.from(evolutionPublicBytes)).toEqual(Buffer.from(evolutionPaymentViaPubKey))
    })
  })

  describe("CML Compatibility Format", () => {
    let evolutionRootKey: Bip32PrivateKey.Bip32PrivateKey

    beforeEach(() => {
      evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)
    })

    it("should convert to and from CML 128-byte format", () => {
      // Convert to CML format
      const cml128Bytes = Bip32PrivateKey.to128XPRV(evolutionRootKey)
      expect(cml128Bytes.length).toBe(128)

      // Convert back from CML format
      const restoredKey = Bip32PrivateKey.from128XPRV(cml128Bytes)

      // Should be identical to original
      const originalBytes = Bip32PrivateKey.toBytes(evolutionRootKey)
      const restoredBytes = Bip32PrivateKey.toBytes(restoredKey)

      expect(Buffer.from(originalBytes)).toEqual(Buffer.from(restoredBytes))
    })

    it("should be compatible with CML's 128-byte format structure", () => {
      // Get CML key for reference
      const cmlKey = CML.Bip32PrivateKey.from_bip39_entropy(new Uint8Array(testEntropy), new Uint8Array())
      const cml128Bytes = cmlKey.to_128_xprv()

      // Convert Evolution key to 128-byte format
      const evolution128Bytes = Bip32PrivateKey.to128XPRV(evolutionRootKey)

      // The formats should have the same structure
      expect(evolution128Bytes.length).toBe(cml128Bytes.length)
      expect(evolution128Bytes.length).toBe(128)

      // They should be identical since we start from the same entropy
      expect(Buffer.from(evolution128Bytes)).toEqual(Buffer.from(cml128Bytes))
    })

    it("should roundtrip through CML format without data loss", () => {
      // Original key
      const originalBytes = Bip32PrivateKey.toBytes(evolutionRootKey)

      // Convert to CML format and back
      const cml128Bytes = Bip32PrivateKey.to128XPRV(evolutionRootKey)
      const restoredKey = Bip32PrivateKey.from128XPRV(cml128Bytes)
      const restoredBytes = Bip32PrivateKey.toBytes(restoredKey)

      // Should be identical
      expect(Buffer.from(originalBytes)).toEqual(Buffer.from(restoredBytes))

      // Derived keys should also be identical
      const originalDerived = Bip32PrivateKey.deriveChild(evolutionRootKey, harden(1852))
      const restoredDerived = Bip32PrivateKey.deriveChild(restoredKey, harden(1852))

      const originalDerivedBytes = Bip32PrivateKey.toBytes(originalDerived)
      const restoredDerivedBytes = Bip32PrivateKey.toBytes(restoredDerived)

      expect(Buffer.from(originalDerivedBytes)).toEqual(Buffer.from(restoredDerivedBytes))
    })
  })

  describe("Edge Cases and Error Handling", () => {
    it("should handle maximum hardened index", () => {
      const maxHardened = 0xffffffff
      const evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)

      // Should not throw for maximum hardened index
      expect(() => {
        Bip32PrivateKey.deriveChild(evolutionRootKey, maxHardened)
      }).not.toThrow()
    })

    it("should handle derivation of many levels", () => {
      const evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)
      const deepPath = [harden(1852), harden(1815), harden(0), 0, 0, 1, 2, 3, 4, 5]

      // Should not throw for deep derivation
      expect(() => {
        Bip32PrivateKey.derive(evolutionRootKey, deepPath)
      }).not.toThrow()
    })

    it("should handle different entropy sizes", () => {
      const entropy128 = new Uint8Array(16) // 128 bits
      const entropy256 = new Uint8Array(32) // 256 bits

      // Fill with test data
      entropy128.fill(0xaa)
      entropy256.fill(0xbb)

      expect(() => {
        Bip32PrivateKey.fromBip39Entropy(entropy128, "")
      }).not.toThrow()

      expect(() => {
        Bip32PrivateKey.fromBip39Entropy(entropy256, "")
      }).not.toThrow()
    })
  })

  describe("Cardano Path Utilities", () => {
    it("should generate correct Cardano BIP44 indices", () => {
      const paymentIndices = Bip32PrivateKey.CardanoPath.paymentIndices(0, 0)
      const stakeIndices = Bip32PrivateKey.CardanoPath.stakeIndices(0, 0)

      expect(paymentIndices).toEqual([
        harden(1852), // Purpose
        harden(1815), // Coin type (ADA)
        harden(0), // Account
        0, // Role (payment)
        0 // Index
      ])

      expect(stakeIndices).toEqual([
        harden(1852), // Purpose
        harden(1815), // Coin type (ADA)
        harden(0), // Account
        2, // Role (stake)
        0 // Index
      ])
    })

    it("should derive keys using Cardano path utilities", () => {
      const evolutionRootKey = Bip32PrivateKey.fromBip39Entropy(new Uint8Array(testEntropy), testPassword)

      // Derive using utility
      const paymentKey = Bip32PrivateKey.derive(evolutionRootKey, Bip32PrivateKey.CardanoPath.paymentIndices(0, 0))
      const stakeKey = Bip32PrivateKey.derive(evolutionRootKey, Bip32PrivateKey.CardanoPath.stakeIndices(0, 0))

      // Derive manually for comparison
      const manual = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0), 0, 0])

      const manualStake = Bip32PrivateKey.derive(evolutionRootKey, [harden(1852), harden(1815), harden(0), 2, 0])

      expect(Buffer.from(Bip32PrivateKey.toBytes(paymentKey))).toEqual(Buffer.from(Bip32PrivateKey.toBytes(manual)))
      expect(Buffer.from(Bip32PrivateKey.toBytes(stakeKey))).toEqual(Buffer.from(Bip32PrivateKey.toBytes(manualStake)))
    })
  })
})
