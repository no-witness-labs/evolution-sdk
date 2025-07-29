#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const sourceDir = path.resolve(process.cwd(), '../packages/evolution/docs');
const targetDir = path.resolve(process.cwd(), './pages/reference/modules');

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function convertMdToMdx(content) {
  // Convert HTML class attributes to className for React/MDX compatibility
  content = content.replace(/class="/g, 'className="');
  
  // Fix MDX parsing issues by putting problematic content in proper code blocks
  // This handles CDDL specifications and other patterns that confuse MDX
  
  // First, protect existing code blocks and inline code from modification
  const codeBlocks = [];
  const inlineCode = [];
  
  // Extract and protect code blocks (```)
  content = content.replace(/```[\s\S]*?```/g, (match, index) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });
  
  // Extract and protect inline code (`)
  content = content.replace(/`[^`\n]+`/g, (match, index) => {
    inlineCode.push(match);
    return `__INLINE_CODE_${inlineCode.length - 1}__`;
  });
  
  // Now fix problematic patterns outside of code blocks
  
  // Handle CDDL lines that start with known patterns and put them in code blocks
  content = content.replace(/^(CDDL:.*)$/gm, '```\n$1\n```');
  
  // Handle angle bracket patterns that MDX interprets as HTML tags
  content = content.replace(/(<[a-z_][a-z0-9_]*>)/gi, '`$1`');
  
  // Handle curly brace patterns
  content = content.replace(/(\{[^}]*=>[^}]*\})/g, '`$1`');
  content = content.replace(/(\{[^}]*_[^}]*\})/g, '`$1`');
  
  // Handle square bracket patterns with underscores
  content = content.replace(/(\[\s*\*[^]]*\])/g, '`$1`');
  content = content.replace(/(\[\s*_[^]]*\])/g, '`$1`');
  
  // Handle arrow functions and other patterns
  content = content.replace(/(\w+\s*=>\s*\w+)(?![^`]*`)/g, '`$1`');
  
  // Restore inline code
  inlineCode.forEach((code, index) => {
    content = content.replace(`__INLINE_CODE_${index}__`, code);
  });
  
  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    content = content.replace(`__CODE_BLOCK_${index}__`, block);
  });
  
  return content;
}

async function copyFile(src, dest) {
  try {
    const content = await fs.readFile(src, 'utf8');
    const convertedContent = convertMdToMdx(content);
    await fs.writeFile(dest, convertedContent);
    console.log(`Copied: ${path.relative(process.cwd(), src)} → ${path.relative(process.cwd(), dest)}`);
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}: ${error.message}`);
    throw error;
  }
}

async function copyDirectory(source, target) {
  await ensureDirectoryExists(target);
  
  const entries = await fs.readdir(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    let targetName = entry.name;
    
    // For .md files, convert to .mdx and remove .ts for cleaner navigation
    if (entry.name.endsWith('.md')) {
      if (entry.name.endsWith('.ts.md')) {
        // Convert Address.ts.md to Address.mdx (remove .ts)
        targetName = entry.name.replace(/\.ts\.md$/, '.mdx');
      } else {
        targetName = entry.name.replace(/\.md$/, '.mdx');
      }
    }
    
    const targetPath = path.join(target, targetName);
    
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function createMetaJson(directory) {
  try {
    const entries = await fs.readdir(directory);
    const metaEntries = {};
    
    // Filter only the .mdx files (converted from .md)
    const mdxFiles = entries.filter(entry => 
      entry.endsWith('.mdx') && entry !== 'index.mdx'
    );
    
    // Sort alphabetically
    mdxFiles.sort();
    
    // Create meta entries for each file using simple string format like working examples
    for (const file of mdxFiles) {
      const routeName = file.replace(/\.mdx$/, '');
      // Since we removed .ts from filename, add it back to the title for clarity
      const title = `${routeName}.ts`;
      metaEntries[routeName] = title;
    }
    
    // Special handling for index if it exists
    if (entries.includes('index.mdx')) {
      metaEntries['index'] = 'Overview';
      // Move index to the front
      const temp = { index: metaEntries['index'] };
      delete metaEntries['index'];
      Object.assign(temp, metaEntries);
      Object.assign(metaEntries, temp);
    }
    
    await fs.writeFile(
      path.join(directory, '_meta.json'),
      JSON.stringify(metaEntries, null, 2)
    );
    
    console.log(`Created _meta.json in ${path.relative(process.cwd(), directory)}`);
  } catch (error) {
    console.error(`Error creating _meta.json in ${directory}: ${error.message}`);
  }
}

async function run() {
  try {
    console.log('Starting copy of evolution documentation...');
    
    // Remove the target directory if it exists
    try {
      console.log(`Removing existing directory: ${targetDir}`);
      await fs.rm(targetDir, { recursive: true, force: true });
    } catch (error) {
      console.log(`No existing directory to remove: ${error.message}`);
    }
    
    // Ensure the target directory exists
    await ensureDirectoryExists(targetDir);
    
    // Copy the config file directly
    const configPath = path.join(sourceDir, '_config.yml');
    try {
      await copyFile(configPath, path.join(targetDir, '_config.yml'));
    } catch (error) {
      console.log(`Config file not found, skipping: ${error.message}`);
    }
    
    // Copy the index file directly
    const indexPath = path.join(sourceDir, 'index.md');
    try {
      await copyFile(indexPath, path.join(targetDir, 'index.mdx'));
    } catch (error) {
      console.log(`Index file not found, skipping: ${error.message}`);
    }
    
    // Copy the contents of the modules directory directly to target (avoiding double nesting)
    const modulesSourceDir = path.join(sourceDir, 'modules');
    
    // Copy modules directly to target directory instead of creating subdirectory
    await copyDirectory(modulesSourceDir, targetDir);
    
    // Create _meta.json for the modules directory
    await createMetaJson(targetDir);
    
    console.log('Documentation copy completed successfully!');
  } catch (error) {
    console.error(`Error copying documentation: ${error.message}`);
    process.exit(1);
  }
}

run();
