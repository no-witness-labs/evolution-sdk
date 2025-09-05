import { Data, ParseResult, pipe, Schema } from "effect"

import * as CoreAddressStructure from "../core/AddressStructure.js"

export class AddressError extends Data.TaggedError("AddressError")<{
  message?: string
  cause?: unknown
}> {}

// bech32
export type Address = string

export const toAddressStructure = Schema.decodeSync(CoreAddressStructure.FromBech32)
export const fromAddressStructure = Schema.encodeSync(CoreAddressStructure.FromBech32)

export const fromStruct = Schema.decodeSync(CoreAddressStructure.AddressStructure)
export const toStruct = Schema.encodeSync(CoreAddressStructure.AddressStructure)


// export const FromAddressStructure = Schema.transformOrFail(
//   Schema.typeSchema(CoreAddressStructure.AddressStructure),
//   Schema.String,
//   {
//     strict: true,
//     encode: (address) => ParseResult.decodeEither(CoreAddressStructure.FromBech32)(address),
//     decode: (value) => ParseResult.encodeEither(CoreAddressStructure.FromBech32)(value)
//   }
// )

// export const toCoreAddress = Function.makeEncodeSync(FromAddressStructure, AddressError, "toCoreAddress")

// export const fromCoreAddress = Function.makeDecodeSync(FromAddressStructure, AddressError, "fromCoreAddress")

// export const fromCredentials = ({
//   network = "Mainnet",
//   paymentCredential,
//   stakingCredential
// }: {
//   network?: "Mainnet" | "Testnet"
//   paymentCredential: Credential.Credential
//   stakingCredential: Credential.Credential
// }): Either.Either<Address, AddressError> => {
//   const payment = CoreCredential.Either.fromCBORHex(paymentCredential.hash)
//   if (Either.isLeft(payment)) {
//     return Either.left(new AddressError({ message: "Invalid payment credential", cause: payment.left }))
//   }
//   const staking = CoreCredential.Either.fromCBORHex(stakingCredential.hash)
//   if (Either.isLeft(staking)) {
//     return Either.left(new AddressError({ message: "Invalid staking credential", cause: staking.left }))
//   }

//   const coreAddress = new CoreAddressStructure.AddressStructure({
//     networkId: network === "Mainnet" ? 1 : 0,
//     paymentCredential: payment.right,
//     stakingCredential: staking.right
//   })
//   return Either.right(CoreAddressStructure.toBech32(coreAddress))
// }

// export const withCredentials = ({
//   network,
//   paymentCredential,
//   stakingCredential
// }: {
//   network: "Mainnet" | "Testnet"
//   paymentCredential: Credential.Credential
//   stakingCredential?: Credential.Credential
// }) => {
//   const coreAddress = new CoreAddressStructure.AddressStructure({
//     networkId: network === "Mainnet" ? 1 : 0, // Fix: 1 for Mainnet, 0 for Testnet
//     paymentCredential: Credential.toCoreCredential(paymentCredential),
//     stakingCredential: stakingCredential ? Credential.toCoreCredential(stakingCredential) : undefined
//   })
//   return CoreAddressStructure.toBech32(coreAddress)
// }

// /**
//  * Create an enterprise address (payment only) from a payment credential.
//  * An enterprise address has only a payment credential and no staking credential.
//  *
//  * @example
//  * ```typescript
//  * const credential = { type: "Key", hash: "abcd1234..." }
//  * const address = fromPaymentCredential(credential, "Mainnet")
//  * // Returns: "addr1w9rlm65wjfkctdlyxl5cw87h9...
//  * ```
//  */
// export const fromPaymentCredential = (
//   paymentCredential: Credential.Credential,
//   network: Credential.Network = "Mainnet"
// ): Address => {
//   const coreAddress = new CoreAddressStructure.AddressStructure({
//     networkId: network === "Mainnet" ? 1 : 0,
//     paymentCredential: Credential.toCoreCredential(paymentCredential),
//     // No staking credential for enterprise addresses
//     stakingCredential: undefined
//   })
//   return CoreAddressStructure.toBech32(coreAddress)
// }
