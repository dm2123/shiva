/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shiva: {
          dark:    '#090D16',
          slate:   '#0F172A',
          blue:    '#1E3A8A',
          indigo:  '#4F46E5',
          violet:  '#8B5CF6',
          amber:   '#D97706',
          emerald: '#059669',
          gold:    '#F59E0B',
        },
        student: {
          primary: 'var(--student-primary)',
          surface: 'var(--student-surface)',
          border:  'var(--student-border)',
          text:    'var(--student-text)',
          muted:   'var(--student-text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        'sidebar': 'var(--sidebar-width)',
        'header': 'var(--header-height)',
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(15, 23, 42, 0.06)',
        'glass-lg':   '0 16px 48px rgba(15, 23, 42, 0.08)',
        'indigo':     '0 10px 30px -5px rgba(79, 70, 229, 0.15)',
        'indigo-lg':  '0 20px 40px -8px rgba(79, 70, 229, 0.2)',
        'card':       '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -4px rgba(79, 70, 229, 0.04)',
        'float':      '0 8px 24px -4px rgba(15, 23, 42, 0.1)',
        'dock':       '0 -4px 32px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'morph-slow':    'morph 14s ease-in-out infinite alternate',
        'morph-slower':  'morph2 18s ease-in-out infinite alternate',
        'float-slow':    'float 6s ease-in-out infinite',
        'float-gentle':  'float-gentle 8s ease-in-out infinite',
        'pulse-subtle':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ring':    'pulse-ring 2s ease-out infinite',
        'shimmer':       'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        morph: {
          '0%':   { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
          '33%':  { borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%', transform: 'rotate(60deg) scale(1.05)' },
          '66%':  { borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%', transform: 'rotate(240deg) scale(0.98)' },
          '100%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(360deg) scale(1.08)' },
        },
        morph2: {
          '0%':   { borderRadius: '40% 60% 70% 30% / 50% 40% 60% 50%', transform: 'rotate(0deg) scale(1)' },
          '100%': { borderRadius: '60% 40% 30% 70% / 40% 60% 40% 60%', transform: 'rotate(-360deg) scale(1.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-6px) rotate(1deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '0.5' },
          '50%':  { transform: 'scale(1)', opacity: '0.2' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs':  '375px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
