import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['index.html', './src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        board: {
          light: '#f0d9b5',
          dark: '#b58863'
        }
      }
    }
  },
  plugins: []
};

export default config;
