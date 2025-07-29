import { Schema } from "effect"

import * as NetworkId from "./NetworkId.js"

const Network = Schema.Literal("Mainnet", "Preview", "Preprod", "Custom")
type Network = typeof Network.Type

/**
 * Converts a Network type to Id number
 *
 * @since 1.0.0
 */
const _toId = <T extends Network>(network: T): NetworkId.NetworkId => {
  switch (network) {
    case "Preview":
    case "Preprod":
    case "Custom":
      return NetworkId.NetworkId.make(0)
    case "Mainnet":
      return NetworkId.NetworkId.make(1)
    default:
      throw new Error(`Exhaustive check failed: Unhandled case ${network}`)
  }
}

const _fromId = (id: NetworkId.NetworkId): Network => {
  switch (id) {
    case 0:
      return "Preview"
    case 1:
      return "Mainnet"
    default:
      throw new Error(`Exhaustive check failed: Unhandled case ${id}`)
  }
}
