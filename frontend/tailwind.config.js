export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired neutral palette
        slate: {
          50: '#f5f5f7', // Apple light gray background
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#86868b', // Apple gray text
          400: '#6e6e73',
          500: '#424245',
          600: '#1d1d1f', // Apple nearly black
          700: '#121212',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        // Apple-inspired accent
        brand: {
          blue: '#0071e3',
          darkBlue: '#0077ED',
        }
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'blob': "blob 7s infinite",
      }
    },
  },
  plugins: [],
}
