import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['dist/**', 'plain-dist/**', 'figma-source/**', 'node_modules/**', 'artifacts/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
