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
        leetcode: {
          bg: '#1a1a1a',
          card: '#262626',
          panel: '#282828',
          subpanel: '#1f1f1f',
          dark: '#141414',
          border: '#333333',
          borderLight: '#3e3e3e',
          text: '#eff1f6',
          muted: '#9ca3af',
          dim: '#6b7280',
          orange: '#ffa116',
          yellow: '#ffc01e',
          green: '#00b8a3',
          red: '#ef4743',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
