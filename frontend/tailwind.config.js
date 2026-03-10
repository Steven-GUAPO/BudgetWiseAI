/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        serifDisplay: ['"DM Serif Text"', ...defaultTheme.fontFamily.serif],
        serifBody: ['"Crimson Text"', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
}

