const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
})

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

module.exports = withNextra({
  reactStrictMode: true,
  trailingSlash: true,
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true
  },
  basePath: isGitHubPages ? "/evolution-sdk" : "",
})
