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

  const hasStylesImport = content.includes('import styles from');
  const hasPlainClass = /className='([^']+)'/.test(content) || /className="([^"]+)"/.test(content);

  if (hasStylesImport && hasPlainClass) {
    console.log('MIXED: ' + file);
  }
});