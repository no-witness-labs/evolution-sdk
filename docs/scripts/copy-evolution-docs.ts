#!/usr/bin/env node

import * as fs from "fs/promises"
import * as path from "path"

const sourceDir = path.resolve(process.cwd(), "../packages/evolution/docs/modules")
const targetDir = path.resolve(process.cwd(), "./content/docs/modules")

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir)
  } catch (error) {
    await fs.mkdir(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
}

function convertMdToMdx(content: string) {
  // Convert HTML class attributes to className for React/MDX compatibility
  content = content.replace(/class="/g, 'className="')

  // Just copy the files and rename them - no complex processing
  return content
}

async function copyFile(src: string, dest: string) {
  try {
    const content = await fs.readFile(src, "utf8")
    const convertedContent = convertMdToMdx(content)
    await fs.writeFile(dest, convertedContent)
    console.log(`Copied: ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dest)}`)
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}: ${(error as Error).message}`)
    throw error
  }
}

async function copyDirectory(source: string, target: string) {
  await ensureDirectoryExists(target)

  const entries = await fs.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    let targetName = entry.name

    // For .md files, convert to .mdx and remove .ts for cleaner navigation
    if (entry.name.endsWith(".md")) {
      if (entry.name.endsWith(".ts.md")) {
        // Convert Address.ts.md to Address.mdx (remove .ts)
        targetName = entry.name.replace(/\.ts\.md$/, ".mdx")
      } else {
        targetName = entry.name.replace(/\.md$/, ".mdx")
      }
    }

    const targetPath = path.join(target, targetName)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
    } else {
      await copyFile(sourcePath, targetPath)
    }
  }
}

async function createMetaJson(directory: string) {
  try {
    const entries = await fs.readdir(directory)
    const metaEntries: Record<string, string> = {}

    // Filter only the .mdx files (converted from .md)
    const mdxFiles = entries.filter((entry) => entry.endsWith(".mdx") && entry !== "index.mdx")

    // Sort alphabetically
    mdxFiles.sort()

    // Create meta entries for each file using simple string format
    for (const file of mdxFiles) {
      const name = file.replace(".mdx", "")
      metaEntries[name] = name
    }

    await fs.writeFile(path.join(directory, "_meta.json"), JSON.stringify(metaEntries, null, 2))

    console.log(`Created _meta.json in ${path.relative(process.cwd(), directory)}`)
  } catch (error) {
    console.error(`Error creating _meta.json: ${(error as Error).message}`)
  }
}

async function main() {
  try {
    console.log("Starting copy of evolution documentation...")

    // Remove existing target directory
    try {
      await fs.rm(targetDir, { recursive: true, force: true })
      console.log(`Removing existing directory: ${targetDir}`)
    } catch (error) {
      // Directory might not exist, that's ok
    }

    // Copy source to target
    await copyDirectory(sourceDir, targetDir)

    // Create _meta.json for navigation
    await createMetaJson(targetDir)

    console.log("Documentation copy completed successfully!")
  } catch (error) {
    console.error("Error copying documentation:", (error as Error).message)
    process.exit(1)
  }
}

main()
