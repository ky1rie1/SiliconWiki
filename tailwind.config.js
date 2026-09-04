/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        silicon: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fde047',
          500: '#F7D84A', // Master Silicon Gold signature
          600: '#e0b828',
          700: '#b48a14',
          900: '#715106',
        },
        obsidian: {
          DEFAULT: '#000000',
          pure: '#000000',
          card: '#09090b',
          surface: '#0f172a',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          gold: '#F7D84A',
        },
        slate: {
          850: '#151f32',
          925: '#0b1120',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
