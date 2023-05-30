module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'standard',
    'standard-react',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:package-json/recommended',
  ],
  plugins: [
    'react-hooks',
    'simple-import-sort',
    'sort-keys-fix',
    'prettier',
    '@typescript-eslint/eslint-plugin',
    'package-json',
    'file-progress',
  ],
  overrides: [
    {
      files: ['apps/CurriDriver/**/*.tsx'],
      plugins: ['jsx-expressions'],

      // This is a crucial check for React Native, to prevent fatal app crashes:
      // (Save the below links, to require ternary usage if this rule is not sufficient to prevent text crashes)
      // https://github.com/yannickcr/eslint-plugin-react/issues/2073
      // https://stackoverflow.com/questions/52368342/invariant-violation-text-strings-must-be-rendered-within-a-text-component/59108109#59108109
      rules: {
        'jsx-expressions/strict-logical-expressions': 'error',
        'no-nested-ternary': 'warn'
      },
      parserOptions: {
        project: './apps/CurriDriver/tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      files: ['*.mjs/*.js/*.ts'],
      processor: '@graphql-eslint/graphql',
    },
    {
      files: ['*.graphql'],
      extends: [
        'plugin:@graphql-eslint/schema-recommended',
        'plugin:@graphql-eslint/operations-recommended',
      ],
      rules: {
        'prettier/prettier': ['error', { parser: 'graphql' }],
        '@graphql-eslint/naming-convention': [
          'error',
          { types: 'PascalCase', FieldDefinition: 'camelCase' },
        ],
        '@graphql-eslint/require-description': 'off',
        '@graphql-eslint/strict-id-in-types': 'off',
        '@graphql-eslint/no-hashtag-description': 'off',
        '@graphql-eslint/require-id-when-available': 'off',
        '@graphql-eslint/no-typename-prefix': 'off',
        '@graphql-eslint/no-deprecated': 'warn',
        '@graphql-eslint/known-type-names': 'off',
        '@graphql-eslint/fields-on-correct-type': 'off',
        'spaced-comment': ['off'],
      },
    },

  ],
  ignorePatterns: ['**/hooks-generated', '**/*.config.js'],
  rules: {
    'file-progress/activate': 1,

    'prettier/prettier': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // TODO: Replace in the future, we need to make sure these are resolved
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',

    'camelcase': 'off', // This rule no longer exists, it was replaced by naming-convention

    'curly': ['error', 'multi-line', 'consistent'], // This will enforce curly braces on multi-line statements, but not force them on one-liners.

    '@typescript-eslint/camelcase': 'off',

    // Should be replaced by below when parserOptions.project is figured out
    // '@typescript-eslint/naming-convention': [
    //   'error',
    //   {
    //     selector: 'default',
    //     format: ['camelCase'],
    //   },
    //   {
    //     selector: 'variable',
    //     format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    //   },
    //   {
    //     selector: 'parameter',
    //     format: ['camelCase'],
    //     leadingUnderscore: 'allow',
    //   },
    //   {
    //     selector: 'memberLike',
    //     modifiers: ['private'],
    //     format: ['camelCase'],
    //     leadingUnderscore: 'require',
    //   },
    //   {
    //     selector: 'typeLike',
    //     format: ['PascalCase'],
    //   },
    // ],

    'no-unexpected-multiline': 'off',
    'no-nested-ternary': 'error',

    'no-redeclare': 'off',
    'no-unmodified-loop-condition': 'off',

    // This conflicts with prettier, so keep it off.
    // Unless you want an infinite semicolon cycle, woooOOooOOo
    '@typescript-eslint/no-extra-semi': 'off',

    '@typescript-eslint/no-explicit-any': ['error'],

    // https://github.com/typescript-eslint/typescript-eslint/blob/main/docs/linting/TROUBLESHOOTING.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
    // TLDR: Don't use this rule with TypeScript. TS already provides this functionality and better.
    'no-undef': 'off',
    'import/no-duplicates': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-namespace': 'off',

    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
      },
    ],
    'dot-notation': 'off',
    'no-void': 'off',
    'no-empty': 'off',
    'n/no-path-concat': 'off',
    'react/prop-types': 'off',
    'react/no-unused-prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-key': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // This is covered by tsconfig.json itself
    'react-hooks/rules-of-hooks': 'error',
    'simple-import-sort/imports': 'error',
    'sort-keys-fix/sort-keys-fix': 'error',
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
}
