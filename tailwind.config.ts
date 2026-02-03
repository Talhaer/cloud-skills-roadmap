import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        panel: '#0f172a',
        surface: '#111827',
        outline: '#1f2937',
        muted: '#94a3b8'
      }
    }
  },
  plugins: []
};

export default config;
