/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sun: {
          50:  '#FFFBEA',
          100: '#FFF3C4',
          200: '#FCE588',
          300: '#FADB5F',
          400: '#F7C948',
          500: '#F0B429',
          600: '#DE911D',
          700: '#CB6E17',
          800: '#B44D12',
          900: '#8D2B0B'
        },
        leaf: {
          400: '#7BC74D',
          500: '#5BAE2F',
          600: '#3F8C1B'
        },
        dirt: {
          400: '#A56A37',
          500: '#7A4A22',
          600: '#5A3416'
        }
      },
      fontFamily: {
        gt: ['"Century Gothic"', 'CenturyGothic', 'Geneva', 'AppleGothic', 'sans-serif']
      },
      animation: {
        'walk':       'walk 0.28s steps(2) infinite',
        'idle-bob':   'idleBob 2.4s ease-in-out infinite',
        'cloud':      'cloud 60s linear infinite',
        'sun-glow':   'sunGlow 4s ease-in-out infinite',
        'pop':        'pop 0.4s ease-out',
        'fall':       'fall 0.6s ease-in forwards',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'firework':   'firework 1.2s ease-out forwards',
        'sign-bob':   'signBob 3s ease-in-out infinite'
      },
      keyframes: {
        walk:    { '0%': { transform: 'translateY(0px) rotate(-2deg)' }, '50%': { transform: 'translateY(-3px) rotate(2deg)' } },
        idleBob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-2px)' } },
        cloud:   { '0%': { transform: 'translateX(-10vw)' }, '100%': { transform: 'translateX(110vw)' } },
        sunGlow: { '0%,100%': { filter: 'drop-shadow(0 0 14px #FADB5F)' }, '50%': { filter: 'drop-shadow(0 0 28px #FFF3C4)' } },
        pop:     { '0%': { transform: 'scale(0.2)', opacity: '0' }, '70%': { transform: 'scale(1.15)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        fall:    { '0%': { transform: 'translateY(-60px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeUp:  { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        firework:{ '0%':   { transform: 'scale(0.1)', opacity: '1' },
                   '60%':  { transform: 'scale(1.4)', opacity: '0.9' },
                   '100%': { transform: 'scale(2)',   opacity: '0' } },
        signBob: { '0%,100%': { transform: 'translateY(0) rotate(-1deg)' }, '50%': { transform: 'translateY(-3px) rotate(1deg)' } }
      }
    }
  },
  plugins: []
}
