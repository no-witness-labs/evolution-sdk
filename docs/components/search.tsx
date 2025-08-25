"use client"
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps
} from "fumadocs-ui/components/dialog/search"
import { useDocsSearch } from "fumadocs-core/search/client"
import { create } from "@orama/orama"
import { useI18n } from "fumadocs-ui/contexts/i18n"

function initOrama() {
  return create({
    schema: { _: "string" },
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: "english"
  })
}

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n() // (optional) for i18n
  // Determine API base path at build/runtime. When deployed to GitHub Pages
  // the site lives under a subpath (e.g. /evolution-sdk). Set
  // NEXT_PUBLIC_BASE_PATH=/evolution-sdk in CI so the client requests the
  // correct static search JSON. Falls back to empty string for local dev.
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const normalizedBase = basePath.endsWith('/') && basePath.length > 1 ? basePath.slice(0, -1) : basePath
  const apiFrom = `${normalizedBase}/api/search`

  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    initOrama,
    locale,
    from: apiFrom,
  })

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  )
}
