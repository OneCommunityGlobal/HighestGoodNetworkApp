module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: ['plugin:react/recommended', 'airbnb'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	plugins: ['react', "testing-library"],
	rules: {
		"react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
	},
	overrides: [
		{
			files: [
				"**/*.test.js",
				"**/*.test.jsx"
			],
			env: {
				jest: true
			}
		}
	]
};
