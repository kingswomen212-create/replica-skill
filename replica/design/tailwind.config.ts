import type { Config } from "tailwindcss";

// Maps replica/design/tokens.json into Tailwind's theme, by role, so
// components use `bg-surface text-muted` rather than raw hex. Regenerate
// by hand if tokens.json changes until a build step does it automatically.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: "var(--color-border)",
        "border-input": "var(--color-border-input)",
        text: "var(--color-text)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "on-accent": "var(--color-on-accent)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      // Point straight at the font loader's variable (e.g. next/font's
      // --font-geist-sans) rather than through an intermediate --font-sans
      // custom property — see tokens.css's note on why.
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["var(--text-xs-size)", { lineHeight: "var(--text-xs-line)" }],
        sm: ["var(--text-sm-size)", { lineHeight: "var(--text-sm-line)" }],
        base: ["var(--text-base-size)", { lineHeight: "var(--text-base-line)" }],
        lg: ["var(--text-lg-size)", { lineHeight: "var(--text-lg-line)" }],
        xl: ["var(--text-xl-size)", { lineHeight: "var(--text-xl-line)" }],
        display: ["var(--text-display-size)", { lineHeight: "var(--text-display-line)" }],
        "display-lg": ["var(--text-display-lg-size)", { lineHeight: "var(--text-display-lg-line)" }],
      },
      spacing: {
        0: "var(--space-0)", 1: "var(--space-1)", 2: "var(--space-2)",
        3: "var(--space-3)", 4: "var(--space-4)", 5: "var(--space-5)",
        6: "var(--space-6)", 7: "var(--space-7)", 8: "var(--space-8)",
        9: "var(--space-9)",
      },
      borderRadius: {
        sm: "var(--radius-sm)", md: "var(--radius-md)",
        lg: "var(--radius-lg)", pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)", pop: "var(--shadow-pop)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)", base: "var(--motion-base)",
      },
      transitionTimingFunction: {
        token: "var(--motion-ease)",
      },
    },
  },
} satisfies Config;
