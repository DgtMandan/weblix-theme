/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#2155FF',
        darkBlue: '#06134A',
        lightBlue: '#4F7BFF',
        ink: '#0A0F2C',
        mist: '#F5F7FF'
      },
      boxShadow: {
        premium: '0 24px 70px rgba(33, 85, 255, 0.18)',
        glass: '0 18px 50px rgba(6, 19, 74, 0.12)'
      }
    }
  },
  plugins: []
};
