import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        nados: {
          primary: '#1a56db',
          secondary: '#0e9f6e',
          danger: '#e02424',
          warning: '#d03801',
        },
      },
    },
  },
  plugins: [],
};

export default config;
