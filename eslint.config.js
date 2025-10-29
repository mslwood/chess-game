import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default ts.config(
  {
    ignores: ['dist', 'node_modules', 'package-lock.json', 'postcss.config.cjs']
  },
  js.configs.recommended,
  ...ts.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': hooks,
      'jsx-a11y': jsxA11y,
      'react-refresh': reactRefresh
    },
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'jsx-a11y/no-autofocus': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  prettier
);
