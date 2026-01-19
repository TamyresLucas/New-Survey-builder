import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				// Bridge variable for maximum safety
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
				// New semantic families
				heading: ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
				body: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// ARRAY SYNTAX: [Size, { lineHeight }] - CRITICAL for vertical rhythm
				xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-tight)' }],
				sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
				base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
				lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-snug)' }],
				xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-snug)' }],
				'2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
				'3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
				'4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
			},
			fontWeight: {
				normal: 'var(--font-weight-normal)',
				medium: 'var(--font-weight-medium)',
				semibold: 'var(--font-weight-semibold)',
				bold: 'var(--font-weight-bold)',
				extrabold: 'var(--font-weight-extrabold)',
			},
			lineHeight: {
				none: 'var(--line-height-none)',
				tight: 'var(--line-height-tight)',
				snug: 'var(--line-height-snug)',
				normal: 'var(--line-height-normal)',
				relaxed: 'var(--line-height-relaxed)',
				loose: 'var(--line-height-loose)',
			},
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					hover: 'var(--secondary-hover)',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					background: 'var(--background-destructive)',
					border: 'var(--border-destructive)'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					background: 'var(--background-success)',
					border: 'var(--border-success)'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					background: 'var(--background-warning)',
					border: 'var(--border-warning)'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
					background: 'var(--background-info)',
					border: 'var(--border-info)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				disabled: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--disabled-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},

			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',

			}
		}
	},
	plugins: [tailwindcssAnimate],
}
