/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        night: {
          950: '#0D0B1A',
          900: '#151229',
          800: '#1E1A36',
          700: '#2A2548',
          600: '#3D3666',
        },
        neon: {
          orange: '#FF6B35',
          green: '#00FF88',
          purple: '#A855F7',
          pink: '#FF3D8E',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow-breathe': 'glowBreathe 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'countdown-tick': 'countdownTick 1s steps(1) infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255,107,53,0.3), 0 0 20px rgba(255,107,53,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(255,107,53,0.6), 0 0 40px rgba(255,107,53,0.3)' },
        },
        glowBreathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countdownTick: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
