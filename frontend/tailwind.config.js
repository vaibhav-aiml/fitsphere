/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#090C10',
        charcoal: '#11161F',
        elevated: '#18202C',
        blaze: {
          DEFAULT: '#FF5500',
          hover: '#E04B00',
          glow: 'rgba(255, 85, 0, 0.25)',
        },
        borderMuted: '#202938',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neumorphic-raised': '5px 5px 12px rgba(0,0,0,0.6), -3px -3px 9px rgba(255,255,255,0.03)',
        'neumorphic-raised-hover': '7px 7px 16px rgba(0,0,0,0.7), -4px -4px 12px rgba(255,255,255,0.05)',
        'neumorphic-inset': 'inset 3px 3px 6px rgba(0,0,0,0.7), inset -2px -2px 4px rgba(255,255,255,0.04)',
        'blaze-glow': '0 0 25px rgba(255, 85, 0, 0.4)',
      },
    },
  },
  plugins: [],
};