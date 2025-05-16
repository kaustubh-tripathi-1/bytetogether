import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default [
    { ignores: ["dist"] },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "jsx-a11y": jsxA11y,
            import: importPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            ...importPlugin.configs.recommended.rules,
            ...prettier.rules, // Disables conflicting formatting rules
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "react/prop-types": "off", // Disable prop-types
            "import/order": ["error", { "newlines-between": "always" }], // Sort imports
        },
        settings: {
            react: { version: "detect" }, // Auto-detect React version
            imports: { ignore: ["node_modules"] },
        },
    },
];
