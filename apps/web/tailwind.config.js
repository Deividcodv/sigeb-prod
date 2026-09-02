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
        // SIGEB Brand Colors
        sigeb: {
          blue: '#0057B8',
          'blue-dark': '#003B73',
          light: '#4DA3D9',
          white: '#FFFFFF',
          gray: '#F4F7FA',
          gold: '#D4A72C',
        },
        // Brutalista / maximalismo
        brutal: {
          tinta: '#141414',
          papel: '#F4F1EA',
          blanco: '#FFFFFF',
          cian: '#00C2FF',
          rojo: '#FF4D4D',
          naranja: '#FF7A00',
          lima: '#9ACD32',
          rosa: '#FF5FA2',
          indigo: '#6366F1',
          teal: '#14B8A6',
          gold: '#D4A72C',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        brut: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        brutal: '0px',
        brutalmd: '0px',
        brutalcard: '6px',
      },
      boxShadow: {
        brutal: '6px 6px 0 0 #141414',
        'brutal-sm': '4px 4px 0 0 #141414',
        'brutal-cyan': '6px 6px 0 0 #00C2FF',
        'brutal-gold': '6px 6px 0 0 #D4A72C',
      },
      borderWidth: {
        brutal: '3px',
      },
      rotate: {
        brutal: '-1.5deg',
      },
    },
  },
  plugins: [],
};