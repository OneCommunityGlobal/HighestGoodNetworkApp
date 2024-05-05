module.exports = {
  ignorePatterns: ['**/*.css'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx'],
      },
    },
  },
  extends: [
    'airbnb',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/recommended',
    'prettier/react',
    // 'plugin:prettier/recommended', // use prettier as a eslint rule
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'testing-library', 'prettier'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-underscore-dangle': 'off',
    'react/destructuring-assignment': 'off',
    'react/prop-types': 'off',
    'react/no-array-index-key': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-key': 'off',
    'react/jsx-uses-react': 'off',
    'react/display-name': 'off',
    'react/no-direct-mutation-state': 'warn',
    'react/no-unknown-property': 'error',
    'react/react-in-jsx-scope': 'off',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'off',
    'no-alert': 'warn',
    'no-console': 'error',
    'linebreak-style': 0,
    'react/forbid-prop-types': 0,
    'import/no-named-as-default-member': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true,
      },
    },
  ],
};
