// Exam shared components
export { StatusBadge, type TestStatus } from "./StatusBadge";
export { DifficultyBadge, type Difficulty } from "./DifficultyBadge";
export { StatsCard } from "./StatsCard";

// Exam theme - Direct values for MUI compatibility
// CSS variables defined in globals.css for Tailwind usage
// Colors synced with TopNavBar: #22c55e, #16a34a, #15803d
export const examTheme = {
  // Gradients - use with `background` property
  gradients: {
    primary: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    primaryLight: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
    primaryDark: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    secondary: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)",
    accent: "linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)",
    accentLight: "linear-gradient(135deg, #86efac 0%, #4ade80 100%)",
    hero: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
    heroLight: "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)",
    card: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
  },

  // Solid colors
  colors: {
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primaryLight: "#4ade80",
    primaryLighter: "#86efac",
    text: "#15803d",
    textLight: "#16a34a",
    bg: "#f0fdf4",
    bgLight: "#f8fdfb",
    bgDark: "#ecfdf5",
    border: "#bbf7d0",
    borderLight: "#e5e7eb",
  },

  // Shadows
  shadows: {
    card: "0 10px 40px rgba(0,0,0,0.08)",
    cardHover: "0 8px 30px rgba(34, 197, 94, 0.15)",
    button: "0 8px 20px rgba(0,0,0,0.2)",
  },
};

