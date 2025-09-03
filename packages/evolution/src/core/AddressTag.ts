import { Data } from "effect"

/**
 * @since 2.0.0
 * @category model
 */
export class AddressTagError extends Data.TaggedError("AddressTagError")<{
  message: string
  cause?: unknown
}> {}

/**
 * Address header kind - used to determine the type of address from its header
 * Following CIP-0019 address types
 *
 * @since 2.0.0
 * @category model
 */
export type AddressTag = "Base" | "Enterprise" | "Pointer" | "Reward" | "Byron"

// /**
//  * Get address kind from address string
//  *
//  * @since 2.0.0
//  * @category transformation
//  */
// export const fromBech32 = (
//   bech32Address: string,
// ): Effect.Effect<AddressTag, Bech32.Bech32Error> =>
//   Effect.map(Header.fromBech32(bech32Address), (header) => fromHeader(header));

// /**
//  * Get address tag from header byte
//  * Shifts the header byte to the right by 4 bits to isolate the address type
//  *
//  * @since 2.0.0
//  * @category transformation
//  */
// export const fromHeader = (header: number): AddressTag => {
//   const addressType = header >> 4;
//   switch (addressType) {
//     case 0b0000:
//     case 0b0001:
//     case 0b0010:
//     case 0b0011:
//       return "Base";
//     case 0b0100:
//     case 0b0101:
//       return "Pointer";
//     case 0b0110:
//     case 0b0111:
//       return "Enterprise";
//     case 0b1000:
//       return "Byron";
//     case 0b1110:
//     case 0b1111:
//       return "Reward";
//     default:
//       throw new AddressTagError({
//         message: `Unknown address header: ${header}`,
//       });
//   }
// };
