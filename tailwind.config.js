/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#050508',
        primary: '#0a0a0f',
        elevated: '#12121a',
        card: '#16161f',
        accent: {
          primary: '#00f0ff',
          secondary: '#7c3aed',
        },
        up: '#00ff88',
        down: '#ff3366',
      },
    },
  },
  plugins: [],
}
