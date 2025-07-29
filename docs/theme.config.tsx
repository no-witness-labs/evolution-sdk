import React from "react"
import { DocsThemeConfig } from "nextra-theme-docs"

const config: DocsThemeConfig = {
  logo: <span>Evolution SDK</span>,
  project: {
    link: "https://github.com/no-witness-labs/evolution-sdk"
  },
  chat: {
    link: "https://discord.gg/your-discord" // Replace with actual Discord link
  },
  docsRepositoryBase: "https://github.com/no-witness-labs/evolution-sdk/tree/main/docs",
  footer: {
    text: "Evolution SDK Documentation"
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Evolution SDK"
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Evolution SDK" />
      <meta property="og:description" content="Cardano blockchain development toolkit" />
    </>
  )
}

export default config
