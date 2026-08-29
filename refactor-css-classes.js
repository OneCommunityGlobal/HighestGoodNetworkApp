// updated on june 11
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');

// Helper to convert kebab-case, snake_case, pascalcase to camelCase
const toCamelCase = str => {
  const formatted = str.replaceAll(/[-_](\w)/gu, (_, char) => char.toUpperCase());
  return formatted.charAt(0).toLowerCase() + formatted.slice(1);
};

const classMap = {}; // e.g. { "my-class": "myClass" }

// Step 1: Convert class names in .css files
const convertCSSFile = filePath => {
  const css = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { parser: safeParser });

  root.walkRules(rule => {
    const updated = rule.selectors.map(selector => {
      return selector.replaceAll(/\.(\w[\w-]*)/gu, (_, className) => {
        const camel = toCamelCase(className);
        classMap[className] = camel;
        return `.${camel}`;
      });
    });
    // eslint-disable-next-line no-param-reassign
    rule.selectors = updated;
  });

  fs.writeFileSync(filePath, root.toString());
  console.log(`✅ Updated CSS: ${filePath}`);
};

// Step 2: Replace import statement for CSS module in JSX
const replaceImportStatement = code => {
  const importRegex = /import\s+['"](.+\/)?([a-zA-Z0-9_-]+)\.css['"];/u;
  // eslint-disable-next-line default-param-last
  return code.replace(importRegex, (_, pathPrefix = '', cssFileName) => {
    return `import styles from '${pathPrefix}${cssFileName}.module.css';`;
  });
};

// Step 3: Replace kebab-case classes in JSX code with styles.camelCase
const replaceInCodeFile = filePath => {
  let code = fs.readFileSync(filePath, 'utf8');
  const originalCode = code;

  console.log(`Processing code file: ${filePath}`);

  // Step 1: Update import statement
  code = replaceImportStatement(code);
  console.log(`✅ Updated import`);

  if (Object.keys(classMap).length === 0) {
    console.log('classMap is empty, please check the refactor script!');
    return;
  }

  // Step 2: Replace className="text-light input-file-upload" → className={styles.textLight + " " + styles.inputFileUpload}
  code = code.replaceAll(/className\s*=\s*["']([^"']+)["']/gu, (_, classStr) => {
    const classList = classStr.trim().split(/\s+/u);

    // Skip transforming if no class in classList exists in classMap
    if (classList.every(cls => !classMap[cls])) {
      return `className="${classStr}"`;
    }
    const mapped = classList.map(cls => {
      const camel = classMap[cls];
      return camel ? `\${styles.${camel}}` : cls;
    });
    return `className={\`${mapped.join(' ')}\`}`;
  });

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`✅ Updated code in: ${filePath}`);
  } else {
    console.log('⚠️  No className replacements made.');
  }
};
const cssFiles = []; // To collect all CSS files
const codeFiles = []; // To collect all JS/JSX files

// Step 3: Walk through project and process files
const walkDir = dir => {
  // First pass: Collect files into two separate arrays
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.css')) {
      cssFiles.push(fullPath);
    } else if (
      file.endsWith('.js') ||
      file.endsWith('.jsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.html')
    ) {
      codeFiles.push(fullPath);
    }
  });

  // Now process CSS files first
  cssFiles.forEach(cssFile => {
    console.log('Processing CSS file:', cssFile);
    convertCSSFile(cssFile);
  });

  // Then process code files (JS/JSX, etc.)
  codeFiles.forEach(codeFile => {
    console.log('Processing code file:', codeFile);
    replaceInCodeFile(codeFile);
  });
};

// 🚀 Start here: Replace with your actual project folder path
const rootDir = 'src/components/HGNForm';
walkDir(rootDir);
