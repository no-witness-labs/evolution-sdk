import nextra from 'nextra'

// Configure Nextra v2.13 with top-level options
const withNextra = nextra({
})

const isCI = !!process.env.GITHUB_ACTIONS
const isProd = process.env.NODE_ENV === 'production'

export default withNextra({
  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  images: { unoptimized: true },
  basePath: isCI && isProd ? '/evolution-sdk' : ''
})
