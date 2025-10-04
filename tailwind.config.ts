import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        headline: ['Montserrat', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        error: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--error-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Nueva paleta cálida y terrosa
        'acento-fuerte': '#A4243B',
        'fondo-base': '#D8C99B',
        'barra-principal': '#D8973C',
        'acento-calido': '#BD632F',
        'primario-oscuro': '#273E47',
        
        // Colores para estados de casillas
        'slot-available': '#8B9A46',
        'slot-paid': '#5D7CA6',
        'slot-reserved': '#C17D4E',
        'slot-winning': '#E6B422',
        'slot-losing': '#7A6B5D',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'winner-pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0px hsl(var(--accent) / 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px hsl(var(--accent) / 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'winner-pulse': 'winner-pulse 2s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
