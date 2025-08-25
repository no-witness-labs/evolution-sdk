import "@/app/global.css"
// import { RootProvider } from "fumadocs-ui/provider"
import { Provider } from "./provider"

import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"]
})

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
