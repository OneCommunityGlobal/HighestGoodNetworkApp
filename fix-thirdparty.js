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

// These are third-party packages - should NOT be module.css
const thirdParty = [
  'bootstrap/',
  'font-awesome/',
  'react-toastify/',
  'react-calendar/',
  'leaflet/',
  'react-phone-input-2/',
  'reactjs-popup/',
  'react-datepicker/',
];

const files = getAllFiles('src', ['.jsx', '.js', '.tsx', '.ts']);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  thirdParty.forEach(pkg => {
    // Revert .module.css back to .css for third-party imports
    const regex = new RegExp(`(import\\s+['"]${pkg.replace('/', '\\/')}[^'"]+)\\.module\\.css(['"])`, 'g');
    content = content.replace(regex, '$1.css$2');
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
  }
});

console.log('Done!');