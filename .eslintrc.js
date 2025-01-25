module.exports = {
  ignorePatterns: ['**/*.css'],
  env: {
    browser: true,
    es6: true,
    node: true,
    es2020: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', 'json'],
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
  plugins: ['react', 'testing-library', 'prettier', 'jest'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-underscore-dangle': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-key': 'off',
    'react/jsx-uses-react': 'error',
    'react/display-name': 'off',
    'react/no-direct-mutation-state': 'off',
    'react/no-unknown-property': 'off',
    'react/destructuring-assignment': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-duplicates': 'off',
    'import/no-named-as-default': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-alert': 'error',
    'no-console': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/extensions': ['error', 'always', { js: 'never', jsx: 'never', json: 'always' }],
  },

  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', 'jest.config.js', 'src/graceful-fs.js'],
      env: {
        jest: true, // Enable Jest globals for these files
      },
    },
  ],
};
