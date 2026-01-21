// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
    js.configs.recommended,

    ...tseslint.configs.recommendedTypeChecked,

    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname
            }
        },
        plugins: {
            import: importPlugin,
            'unused-imports': unusedImports
        },
        rules: {
            /* ---------- TypeScript ---------- */
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',

            /* ---------- Imports ---------- */
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index'
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true }
                }
            ],

            /* ---------- Unused ---------- */
            'unused-imports/no-unused-imports': 'error',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },

    {
        ignores: ['dist', 'node_modules']
    }
]
