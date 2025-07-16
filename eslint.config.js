const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

const shareables = [
  'airbnb',
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
      // Ignore test files inside /src/components
      'src/components/BMDashboard/_tests_/BMDashboard.test.jsx',
      'src/components/Reports/PeopleReport/components/PeopleTasksPieChart.test.jsx',
      // Ignore entire component folders
      'src/components/Badge/**',
      'src/components/Dashboard/**',
      'src/components/Projects/**',
      'src/components/SummaryManagement/**',
      'src/components/TeamMemberTasks/**',
      'src/components/Teams/TeamMembersPopup.jsx',
      'src/components/UserManagement/**',
      'src/components/UserProfile/**',
      'src/components/Announcements/index.jsx',
    ],
  },

  ...baseExtends,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        IntersectionObserver: 'readonly',
        WebSocket: 'readonly',
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
