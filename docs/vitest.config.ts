import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000
  },
  resolve: {
    alias: {
      "@evolution-sdk/evolution": "../packages/evolution/src"
    }
  }
})
