/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@voxco/design-system/src/**/*.{js,ts,jsx,tsx}", // For the installed package
        "./packages/design-system/src/**/*.{js,ts,jsx,tsx}" // CRITICAL: For local dev hot-reloading
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
