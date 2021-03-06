// Cribbed from https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb

module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    indent: 2,
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '(^h$|Component$)' }],
    // Use sparingly ;).
    '@typescript-eslint/no-explicit-any': false,
    '@typescript-eslint/ban-ts-ignore': false,
  },
};
