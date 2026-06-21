/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF4EE',
          100: '#FFE6D9',
          200: '#FFCCB3',
          300: '#FFB38C',
          400: '#FF9966',
          500: '#FF6B35',
          600: '#E85A24',
          700: '#CC4A1A',
          800: '#A33B15',
          900: '#7A2C10',
        },
        secondary: {
          50: '#E6F0F7',
          100: '#CCE1EF',
          200: '#99C3DF',
          300: '#66A5CF',
          400: '#3387BF',
          500: '#004E89',
          600: '#003D6E',
          700: '#002D52',
          800: '#001E37',
          900: '#000F1B',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6ED',
          200: '#F7F3E9',
          300: '#F0E9D9',
          400: '#E9DFC9',
          500: '#E2D5B9',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
