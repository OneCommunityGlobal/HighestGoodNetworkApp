// Script to copy tinymce to public folder. Read more: https://www.tiny.cloud/docs/tinymce/latest/react-pm-host/
const fse = require('fs-extra');
const path = require('path');

const topDir = __dirname;
// const topDir = import.meta.dirname;
fse.emptyDirSync(path.join(topDir, 'public', 'tinymce'));
fse.copySync(path.join(topDir, 'node_modules', 'tinymce'), path.join(topDir, 'public', 'tinymce'), {
  overwrite: true,
});
