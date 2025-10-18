/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A3DFF',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#4A3DFF',
          600: '#3730DD',
          700: '#2E28B8',
          800: '#251F94',
          900: '#1C1870',
        },
        secondary: {
          DEFAULT: '#0f3460',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0f3460',
          600: '#0C2A4D',
          700: '#09203A',
          800: '#061627',
          900: '#030C14',
        },
        accent: {
          DEFAULT: '#1565C0',
          light: '#2196F3',
          dark: '#0D47A1',
        },
        error: {
          DEFAULT: '#e94560',
          light: '#FF6B8A',
          dark: '#C72E4A',
        },
        background: {
          DEFAULT: '#000000',
          secondary: '#1a1a2e',
          tertiary: '#2a2a3e',
          light: '#FFFFFF',
        },
        foreground: {
          DEFAULT: '#FFFFFF',
          secondary: '#8E8E93',
          tertiary: '#555555',
          dark: '#000000',
        },
        border: {
          DEFAULT: '#2C2C2E',
          light: '#E0E0E0',
          focus: '#4A3DFF',
        },
      },
      fontFamily: {
        sans: ['Montserrat_400Regular', 'System'],
        medium: ['Montserrat_500Medium', 'System'],
        semibold: ['Montserrat_600SemiBold', 'System'],
        bold: ['Montserrat_700Bold', 'System'],
        mono: ['monospace'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
