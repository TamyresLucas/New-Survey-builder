import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            /* ============================================
               DESIGN SYSTEM IMPORT GOVERNANCE
               ============================================ */
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '../../packages/design-system/*',
                                '../packages/design-system/*',
                                './packages/design-system/*',
                                '**/packages/design-system/src/*'
                            ],
                            message: 'Use: import { ... } from "@voxco/design-system"'
                        },
                        {
                            group: [
                                './components/Button',
                                '../components/Button',
                                '**/components/Button'
                            ],
                            message: 'Use: import { Button } from "@/adapters" or "@voxco/design-system"'
                        }
                    ]
                }
            ]
        },
    },
);
