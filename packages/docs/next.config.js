const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
})

module.exports = withNextra({
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === "production" ? "/evolution-sdk" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/evolution-sdk/" : ""
})
