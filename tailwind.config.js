/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': {
          light: '#E2D9F3',
          DEFAULT: '#593396', // Novo roxo principal
          dark: '#3d225c',    // Um roxo mais escuro para hover
        },
        'brand-yellow': {
          DEFAULT: '#f7dd52', // Novo amarelo principal
          dark: '#e6c13b',   // Amarelo mais escuro para hover
        },
        'brand-background': '#FFFFFF',
        'brand-text': '#1A1A1A',
        'brand-text-secondary': '#555555',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        'indie-flower': ['"Indie Flower"', 'cursive'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem', // 16px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem', //32px
      },
      boxShadow: {
        'subtle': '0px 4px 12px rgba(0, 0, 0, 0.05)',
        'card': '0px 8px 20px rgba(79, 45, 128, 0.1)', // Purpleish shadow
      }
    },
  },
  plugins: [],
}