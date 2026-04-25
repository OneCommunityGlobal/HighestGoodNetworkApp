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

const files = getAllFiles('src', ['.jsx', '.js']);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  const importMatch = content.match(/import styles from ['"](.+\.module\.css)['"]/);
  if (!importMatch) return;

  const cssPath = path.join(path.dirname(file), importMatch[1]);
  if (!fs.existsSync(cssPath)) return;

  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Extract all class names from CSS
  const classNames = [...cssContent.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]+)\s*[{,]/g)]
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);

  // Only replace plain className="x" if x exists in the CSS module
  classNames.forEach(cls => {
    const plain1 = new RegExp(`className="${cls}"`, 'g');
    const plain2 = new RegExp(`className='${cls}'`, 'g');
    const replacement = cls.includes('-')
      ? `className={styles['${cls}']}`
      : `className={styles.${cls}}`;
    content = content.replace(plain1, replacement);
    content = content.replace(plain2, replacement);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
  }
});

console.log('Done!');