/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                neon: {
                    cyan: '#00fff9',
                    pink: '#ff00e5',
                    purple: '#bf00ff',
                    blue: '#0066ff',
                },
                cyber: {
                    dark: '#0a0a0f',
                    darker: '#050507',
                    card: 'rgba(15, 15, 25, 0.8)',
                }
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
                'spin-slow': 'spin-slow 3s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { textShadow: '0 0 10px #00fff9, 0 0 20px #00fff9' },
                    '100%': { textShadow: '0 0 20px #ff00e5, 0 0 30px #ff00e5' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                scan: {
                    '0%': { backgroundPosition: '0% 0%' },
                    '100%': { backgroundPosition: '200% 0%' },
                },
                'spin-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}