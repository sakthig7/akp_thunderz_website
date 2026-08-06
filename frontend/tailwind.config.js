/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#D4AF37', light: '#E8C766', dark: '#A6841F' },
        maroon: { DEFAULT: '#7A0C0C', light: '#9E1A1A', dark: '#4E0707' }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        stadium: "linear-gradient(180deg, rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url('/stadium-bg.jpg')"
      }
    }
  },
  plugins: []
};
