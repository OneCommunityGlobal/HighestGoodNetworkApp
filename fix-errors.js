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

  // Fix any remaining .css imports (relative paths like ../ or ../../)
  content = content.replace(/import\s+['"]([^'"]+)\.css['"]/g, (match, p1) => {
    return `import '${p1}.module.css'`;
  });

  // Fix duplicate styles imports - rename them to styles2, styles3 etc
  let styleCount = 0;
  content = content.replace(/import styles from /g, () => {
    styleCount++;
    if (styleCount === 1) return 'import styles from ';
    return `import styles${styleCount} from `;
  });

  // Also fix .module.module.css (double extension bug)
  content = content.replace(/\.module\.module\.css/g, '.module.css');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
  }
});

console.log('Done!');
