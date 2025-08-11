import type { PowerlineConfig } from "../types/config";

export const DEFAULT_CONFIG: PowerlineConfig = {
  theme: "dark",
  display: {
    lines: [
      {
        segments: {
          directory: { enabled: true },
          git: {
            enabled: true,
            showSha: false,
          },
          model: { enabled: true },
          session: { enabled: true, type: "tokens" },
          today: { enabled: true, type: "both" },
          block: { enabled: false, type: "cost" },
          tmux: { enabled: false },
        },
      },
    ],
  },
  colors: {
    light: {
      directory: { bg: "#ff6b47", fg: "#ffffff" },
      git: { bg: "#4fb3d9", fg: "#ffffff" },
      model: { bg: "#87ceeb", fg: "#000000" },
      session: { bg: "#da70d6", fg: "#ffffff" },
      today: { bg: "#90ee90", fg: "#ffffff" },
      block: { bg: "#ff8c00", fg: "#ffffff" },
      tmux: { bg: "#32cd32", fg: "#ffffff" },
    },
    dark: {
      directory: { bg: "#8b4513", fg: "#ffffff" },
      git: { bg: "#404040", fg: "#ffffff" },
      model: { bg: "#2d2d2d", fg: "#ffffff" },
      session: { bg: "#202020", fg: "#00ffff" },
      today: { bg: "#1c1c1c", fg: "#ffffff" },
      block: { bg: "#8b4500", fg: "#ffffff" },
      tmux: { bg: "#2f4f2f", fg: "#90ee90" },
    },
    custom: {
      directory: { bg: "#ff6600", fg: "#ffffff" },
      git: { bg: "#0066cc", fg: "#ffffff" },
      model: { bg: "#9900cc", fg: "#ffffff" },
      session: { bg: "#cc0099", fg: "#ffffff" },
      today: { bg: "#00cc66", fg: "#000000" },
      block: { bg: "#cc6600", fg: "#ffffff" },
      tmux: { bg: "#228b22", fg: "#ffffff" },
    },
  },
  budget: {
    session: {
      warningThreshold: 80,
    },
    today: {
      amount: 50,
      warningThreshold: 80,
    },
  },
};
