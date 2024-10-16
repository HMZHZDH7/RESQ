import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#09101B',
        'background': '#F7FAFC',
        'primary': '#2C79DD',
        'secondary': '#81B3F3',
        'accent': '#4C98FA',
        'gray': {
          'light': "#E2E8F0",
          "dark": "#A0AEC0"
        }
      },
      fontSize: {
        sm: '0.750rem',
        base: '1rem',
        xl: '1.333rem',
        '2xl': '1.777rem',
        '3xl': '2.369rem',
        '4xl': '3.158rem',
        '5xl': '4.210rem',
      }
    },
  },
  plugins: [],
};
export default config;
