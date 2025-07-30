#!/usr/bin/env node

/**
 * Code Generation Script for Evolution SDK
 *
 * This script can be extended to generate:
 * - TypeScript types from CDDL schemas
 * - Cardano transaction builders
 * - Constants from blockchain parameters
 * - API client code from OpenAPI specs
 */

import { dirname, join } from "path"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const srcDir = join(__dirname, "..", "src")

// Ensure generated directory exists
const generatedDir = join(srcDir, "generated")
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir, { recursive: true })
}

/**
 * Generate version constants
 */
async function generateVersionInfo() {
  const packageJson = await import("../package.json", { assert: { type: "json" } })

  const content = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

export const VERSION = '${packageJson.default.version}';
export const PACKAGE_NAME = '${packageJson.default.name}';
export const BUILD_TIME = '${new Date().toISOString()}';

// Cardano Constants (can be extended)
export const CARDANO_CONSTANTS = {
  // Byron era constants
  BYRON_SLOT_DURATION: 20_000, // 20 seconds
  
  // Shelley era constants  
  SHELLEY_SLOT_DURATION: 1_000, // 1 second
  EPOCH_LENGTH: 432_000, // 5 days worth of slots
  
  // Address constants
  ADDRESS_CHECKSUM_SIZE: 4,
  
  // Transaction constants
  MAX_TX_SIZE: 16_384, // 16KB
  MIN_FEE_A: 44,
  MIN_FEE_B: 155_381,
  
  // UTxO constants
  MIN_UTxO: 1_000_000, // 1 ADA in lovelace
} as const;

export type CardanoConstants = typeof CARDANO_CONSTANTS;
`

  writeFileSync(join(generatedDir, "constants.ts"), content)
  console.log("✅ Generated constants.ts")
}

/**
 * Generate network configurations
 */
function generateNetworkConfigs() {
  const content = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

export interface NetworkConfig {
  readonly networkId: number;
  readonly protocolMagic: number;
  readonly name: string;
  readonly explorerUrl?: string;
}

export const NETWORKS = {
  mainnet: {
    networkId: 1,
    protocolMagic: 764824073,
    name: 'mainnet',
    explorerUrl: 'https://cardanoscan.io',
  },
  preprod: {
    networkId: 0,
    protocolMagic: 1,
    name: 'preprod',
    explorerUrl: 'https://preprod.cardanoscan.io',
  },
  preview: {
    networkId: 0,
    protocolMagic: 2,
    name: 'preview',
    explorerUrl: 'https://preview.cardanoscan.io',
  },
  private: {
    networkId: 0,
    protocolMagic: 42,
    name: 'private',
  },
} as const satisfies Record<string, NetworkConfig>;

export type NetworkName = keyof typeof NETWORKS;
export type Networks = typeof NETWORKS;
`

  writeFileSync(join(generatedDir, "networks.ts"), content)
  console.log("✅ Generated networks.ts")
}

/**
 * Generate type utilities
 */
function generateTypeUtils() {
  const content = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

/**
 * Utility types for the Evolution SDK
 */

// Hex string validation
export type HexString = string & { readonly __brand: 'HexString' };

// Address types
export type Address = string & { readonly __brand: 'Address' };
export type StakeAddress = string & { readonly __brand: 'StakeAddress' };

// Hash types  
export type Hash28 = HexString & { readonly __length: 28 };
export type Hash32 = HexString & { readonly __length: 32 };

export type TransactionHash = Hash32 & { readonly __type: 'TransactionHash' };
export type PolicyId = Hash28 & { readonly __type: 'PolicyId' };
export type AssetName = HexString & { readonly __type: 'AssetName' };

// Lovelace amount (always bigint for precision)
export type Lovelace = bigint & { readonly __brand: 'Lovelace' };

// Slot and epoch types
export type Slot = number & { readonly __brand: 'Slot' };
export type Epoch = number & { readonly __brand: 'Epoch' };

// Validation helpers
export const isHexString = (value: string): value is HexString => {
  return /^[0-9a-fA-F]*$/.test(value);
};

export const isValidAddress = (value: string): value is Address => {
  // Basic validation - can be enhanced
  return value.startsWith('addr') || value.startsWith('stake') || value.length === 103;
};
`

  writeFileSync(join(generatedDir, "types.ts"), content)
  console.log("✅ Generated types.ts")
}

/**
 * Generate index file for all generated code
 */
function generateIndex() {
  const content = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

export * from './constants.js';
export * from './networks.js';
export * from './types.js';
`

  writeFileSync(join(generatedDir, "index.ts"), content)
  console.log("✅ Generated index.ts")
}

/**
 * Main generation function
 */
async function main() {
  console.log("🚀 Starting code generation...")

  try {
    await generateVersionInfo()
    generateNetworkConfigs()
    generateTypeUtils()
    generateIndex()

    console.log("\n✨ Code generation completed successfully!")
    console.log(`📁 Generated files in: ${generatedDir}`)
  } catch (error) {
    console.error("❌ Code generation failed:", error)
    process.exit(1)
  }
}

main()
