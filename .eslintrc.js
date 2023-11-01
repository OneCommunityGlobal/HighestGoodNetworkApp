module.exports = {
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
    'plugin:prettier/recommended', // use prettier as a eslint rule
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
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-key': 'off',
    'react/jsx-uses-react': 'off',
    'react/display-name': 'off',
    'react/no-direct-mutation-state': 'off',
    'react/no-unknown-property': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-duplicates': 'off',
    'import/no-named-as-default': 'off',
    'no-alert': 'error',
    'no-console': 'error',
    'react/jsx-props-no-spreading': 'off',
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
