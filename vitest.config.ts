import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 60000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    retry: 2,
    bail: 1,
    exclude: ["**/node_modules/**", "**/dist/**", "**/temp/**", "**/.{idea,git,cache,output,temp}/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.spec.ts", "examples/", "scripts/", "temp/"]
    }
  }
})
