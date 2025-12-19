// Exam shared components
export { StatusBadge, type TestStatus } from "./StatusBadge";
export { DifficultyBadge, type Difficulty } from "./DifficultyBadge";
export { StatsCard } from "./StatsCard";

// Exam theme - Direct values for MUI compatibility
// CSS variables defined in globals.css for Tailwind usage
export const examTheme = {
  // Gradients - use with `background` property
  gradients: {
    primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    primaryLight: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
    primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    secondary: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)",
    accent: "linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)",
    accentLight: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
    hero: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
    heroLight: "linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)",
    card: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
  },

  // Solid colors
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
    primaryLighter: "#6ee7b7",
    text: "#047857",
    textLight: "#059669",
    bg: "#f0fdf4",
    bgLight: "#f8fdfb",
    bgDark: "#ecfdf5",
    border: "#d1fae5",
    borderLight: "#e5e7eb",
  },

  // Shadows
  shadows: {
    card: "0 10px 40px rgba(0,0,0,0.08)",
    cardHover: "0 8px 30px rgba(16, 185, 129, 0.12)",
    button: "0 8px 20px rgba(0,0,0,0.2)",
  },
};
