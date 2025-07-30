const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
})

module.exports = withNextra({
  reactStrictMode: true,
  trailingSlash: true,
  basePath: "",
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true
  }
})
