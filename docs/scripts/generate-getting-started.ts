#!/usr/bin/env tsx

// Snippet injector: replaces placeholders in MDX with code regions from TS files.
// Usage: tsx scripts/generate-getting-started.ts (run from docs package)
// Placeholders in MDX:
//   <!-- BEGIN:snippet file=address.ts region=address-example lang=ts stripImports=node:assert -->
//   ... auto-filled ...
//   <!-- END:snippet -->
// Regions in TS examples use VS Code style region markers:
//   // #region address-example
//   // code
//   // #endregion address-example

import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// docs/ directory
const DOCS_ROOT = path.resolve(__dirname, "..")
const EXAMPLES_DIR = path.resolve(DOCS_ROOT, "examples")
const PAGES_DIR = path.resolve(DOCS_ROOT, "pages/getting-started")

interface SnippetAttributes {
  file?: string
  region?: string
  lang?: string
  stripImports?: string
}

/** Parse attributes from a BEGIN:snippet comment token (supports HTML and MDX comments) */
function parseAttrs(token: string): SnippetAttributes {
  const attrs: SnippetAttributes = {}
  let raw: string | null = null
  if (token.includes("<!--")) {
    const m = token.match(/BEGIN:snippet\s+(.+?)(?:-->|$)/)
    raw = m?.[1] ?? null
  } else if (token.includes("{/*")) {
    const m = token.match(/BEGIN:snippet\s+(.+?)(?:\*\/\}|$)/)
    raw = m?.[1] ?? null
  }
  if (!raw) return attrs
  const parts = raw.match(/(\w+)=([^\s]+)/g) || []
  for (const part of parts) {
    const [k, v] = part.split("=")
    attrs[k as keyof SnippetAttributes] = v.replace(/^"|^'|"$|'$/g, "")
  }
  return attrs
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Extract a region from a TS file using // #region <name> markers */
async function extractRegion(filePath: string, region: string): Promise<string> {
  const content = await fs.readFile(filePath, "utf8")
  const escaped = escapeRegex(region)
  const startRe = new RegExp(`^\\s*\/\/\\s*#region\\s+${escaped}.*$`, "m")
  const startMatch = startRe.exec(content)
  if (!startMatch) throw new Error(`Region '${region}' not found in ${filePath}`)
  const afterStartLineIdx = content.indexOf("\n", startMatch.index)
  const codeStart = afterStartLineIdx === -1 ? content.length : afterStartLineIdx + 1

  const endRe = new RegExp(`^\\s*\/\/\\s*#endregion\\s+${escaped}.*$`, "m")
  const endSlice = content.slice(codeStart)
  const endMatch = endRe.exec(endSlice)
  if (!endMatch) throw new Error(`End of region '${region}' not found in ${filePath}`)
  const codeEnd = codeStart + endMatch.index
  return content.slice(codeStart, codeEnd)
}

/** Optionally strip import lines that include any of the tokens (comma-separated) */
function stripImportLines(code: string, tokensCsv?: string): string {
  if (!tokensCsv) return code
  const tokens = tokensCsv
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
  const lines = code.split("\n")
  const filtered = lines.filter((ln: string) => {
    if (!ln.trim().startsWith("import")) return true
    return !tokens.some((t: string) => ln.includes(t))
  })
  return filtered.join("\n")
}

interface MatchInfo {
  type: "html" | "mdx"
  endRe: RegExp
  index: number
  token: string
}

/** Replace all snippet blocks in an MDX file */
async function processMdxFile(mdxPath: string): Promise<boolean> {
  let mdx = await fs.readFile(mdxPath, "utf8")
  // Support both HTML comments and MDX comments for snippet markers
  const beginPatterns = [
    { type: "html" as const, re: /<!--\s*BEGIN:snippet[^>]*-->/g, endRe: /<!--\s*END:snippet\s*-->/ },
    { type: "mdx" as const, re: /\{\/\*\s*BEGIN:snippet[^*}]*\*\/\}/g, endRe: /\{\/\*\s*END:snippet\s*\*\/\}/ }
  ]
  const matches: MatchInfo[] = []
  for (const p of beginPatterns) {
    for (const m of mdx.matchAll(p.re)) {
      matches.push({ type: p.type, endRe: p.endRe, index: m.index ?? 0, token: m[0] })
    }
  }
  if (matches.length === 0) return false
  // Process in source order
  matches.sort((a, b) => a.index - b.index)

  let offset = 0
  for (const m of matches) {
    const beginIdx = m.index + offset
    // Find end marker after this begin
    const afterBegin = mdx.slice(beginIdx)
    const endMatch = afterBegin.match(m.endRe)
    if (!endMatch) throw new Error(`Missing END:snippet in ${mdxPath}`)
    const endIdx = beginIdx + (endMatch.index ?? 0) + endMatch[0].length

    // Extract attributes
    const beginToken = m.token
    const attrs = parseAttrs(beginToken)
    if (!attrs.file || !attrs.region) {
      throw new Error(`BEGIN:snippet missing file or region in ${mdxPath}: ${beginToken}`)
    }
    const lang = attrs.lang || "ts"
    const stripImports = attrs.stripImports

    const examplePath = path.resolve(EXAMPLES_DIR, attrs.file)
    const codeRaw = await extractRegion(examplePath, attrs.region)
    const code = stripImportLines(codeRaw.trimEnd(), stripImports)

    const fenced = `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`

    // Replace everything between begin and end with the begin + fenced + end
    const endToken = m.type === "mdx" ? "{/* END:snippet */}" : "<!-- END:snippet -->"
    const newBlock = `${beginToken}${fenced}${endToken}`
    mdx = mdx.slice(0, beginIdx) + newBlock + mdx.slice(endIdx)
    offset = offset + (newBlock.length - (endIdx - beginIdx))
  }

  await fs.writeFile(mdxPath, mdx)
  return true
}

async function main() {
  // 1) Replace inline snippet blocks in existing MDX files
  const pages = await fs.readdir(PAGES_DIR)
  const mdxFiles = pages.filter((f) => f.endsWith(".mdx"))
  let changed = 0
  for (const f of mdxFiles) {
    const p = path.join(PAGES_DIR, f)
    const did = await processMdxFile(p).catch((err) => {
      console.error(`Error processing ${f}:`, err.message)
      process.exitCode = 1
      return false
    })
    if (did) changed++
  }

  // 2) Auto-generate grouped example pages if folders exist under examples/
  const groups = await listGroups(EXAMPLES_DIR)
  for (const g of groups) {
    const created = await generateGroupPages(g).catch((err) => {
      console.error(`Error generating group '${g}':`, err.message)
      process.exitCode = 1
      return 0
    })
    if (created > 0) changed += created
  }

  console.log(`Snippet generation complete. Updated ${changed} file(s).`)
}

main()

// Utilities for group generation
async function listGroups(baseDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

function toTitleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m: string) => m.toUpperCase())
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function readText(p: string): Promise<string> {
  return fs.readFile(p, "utf8")
}

function extractDirective(content: string, name: string): string | null {
  // Looks for // @name: value or /* @name: value */ on first ~10 lines
  const lines = content.split(/\r?\n/).slice(0, 10)
  for (const line of lines) {
    const m1 = line.match(new RegExp(`^\\s*\\/\\/\\s*@${name}:\\s*(.+)$`))
    if (m1) return m1[1].trim()

    const m2 = line.match(new RegExp(`\\/\\*\\s*@${name}:\\s*([^*]+)\\*\\/`))
    if (m2) return m2[1].trim()
  }
  return null
}

async function getExampleCodeForFile(filePath: string): Promise<string> {
  const content = await readText(filePath)
  // Prefer a region named 'main' for clarity; else include entire file
  try {
    return await extractRegion(filePath, "main")
  } catch {
    return content.trimEnd()
  }
}

interface LinkInfo {
  title: string
  slug: string
}

async function generateGroupPages(groupName: string): Promise<number> {
  const groupDir = path.join(EXAMPLES_DIR, groupName)
  let files: string[]
  try {
    files = (await fs.readdir(groupDir)).filter((f: string) => f.endsWith(".ts") || f.endsWith(".tsx"))
  } catch {
    return 0
  }
  if (files.length === 0) return 0

  const outDir = path.join(PAGES_DIR, groupName)

  // Clean up existing directory to ensure fresh generation
  try {
    await fs.rm(outDir, { recursive: true, force: true })
    console.log(`  Cleaned existing directory: ${outDir}`)
  } catch {
    // Directory might not exist, that's fine
  }

  await fs.mkdir(outDir, { recursive: true })

  // Generate individual pages
  let created = 0
  const links: LinkInfo[] = []
  for (const f of files) {
    const abs = path.join(groupDir, f)
    const content = await readText(abs)
    const code = await getExampleCodeForFile(abs)
    const title = extractDirective(content, "title") || toTitleCase(f.replace(/\.(ts|tsx)$/i, ""))
    const desc = extractDirective(content, "description")
    const slug = toSlug(f.replace(/\.(ts|tsx)$/i, ""))

    const mdx = [`# ${title}`, "", ...(desc ? [desc, ""] : []), "```typescript", code, "```", ""].join("\n")

    const outFile = path.join(outDir, `${slug}.mdx`)
    let shouldWrite = true
    try {
      const existing = await fs.readFile(outFile, "utf8")
      if (existing === mdx) shouldWrite = false
    } catch {}
    if (shouldWrite) {
      await fs.writeFile(outFile, mdx)
      created++
    }
    links.push({ title, slug })
  }

  // Generate or refresh index.mdx with a simple list of links
  const indexTitle = `${toTitleCase(groupName)} Examples`
  const indexLines = [
    `# ${indexTitle}`,
    "",
    ...links.map(
      (l: LinkInfo) =>
        `- [${l.title}](/${path.relative(path.join(DOCS_ROOT, "pages"), path.join(outDir, l.slug)).replace(/\\/g, "/")})`
    ),
    ""
  ]
  const indexPath = path.join(outDir, "index.mdx")
  const indexContent = indexLines.join("\n")
  let wroteIndex = 0
  try {
    const existing = await fs.readFile(indexPath, "utf8")
    if (existing !== indexContent) {
      await fs.writeFile(indexPath, indexContent)
      wroteIndex = 1
    }
  } catch {
    await fs.writeFile(indexPath, indexContent)
    wroteIndex = 1
  }

  return created + wroteIndex
}
