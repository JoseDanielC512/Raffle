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
        body: ['PT Sans', 'sans-serif'],
        headline: ['PT Sans', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sage: {
          DEFAULT: '#b5ba72',
          '100': '#272814',
          '200': '#4e5128',
          '300': '#75793c',
          '400': '#9ca14f',
          '500': '#b5ba72',
          '600': '#c4c88f',
          '700': '#d3d6ab',
          '800': '#e2e3c7',
          '900': '#f0f1e3',
        },
        battleship_gray: {
          DEFAULT: '#99907d',
          '100': '#1f1d19',
          '200': '#3f3b31',
          '300': '#5e584a',
          '400': '#7e7563',
          '500': '#99907d',
          '600': '#aea798',
          '700': '#c2bdb2',
          '800': '#d7d3cc',
          '900': '#ebe9e5',
        },
        mountbatten_pink: {
          DEFAULT: '#7d6f86',
          '100': '#19161b',
          '200': '#322d35',
          '300': '#4b4350',
          '400': '#64596b',
          '500': '#7d6f86',
          '600': '#978b9e',
          '700': '#b1a8b7',
          '800': '#cbc5cf',
          '900': '#e5e2e7',
        },
        ultra_violet: {
          DEFAULT: '#585191',
          '100': '#12101d',
          '200': '#232039',
          '300': '#353056',
          '400': '#464173',
          '500': '#585191',
          '600': '#746dad',
          '700': '#9791c1',
          '800': '#bab6d6',
          '900': '#dcdaea',
        },
        tekhelet: {
          DEFAULT: '#4f359b',
          '100': '#100b1f',
          '200': '#20153e',
          '300': '#2f205d',
          '400': '#3f2b7d',
          '500': '#4f359b',
          '600': '#694cc2',
          '700': '#8f78d1',
          '800': '#b4a5e0',
          '900': '#dad2f0',
        },
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
