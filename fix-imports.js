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

  content = content.replace(/import\s+['"]\.\/([^'"]+)\.css['"]/g, "import styles from './$1.module.css'");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});

console.log('Done!');