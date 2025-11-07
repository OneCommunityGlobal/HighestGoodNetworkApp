// ...existing code...
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  resolvePluginsRelativeTo: __dirname,
});

const shareables = [
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'plugin:import/recommended',
  'plugin:jsx-a11y/recommended',
  'plugin:prettier/recommended',
  'plugin:testing-library/react',
];

const baseExtends = compat.extends(...shareables).map(presetConfig => ({
  files: ['**/*.{js,jsx}'],
  ...presetConfig,
}));

// Shared globals to avoid duplication (keeps config DRY)
const sharedGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  IntersectionObserver: 'readonly',
  WebSocket: 'readonly',
  sessionStorage: 'readonly',
  localStorage: 'readonly',
  fetch: 'readonly',
  process: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  URL: 'readonly',
  require: 'readonly',
  global: 'readonly',
  File: 'readonly',
  URLSearchParams: 'readonly',
  alert: 'readonly',
  Intl: 'readonly',
  Event: 'readonly',
  CustomEvent: 'readonly',
  FormData: 'readonly',
  FileReader: 'readonly',
  MutationObserver: 'readonly',
  DOMParser: 'readonly',
  AbortController: 'readonly',
  render: 'readonly',
  unmountComponentAtNode: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  module: 'readonly',
  __dirname: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  ReactHtmlParser: 'readonly',
  Blob: 'readonly',
  crypto: 'readonly',
  requestAnimationFrame: 'readonly',
  reduxTests: 'readonly',
  open: 'readonly',
  weeklyCommittedHours: 'readonly',
};

// Exported config
module.exports = [
  // Add ESLint recommended config first
  js.configs.recommended,

  {
    ignores: [
      //  =======================================================================
      //  ⚠️ DO NOT ADD NEW ENTRIES ⚠️
      //  Only the files and folders listed below are allowed to be ignored.
      //  This .gitignore is locked down to maintain consistency across the team.
      //  To propose changes, please open a discussion or PR with justification.
      //  =======================================================================
      'node_modules/**',
      'public/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      // Ignore test files inside /src/components
      'src/components/Reports/PeopleReport/components/PeopleTasksPieChart.test.jsx',
      // Ignore entire component folders
      'src/components/Badge/**',
    ],
  },

  ...baseExtends,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      // eslint-disable-next-line global-require
      parser: require('@babel/eslint-parser'),
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        babelOptions: {
          plugins: [
            '@babel/plugin-transform-optional-chaining',
            '@babel/plugin-transform-nullish-coalescing-operator',
          ],
        },
      },
      globals: { ...sharedGlobals },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { paths: ['src'], extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      // ===============================
      // KEEP YOUR EXISTING RULES (LIGHT)
      // ===============================
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'no-underscore-dangle': 'off',
      'react/prop-types': 'off', // Keep off for now
      'react-hooks/exhaustive-deps': 'off',
      'no-alert': 'warn',
      'no-console': 'warn', // Keep as warn
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

      // ===============================
      // LIGHT ENTERPRISE ADDITIONS (WARNINGS ONLY)
      // ===============================
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
      'no-var': 'warn', // Gradually migrate
      'prefer-const': 'warn',

      // Light React improvements
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-string-refs': 'warn',
      'react/self-closing-comp': 'warn',

      // Light code quality (warnings only)
      'no-debugger': 'warn',
      'no-duplicate-imports': 'warn',
      'prefer-template': 'warn',

      // Import organization (light)
      'import/newline-after-import': 'warn',
      'import/no-named-as-default': 'warn',

      // Performance (warnings only)
      'no-loop-func': 'warn',
      'react/jsx-no-bind': ['warn', { allowArrowFunctions: true }],
    },
  },

  // ===============================
  // TEST FILES SPECIFIC RULES
  // ===============================
  {
    files: ['**/__tests__/*.{js,jsx}', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: {
        // test-specific extras can go here; reuse shared globals for the rest
        vi: 'readonly',
        jest: 'readonly',
        mock: 'readonly',
        ...sharedGlobals,
      },
    },
    rules: {
      // Relax rules for test files
      'import/no-extraneous-dependencies': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/prop-types': 'off',
      'no-console': 'off',
    },
  },

  // ===============================
  // CONFIGURATION FILES
  // ===============================
  {
    files: ['*.config.{js,jsx}', '.eslintrc.{js,jsx}'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
    },
  },
];
// ...existing code...