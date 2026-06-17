import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  presets: [presetWind4({ dark: "media", preflights: { reset: true } })],
  theme: {
    colors: {
      heading: "var(--text-h)",
      background: "var(--bg)",
      border: "var(--border)",
      code: "var(--code-bg)",
      accent: "var(--accent)",
      success: "var(--success)",
      warning: "var(--warning)",
      error: "var(--error)",
    },
  },
});
