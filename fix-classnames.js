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

  // Replace className="single-class" with className={styles['single-class']} or className={styles.singleClass}
  content = content.replace(/className="([a-zA-Z0-9_-]+)"/g, (match, cls) => {
    if (cls.includes('-')) return `className={styles['${cls}']}`;
    return `className={styles.${cls}}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});

console.log('Done!');