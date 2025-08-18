---
title: Devnet/DevnetDefault.ts
nav_order: 42
parent: Modules
---

## DevnetDefault overview

Type definitions for configuration objects to allow flexible values
while maintaining structure compatibility.

---

<h2 class="text-delta">Table of contents</h2>

- [constants](#constants)
  - [DEFAULT_ALONZO_GENESIS](#default_alonzo_genesis)
  - [DEFAULT_BYRON_GENESIS](#default_byron_genesis)
  - [DEFAULT_CONWAY_GENESIS](#default_conway_genesis)
  - [DEFAULT_DEVNET_CONFIG](#default_devnet_config)
  - [DEFAULT_KES_KEY](#default_kes_key)
  - [DEFAULT_KUPO_CONFIG](#default_kupo_config)
  - [DEFAULT_NODE_CONFIG](#default_node_config)
  - [DEFAULT_OGMIOS_CONFIG](#default_ogmios_config)
  - [DEFAULT_OPCERT](#default_opcert)
  - [DEFAULT_SHELLEY_GENESIS](#default_shelley_genesis)
  - [DEFAULT_VRF_SKEY](#default_vrf_skey)
- [model](#model)
  - [DevNetConfig (interface)](#devnetconfig-interface)
  - [KupoConfig (interface)](#kupoconfig-interface)
  - [OgmiosConfig (interface)](#ogmiosconfig-interface)
- [utils](#utils)
  - [AlonzoGenesis (type alias)](#alonzogenesis-type-alias)
  - [ByronGenesis (type alias)](#byrongenesis-type-alias)
  - [ConwayGenesis (type alias)](#conwaygenesis-type-alias)
  - [KesKey (type alias)](#keskey-type-alias)
  - [NodeConfig (type alias)](#nodeconfig-type-alias)
  - [OpCert (type alias)](#opcert-type-alias)
  - [ShelleyGenesis (type alias)](#shelleygenesis-type-alias)
  - [VrfSkey (type alias)](#vrfskey-type-alias)

---

# constants

## DEFAULT_ALONZO_GENESIS

Default Alonzo genesis configuration for Cardano DevNet.
Contains Plutus script execution parameters, cost models, and resource limits.

**Signature**

```ts
export declare const DEFAULT_ALONZO_GENESIS: {
  readonly lovelacePerUTxOWord: 34482
  readonly executionPrices: {
    readonly prSteps: { readonly numerator: 721; readonly denominator: 10000000 }
    readonly prMem: { readonly numerator: 577; readonly denominator: 10000 }
  }
  readonly maxTxExUnits: { readonly exUnitsMem: 10000000; readonly exUnitsSteps: 10000000000 }
  readonly maxBlockExUnits: { readonly exUnitsMem: 50000000; readonly exUnitsSteps: 40000000000 }
  readonly maxValueSize: 5000
  readonly collateralPercentage: 150
  readonly maxCollateralInputs: 3
  readonly costModels: {
    readonly PlutusV1: readonly [
      100788,
      420,
      1,
      1,
      1000,
      173,
      0,
      1,
      1000,
      59957,
      4,
      1,
      11183,
      32,
      201305,
      8356,
      4,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      100,
      100,
      16000,
      100,
      94375,
      32,
      132994,
      32,
      61462,
      4,
      72010,
      178,
      0,
      1,
      22151,
      32,
      91189,
      769,
      4,
      2,
      85848,
      228465,
      122,
      0,
      1,
      1,
      1000,
      42921,
      4,
      2,
      24548,
      29498,
      38,
      1,
      898148,
      27279,
      1,
      51775,
      558,
      1,
      39184,
      1000,
      60594,
      1,
      141895,
      32,
      83150,
      32,
      15299,
      32,
      76049,
      1,
      13169,
      4,
      22100,
      10,
      28999,
      74,
      1,
      28999,
      74,
      1,
      43285,
      552,
      1,
      44749,
      541,
      1,
      33852,
      32,
      68246,
      32,
      72362,
      32,
      7243,
      32,
      7391,
      32,
      11546,
      32,
      85848,
      228465,
      122,
      0,
      1,
      1,
      90434,
      519,
      0,
      1,
      74433,
      32,
      85848,
      228465,
      122,
      0,
      1,
      1,
      85848,
      228465,
      122,
      0,
      1,
      1,
      270652,
      22588,
      4,
      1457325,
      64566,
      4,
      20467,
      1,
      4,
      0,
      141992,
      32,
      100788,
      420,
      1,
      1,
      81663,
      32,
      59498,
      32,
      20142,
      32,
      24588,
      32,
      20744,
      32,
      25933,
      32,
      24623,
      32,
      53384111,
      14333,
      10
    ]
    readonly PlutusV2: readonly [
      100788,
      420,
      1,
      1,
      1000,
      173,
      0,
      1,
      1000,
      59957,
      4,
      1,
      11183,
      32,
      201305,
      8356,
      4,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      16000,
      100,
      100,
      100,
      16000,
      100,
      94375,
      32,
      132994,
      32,
      61462,
      4,
      72010,
      178,
      0,
      1,
      22151,
      32,
      91189,
      769,
      4,
      2,
      85848,
      228465,
      122,
      0,
      1,
      1,
      1000,
      42921,
      4,
      2,
      24548,
      29498,
      38,
      1,
      898148,
      27279,
      1,
      51775,
      558,
      1,
      39184,
      1000,
      60594,
      1,
      141895,
      32,
      83150,
      32,
      15299,
      32,
      76049,
      1,
      13169,
      4,
      22100,
      10,
      28999,
      74,
      1,
      28999,
      74,
      1,
      43285,
      552,
      1,
      44749,
      541,
      1,
      33852,
      32,
      68246,
      32,
      72362,
      32,
      7243,
      32,
      7391,
      32,
      11546,
      32,
      85848,
      228465,
      122,
      0,
      1,
      1,
      90434,
      519,
      0,
      1,
      74433,
      32,
      85848,
      228465,
      122,
      0,
      1,
      1,
      85848,
      228465,
      122,
      0,
      1,
      1,
      955506,
      213312,
      0,
      2,
      270652,
      22588,
      4,
      1457325,
      64566,
      4,
      20467,
      1,
      4,
      0,
      141992,
      32,
      100788,
      420,
      1,
      1,
      81663,
      32,
      59498,
      32,
      20142,
      32,
      24588,
      32,
      20744,
      32,
      25933,
      32,
      24623,
      32,
      43053543,
      10,
      53384111,
      14333,
      10,
      43574283,
      26308,
      10
    ]
  }
}
```

Added in v2.0.0

## DEFAULT_BYRON_GENESIS

Default Byron genesis configuration for Cardano DevNet.
Contains protocol constants and initial blockchain state for the Byron era.

**Signature**

```ts
export declare const DEFAULT_BYRON_GENESIS: {
  readonly protocolConsts: { readonly k: 2160; readonly protocolMagic: 42 }
  readonly startTime: number
  readonly blockVersionData: {
    readonly scriptVersion: 0
    readonly slotDuration: "250"
    readonly maxBlockSize: "2000000"
    readonly maxHeaderSize: "2000000"
    readonly maxTxSize: "4096"
    readonly maxProposalSize: "700"
    readonly mpcThd: "20000000000000"
    readonly heavyDelThd: "300000000000"
    readonly updateVoteThd: "1000000000000"
    readonly updateProposalThd: "100000000000000"
    readonly updateImplicit: "10000"
    readonly softforkRule: {
      readonly initThd: "900000000000000"
      readonly minThd: "600000000000000"
      readonly thdDecrement: "50000000000000"
    }
    readonly txFeePolicy: { readonly summand: "155381000000000"; readonly multiplier: "43000000000" }
    readonly unlockStakeEpoch: "18446744073709551615"
  }
  readonly bootStakeholders: { readonly "7a4519c93d7be4577dd85bd524c644e6b809e44eae0457b43128c1c7": 1 }
  readonly heavyDelegation: {}
  readonly nonAvvmBalances: {}
  readonly avvmDistr: {}
}
```

Added in v2.0.0

## DEFAULT_CONWAY_GENESIS

Default Conway genesis configuration for Cardano DevNet.
Contains governance parameters, voting thresholds, and Plutus V3 cost models.

**Signature**

```ts
export declare const DEFAULT_CONWAY_GENESIS: {
  readonly poolVotingThresholds: {
    readonly committeeNormal: 0.6
    readonly committeeNoConfidence: 0.51
    readonly hardForkInitiation: 0.51
    readonly motionNoConfidence: 0.6
    readonly ppSecurityGroup: 0.6
  }
  readonly dRepVotingThresholds: {
    readonly motionNoConfidence: 0.67
    readonly committeeNormal: 0.67
    readonly committeeNoConfidence: 0.6
    readonly updateToConstitution: 0.75
    readonly hardForkInitiation: 0.6
    readonly ppNetworkGroup: 0.67
    readonly ppEconomicGroup: 0.67
    readonly ppTechnicalGroup: 0.67
    readonly ppGovGroup: 0.75
    readonly treasuryWithdrawal: 0.67
  }
  readonly committeeMinSize: 0
  readonly committeeMaxTermLength: 73
  readonly govActionLifetime: 8
  readonly govActionDeposit: 50000000000
  readonly dRepDeposit: 500000000
  readonly dRepActivity: 20
  readonly minFeeRefScriptCostPerByte: 44
  readonly plutusV3CostModel: readonly [
    100788,
    420,
    1,
    1,
    1000,
    173,
    0,
    1,
    1000,
    59957,
    4,
    1,
    11183,
    32,
    201305,
    8356,
    4,
    16000,
    100,
    16000,
    100,
    16000,
    100,
    16000,
    100,
    16000,
    100,
    16000,
    100,
    100,
    100,
    16000,
    100,
    94375,
    32,
    132994,
    32,
    61462,
    4,
    72010,
    178,
    0,
    1,
    22151,
    32,
    91189,
    769,
    4,
    2,
    85848,
    123203,
    7305,
    -900,
    1716,
    549,
    57,
    85848,
    0,
    1,
    1,
    1000,
    42921,
    4,
    2,
    24548,
    29498,
    38,
    1,
    898148,
    27279,
    1,
    51775,
    558,
    1,
    39184,
    1000,
    60594,
    1,
    141895,
    32,
    83150,
    32,
    15299,
    32,
    76049,
    1,
    13169,
    4,
    22100,
    10,
    28999,
    74,
    1,
    28999,
    74,
    1,
    43285,
    552,
    1,
    44749,
    541,
    1,
    33852,
    32,
    68246,
    32,
    72362,
    32,
    7243,
    32,
    7391,
    32,
    11546,
    32,
    85848,
    123203,
    7305,
    -900,
    1716,
    549,
    57,
    85848,
    0,
    1,
    90434,
    519,
    0,
    1,
    74433,
    32,
    85848,
    123203,
    7305,
    -900,
    1716,
    549,
    57,
    85848,
    0,
    1,
    1,
    85848,
    123203,
    7305,
    -900,
    1716,
    549,
    57,
    85848,
    0,
    1,
    955506,
    213312,
    0,
    2,
    270652,
    22588,
    4,
    1457325,
    64566,
    4,
    20467,
    1,
    4,
    0,
    141992,
    32,
    100788,
    420,
    1,
    1,
    81663,
    32,
    59498,
    32,
    20142,
    32,
    24588,
    32,
    20744,
    32,
    25933,
    32,
    24623,
    32,
    43053543,
    10,
    53384111,
    14333,
    10,
    43574283,
    26308,
    10,
    16000,
    100,
    16000,
    100,
    962335,
    18,
    2780678,
    6,
    442008,
    1,
    52538055,
    3756,
    18,
    267929,
    18,
    76433006,
    8868,
    18,
    52948122,
    18,
    1995836,
    36,
    3227919,
    12,
    901022,
    1,
    166917843,
    4307,
    36,
    284546,
    36,
    158221314,
    26549,
    36,
    74698472,
    36,
    333849714,
    1,
    254006273,
    72,
    2174038,
    72,
    2261318,
    64571,
    4,
    207616,
    8310,
    4,
    1293828,
    28716,
    63,
    0,
    1,
    1006041,
    43623,
    251,
    0,
    1
  ]
  readonly constitution: {
    readonly anchor: {
      readonly url: ""
      readonly dataHash: "0000000000000000000000000000000000000000000000000000000000000000"
    }
  }
  readonly committee: { readonly members: {}; readonly threshold: 0.66 }
}
```

Added in v2.0.0

## DEFAULT_DEVNET_CONFIG

Complete default configuration for Cardano DevNet.
Includes all required settings for running a local Cardano development network.

**Signature**

```ts
export declare const DEFAULT_DEVNET_CONFIG: Required<DevNetConfig>
```

Added in v2.0.0

## DEFAULT_KES_KEY

Default KES (Key Evolving Signature) signing key for Cardano DevNet.
Used for block production and stake pool operations.

**Signature**

```ts
export declare const DEFAULT_KES_KEY: {
  readonly type: "KesSigningKey_ed25519_kes_2^6"
  readonly description: "KES Signing Key"
  readonly cborHex: "590260a199f16b11da6c7f5c1e0f1eb0b9bbe278d3d8f35bfd50d0951c2ff94d0344cd57df5f64c9bac1dd60b4482f9c636168f40737d526625a2ec82f22ec0c72de0013f86ef743a7bba0286db6ddf3d85bf8e49ddbf14d9d3b7ee22f4857c77b740948f84f2e72f6bcf91f405e34ea50a2c53fa4876b43cfce2bcfe87c06a903de8bb33d968ca7930b67d0c23f5cb2d74e422d773ba80e388de384691000d6ba8a9b4dc7d3187f76048fbef9a52b72d80d835bb76eced7c0e0cdc5b58869b73c095dffa01db4ff51765afcead565395a5ed1cf74e5f2134d61076fece21aacd080bbbfaab94125401d7bbc74eafc7e7e3a2235f59dc03d6e332e53d558493a1e22213b92c77b1328ff1b83855da704fc366bf4415490602481d1939136eeaf252c65184912a779d9d94a90e32b72c1877ef60b6d79e707ce5a762acb4bed46436efe4fe62aae50b39068cc508a09427c92791cbcbea44318529cc68d297ca24e1b73b2394c385ec63fcd85ed56eec3de48860a1ec950aad4f91cbf741dbd7bf1d3c278875bd20e31ff5372339f6aa5280ad9b8bf3514889ac44600fe57ca0b535d6dc6b0b981e079595aad186ee0be9b07e837391ab165e4ca406601c876a86e246a3f53311e21199cccc0b080f28d18f4dc6987731e10e4ade00df7c6921c5ef3022b6f49a29ba307a2c8f4bd2ba42fcfa0aad68a2f0ad31fff69a99d3471f9036d3f5817a3edfeff7fc3c14e1151d767aaa043481cfd1a6ee55e8e5d7853ecdaf9da2bb36c716beae8d706bc648a790d4697e1d044a11a49f305ab8bc64a094bd81bda7395fe6f77dd5557c39919dd9bb9cf22a87fe47408ae3ec2247007d015a5"
}
```

Added in v2.0.0

## DEFAULT_KUPO_CONFIG

Default configuration for Kupo service

**Signature**

```ts
export declare const DEFAULT_KUPO_CONFIG: Required<KupoConfig>
```

Added in v2.0.0

## DEFAULT_NODE_CONFIG

Default node configuration constants for Cardano DevNet.
These settings control the behavior of the Cardano node including
protocol parameters, logging, tracing, and hard fork schedules.

**Signature**

```ts
export declare const DEFAULT_NODE_CONFIG: {
  readonly Protocol: "Cardano"
  readonly ByronGenesisFile: "genesis-byron.json"
  readonly ShelleyGenesisFile: "genesis-shelley.json"
  readonly AlonzoGenesisFile: "genesis-alonzo.json"
  readonly ConwayGenesisFile: "genesis-conway.json"
  readonly ApplicationName: "cardano-sl"
  readonly ApplicationVersion: 1
  readonly MaxKnownMajorProtocolVersion: 2
  readonly "LastKnownBlockVersion-Alt": 0
  readonly "LastKnownBlockVersion-Major": 6
  readonly "LastKnownBlockVersion-Minor": 0
  readonly TestShelleyHardForkAtEpoch: 0
  readonly TestAllegraHardForkAtEpoch: 0
  readonly TestMaryHardForkAtEpoch: 0
  readonly TestAlonzoHardForkAtEpoch: 0
  readonly TestBabbageHardForkAtEpoch: 0
  readonly TestConwayHardForkAtEpoch: 0
  readonly RequiresNetworkMagic: "RequiresNoMagic"
  readonly minSeverity: "Info"
  readonly defaultBackends: readonly ["KatipBK"]
  readonly defaultScribes: readonly [readonly ["StdoutSK", "stdout"]]
  readonly setupBackends: readonly ["KatipBK"]
  readonly setupScribes: readonly [
    { readonly scFormat: "ScJson"; readonly scKind: "StdoutSK"; readonly scName: "stdout"; readonly scRotation: null }
  ]
  readonly TurnOnLogMetrics: true
  readonly TurnOnLogging: true
  readonly TracingVerbosity: "NormalVerbosity"
  readonly TraceBlockFetchClient: false
  readonly TraceBlockFetchDecisions: false
  readonly TraceBlockFetchProtocol: false
  readonly TraceBlockFetchProtocolSerialised: false
  readonly TraceBlockFetchServer: false
  readonly TraceChainDb: true
  readonly TraceChainSyncBlockServer: false
  readonly TraceChainSyncClient: false
  readonly TraceChainSyncHeaderServer: false
  readonly TraceChainSyncProtocol: false
  readonly TraceDNSResolver: false
  readonly TraceDNSSubscription: false
  readonly TraceErrorPolicy: false
  readonly TraceForge: true
  readonly TraceHandshake: false
  readonly TraceIpSubscription: false
  readonly TraceLocalChainSyncProtocol: true
  readonly TraceLocalErrorPolicy: false
  readonly TraceLocalHandshake: false
  readonly TraceLocalTxSubmissionProtocol: true
  readonly TraceLocalTxSubmissionServer: true
  readonly TraceMempool: true
  readonly TraceMux: false
  readonly TraceOptions: {}
  readonly TraceTxInbound: false
  readonly TraceTxOutbound: false
  readonly TraceTxSubmissionProtocol: false
  readonly hasEKG: 12788
  readonly hasPrometheus: readonly ["0.0.0.0", 12798]
  readonly options: {
    readonly mapBackends: {
      readonly "cardano.node.metrics": readonly ["EKGViewBK"]
      readonly "cardano.node.resources": readonly ["EKGViewBK"]
    }
    readonly mapSubtrace: { readonly "cardano.node.metrics": { readonly subtrace: "Neutral" } }
  }
  readonly ExperimentalHardForksEnabled: true
  readonly ExperimentalProtocolsEnabled: true
}
```

Added in v2.0.0

## DEFAULT_OGMIOS_CONFIG

Default configuration for Ogmios service

**Signature**

```ts
export declare const DEFAULT_OGMIOS_CONFIG: Required<OgmiosConfig>
```

Added in v2.0.0

## DEFAULT_OPCERT

Default node operational certificate for Cardano DevNet.
Certifies the stake pool's authority to produce blocks.

**Signature**

```ts
export declare const DEFAULT_OPCERT: {
  readonly type: "NodeOperationalCertificate"
  readonly description: ""
  readonly cborHex: "828458204cd49bb05e9885142fe7af1481107995298771fd1a24e72b506a4d600ee2b3120000584089fc9e9f551b2ea873bf31643659d049152d5c8e8de86be4056370bccc5fa62dd12e3f152f1664e614763e46eaa7a17ed366b5cef19958773d1ab96941442e0b58205a3d778e76741a009e29d23093cfe046131808d34d7c864967b515e98dfc3583"
}
```

Added in v2.0.0

## DEFAULT_SHELLEY_GENESIS

Default Shelley genesis configuration for Cardano DevNet.
Contains protocol parameters, initial funds, staking configuration, and network settings.

**Signature**

```ts
export declare const DEFAULT_SHELLEY_GENESIS: {
  readonly epochLength: 432000
  readonly activeSlotsCoeff: 1
  readonly slotLength: 1
  readonly securityParam: 2160
  readonly genDelegs: {}
  readonly initialFunds: {
    readonly "00813c32c92aad21770ff8001de0918f598df8c06775f77f8e8839d2a0074a515f7f32bf31a4f41c7417a8136e8152bfb42f06d71b389a6896": 900000000000
    readonly "609783be7d3c54f11377966dfabc9284cd6c32fca1cd42ef0a4f1cc45b": 900000000000
  }
  readonly maxKESEvolutions: 60
  readonly maxLovelaceSupply: 2000000000000
  readonly networkId: "Testnet"
  readonly networkMagic: 42
  readonly protocolParams: {
    readonly a0: 0
    readonly decentralisationParam: 0
    readonly eMax: 18
    readonly extraEntropy: { readonly tag: "NeutralNonce" }
    readonly keyDeposit: 0
    readonly maxBlockBodySize: 65536
    readonly maxBlockHeaderSize: 1100
    readonly maxTxSize: 16384
    readonly minFeeA: 44
    readonly minFeeB: 155381
    readonly minPoolCost: 0
    readonly minUTxOValue: 0
    readonly nOpt: 100
    readonly poolDeposit: 0
    readonly protocolVersion: { readonly major: 10; readonly minor: 0 }
    readonly rho: 0.1
    readonly tau: 0.1
  }
  readonly slotsPerKESPeriod: 129600
  readonly staking: {
    readonly pools: {
      readonly "8a219b698d3b6e034391ae84cee62f1d76b6fbc45ddfe4e31e0d4b60": {
        readonly cost: 0
        readonly margin: 0
        readonly metadata: null
        readonly owners: readonly []
        readonly pledge: 0
        readonly publicKey: "8a219b698d3b6e034391ae84cee62f1d76b6fbc45ddfe4e31e0d4b60"
        readonly relays: readonly []
        readonly rewardAccount: {
          readonly credential: { readonly "key hash": "b6ffb20cf821f9286802235841d4348a2c2bafd4f73092b7de6655ea" }
          readonly network: "Testnet"
        }
        readonly vrf: "fec17ed60cbf2ec5be3f061fb4de0b6ef1f20947cfbfce5fb2783d12f3f69ff5"
      }
    }
    readonly stake: {
      readonly "074a515f7f32bf31a4f41c7417a8136e8152bfb42f06d71b389a6896": "8a219b698d3b6e034391ae84cee62f1d76b6fbc45ddfe4e31e0d4b60"
    }
  }
  readonly systemStart: string
  readonly updateQuorum: 2
}
```

Added in v2.0.0

## DEFAULT_VRF_SKEY

Default VRF (Verifiable Random Function) signing key for Cardano DevNet.
Used for leader election and randomness generation in the consensus protocol.

**Signature**

```ts
export declare const DEFAULT_VRF_SKEY: {
  readonly type: "VrfSigningKey_PraosVRF"
  readonly description: "VRF Signing Key"
  readonly cborHex: "5840899795b70e9f34b737159fe21a6170568d6031e187f0cc84555c712b7c29b45cb882007593ef70f86e5c0948561a3b8e8851529a4f98975f2b24e768dda38ce2"
}
```

Added in v2.0.0

# model

## DevNetConfig (interface)

Configuration interface for Cardano DevNet setup.
All properties are optional, with sensible defaults provided.

**Signature**

```ts
export interface DevNetConfig {
  readonly clusterName?: string
  readonly image?: string
  readonly ports?: {
    readonly node: number
    readonly submit: number
  }
  readonly networkMagic?: number
  readonly nodeConfig?: Partial<NodeConfig>
  readonly byronGenesis?: Partial<ByronGenesis>
  readonly shelleyGenesis?: Partial<ShelleyGenesis>
  readonly alonzoGenesis?: Partial<AlonzoGenesis>
  readonly conwayGenesis?: Partial<ConwayGenesis>
  readonly kesKey?: Partial<KesKey>
  readonly opCert?: Partial<OpCert>
  readonly vrfSkey?: Partial<VrfSkey>
  readonly kupo?: KupoConfig
  readonly ogmios?: OgmiosConfig
}
```

Added in v2.0.0

## KupoConfig (interface)

Configuration interface for Kupo - A fast, lightweight & configurable chain-index

**Signature**

```ts
export interface KupoConfig {
  readonly enabled?: boolean
  readonly image?: string
  readonly port?: number
  readonly logLevel?: "Debug" | "Info" | "Notice" | "Warning" | "Error"
  readonly match?: string
  readonly deferDbIndexes?: boolean
  readonly since?: string
}
```

Added in v2.0.0

## OgmiosConfig (interface)

Configuration interface for Ogmios - A lightweight bridge interface for Cardano

**Signature**

```ts
export interface OgmiosConfig {
  readonly enabled?: boolean
  readonly image?: string
  readonly port?: number
  readonly logLevel?: "debug" | "info" | "notice" | "warning" | "error"
}
```

Added in v2.0.0

# utils

## AlonzoGenesis (type alias)

**Signature**

```ts
export type AlonzoGenesis = {
  readonly lovelacePerUTxOWord: number
  readonly executionPrices: {
    readonly prSteps: {
      readonly numerator: number
      readonly denominator: number
    }
    readonly prMem: {
      readonly numerator: number
      readonly denominator: number
    }
  }
  readonly maxTxExUnits: {
    readonly exUnitsMem: number
    readonly exUnitsSteps: number
  }
  readonly maxBlockExUnits: {
    readonly exUnitsMem: number
    readonly exUnitsSteps: number
  }
  readonly maxValueSize: number
  readonly collateralPercentage: number
  readonly maxCollateralInputs: number
  readonly costModels: {
    readonly PlutusV1: ReadonlyArray<number>
    readonly PlutusV2: ReadonlyArray<number>
  }
}
```

## ByronGenesis (type alias)

**Signature**

```ts
export type ByronGenesis = {
  readonly protocolConsts: {
    readonly k: number
    readonly protocolMagic: number
  }
  readonly startTime: number
  readonly blockVersionData: {
    readonly scriptVersion: number
    readonly slotDuration: string
    readonly maxBlockSize: string
    readonly maxHeaderSize: string
    readonly maxTxSize: string
    readonly maxProposalSize: string
    readonly mpcThd: string
    readonly heavyDelThd: string
    readonly updateVoteThd: string
    readonly updateProposalThd: string
    readonly updateImplicit: string
    readonly softforkRule: {
      readonly initThd: string
      readonly minThd: string
      readonly thdDecrement: string
    }
    readonly txFeePolicy: {
      readonly summand: string
      readonly multiplier: string
    }
    readonly unlockStakeEpoch: string
  }
  readonly bootStakeholders: Record<string, number>
  readonly heavyDelegation: Record<string, unknown>
  readonly nonAvvmBalances: Record<string, unknown>
  readonly avvmDistr: Record<string, unknown>
}
```

## ConwayGenesis (type alias)

**Signature**

```ts
export type ConwayGenesis = {
  readonly poolVotingThresholds: {
    readonly committeeNormal: number
    readonly committeeNoConfidence: number
    readonly hardForkInitiation: number
    readonly motionNoConfidence: number
    readonly ppSecurityGroup: number
  }
  readonly dRepVotingThresholds: {
    readonly motionNoConfidence: number
    readonly committeeNormal: number
    readonly committeeNoConfidence: number
    readonly updateToConstitution: number
    readonly hardForkInitiation: number
    readonly ppNetworkGroup: number
    readonly ppEconomicGroup: number
    readonly ppTechnicalGroup: number
    readonly ppGovGroup: number
    readonly treasuryWithdrawal: number
  }
  readonly committeeMinSize: number
  readonly committeeMaxTermLength: number
  readonly govActionLifetime: number
  readonly govActionDeposit: number
  readonly dRepDeposit: number
  readonly dRepActivity: number
  readonly minFeeRefScriptCostPerByte: number
  readonly plutusV3CostModel: ReadonlyArray<number>
  readonly constitution: {
    readonly anchor: {
      readonly url: string
      readonly dataHash: string
    }
  }
  readonly committee: {
    readonly members: Record<string, unknown>
    readonly threshold: number
  }
}
```

## KesKey (type alias)

**Signature**

```ts
export type KesKey = {
  readonly type: string
  readonly description: string
  readonly cborHex: string
}
```

## NodeConfig (type alias)

Type definitions for configuration objects to allow flexible values
while maintaining structure compatibility.

**Signature**

```ts
export type NodeConfig = {
  readonly Protocol: string
  readonly ByronGenesisFile: string
  readonly ShelleyGenesisFile: string
  readonly AlonzoGenesisFile: string
  readonly ConwayGenesisFile: string
  readonly ApplicationName: string
  readonly ApplicationVersion: number
  readonly MaxKnownMajorProtocolVersion: number
  readonly "LastKnownBlockVersion-Alt": number
  readonly "LastKnownBlockVersion-Major": number
  readonly "LastKnownBlockVersion-Minor": number
  readonly TestShelleyHardForkAtEpoch: number
  readonly TestAllegraHardForkAtEpoch: number
  readonly TestMaryHardForkAtEpoch: number
  readonly TestAlonzoHardForkAtEpoch: number
  readonly TestBabbageHardForkAtEpoch: number
  readonly TestConwayHardForkAtEpoch: number
  readonly RequiresNetworkMagic: string
  readonly minSeverity: string
  readonly defaultBackends: ReadonlyArray<string>
  readonly defaultScribes: ReadonlyArray<ReadonlyArray<string>>
  readonly setupBackends: ReadonlyArray<string>
  readonly setupScribes: ReadonlyArray<{
    readonly scFormat: string
    readonly scKind: string
    readonly scName: string
    readonly scRotation: null
  }>
  readonly TurnOnLogMetrics: boolean
  readonly TurnOnLogging: boolean
  readonly TracingVerbosity: string
  readonly TraceBlockFetchClient: boolean
  readonly TraceBlockFetchDecisions: boolean
  readonly TraceBlockFetchProtocol: boolean
  readonly TraceBlockFetchProtocolSerialised: boolean
  readonly TraceBlockFetchServer: boolean
  readonly TraceChainDb: boolean
  readonly TraceChainSyncBlockServer: boolean
  readonly TraceChainSyncClient: boolean
  readonly TraceChainSyncHeaderServer: boolean
  readonly TraceChainSyncProtocol: boolean
  readonly TraceDNSResolver: boolean
  readonly TraceDNSSubscription: boolean
  readonly TraceErrorPolicy: boolean
  readonly TraceForge: boolean
  readonly TraceHandshake: boolean
  readonly TraceIpSubscription: boolean
  readonly TraceLocalChainSyncProtocol: boolean
  readonly TraceLocalErrorPolicy: boolean
  readonly TraceLocalHandshake: boolean
  readonly TraceLocalTxSubmissionProtocol: boolean
  readonly TraceLocalTxSubmissionServer: boolean
  readonly TraceMempool: boolean
  readonly TraceMux: boolean
  readonly TraceOptions: Record<string, unknown>
  readonly TraceTxInbound: boolean
  readonly TraceTxOutbound: boolean
  readonly TraceTxSubmissionProtocol: boolean
  readonly hasEKG: number
  readonly hasPrometheus: ReadonlyArray<string | number>
  readonly options: {
    readonly mapBackends: Record<string, ReadonlyArray<string>>
    readonly mapSubtrace: Record<string, { readonly subtrace: string }>
  }
  readonly ExperimentalHardForksEnabled: boolean
  readonly ExperimentalProtocolsEnabled: boolean
}
```

## OpCert (type alias)

**Signature**

```ts
export type OpCert = {
  readonly type: string
  readonly description: string
  readonly cborHex: string
}
```

## ShelleyGenesis (type alias)

**Signature**

```ts
export type ShelleyGenesis = {
  readonly epochLength: number
  readonly activeSlotsCoeff: number
  readonly slotLength: number
  readonly securityParam: number
  readonly genDelegs: Record<string, unknown>
  readonly initialFunds: Record<string, number>
  readonly maxKESEvolutions: number
  readonly maxLovelaceSupply: number
  readonly networkId: string
  readonly networkMagic: number
  readonly protocolParams: {
    readonly a0: number
    readonly decentralisationParam: number
    readonly eMax: number
    readonly extraEntropy: {
      readonly tag: string
    }
    readonly keyDeposit: number
    readonly maxBlockBodySize: number
    readonly maxBlockHeaderSize: number
    readonly maxTxSize: number
    readonly minFeeA: number
    readonly minFeeB: number
    readonly minPoolCost: number
    readonly minUTxOValue: number
    readonly nOpt: number
    readonly poolDeposit: number
    readonly protocolVersion: {
      readonly major: number
      readonly minor: number
    }
    readonly rho: number
    readonly tau: number
  }
  readonly slotsPerKESPeriod: number
  readonly staking: {
    readonly pools: Record<
      string,
      {
        readonly cost: number
        readonly margin: number
        readonly metadata: null
        readonly owners: ReadonlyArray<unknown>
        readonly pledge: number
        readonly publicKey: string
        readonly relays: ReadonlyArray<unknown>
        readonly rewardAccount: {
          readonly credential: {
            readonly "key hash": string
          }
          readonly network: string
        }
        readonly vrf: string
      }
    >
    readonly stake: Record<string, string>
  }
  readonly systemStart: string
  readonly updateQuorum: number
}
```

## VrfSkey (type alias)

**Signature**

```ts
export type VrfSkey = {
  readonly type: string
  readonly description: string
  readonly cborHex: string
}
```
