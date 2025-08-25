---
title: utils/Hash.ts
nav_order: 118
parent: Modules
---

## Hash overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [computeTotalExUnits](#computetotalexunits)
  - [hashAuxiliaryData](#hashauxiliarydata)
  - [hashPlutusData](#hashplutusdata)
  - [hashScriptData](#hashscriptdata)
  - [hashTransaction](#hashtransaction)

---

# utils

## computeTotalExUnits

Compute total ex_units by summing over redeemers.

**Signature**

```ts
export declare const computeTotalExUnits: (redeemers: ReadonlyArray<Redeemer.Redeemer>) => Redeemer.ExUnits
```

## hashAuxiliaryData

Compute hash of auxiliary data (tag 259) per ledger rules.

**Signature**

```ts
export declare const hashAuxiliaryData: (aux: AuxiliaryData.AuxiliaryData) => AuxiliaryDataHash.AuxiliaryDataHash
```

## hashPlutusData

Compute hash of plutus data using default Data encoding.

**Signature**

```ts
export declare const hashPlutusData: (pd: Data.Data) => DatumOption.DatumHash
```

## hashScriptData

script_data per CDDL (Conway)

```
; This is a hash of data which may affect evaluation of a script.
; This data consists of:
;   - The redeemers from the transaction_witness_set (the value of field 5).
;   - The datums from the transaction_witness_set (the value of field 4).
;   - The value in the cost_models map corresponding to the script's language
;     (in field 18 of protocol_param_update.)
; (In the future it may contain additional protocol parameters.)
;
; Since this data does not exist in contiguous form inside a transaction, it needs
; to be independently constructed by each recipient.
;
; The bytestring which is hashed is the concatenation of three things:
;   redeemers || datums || language views
; The redeemers are exactly the data present in the transaction witness set.
; Similarly for the datums, if present. If no datums are provided, the middle
; field is omitted (i.e. it is the empty/null bytestring).
;
; language views CDDL:
; { * language => script_integrity_data }
;
; This must be encoded canonically, using the same scheme as in
; RFC7049 section 3.9:
;  - Maps, strings, and bytestrings must use a definite-length encoding
;  - Integers must be as small as possible.
;  - The expressions for map length, string length, and bytestring length
;    must be as short as possible.
;  - The keys in the map must be sorted as follows:
;     -  If two keys have different lengths, the shorter one sorts earlier.
;     -  If two keys have the same length, the one with the lower value
;        in (byte-wise) lexical order sorts earlier.
;
; For PlutusV1 (language id 0), the language view is the following:
;   - the value of cost_models map at key 0 (in other words, the script_integrity_data)
;     is encoded as an indefinite length list and the result is encoded as a bytestring.
;     (our apologies)
;     For example, the script_integrity_data corresponding to the all zero costmodel for V1
;     would be encoded as (in hex):
;     58a89f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff
;   - the language ID tag is also encoded twice. first as a uint then as
;     a bytestring. (our apologies)
;     Concretely, this means that the language version for V1 is encoded as
;     4100 in hex.
; For PlutusV2 (language id 1), the language view is the following:
;   - the value of cost_models map at key 1 is encoded as an definite length list.
;     For example, the script_integrity_data corresponding to the all zero costmodel for V2
;     would be encoded as (in hex):
;     98af0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
;   - the language ID tag is encoded as expected.
;     Concretely, this means that the language version for V2 is encoded as
;     01 in hex.
; For PlutusV3 (language id 2), the language view is the following:
;   - the value of cost_models map at key 2 is encoded as a definite length list.
;
; Note that each Plutus language represented inside a transaction must have
; a cost model in the cost_models protocol parameter in order to execute,
; regardless of what the script integrity data is.
;
; Finally, note that in the case that a transaction includes datums but does not
; include the redeemers field, the script data format becomes (in hex):
; [ A0 | datums | A0 ]
; corresponding to a CBOR empty map and an empty map for language view.
; This empty redeeemer case has changed from the previous eras, since default
; representation for redeemers has been changed to a map. Also whenever redeemers are
; supplied either as a map or as an array they must contain at least one element,
; therefore there is no way to override this behavior by providing a custom
; representation for empty redeemers.
script_data_hash = hash32
```

**Signature**

```ts
export declare const hashScriptData: (
  redeemers: ReadonlyArray<Redeemer.Redeemer>,
  costModels: CostModel.CostModels,
  datums?: ReadonlyArray<Data.Data>
) => ScriptDataHash.ScriptDataHash
```

## hashTransaction

Compute the transaction body hash (blake2b-256 over CBOR of body).

**Signature**

```ts
export declare const hashTransaction: (body: TransactionBody.TransactionBody) => TransactionHash.TransactionHash
```
