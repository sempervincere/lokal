import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#1B7A65',
          500: '#2A9D82',
          400: '#5FB8A3',
          100: '#E6F3EF',
        },
        earth: {
          600: '#C17A5F',
          500: '#D4917A',
          100: '#F5E9E3',
        },
        cream: {
          50:  '#FDFBF7',
          100: '#FAF6ED',
          200: '#F5F1EC',
        },
        warmgray: {
          900: '#1A1A1A',
          700: '#4A4540',
          500: '#6B6560',
        },
        success: '#2A9D82',
        warning: '#D4A03D',
        danger:  '#C45B4A',
        info:    '#5B8BA0',
      },
      fontFamily: {
        jakarta: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'lokal-sm': '8px',
        'lokal-md': '12px',
        'lokal-lg': '16px',
        'lokal-xl': '24px',
      },
      boxShadow: {
        'lokal-sm': '0 1px 2px rgba(26,26,26,0.05)',
        'lokal-md': '0 4px 12px rgba(26,26,26,0.08)',
        'lokal-lg': '0 8px 24px rgba(26,26,26,0.10)',
        'lokal-xl': '0 16px 48px rgba(26,26,26,0.12)',
      },
      maxWidth: {
        'layout': '1200px',
      },
      animation: {
        'bounce-dot': 'bounceDot 1.2s ease infinite',
        'hero-pulse': 'heroPulse 8s ease-in-out infinite',
      },
      keyframes: {
        bounceDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
        heroPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}

export default config
