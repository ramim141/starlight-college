/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5722',
          'orange-hover': '#E64A19',
          navy: '#0F2C59',
          'navy-light': '#1E3A8A',
          sky: '#EBF3FA',
          canvas: '#F8FAFC',
          text: '#1E293B',
          muted: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Hind Siliguri', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 44, 89, 0.06)',
        'premium': '0 10px 30px -5px rgba(15, 44, 89, 0.1)',
      }
    },
  },
  plugins: [],
}