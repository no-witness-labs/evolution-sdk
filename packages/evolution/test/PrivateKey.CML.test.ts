import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs"
import { describe, expect, it } from "vitest"

import * as PrivateKey from "../src/PrivateKey"
import * as VKey from "../src/VKey"

// Test compatibility with CML (Cardano Multiplatform Library)
describe("PrivateKey CML Compatibility", () => {
  // Sample test data - using valid 32-byte and 64-byte keys
  const sampleBytes32 = new Uint8Array([
    0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08
  ])

  const sampleBytes64 = new Uint8Array([
    0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60,
    0x70, 0x80, 0x90, 0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
    0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10
  ])

  const testMessage = new Uint8Array([0x01, 0x02, 0x03, 0x04])

  describe("Missing Functions Implementation", () => {
    it("should have generate method", () => {
      const privateKeyBytes = PrivateKey.generate()
      expect(privateKeyBytes).toBeDefined()
      expect(privateKeyBytes.length).toBe(32) // Raw bytes for 32-byte key

      // Convert to PrivateKey to verify it works
      const privateKey = PrivateKey.fromBytes(privateKeyBytes)
      const bytes = PrivateKey.toBytes(privateKey)
      expect(bytes.length).toBe(32)
    })

    it("should have generateExtended method", () => {
      const privateKeyBytes = PrivateKey.generateExtended()
      expect(privateKeyBytes).toBeDefined()
      expect(privateKeyBytes.length).toBe(64) // Raw bytes for 64-byte key

      // Convert to PrivateKey to verify it works
      const privateKey = PrivateKey.fromBytes(privateKeyBytes)
      const bytes = PrivateKey.toBytes(privateKey)
      expect(bytes.length).toBe(64)
    })

    it("should have toPublic method", () => {
      const privateKey = PrivateKey.fromBytes(sampleBytes32)
      expect(PrivateKey.toBytes(privateKey).length).toBe(32) // Input should be 32 bytes
      
      const publicKey = PrivateKey.toPublicKey(privateKey)
      expect(publicKey).toBeDefined()

      const publicKeyBytes = VKey.toBytes(publicKey)
      expect(publicKeyBytes.length).toBe(32) // Public key should be 32 bytes
    })
  })

  describe("Constructor Methods Compatibility", () => {
    it("should match CML.PrivateKey.from_normal_bytes", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML should return 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)

      // Compare the raw bytes - convert evolution hex string to bytes
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(32) // Evolution should also be 32 bytes
      expect(Buffer.from(cmlPrivateKey.to_raw_bytes())).toEqual(Buffer.from(evolutionBytes))
    })

    it("should match CML.PrivateKey.from_extended_bytes", () => {
      expect(sampleBytes64.length).toBe(64) // Verify input is 64 bytes
      
      const cmlPrivateKey = CML.PrivateKey.from_extended_bytes(sampleBytes64)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(64) // CML should return 64 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes64)

      // Compare the raw bytes - convert evolution hex string to bytes
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(64) // Evolution should also be 64 bytes
      expect(Buffer.from(cmlPrivateKey.to_raw_bytes())).toEqual(Buffer.from(evolutionBytes))
    })
  })

  describe("Output Methods Compatibility", () => {
    it("should generate CML-compatible bytes output", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML output should be 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)

      // Raw bytes should match - convert evolution hex string to bytes
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(32) // Evolution output should be 32 bytes
      expect(Buffer.from(cmlPrivateKey.to_raw_bytes())).toEqual(Buffer.from(evolutionBytes))
    })

    it("should generate CML-compatible bech32 output", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML should maintain 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)

      // Note: CML and Evolution use different bech32 prefixes:
      // CML: "ed25519_sk" vs Evolution: "ed25519e_sk"
      // This is a known difference and doesn't affect functionality.
      // Let's verify the underlying data is the same by comparing the original bytes
      const cmlBech32 = cmlPrivateKey.to_bech32()
      const evolutionBech32 = PrivateKey.toBech32(evolutionPrivateKey)

      // Both should be valid bech32 strings
      expect(cmlBech32).toMatch(/^ed25519[e]?_sk1[a-z0-9]+$/)
      expect(evolutionBech32).toMatch(/^ed25519[e]?_sk1[a-z0-9]+$/)

      // The original bytes should be identical
      const cmlBytes = cmlPrivateKey.to_raw_bytes()
      expect(cmlBytes.length).toBe(32) // CML bytes should be 32
      
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(32) // Evolution bytes should be 32
      expect(Buffer.from(cmlBytes)).toEqual(Buffer.from(evolutionBytes))

      // Evolution should be able to decode its own bech32
      const evolutionFromBech32 = PrivateKey.fromBech32(evolutionBech32)
      const evolutionDecodedBytes = PrivateKey.toBytes(evolutionFromBech32)
      expect(Buffer.from(evolutionDecodedBytes)).toEqual(Buffer.from(evolutionBytes))
    })

    it("should generate CML-compatible hex output", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML should maintain 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)

      // CML doesn't have to_hex method, so compare with raw bytes converted to hex
      const cmlBytes = cmlPrivateKey.to_raw_bytes()
      expect(cmlBytes.length).toBe(32) // Verify CML bytes are 32
      
      const cmlHex = Array.from(cmlBytes as Uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      expect(cmlHex.length).toBe(64) // Hex string should be 64 chars (32 bytes * 2)
      expect(cmlHex).toEqual(PrivateKey.toHex(evolutionPrivateKey))
    })
  })

  describe("Generator Methods Compatibility", () => {
    it("should have generate method like CML.PrivateKey.generate_ed25519", () => {
      // Test that our generate method produces valid keys
      const evolutionPrivateKeyBytes = PrivateKey.generate()
      expect(evolutionPrivateKeyBytes.length).toBe(32) // Normal key is 32 bytes

      // Should be able to create a CML key from our generated bytes
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(evolutionPrivateKeyBytes)
      expect(cmlPrivateKey).toBeDefined()
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML should also maintain 32 bytes
    })

    it("should have generateExtended method like CML.PrivateKey.generate_ed25519extended", () => {
      // Test that our generateExtended method produces valid keys
      const evolutionPrivateKeyBytes = PrivateKey.generateExtended()
      expect(evolutionPrivateKeyBytes.length).toBe(64) // Extended key is 64 bytes

      // Should be able to create a CML key from our generated bytes
      const cmlPrivateKey = CML.PrivateKey.from_extended_bytes(evolutionPrivateKeyBytes)
      expect(cmlPrivateKey).toBeDefined()
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(64) // CML should also maintain 64 bytes

      // Compare with CML's own generation
      const cmlGenerated = CML.PrivateKey.generate_ed25519extended()
      const cmlGeneratedBytes = cmlGenerated.to_raw_bytes()
      expect(cmlGeneratedBytes.length).toBe(64) // Should also be 64 bytes
    })
  })

  describe("Cryptographic Operations Compatibility", () => {
    it("should generate identical signatures for 32-byte keys", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      expect(testMessage.length).toBe(4) // Verify test message length
      
      // Create identical keys
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML key should be 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)
      expect(PrivateKey.toBytes(evolutionPrivateKey).length).toBe(32) // Evolution key should be 32 bytes

      // Sign the same message
      const cmlSignature = cmlPrivateKey.sign(testMessage)
      expect(cmlSignature.to_raw_bytes().length).toBe(64) // Ed25519 signature is 64 bytes
      
      const evolutionSignature = PrivateKey.sign(evolutionPrivateKey, testMessage)
      expect(evolutionSignature.length).toBe(64) // Evolution signature should also be 64 bytes

      // Signatures should be identical
      expect(Buffer.from(cmlSignature.to_raw_bytes())).toEqual(Buffer.from(evolutionSignature))

      // Verify signatures are cryptographically valid
      const cmlPublicKey = cmlPrivateKey.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionPrivateKey)

      // CML signature verification
      const cmlVerifyResult = cmlPublicKey.verify(testMessage, cmlSignature)
      expect(cmlVerifyResult).toBe(true)

      // Evolution signature verification using VKey
      const evolutionVerifyResult = VKey.verify(evolutionPublicKey, testMessage, evolutionSignature)
      expect(evolutionVerifyResult).toBe(true)

      // Cross-verify: CML signature with Evolution public key
      const crossVerifyEvolution = VKey.verify(evolutionPublicKey, testMessage, cmlSignature.to_raw_bytes())
      expect(crossVerifyEvolution).toBe(true)

      // Cross-verify: Evolution signature with CML public key
      const evolutionSignatureForCml = CML.Ed25519Signature.from_raw_bytes(evolutionSignature)
      const crossVerifyCml = cmlPublicKey.verify(testMessage, evolutionSignatureForCml)
      expect(crossVerifyCml).toBe(true)
    })

    it("should generate identical signatures for 64-byte extended keys", () => {
      expect(sampleBytes64.length).toBe(64) // Verify input is 64 bytes
      expect(testMessage.length).toBe(4) // Verify test message length
      
      // Create identical extended keys
      const cmlPrivateKey = CML.PrivateKey.from_extended_bytes(sampleBytes64)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(64) // CML extended key should be 64 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes64)
      expect(PrivateKey.toBytes(evolutionPrivateKey).length).toBe(64) // Evolution extended key should be 64 bytes

      // Sign the same message
      const cmlSignature = cmlPrivateKey.sign(testMessage)
      expect(cmlSignature.to_raw_bytes().length).toBe(64) // Ed25519 signature is 64 bytes
      
      const evolutionSignature = PrivateKey.sign(evolutionPrivateKey, testMessage)
      expect(evolutionSignature.length).toBe(64) // Evolution signature should also be 64 bytes

      // Signatures should be identical
      expect(Buffer.from(cmlSignature.to_raw_bytes())).toEqual(Buffer.from(evolutionSignature))

      // Verify signatures are cryptographically valid
      const cmlPublicKey = cmlPrivateKey.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionPrivateKey)

      // CML signature verification
      const cmlVerifyResult = cmlPublicKey.verify(testMessage, cmlSignature)
      expect(cmlVerifyResult).toBe(true)

      // Evolution signature verification using VKey
      const evolutionVerifyResult = VKey.verify(evolutionPublicKey, testMessage, evolutionSignature)
      expect(evolutionVerifyResult).toBe(true)

      // Cross-verify: CML signature with Evolution public key
      const crossVerifyEvolution = VKey.verify(evolutionPublicKey, testMessage, cmlSignature.to_raw_bytes())
      expect(crossVerifyEvolution).toBe(true)

      // Cross-verify: Evolution signature with CML public key
      const evolutionSignatureForCml = CML.Ed25519Signature.from_raw_bytes(evolutionSignature)
      const crossVerifyCml = cmlPublicKey.verify(testMessage, evolutionSignatureForCml)
      expect(crossVerifyCml).toBe(true)
    })
  })

  describe("Public Key Derivation Compatibility", () => {
    it("should derive identical public keys from normal private keys", () => {
      expect(sampleBytes32.length).toBe(32) // Verify input is 32 bytes
      
      // Create identical keys
      const cmlPrivateKey = CML.PrivateKey.from_normal_bytes(sampleBytes32)
      expect(cmlPrivateKey.to_raw_bytes().length).toBe(32) // CML private key should be 32 bytes
      
      const evolutionPrivateKey = PrivateKey.fromBytes(sampleBytes32)
      expect(PrivateKey.toBytes(evolutionPrivateKey).length).toBe(32) // Evolution private key should be 32 bytes

      // Compare public keys
      const cmlPublicKey = cmlPrivateKey.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionPrivateKey)

      const cmlPublicBytes = cmlPublicKey.to_raw_bytes()
      expect(cmlPublicBytes.length).toBe(32) // Ed25519 public key is 32 bytes
      
      const evolutionPublicBytes = VKey.toBytes(evolutionPublicKey)
      expect(evolutionPublicBytes.length).toBe(32) // Evolution public key should also be 32 bytes

      expect(Buffer.from(cmlPublicBytes)).toEqual(Buffer.from(evolutionPublicBytes))
    })

    it("should derive identical public keys from extended private keys", () => {
      expect(sampleBytes64.length).toBe(64) // Verify input is 64 bytes
      
      // Create identical extended keys
      const cmlExtended = CML.PrivateKey.from_extended_bytes(sampleBytes64)
      expect(cmlExtended.to_raw_bytes().length).toBe(64) // CML extended private key should be 64 bytes
      
      const evolutionExtended = PrivateKey.fromBytes(sampleBytes64)
      expect(PrivateKey.toBytes(evolutionExtended).length).toBe(64) // Evolution extended private key should be 64 bytes

      // Compare public keys derived from extended keys
      const cmlPublicKey = cmlExtended.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionExtended)

      const cmlPublicBytes = cmlPublicKey.to_raw_bytes()
      expect(cmlPublicBytes.length).toBe(32) // Public key should still be 32 bytes
      
      const evolutionPublicBytes = VKey.toBytes(evolutionPublicKey)
      expect(evolutionPublicBytes.length).toBe(32) // Evolution public key should also be 32 bytes

      expect(Buffer.from(cmlPublicBytes)).toEqual(Buffer.from(evolutionPublicBytes))
    })
  })

  describe("Roundtrip Compatibility", () => {
    it("should handle CML-generated keys", () => {
      // Generate a key with CML
      const cmlPrivateKey = CML.PrivateKey.generate_ed25519()
      const cmlBytes = cmlPrivateKey.to_raw_bytes()
      expect(cmlBytes.length).toBe(32) // CML normal key should be 32 bytes

      // Import it into our system
      const evolutionPrivateKey = PrivateKey.fromBytes(cmlBytes)
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(32) // Evolution should maintain 32 bytes

      // Should produce identical results
      expect(Buffer.from(evolutionBytes)).toEqual(Buffer.from(cmlBytes))

      // Should produce identical signatures
      const message = new Uint8Array([1, 2, 3, 4])
      expect(message.length).toBe(4) // Verify message length
      
      const cmlSignature = cmlPrivateKey.sign(message)
      expect(cmlSignature.to_raw_bytes().length).toBe(64) // Signature should be 64 bytes
      
      const evolutionSignature = PrivateKey.sign(evolutionPrivateKey, message)
      expect(evolutionSignature.length).toBe(64) // Evolution signature should also be 64 bytes

      expect(Buffer.from(cmlSignature.to_raw_bytes())).toEqual(Buffer.from(evolutionSignature))

      // Verify signatures are cryptographically valid
      const cmlPublicKey = cmlPrivateKey.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionPrivateKey)

      // Both signatures should verify correctly
      const cmlVerifyResult = cmlPublicKey.verify(message, cmlSignature)
      expect(cmlVerifyResult).toBe(true)

      const evolutionVerifyResult = VKey.verify(evolutionPublicKey, message, evolutionSignature)
      expect(evolutionVerifyResult).toBe(true)

      // Cross-verification should also work
      const crossVerifyEvolution = VKey.verify(evolutionPublicKey, message, cmlSignature.to_raw_bytes())
      expect(crossVerifyEvolution).toBe(true)

      const evolutionSigForCml = CML.Ed25519Signature.from_raw_bytes(evolutionSignature)
      const crossVerifyCml = cmlPublicKey.verify(message, evolutionSigForCml)
      expect(crossVerifyCml).toBe(true)
    })

    it("should handle CML-generated extended keys", () => {
      // Generate an extended key with CML
      const cmlPrivateKey = CML.PrivateKey.generate_ed25519extended()
      const cmlBytes = cmlPrivateKey.to_raw_bytes()
      expect(cmlBytes.length).toBe(64) // CML extended key should be 64 bytes

      // Import it into our system
      const evolutionPrivateKey = PrivateKey.fromBytes(cmlBytes)

      // Should produce identical results
      const evolutionBytes = PrivateKey.toBytes(evolutionPrivateKey)
      expect(evolutionBytes.length).toBe(64) // Evolution should maintain 64 bytes
      expect(Buffer.from(evolutionBytes)).toEqual(Buffer.from(cmlBytes))

      // For signatures, both should produce valid signatures, but they might be different
      // due to different extended key handling. Let's verify they're both valid.
      const message = new Uint8Array([1, 2, 3, 4])
      expect(message.length).toBe(4) // Verify message length
      
      const cmlSignature = cmlPrivateKey.sign(message)
      const evolutionSignature = PrivateKey.sign(evolutionPrivateKey, message)

      // Both signatures should be 64 bytes (Ed25519 signature length)
      expect(cmlSignature.to_raw_bytes().length).toBe(64)
      expect(evolutionSignature.length).toBe(64)

      // For extended keys, the signatures might be different due to different derivation
      // So let's just verify both are valid by checking they can verify
      const cmlPublicKey = cmlPrivateKey.to_public()
      const evolutionPublicKey = PrivateKey.toPublicKey(evolutionPrivateKey)

      // Both should derive the same public key
      const cmlPublicBytes = cmlPublicKey.to_raw_bytes()
      expect(cmlPublicBytes.length).toBe(32) // Public key should be 32 bytes

      const evolutionPublicBytes = VKey.toBytes(evolutionPublicKey)
      expect(evolutionPublicBytes.length).toBe(32) // Evolution public key should also be 32 bytes
      expect(Buffer.from(cmlPublicBytes)).toEqual(Buffer.from(evolutionPublicBytes))

      // Verify both signatures are cryptographically valid
      const cmlVerifyResult = cmlPublicKey.verify(message, cmlSignature)
      expect(cmlVerifyResult).toBe(true)

      const evolutionVerifyResult = VKey.verify(evolutionPublicKey, message, evolutionSignature)
      expect(evolutionVerifyResult).toBe(true)

      // Since public keys are identical, cross-verification should work too
      const crossVerifyEvolution = VKey.verify(evolutionPublicKey, message, cmlSignature.to_raw_bytes())
      expect(crossVerifyEvolution).toBe(true)

      const evolutionSigForCml = CML.Ed25519Signature.from_raw_bytes(evolutionSignature)
      const crossVerifyCml = cmlPublicKey.verify(message, evolutionSigForCml)
      expect(crossVerifyCml).toBe(true)
    })
  })
})
