/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F19",
          card: "#151C2C",
          cardHover: "#1E293B",
          border: "#1E293B",
          accent: "#4F46E5",
        },
        real: {
          glow: "#10B981",
          bg: "rgba(16, 185, 129, 0.1)",
          text: "#34D399",
        },
        fake: {
          glow: "#EF4444",
          bg: "rgba(239, 68, 68, 0.1)",
          text: "#F87171",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(79, 70, 229, 0.3)',
        'glow-real': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-fake': '0 0 15px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
