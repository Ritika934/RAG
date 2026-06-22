// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",  // ✅ ADD THIS LINE
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}