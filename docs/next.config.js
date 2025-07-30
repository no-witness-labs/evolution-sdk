const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
})

module.exports = withNextra({
  reactStrictMode: true,
  trailingSlash: true,
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true
  },
  basePath: "/evolution-sdk",
})
