/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './components/**/*.{js,ts,jsx,tsx}',
        './contexts/**/*.{js,ts,jsx,tsx}',
        './hooks/**/*.{js,ts,jsx,tsx}',
        // DESIGN SYSTEM - src for dev, dist for prod
        './node_modules/@voxco/design-system/src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@voxco/design-system/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
