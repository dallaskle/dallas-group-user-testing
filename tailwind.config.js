/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        ring: 'hsl(var(--ring))',
        // Primary Colors
        'forest': {
          DEFAULT: '#2D4F3C',
          light: '#3A6B4F',
          dark: '#1F3829',
        },
        'slate': {
          DEFAULT: '#708090',
          light: '#8D99A6',
          dark: '#566A7F',
        },
        'stone': {
          DEFAULT: '#9A8478',
          light: '#B19C8F',
          dark: '#7D6A60',
        },
        // Accent Colors
        'copper': {
          DEFAULT: '#B87333',
          light: '#D48B45',
          dark: '#955B2A',
        },
        'sage': {
          DEFAULT: '#B2BEB5',
          light: '#C5CEC8',
          dark: '#96A499',
        },
        'ice': {
          DEFAULT: '#A5D8DD',
          light: '#BFE5E9',
          dark: '#8BCCD2',
        },
        // Background Colors
        'pearl': {
          DEFAULT: '#F5F5F1',
          light: '#FFFFFF',
          dark: '#E8E8E4',
        },
        'charcoal': {
          DEFAULT: '#2F4F4F',
          light: '#3A5F5F',
          dark: '#243F3F',
        },
        'clay': {
          DEFAULT: '#E6D5C7',
          light: '#F2E4D8',
          dark: '#D9C4B5',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        display: ['Tenor Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        'natural': {
          sm: '0.75rem',
          md: '1.25rem',
          lg: '2rem',
          xl: '3.25rem',
        },
      },
      boxShadow: {
        'natural': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
            },
            strong: {
              color: 'inherit',
            },
            hr: {
              borderColor: 'inherit',
            },
            code: {
              color: 'inherit',
            },
            pre: {
              color: 'inherit',
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}

