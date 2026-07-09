/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        slate: {
          105: '#F8FAFC',
          205: '#E2E8F0',
          450: '#94A3B8',
          455: '#64748B',
          655: '#475569',
          805: '#1E293B',
          850: '#1E293B',
          905: '#0F172A',
        },
        blue: {
          105: '#EFF6FF',
          505: '#3B82F6',
          650: '#2563EB',
          955: '#1E3A8A',
        },
        indigo: {
          650: '#4F46E5',
          955: '#312E81',
        },
        rose: {
          455: '#F87171',
          555: '#EF4444',
          605: '#DC2626',
          955: '#7F1D1D',
        },
        emerald: {
          450: '#34D399',
          455: '#10B981',
        },
        amber: {
          455: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
