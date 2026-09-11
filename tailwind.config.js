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
        zinc: {
          750: '#393e36',
          850: '#242a23',
        },
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
          50: '#f7f7f5',
          100: '#efefec',
          200: '#e0e1dd',
          300: '#c9cbc5',
          400: '#93978e',
          500: '#6e7469',
          600: '#545b51',
          700: '#3d453b',
          800: '#282e29',
          900: '#191e1a',
          850: '#202720',
          925: '#151a15',
          950: '#111511',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
