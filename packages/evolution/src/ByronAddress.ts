import { Schema } from "effect"

import * as Bytes from "./Bytes.js"
import * as NetworkId from "./NetworkId.js"

/**
 * Byron legacy address format
 *
 * @since 2.0.0
 * @category schemas
 */
export class ByronAddress extends Schema.TaggedClass<ByronAddress>("ByronAddress")("ByronAddress", {
  networkId: NetworkId.NetworkId,
  bytes: Bytes.HexSchema
}) {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      _tag: "ByronAddress",
      networkId: this.networkId,
      bytes: this.bytes
    }
  }
}

// /**
//  * Byron legacy address has limited support
//  * @since 2.0.0
//  */
export const BytesSchema = Schema.transform(Schema.Uint8ArrayFromSelf, ByronAddress, {
  strict: true,
  encode: (_, toA) => Bytes.Codec.Encode.bytes(toA.bytes),
  decode: (_, fromA) =>
    new ByronAddress({
      networkId: NetworkId.NetworkId.make(0),
      bytes: Bytes.Codec.Decode.bytes(fromA)
    })
})
