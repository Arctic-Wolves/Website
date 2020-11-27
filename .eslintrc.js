module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['airbnb', 'airbnb/hooks'],
  rules: {
    // General
    'operator-linebreak': ['error', 'after'],
    'linebreak-style': 'off',
    'comma-dangle': 'off',
    'arrow-body-style': 'warn',
    'arrow-parens': ['error', 'as-needed'],
    'no-underscore-dangle': 'off',
    'no-await-in-loop': 'off',
    // React
    'react/jsx-fragments': 'off', // Prefer verbose syntax
    'react/jsx-props-no-spreading': 'off', // Spread appropriatly
    'react/destructuring-assignment': 'off',
    // Import
    'import/prefer-default-export': 'off',
    'import/order': ['error', {
      groups: [
        'builtin',
        ['external', 'internal'],
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always-and-inside-groups'
    }]
  }
};
