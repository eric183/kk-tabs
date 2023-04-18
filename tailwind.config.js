/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ["./src/**/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      margin: {
        1.5: "6px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
      },
      width: {
        5: "20px",
      },
      height: {
        4: "16px",
      },
      lineHeight: {
        6: "24px",
        10: "40px",
      },
      padding: {
        10: "40px",
        2: "8px",
        4: "16px",
      },
      borderRadius: {
        md: "6px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
