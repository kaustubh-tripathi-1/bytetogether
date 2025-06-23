// @ts-nocheck

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin';

export default [
    { ignores: ['dist', 'vite.config.js', 'vitest.config.js'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: 2022,
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'jsx-a11y': jsxA11y,
            import: importPlugin,
            vitest,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.flat.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            ...importPlugin.configs.recommended.rules,
            ...prettier.rules, // Disables conflicting formatting rules
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^([A-Z].*|_[a-zA-Z0-9].*)',
                    argsIgnorePattern: '^_',
                },
            ],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off', // Disable prop-types
            'react/no-direct-mutation-state': 'off', // Deprecated: Applies to class components
            'react/require-render-return': 'off', // Deprecated: Not needed with functional components
            'react/no-find-dom-node': 'off', // Deprecated: findDOMNode is removed in React 19
            'react/no-string-refs': 'off', // Deprecated: String refs are obsolete
            'import/order': ['error', { 'newlines-between': 'always' }], // Sort imports
            'import/no-unresolved': [2, { ignore: ['\\.svg\\?react$'] }], // Ignore SVG imports with ?react
        },
        settings: {
            react: { version: 'detect' }, // Auto-detect React version
            imports: { ignore: ['node_modules'] },
        },
    },
    // Add an overrides section for test files
    {
        files: ['**/*.{test,spec}.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.vitest, // Add Vitest globals
            },
        },
        rules: {
            ...vitest.configs.recommended.rules, // Extend Vitest recommended rules
            'vitest/no-focused-tests': 'error', // Prevent focused tests (e.g., it.only)
            'vitest/no-disabled-tests': 'warn', // Warn on skipped tests (e.g., it.skip)
        },
    },
];
