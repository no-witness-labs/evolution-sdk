import { Data, Effect as Eff, Schema } from "effect"

import * as PlutusData from "../core/Data.js"
import type * as PolicyId from "../core/PolicyId.js"
import * as Redeemer from "../core/Redeemer.js"
import type * as RewardAddress from "../core/RewardAddress.js"
import type * as TransactionInput from "../core/TransactionInput.js"
import type { RedeemerWitnessKey } from "./WitnessBuilder.js"

/**
 * Error class for missing execution units.
 *
 * @since 2.0.0
 * @category errors
 */
export class MissingExunitError extends Data.TaggedError("MissingExunitError")<{
  message?: string
  tag: Redeemer.RedeemerTag
  index: number
  key: string
}> {}

/**
 * Error class for RedeemerBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class RedeemerBuilderError extends Data.TaggedError("RedeemerBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Redeemer without the tag or index for builder code to return partial redeemers.
 *
 * @since 2.0.0
 * @category model
 */
export class UntaggedRedeemer extends Schema.Class<UntaggedRedeemer>("UntaggedRedeemer")({
  data: PlutusData.DataSchema,
  exUnits: Redeemer.ExUnits
}) {
  static new(data: PlutusData.Data, exUnits: Redeemer.ExUnits): UntaggedRedeemer {
    return new UntaggedRedeemer({ data, exUnits })
  }
}

/**
 * Union type for untagged redeemer placeholders.
 *
 * @since 2.0.0
 * @category model
 */
export const UntaggedRedeemerPlaceholder = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("JustData"),
    data: PlutusData.DataSchema
  }),
  Schema.Struct({
    _tag: Schema.Literal("Full"),
    redeemer: UntaggedRedeemer
  })
).annotations({
  identifier: "UntaggedRedeemerPlaceholder",
  description: "Placeholder for redeemer data that may be partial or complete"
})

export type UntaggedRedeemerPlaceholder = typeof UntaggedRedeemerPlaceholder.Type

/**
 * Helper function to extract data from an untagged redeemer placeholder.
 *
 * @since 2.0.0
 * @category utilities
 */
export const getPlaceholderData = (placeholder: UntaggedRedeemerPlaceholder): PlutusData.Data => {
  switch (placeholder._tag) {
    case "JustData":
      return placeholder.data
    case "Full":
      return placeholder.redeemer.data
  }
}

/**
 * Builder for creating redeemer sets.
 *
 * In order to calculate the index from the sorted set, "add*" methods in this builder
 * must be called along with the "add*" methods in transaction builder.
 *
 * @since 2.0.0
 * @category builders
 */
export class RedeemerSetBuilder {
  private spend: Map<string, UntaggedRedeemerPlaceholder | null> = new Map()
  private mint: Map<string, UntaggedRedeemerPlaceholder | null> = new Map()
  private reward: Map<string, UntaggedRedeemerPlaceholder | null> = new Map()
  private cert: Array<UntaggedRedeemerPlaceholder | null> = []
  private proposals: Array<UntaggedRedeemerPlaceholder | null> = []
  private votes: Array<UntaggedRedeemerPlaceholder | null> = []

  /**
   * Create a new RedeemerSetBuilder instance.
   *
   * @since 2.0.0
   * @category constructors
   */
  static new(): RedeemerSetBuilder {
    return new RedeemerSetBuilder()
  }

  /**
   * Check if the builder is empty (no redeemers tracked).
   *
   * @since 2.0.0
   * @category utilities
   */
  isEmpty(): boolean {
    return (
      this.spend.size === 0 &&
      this.mint.size === 0 &&
      this.reward.size === 0 &&
      this.cert.length === 0 &&
      this.proposals.length === 0 &&
      this.votes.length === 0
    )
  }

  /**
   * Update execution units for a specific redeemer.
   * Will override existing value if called twice with the same key.
   *
   * @since 2.0.0
   * @category updates
   */
  updateExUnits(key: RedeemerWitnessKey, exUnits: Redeemer.ExUnits): Eff.Effect<void, RedeemerBuilderError> {
    const index = Number(key.index)

    switch (key.tag) {
      case "spend": {
        const entries = Array.from(this.spend.entries()).sort((a, b) => a[0].localeCompare(b[0]))
        if (index >= entries.length) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: `Spend index ${index} out of bounds`,
              cause: new Error(`Only ${entries.length} spend entries available`)
            })
          )
        }
        const [inputKey, placeholder] = entries[index]
        if (!placeholder) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: "Cannot update ex units for null placeholder"
            })
          )
        }
        const data = getPlaceholderData(placeholder)
        this.spend.set(inputKey, {
          _tag: "Full",
          redeemer: UntaggedRedeemer.new(data, exUnits)
        })
        return Eff.succeed(undefined)
      }
      case "mint": {
        const entries = Array.from(this.mint.entries()).sort((a, b) => a[0].localeCompare(b[0]))
        if (index >= entries.length) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: `Mint index ${index} out of bounds`,
              cause: new Error(`Only ${entries.length} mint entries available`)
            })
          )
        }
        const [policyKey, placeholder] = entries[index]
        if (!placeholder) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: "Cannot update ex units for null placeholder"
            })
          )
        }
        const data = getPlaceholderData(placeholder)
        this.mint.set(policyKey, {
          _tag: "Full",
          redeemer: UntaggedRedeemer.new(data, exUnits)
        })
        return Eff.succeed(undefined)
      }
      case "reward": {
        const entries = Array.from(this.reward.entries()).sort((a, b) => a[0].localeCompare(b[0]))
        if (index >= entries.length) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: `Reward index ${index} out of bounds`,
              cause: new Error(`Only ${entries.length} reward entries available`)
            })
          )
        }
        const [rewardKey, placeholder] = entries[index]
        if (!placeholder) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: "Cannot update ex units for null placeholder"
            })
          )
        }
        const data = getPlaceholderData(placeholder)
        this.reward.set(rewardKey, {
          _tag: "Full",
          redeemer: UntaggedRedeemer.new(data, exUnits)
        })
        return Eff.succeed(undefined)
      }
      case "cert": {
        if (index >= this.cert.length) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: `Cert index ${index} out of bounds`,
              cause: new Error(`Only ${this.cert.length} cert entries available`)
            })
          )
        }
        const placeholder = this.cert[index]
        if (!placeholder) {
          return Eff.fail(
            new RedeemerBuilderError({
              message: "Cannot update ex units for null placeholder"
            })
          )
        }
        const data = getPlaceholderData(placeholder)
        this.cert[index] = {
          _tag: "Full",
          redeemer: UntaggedRedeemer.new(data, exUnits)
        }
        return Eff.succeed(undefined)
      }
    }
  }

  /**
   * Add a spend input result to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addSpend(input: TransactionInput.TransactionInput, redeemerData?: PlutusData.Data): void {
    const key = JSON.stringify(input)
    if (redeemerData) {
      this.spend.set(key, { _tag: "JustData", data: redeemerData })
    } else {
      this.spend.set(key, null)
    }
  }

  /**
   * Add a mint result to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addMint(policyId: PolicyId.PolicyId, redeemerData?: PlutusData.Data): void {
    const key = JSON.stringify(policyId)
    if (redeemerData) {
      this.mint.set(key, { _tag: "JustData", data: redeemerData })
    } else {
      this.mint.set(key, null)
    }
  }

  /**
   * Add a reward withdrawal result to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addReward(address: RewardAddress.RewardAddress, redeemerData?: PlutusData.Data): void {
    const key = JSON.stringify(address)
    if (redeemerData) {
      this.reward.set(key, { _tag: "JustData", data: redeemerData })
    } else {
      this.reward.set(key, null)
    }
  }

  /**
   * Add a certificate result to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addCert(redeemerData?: PlutusData.Data): void {
    if (redeemerData) {
      this.cert.push({ _tag: "JustData", data: redeemerData })
    } else {
      this.cert.push(null)
    }
  }

  /**
   * Add proposal results to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addProposal(redeemerData?: PlutusData.Data): void {
    if (redeemerData) {
      this.proposals.push({ _tag: "JustData", data: redeemerData })
    } else {
      this.proposals.push(null)
    }
  }

  /**
   * Add vote results to the builder.
   *
   * @since 2.0.0
   * @category adds
   */
  addVote(redeemerData?: PlutusData.Data): void {
    if (redeemerData) {
      this.votes.push({ _tag: "JustData", data: redeemerData })
    } else {
      this.votes.push(null)
    }
  }

  /**
   * Build the final redeemers array.
   *
   * @since 2.0.0
   * @category builders
   */
  build(defaultToDummyExunits: boolean = false): Eff.Effect<Array<Redeemer.Redeemer>, RedeemerBuilderError> {
    const redeemers: Array<Redeemer.Redeemer> = []

    const spendEntries = Array.from(this.spend.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const mintEntries = Array.from(this.mint.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const rewardEntries = Array.from(this.reward.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const certEntries = this.cert.map(
      (entry: UntaggedRedeemerPlaceholder | null, i: number) =>
        [`${i}`, entry] as [string, UntaggedRedeemerPlaceholder | null]
    )

    return Eff.Do.pipe(
      Eff.tap(() => this.removePlaceholdersAndTag(redeemers, "spend", spendEntries, defaultToDummyExunits)),
      Eff.tap(() => this.removePlaceholdersAndTag(redeemers, "mint", mintEntries, defaultToDummyExunits)),
      Eff.tap(() => this.removePlaceholdersAndTag(redeemers, "reward", rewardEntries, defaultToDummyExunits)),
      Eff.tap(() => this.removePlaceholdersAndTag(redeemers, "cert", certEntries, defaultToDummyExunits)),
      Eff.map(() => redeemers)
    )
  }

  private removePlaceholdersAndTag(
    redeemers: Array<Redeemer.Redeemer>,
    tag: Redeemer.RedeemerTag,
    entries: Array<[string, UntaggedRedeemerPlaceholder | null]>,
    defaultToDummyExunits: boolean
  ): Eff.Effect<void, RedeemerBuilderError> {
    try {
      const results: Array<UntaggedRedeemer | null> = []

      for (let i = 0; i < entries.length; i++) {
        const [key, placeholder] = entries[i]

        if (!placeholder) {
          results.push(null)
          continue
        }

        switch (placeholder._tag) {
          case "JustData":
            if (!defaultToDummyExunits) {
              return Eff.fail(
                new RedeemerBuilderError({
                  message: "Missing execution units",
                  cause: new MissingExunitError({
                    message: `Missing exunit for ${tag} with key ${key} and index ${i}`,
                    tag,
                    index: i,
                    key
                  })
                })
              )
            } else {
              results.push(UntaggedRedeemer.new(placeholder.data, [BigInt(0), BigInt(0)]))
            }
            break
          case "Full":
            results.push(placeholder.redeemer)
            break
        }
      }

      const taggedRedeemers = this.tagRedeemers(tag, results)
      redeemers.push(...taggedRedeemers)
      return Eff.succeed(undefined)
    } catch (error) {
      return Eff.fail(
        new RedeemerBuilderError({
          message: `Failed to process ${tag} redeemers`,
          cause: error
        })
      )
    }
  }

  private tagRedeemers(
    tag: Redeemer.RedeemerTag,
    untaggedRedeemers: Array<UntaggedRedeemer | null>
  ): Array<Redeemer.Redeemer> {
    const results: Array<Redeemer.Redeemer> = []

    for (let index = 0; index < untaggedRedeemers.length; index++) {
      const untagged = untaggedRedeemers[index]
      if (untagged) {
        results.push(
          new Redeemer.Redeemer({
            tag,
            index: BigInt(index),
            data: untagged.data,
            exUnits: untagged.exUnits
          })
        )
      }
    }

    return results
  }
}
