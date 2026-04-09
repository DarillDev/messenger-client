// @ts-check
const tseslint = require('typescript-eslint');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const importPlugin = require('eslint-plugin-import');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.angular/', 'coverage/', 'out-tsc/', 'jest.config.ts', 'setup-jest.ts'],
  },

  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angular,
      import: importPlugin,
    },
    rules: {
      // ── Angular ──────────────────────────────────────────────
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',

      // ── TypeScript strict ────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',

      // ── Naming conventions (mono-shared style) ───────────────
      '@typescript-eslint/naming-convention': [
        'error',
        // camelCase по умолчанию для переменных, параметров, свойств, методов, функций
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // UPPER_CASE для static readonly
        {
          selector: 'classProperty',
          modifiers: ['static', 'readonly'],
          format: ['UPPER_CASE', 'camelCase'],
        },
        // StrictPascalCase для типов, интерфейсов, классов, перечислений
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Интерфейсы — префикс I
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        // Type aliases — префикс T
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        // Enum — префикс E
        {
          selector: 'enum',
          format: ['PascalCase'],
          prefix: ['E'],
        },
        // Enum members — PascalCase or UPPER_CASE
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        // Boolean variables — can have is/has/should/can prefix
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase', 'PascalCase'],
          prefix: ['is', 'has', 'should', 'can', 'will', 'did'],
        },
        // Variables и imports — разрешить PascalCase для классов/компонентов
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        // Параметры
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Destructured properties — любой формат (внешние API)
        {
          selector: 'variable',
          modifiers: ['destructured'],
          format: null,
        },
        // Object literal properties — любой формат (JSON, API contracts)
        {
          selector: 'objectLiteralProperty',
          format: null,
        },
      ],

      // ── Import sorting ───────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index'],
            ['object', 'type'],
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': 'error',
      'sort-imports': ['warn', { ignoreCase: true, ignoreDeclarationSort: true }],

      // ── General ──────────────────────────────────────────────
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },

  // Spec files — relaxed rules
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },

  // Config files (jest.config.ts, eslint.config.js, etc.)
  {
    files: ['*.config.ts', '*.config.js', 'setup-jest.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'no-console': 'off',
    },
  },

  // Angular templates
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
    },
  },

  // Prettier must be last to override formatting rules
  prettierConfig,
);
