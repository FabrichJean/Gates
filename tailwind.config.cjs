/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 on active le mode dark via une classe
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',      // indigo-600
        primaryHover: '#4338ca', // indigo-700
        danger: '#ef4444',       // red-500
        dangerHover: '#dc2626',
        success: '#10b981',      // emerald-500
        muted: '#6b7280',        // gray-500
        bgLight: '#f9fafb',      // gray-50
        bgDark: '#111827',       // gray-900
        cardLight: '#ffffff',
        cardDark: '#1f2937',     // gray-800
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        'system': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn .25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
      },
      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
      }
    },
  },
  plugins: [],
}
