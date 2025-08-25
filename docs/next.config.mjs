import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

const isCI = !!process.env.GITHUB_ACTIONS
/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // required for GitHub Pages static export
  output: 'export',
  distDir: 'out',
  // when running in CI for GitHub Pages, set basePath/assetPrefix
  basePath: isCI ? '/evolution-sdk' : '',
  assetPrefix: isCI ? '/evolution-sdk' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default withMDX(config)
