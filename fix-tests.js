const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) results = results.concat(getAllFiles(full, exts));
    else if (exts.some(e => file.endsWith(e))) results.push(full);
  });
  return results;
}

const files = getAllFiles('src', ['.test.jsx', '.test.js']);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix querySelector('.class') -> querySelector('[class*="class"]')
  content = content.replace(
    /querySelector\('\.([a-zA-Z][a-zA-Z0-9_-]+)'\)/g,
    'querySelector(\'[class*="$1"]\')',
  );

  // Fix querySelectorAll('.class') -> querySelectorAll('[class*="class"]')
  content = content.replace(
    /querySelectorAll\('\.([a-zA-Z][a-zA-Z0-9_-]+)'\)/g,
    'querySelectorAll(\'[class*="$1"]\')',
  );

  // Fix toHaveClass('class') -> check using class*= pattern
  // Fix classList.contains('class') -> Array.from(classList).some(c => c.includes('class'))
  content = content.replace(
    /element\.classList\.contains\('([a-zA-Z][a-zA-Z0-9_-]+)'\)/g,
    "Array.from(element.classList).some(c => c.includes('$1'))",
  );

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
  }
});

console.log('Done!');
