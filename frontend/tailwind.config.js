/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d8ecff",
          500: "#1f7ae0",
          600: "#1764bd",
          700: "#144f94"
        }
      },
      boxShadow: {
        soft: "0 12px 28px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
