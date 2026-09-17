const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');

// Flat ESLint config for the Trivia Night monorepo.
// Backend is CommonJS (Node); frontend is ESM (browser) with JSX in .js files.
module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '.specify/**',
      'specs/**',
      '.github/**'
    ]
  },
  js.configs.recommended,
  {
    // Backend: Node + Jest
    files: ['packages/backend/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    // Frontend: browser ESM + JSX (.js) + Vitest globals
    files: ['packages/frontend/**/*.{js,jsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        // Vitest globals (globals:true in vite.config)
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      // Mark JSX-referenced identifiers (components) as used.
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }]
    }
  }
];
