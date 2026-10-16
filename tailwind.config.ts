import type { Config } from 'tailwindcss';

/**
 * Design system ported from the نَسَق (Nasaq) mockup.
 * Tokens map 1:1 to the CSS variables in the original single-file app.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'Almarai', 'Arial', 'system-ui', 'sans-serif'],
      },
      colors: {
        // surface / text (palette values, so opacity modifiers resolve)
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        'text-primary': '#172033',
        'text-secondary': '#667085',
        'muted-surface': '#F1F5F9',
        border: '#E6EAF0',
        // brand
        primary: '#5B5CE2',
        'primary-hover': '#4B4CC4',
        secondary: '#16B8A6',
        'light-purple': '#EEEEFF',
        // status
        success: '#16A34A',
        'success-bg': '#DCFCE7',
        warning: '#D97706',
        'warning-bg': '#FEF3C7',
        danger: '#DC2626',
        'danger-bg': '#FEE2E2',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      padding: {
        card: 'var(--card-padding)',
      },
      fontSize: {
        base: 'var(--base-font-size)',
      },
      spacing: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
        topbar: 'var(--topbar-height)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
      },
      maxWidth: {
        container: '1240px',
      },
    },
  },
  plugins: [],
};

export default config;
