import { colors, heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: "#6a3cd6",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#6A3CD6",
            },
            success: {
              DEFAULT: "#05DD6B",
            },
            danger: {
              DEFAULT: "#F31260",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#6A3CD6",
            },
            success: {
              DEFAULT: "#05DD6B",
            },
            danger: {
              DEFAULT: "#F31260",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
