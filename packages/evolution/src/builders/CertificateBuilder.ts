import { Data, Effect as Eff } from "effect"

import type * as Certificate from "../core/Certificate.js"
import type * as Credential from "../core/Credential.js"
import * as KeyHash from "../core/KeyHash.js"
import type * as NativeScripts from "../core/NativeScripts.js"
import type * as PoolKeyHash from "../core/PoolKeyHash.js"
import * as ScriptHash from "../core/ScriptHash.js"
import type { NativeScriptWitnessInfo, PartialPlutusWitness } from "./WitnessBuilder.js"
import { InputAggregateWitnessData, PlutusScriptWitness, RequiredWitnessSet } from "./WitnessBuilder.js"

/**
 * Error class for CertificateBuilder related operations.
 *
 * @since 2.0.0
 * @category errors
 */
export class CertificateBuilderError extends Data.TaggedError("CertificateBuilderError")<{
  message?: string
  cause?: unknown
}> {}

/**
 * Calculates required witnesses for a certificate
 *
 * @since 2.0.0
 * @category utils
 */
export function certRequiredWits(cert: Certificate.Certificate, requiredWitnesses: RequiredWitnessSet): void {
  switch (cert._tag) {
    case "StakeRegistration":
      // Stake key registrations do not require a witness
      break

    case "StakeDeregistration":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "StakeDelegation":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "PoolRegistration":
      cert.poolParams.poolOwners.forEach((owner) => {
        requiredWitnesses.addVkeyKeyHash(owner) // owner is already KeyHash
      })
      requiredWitnesses.addVkeyKeyHash(poolKeyHashToKeyHash(cert.poolParams.operator)) // operator is PoolKeyHash
      break

    case "PoolRetirement":
      requiredWitnesses.addVkeyKeyHash(poolKeyHashToKeyHash(cert.poolKeyHash))
      break

    case "RegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "UnregCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "VoteDelegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "StakeVoteDelegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "StakeRegDelegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "VoteRegDelegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "StakeVoteRegDelegCert":
      addCredentialWitness(cert.stakeCredential, requiredWitnesses)
      break

    case "AuthCommitteeHotCert":
      addCredentialWitness(cert.committeeColdCredential, requiredWitnesses)
      break

    case "ResignCommitteeColdCert":
      addCredentialWitness(cert.committeeColdCredential, requiredWitnesses)
      break

    case "RegDrepCert":
      addCredentialWitness(cert.drepCredential, requiredWitnesses)
      break

    case "UnregDrepCert":
      addCredentialWitness(cert.drepCredential, requiredWitnesses)
      break

    case "UpdateDrepCert":
      addCredentialWitness(cert.drepCredential, requiredWitnesses)
      break
  }
}

function addCredentialWitness(credential: Credential.CredentialSchema, requiredWitnesses: RequiredWitnessSet): void {
  switch (credential._tag) {
    case "KeyHash":
      requiredWitnesses.addVkeyKeyHash(credential)
      break
    case "ScriptHash":
      requiredWitnesses.addScriptHash(credential)
      break
  }
}

function poolKeyHashToKeyHash(poolKeyHash: PoolKeyHash.PoolKeyHash): KeyHash.KeyHash {
  // Both PoolKeyHash and KeyHash are based on Hash28, so we can convert by extracting the hash
  return KeyHash.make({ hash: poolKeyHash.hash })
}

/**
 * Result of building a certificate
 *
 * @since 2.0.0
 * @category model
 */
export interface CertificateBuilderResult {
  cert: Certificate.Certificate
  aggregateWitness?: InputAggregateWitnessData
  requiredWits: RequiredWitnessSet
}

/**
 * Builder for a single certificate
 *
 * @since 2.0.0
 * @category builders
 */
export class SingleCertificateBuilder {
  constructor(public readonly cert: Certificate.Certificate) {}

  static new(cert: Certificate.Certificate): SingleCertificateBuilder {
    return new SingleCertificateBuilder(cert)
  }

  skipWitness(): CertificateBuilderResult {
    const requiredWits = RequiredWitnessSet.default()
    certRequiredWits(this.cert, requiredWits)

    return {
      cert: this.cert,
      aggregateWitness: undefined,
      requiredWits
    }
  }

  paymentKey(): Eff.Effect<CertificateBuilderResult, CertificateBuilderError> {
    return Eff.gen(
      function* (this: SingleCertificateBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        certRequiredWits(this.cert, requiredWits)

        if (requiredWits.scripts.length > 0) {
          return yield* Eff.fail(
            new CertificateBuilderError({
              message: `Certificate contains script. Expected public key hash.`
            })
          )
        }

        return {
          cert: this.cert,
          aggregateWitness: undefined,
          requiredWits
        }
      }.bind(this)
    )
  }

  nativeScript(
    nativeScript: NativeScripts.NativeScript,
    witnessInfo: NativeScriptWitnessInfo
  ): Eff.Effect<CertificateBuilderResult, CertificateBuilderError> {
    return Eff.gen(
      function* (this: SingleCertificateBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        certRequiredWits(this.cert, requiredWits)
        const requiredWitsLeft = structuredClone(requiredWits)

        const scriptHash = ScriptHash.fromScript(nativeScript)

        // Check if the script is actually required
        const contains = requiredWitsLeft.scripts.some((h) => ScriptHash.equals(h, scriptHash))

        // Remove the script hash
        const filteredScripts = requiredWitsLeft.scripts.filter((h) => !ScriptHash.equals(h, scriptHash))
        const mutableRequiredWitsLeft = { ...requiredWitsLeft, scripts: filteredScripts }

        if (mutableRequiredWitsLeft.scripts.length > 0) {
          return yield* Eff.fail(
            new CertificateBuilderError({
              message: "Missing the following witnesses for the certificate",
              cause: mutableRequiredWitsLeft
            })
          )
        }

        return {
          cert: this.cert,
          aggregateWitness: contains ? InputAggregateWitnessData.nativeScript(nativeScript, witnessInfo) : undefined,
          requiredWits
        }
      }.bind(this)
    )
  }

  plutusScript(
    partialWitness: PartialPlutusWitness,
    requiredSigners: Array<KeyHash.KeyHash>
  ): Eff.Effect<CertificateBuilderResult, CertificateBuilderError> {
    return Eff.gen(
      function* (this: SingleCertificateBuilder) {
        const requiredWits = RequiredWitnessSet.default()
        requiredSigners.forEach((signer) => requiredWits.addVkeyKeyHash(signer))
        certRequiredWits(this.cert, requiredWits)
        const requiredWitsLeft = structuredClone(requiredWits)

        // Clear vkeys as we don't know which ones will be used
        const mutableRequiredWitsLeft = { ...requiredWitsLeft, vkeys: [] }

        const scriptHash = PlutusScriptWitness.hash(partialWitness.scriptWitness)

        // Check if the script is actually required
        const contains = requiredWitsLeft.scripts.some((h) => ScriptHash.equals(h, scriptHash))

        // Remove the script hash
        const filteredPlutusScripts = mutableRequiredWitsLeft.scripts.filter((h) => !ScriptHash.equals(h, scriptHash))
        const finalRequiredWitsLeft = new RequiredWitnessSet({
          vkeys: mutableRequiredWitsLeft.vkeys,
          bootstraps: mutableRequiredWitsLeft.bootstraps,
          scripts: filteredPlutusScripts,
          plutusData: mutableRequiredWitsLeft.plutusData,
          redeemers: mutableRequiredWitsLeft.redeemers,
          scriptRefs: mutableRequiredWitsLeft.scriptRefs
        })

        if (finalRequiredWitsLeft.len() > 0) {
          return yield* Eff.fail(
            new CertificateBuilderError({
              message: "Missing the following witnesses for the certificate",
              cause: finalRequiredWitsLeft
            })
          )
        }

        return {
          cert: this.cert,
          aggregateWitness: contains
            ? InputAggregateWitnessData.plutusScript(
                partialWitness,
                requiredSigners,
                undefined // No datum for certificates
              )
            : undefined,
          requiredWits
        }
      }.bind(this)
    )
  }
}
