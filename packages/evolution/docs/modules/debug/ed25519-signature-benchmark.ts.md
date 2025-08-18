---
title: debug/ed25519-signature-benchmark.ts
nav_order: 41
parent: Modules
---

## ed25519-signature-benchmark overview

Benchmark Ed25519Signature (bytes-first implementation) vs CML Ed25519Signature.

Scenarios (cold = construct each sample, warm = reuse decoded):

- ours: fromHex (cold), fromBytes (cold), toHex (warm), toBytes (warm), equals (warm)
- cml : fromHex (cold), fromBytes (cold), toHex (warm), toBytes (warm), equals (warm)

NOTE: This benchmark avoids Schema/Effect wrappers to isolate raw representation costs.

---

<h2 class="text-delta">Table of contents</h2>

---
