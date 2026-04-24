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

const files = getAllFiles('src', ['.jsx', '.js', '.tsx', '.ts']);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const hasStylesImport = content.includes('import styles from');
  const usesStyles = content.includes('styles[') || content.includes('styles.');

  if (!hasStylesImport && usesStyles) {
    // Revert styles['class'] back to "class"
    content = content.replace(/className=\{styles\['([^']+)'\]\}/g, 'className="$1"');
    content = content.replace(/className=\{styles\.([a-zA-Z0-9_]+)\}/g, 'className="$1"');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Reverted: ' + file);
  }
});

console.log('Done!');