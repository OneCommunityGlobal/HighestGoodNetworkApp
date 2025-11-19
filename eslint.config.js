const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

const shareables = [
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'plugin:import/recommended',
  'plugin:jsx-a11y/recommended',
  'plugin:prettier/recommended',
  'plugin:testing-library/react',
];

const baseExtends = compat.extends(...shareables).map(presetConfig => ({
  files: ['**/*.{js,jsx}'], // apply on both .js & .jsx
  ...presetConfig,
}));

module.exports = [
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
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        babelOptions: {
          plugins: [
            '@babel/plugin-transform-optional-chaining',
            '@babel/plugin-transform-nullish-coalescing-operator',
          ],
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        IntersectionObserver: 'readonly',
        WebSocket: 'readonly',
        sessionStorage: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { paths: ['src'], extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'no-underscore-dangle': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-alert': 'warn',
      'no-console': 'warn',
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },

  {
    files: ['**/__tests__/*.{js,jsx}', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
];
