import { expect, test } from "vitest"

import { walletFromSeed } from "../src/sdk/wallet/utils.js"

const seedPhrase =
  "zebra short room flavor rival capital fortune hip profit trust melody office depend adapt visa cycle february link tornado whisper physical kiwi film voyage"

test("WalletFromSeed - Defaults options", () => {
  const expectedFromSeed = {
    address: "addr1q98wl3hnya9l94rt58ky533deyqe9t8zz5n9su26k8e5g23yar4q0adtaax9q9g0kphpv2ws7vxqwu6ln6pqx7j29nfqsfy9mg",
    rewardAddress: "stake1uyjw36s87k477nzsz58mqmsk98g0xrq8wd0eaqsr0f9ze5s48wtl9",
    paymentKey:
      "ed25519e_sk1krszcw3ujfs3qnsjwl6wynw7dwudgnq69w9lrrtdf46yqnd25dgv4f5ttaqxr2v6n6azee489c7mryudvhu8n4x4tcvd5hvhtwswsuc4s4c2d",
    stakeKey:
      "ed25519e_sk19q4d6fguvncszk6f46fvvep5y5w3877y77t3n3dc446wgja25dg968hm8jxkc9d7p982uls6k8uq0srs69e44lay43hxmdx4nc3rttsn0h2f5"
  }
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      addressType: "Base",
      accountIndex: 0,
      network: "Mainnet"
    })
  )
  expect(expectedFromSeed).toStrictEqual(walletFromSeed(seedPhrase))
})

test("WalletFromSeed - accountIndex 1", () => {
  const expectedFromSeed = {
    address: "addr1q8833yrnksyq3v3u582g8pkzzdmg9yge7lftvu8lj6lakmp7e5x8vl3sqdtxra9z9p95k27kx2njgqux86d5mtfc2t8sa7jy78",
    rewardAddress: "stake1uylv6rrk0ccqx4np7j3zsj6t90tr9feyqwrrax6d45u99nce2rkhr",
    paymentKey:
      "ed25519e_sk1tzqvdwc8kr9zk4fmlwhexzpgcgx8t35zls2ckeswehpdsja25dg9j998sp9s2xy0aeyrdquhpljwfgghz9e78wqux8xj9t2p8z59ahc75nyyr",
    stakeKey:
      "ed25519e_sk1trauywg7p9x2hg3jgaw2adeyg5ujhax4jfd6exs6hpzakn925dggyvhgrh8kwc9h9n7nh75nwhge9gyxg7vavcwk7mq3r2t03664drcrdegzx"
  }
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      addressType: "Base",
      accountIndex: 1,
      network: "Mainnet"
    })
  )
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      accountIndex: 1
    })
  )
})

test("WalletFromSeed - Custom Network", () => {
  const expectedFromSeed = {
    address:
      "addr_test1qp8wl3hnya9l94rt58ky533deyqe9t8zz5n9su26k8e5g23yar4q0adtaax9q9g0kphpv2ws7vxqwu6ln6pqx7j29nfqnle9hh",
    rewardAddress: "stake_test1uqjw36s87k477nzsz58mqmsk98g0xrq8wd0eaqsr0f9ze5sjdyfmc",
    paymentKey:
      "ed25519e_sk1krszcw3ujfs3qnsjwl6wynw7dwudgnq69w9lrrtdf46yqnd25dgv4f5ttaqxr2v6n6azee489c7mryudvhu8n4x4tcvd5hvhtwswsuc4s4c2d",
    stakeKey:
      "ed25519e_sk19q4d6fguvncszk6f46fvvep5y5w3877y77t3n3dc446wgja25dg968hm8jxkc9d7p982uls6k8uq0srs69e44lay43hxmdx4nc3rttsn0h2f5"
  }
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      addressType: "Base",
      accountIndex: 0,
      network: "Custom"
    })
  )
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      network: "Custom"
    })
  )
})

test("WalletFromSeed - Address Enterprise", () => {
  const expectedFromSeed = {
    address: "addr1v98wl3hnya9l94rt58ky533deyqe9t8zz5n9su26k8e5g2srcn4hd",
    rewardAddress: undefined,
    paymentKey:
      "ed25519e_sk1krszcw3ujfs3qnsjwl6wynw7dwudgnq69w9lrrtdf46yqnd25dgv4f5ttaqxr2v6n6azee489c7mryudvhu8n4x4tcvd5hvhtwswsuc4s4c2d",
    stakeKey: undefined
  }
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      addressType: "Enterprise",
      accountIndex: 0,
      network: "Mainnet"
    })
  )
  expect(expectedFromSeed).toStrictEqual(
    walletFromSeed(seedPhrase, {
      addressType: "Enterprise"
    })
  )
})
