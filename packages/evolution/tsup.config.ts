import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true, // Enable DTS generation
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  outDir: "dist",
  target: "es2022",
  tsconfig: "./tsconfig.build.json",
  external: ["dockerode", "@effect/platform-node", "@anastasia-labs/cardano-multiplatform-lib-nodejs"],
  esbuildOptions: (options) => {
    options.conditions = ["import"]
  }
})
