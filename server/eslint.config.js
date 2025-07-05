import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
    { ignores: ['**/node_modules/**'] },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.node, // Node.js globals
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...importPlugin.configs.recommended.rules,
            ...prettier.rules, // Disables conflicting formatting rules
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^([A-Z].*|_[a-zA-Z0-9].*)',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'none', // Allows unused catch params
                },
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow warn/error logs
            'node/no-unpublished-require': 'off', // Allow requires if needed
            'import/no-unresolved': 'off', // Turn off false alarms for subpath exports
        },
        settings: {
            // Let ESLint resolve subpath exports and modern node modules
            'import/resolver': {
                node: {
                    extensions: ['.js', '.mjs', '.json'],
                    moduleDirectory: ['node_modules'],
                },
            },
        },
    },
];
