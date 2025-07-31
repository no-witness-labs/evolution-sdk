#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DOCS_DIR = join(__dirname, '..')
const CODEBLOCKS_DIR = join(DOCS_DIR, 'codeblocks')

/**
 * Derive the target documentation file path from codeblock filename
 * Examples:
 * - pages.index.quickstart.ts -> pages/index.mdx
 * - pages.reference.modules.Address.ts -> pages/reference/modules/Address.mdx
 * - pages.getting-started.installation.ts -> pages/getting-started/installation.mdx
 * - pages.api.playground.example.ts -> pages/api/playground/example.mdx
 */
function getTargetFileFromCodeblock(codeblockFilename) {
  const nameWithoutExt = codeblockFilename.replace('.ts', '')
  const parts = nameWithoutExt.split('.')
  
  if (parts.length < 2) {
    throw new Error(`Invalid codeblock filename format: ${codeblockFilename}. Expected format: pages.section.subsection.title.ts`)
  }
  
  // First part should always be 'pages'
  if (parts[0] !== 'pages') {
    throw new Error(`Codeblock filename must start with 'pages.': ${codeblockFilename}`)
  }
  
  // Remove 'pages' prefix and build path
  const pathParts = parts.slice(1)
  
  // Special case: if it's pages.index.something, target pages/index.mdx
  if (pathParts[0] === 'index') {
    return 'pages/index.mdx'
  }
  
  // Last part is the title/filename, everything else is directory structure
  const directories = pathParts.slice(0, -1)
  const filename = pathParts[pathParts.length - 1]
  
  // Build the path: pages/dir1/dir2/filename.mdx
  let targetPath = 'pages'
  if (directories.length > 0) {
    targetPath += '/' + directories.join('/')
  }
  targetPath += `/${filename}.mdx`
  
  return targetPath
}

/**
 * Extract the main function name from codeblock file
 */
function extractMainFunctionName(codeblockPath) {
  const content = readFileSync(codeblockPath, 'utf-8')
  
  // Look for exported functions
  const exportMatch = content.match(/export\s*{\s*([^}]+)\s*}/)
  if (exportMatch) {
    const exports = exportMatch[1].split(',').map(e => e.trim())
    // Return the first exported function
    return exports[0]
  }
  
  // Fallback: look for any function declaration
  const functionMatch = content.match(/function\s+(\w+)/)
  if (functionMatch) {
    return functionMatch[1]
  }
  
  return 'example'
}

/**
 * Generate section title from codeblock filename
 */
function getSectionTitle(codeblockFilename) {
  const nameWithoutExt = codeblockFilename.replace('.ts', '')
  const parts = nameWithoutExt.split('.')
  
  if (parts.length >= 2) {
    // Use the last part (filename) as the section title
    const title = parts[parts.length - 1]
    // Convert camelCase to Title Case
    return title.charAt(0).toUpperCase() + title.slice(1).replace(/([A-Z])/g, ' $1').trim() + ' Example'
  }
  
  return 'Usage Examples'
}

/**
 * Run a codeblock and return whether it passed
 */
function runCodeblock(codeblockPath) {
  try {
    console.log(`🧪 Testing ${codeblockPath}...`)
    execSync(`npx tsx ${codeblockPath}`, { 
      cwd: join(__dirname, '../..'), // Root of monorepo
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    })
    console.log(`✅ ${codeblockPath} passed`)
    return true
  } catch (error) {
    console.error(`❌ ${codeblockPath} failed:`)
    console.error(error.stdout?.toString() || error.message)
    return false
  }
}

/**
 * Extract the TypeScript code from a codeblock file
 */
function extractCodeFromCodeblock(codeblockPath) {
  const content = readFileSync(codeblockPath, 'utf-8')
  
  // Remove the comment header and imports, keep only the implementation
  const lines = content.split('\n')
  const importEndIndex = lines.findIndex(line => line.trim() === '' && lines[lines.indexOf(line) - 1].startsWith('import'))
  
  if (importEndIndex === -1) {
    // Fallback: find the first function
    const functionStartIndex = lines.findIndex(line => line.includes('function '))
    if (functionStartIndex === -1) return content
    
    // Get everything from the first function to the export
    const exportIndex = lines.findIndex(line => line.startsWith('export '))
    return lines.slice(functionStartIndex, exportIndex).join('\n').trim()
  }
  
  // Get everything after imports, before exports
  const exportIndex = lines.findIndex(line => line.startsWith('export '))
  return lines.slice(importEndIndex + 1, exportIndex).join('\n').trim()
}

/**
 * Get the imports from a codeblock file
 */
function extractImportsFromCodeblock(codeblockPath) {
  const content = readFileSync(codeblockPath, 'utf-8')
  const lines = content.split('\n')
  
  const imports = lines
    .filter(line => line.startsWith('import '))
    .filter(line => !line.includes('import assert')) // Remove assert import for docs
    .join('\n')
  
  return imports
}

/**
 * Clean and rebuild a documentation file with fresh content
 */
function cleanAndUpdateDocumentationFile(codeblockFilename, codeblockPath) {
  const targetFile = getTargetFileFromCodeblock(codeblockFilename)
  const sectionTitle = getSectionTitle(codeblockFilename)
  const functionName = extractMainFunctionName(codeblockPath)
  const targetPath = join(DOCS_DIR, targetFile)
  
  try {
    // Extract imports and code from codeblock
    const imports = extractImportsFromCodeblock(codeblockPath)
    const codeExample = extractCodeFromCodeblock(codeblockPath)
    
    // Determine the module name from the filename for the title
    const nameWithoutExt = codeblockFilename.replace('.ts', '')
    const parts = nameWithoutExt.split('.')
    const moduleName = parts[parts.length - 1]
    const moduleTitle = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    
    // Create clean MDX content
    const mdxContent = `# ${moduleTitle}

${moduleTitle} module provides functionality for working with ${moduleName.toLowerCase()} types in Cardano.

## ${sectionTitle}

\`\`\`typescript
${imports}

${codeExample}

\`\`\`

## API Reference

For detailed API documentation, see the generated TypeDoc documentation.
`
    
    writeFileSync(targetPath, mdxContent)
    console.log(`🧹 Cleaned and updated ${targetFile}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to clean and update ${targetFile}:`, error.message)
    return false
  }
}

/**
 * Insert or update a code example in a documentation file (legacy function)
 */
function updateDocumentationFile(codeblockFilename, codeblockPath) {
  // For now, just call the clean function - we can keep both approaches if needed
  return cleanAndUpdateDocumentationFile(codeblockFilename, codeblockPath)
}

/**
 * Main function to validate codeblocks and update documentation
 */
async function main() {
  console.log('🚀 Starting codeblock validation and documentation update...\n')
  
  // Discover all codeblock files
  const codeblockFiles = readdirSync(CODEBLOCKS_DIR)
    .filter(file => file.endsWith('.ts') && file.startsWith('pages.'))
    .sort()
  
  if (codeblockFiles.length === 0) {
    console.log('❌ No codeblock files found in', CODEBLOCKS_DIR)
    console.log('Expected files matching pattern: pages.section.subsection.title.ts')
    process.exit(1)
  }
  
  console.log(`📁 Found ${codeblockFiles.length} codeblock files:`)
  codeblockFiles.forEach(file => {
    try {
      const targetFile = getTargetFileFromCodeblock(file)
      console.log(`   ${file} → ${targetFile}`)
    } catch (error) {
      console.log(`   ${file} → ❌ ${error.message}`)
    }
  })
  console.log()
  
  const results = []
  let allPassed = true
  
  // Test all codeblocks first
  for (const codeblockFile of codeblockFiles) {
    const codeblockPath = join(CODEBLOCKS_DIR, codeblockFile)
    
    try {
      getTargetFileFromCodeblock(codeblockFile) // Validate filename format
      const passed = runCodeblock(codeblockPath)
      
      results.push({
        codeblockFile,
        codeblockPath,
        passed
      })
      
      if (!passed) {
        allPassed = false
      }
    } catch (error) {
      console.error(`❌ Invalid filename format: ${codeblockFile} - ${error.message}`)
      allPassed = false
      results.push({
        codeblockFile,
        codeblockPath,
        passed: false
      })
    }
  }
  
  console.log('\n📊 Validation Results:')
  console.log('=' .repeat(50))
  
  results.forEach(({ codeblockFile, passed }) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${codeblockFile}`)
  })
  
  if (!allPassed) {
    console.log('\n❌ Some codeblocks failed validation. Documentation will not be updated.')
    console.log('Please fix the failing codeblocks and run this script again.')
    process.exit(1)
  }
  
  console.log('\n✅ All codeblocks passed validation!')
  console.log('\n🧹 Cleaning and updating documentation files...')
  console.log('Note: This will completely rebuild the MDX files with fresh content.')
  
  // Group codeblocks by their target directories for cleanup
  const directoriesByCodeblock = new Map()
  const cleanedDirectories = new Set()
  
  for (const { codeblockFile, codeblockPath, passed } of results) {
    if (passed) {
      const targetFile = getTargetFileFromCodeblock(codeblockFile)
      const targetDir = dirname(join(DOCS_DIR, targetFile))
      directoriesByCodeblock.set(codeblockFile, { codeblockPath, targetDir, targetFile })
    }
  }
  
  // Clean directories only once before processing their files
  let updateCount = 0
  for (const [codeblockFile, { codeblockPath, targetDir, targetFile }] of directoriesByCodeblock) {
    // Clean the directory only once
    if (!cleanedDirectories.has(targetDir)) {
      try {
        // Delete all existing MDX files in this directory
        const existingFiles = readdirSync(targetDir).filter(file => file.endsWith('.mdx'))
        for (const file of existingFiles) {
          const filePath = join(targetDir, file)
          const relativeFilePath = relative(DOCS_DIR, filePath)
          console.log(`🗑️ Deleting ${relativeFilePath}`)
          unlinkSync(filePath)
        }
        cleanedDirectories.add(targetDir)
        console.log(`🧹 Cleaned directory ${relative(DOCS_DIR, targetDir)} (removed ${existingFiles.length} files)`)
      } catch (error) {
        // Directory might not exist, that's fine
        console.log(`📁 Directory ${relative(DOCS_DIR, targetDir)} doesn't exist, will be created`)
      }
    }
    
    // Now update the specific file
    const updated = updateDocumentationFile(codeblockFile, codeblockPath)
    if (updated) {
      updateCount++
    }
  }
  
  console.log(`\n🎉 Successfully cleaned and updated ${updateCount} documentation files!`)
  console.log('\nNext steps:')
  console.log('- Review the cleaned documentation files')
  console.log('- Commit the changes to your repository')
  console.log('- The MDX files now contain fresh, up-to-date content with working code examples')
}

// Run the script
main().catch(console.error)
