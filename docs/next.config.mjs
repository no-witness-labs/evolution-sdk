import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const isCI = !!process.env.GITHUB_ACTIONS
const isProd = process.env.NODE_ENV === 'production'

export default withNextra({
  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  images: { unoptimized: true },
  basePath: isCI && isProd ? '/evolution-sdk' : '',
})
