const fs = require('fs');
const path = require('path');

// Function to convert path mapping to relative path
function convertPathMapping(importPath, currentFile) {
  // Remove @/ prefix
  const cleanPath = importPath.replace('@/', '');
  
  // Get directory of current file
  const currentDir = path.dirname(currentFile);
  
  // Calculate relative path from current file to src directory
  const srcIndex = currentDir.indexOf('src');
  const relativeToSrc = currentDir.substring(srcIndex + 4); // +4 for 'src/'
  
  // Calculate how many levels up we need to go
  const levelsUp = relativeToSrc.split('/').filter(Boolean).length;
  const upPath = '../'.repeat(levelsUp);
  
  return upPath + cleanPath;
}

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace all @/ imports with relative imports
    const importRegex = /from\s+['"]@\/([^'"]+)['"]/g;
    content = content.replace(importRegex, (match, importPath) => {
      const relativePath = convertPathMapping(importPath, filePath);
      modified = true;
      return `from '${relativePath}'`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find all TypeScript files
function findTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'server', 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

for (const file of tsFiles) {
  processFile(file);
}

console.log('Import fixing completed!');
