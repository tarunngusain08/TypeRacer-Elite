/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: 0 },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'pulse-glow': {
          '0%, 100%': { 
            'box-shadow': '0 0 0 0 rgba(168, 85, 247, 0.4)',
            transform: 'scale(1)'
          },
          '50%': { 
            'box-shadow': '0 0 20px 5px rgba(168, 85, 247, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'type-cursor': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        'progress-shine': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            'box-shadow': '0 0 20px 0px rgba(168, 85, 247, 0.4)',
            transform: 'scale(1)'
          },
          '50%': { 
            'box-shadow': '0 0 40px 10px rgba(168, 85, 247, 0.6)',
            transform: 'scale(1.05)'
          },
        },
        'text-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'type-cursor': 'type-cursor 1s step-end infinite',
        'progress-shine': 'progress-shine 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'text-flicker': 'text-flicker 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
