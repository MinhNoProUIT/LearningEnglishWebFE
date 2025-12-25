// src/components/treasure-hunt/gameTheme.ts
// ==================== TREASURE HUNT GAME THEME ====================

export const gameTheme = {
  // Primary gradients
  gradients: {
    primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    primaryLight: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
    primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    gold: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    treasure: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)",
    cave: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    fog: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
    danger: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    gem: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    bigGem: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
  },

  // Solid colors
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
    gold: "#f59e0b",
    cave: "#451a03",
    fog: "#374151",
    danger: "#dc2626",
    gem: "#3b82f6",
    bigGem: "#9333ea",
    text: "#047857",
    textLight: "#059669",
    background: "#f0fdf4",
    cardBg: "#ffffff",
  },

  // Cell colors
  cells: {
    fog: {
      bg: "#1f2937",
      border: "#374151",
      icon: "❓",
    },
    hidden: {
      bg: "#78716c",
      border: "#57534e",
      icon: "🪨",
    },
    current: {
      bg: "#10b981",
      border: "#059669",
      icon: "⛏️",
    },
    revealed: {
      bg: "#d6d3d1",
      border: "#a8a29e",
      icon: "✓",
    },
    locked: {
      bg: "#7f1d1d",
      border: "#991b1b",
      icon: "🔒",
    },
  },

  // Cell type icons
  cellTypeIcons: {
    EMPTY: "🟫",
    QUESTION: "❓",
    SMALL_GEM: "💎",
    BIG_GEM: "💠",
    TRAP: "💣",
    TREASURE: "🏆",
  },

  // Item icons
  itemIcons: {
    TORCH: "🔦",
    SHIELD: "🛡️",
    DICTIONARY: "📖",
    COMPASS: "🧭",
    TIME_BOOST: "⏳",
  },

  // Shadows
  shadows: {
    card: "0 10px 40px rgba(0,0,0,0.08)",
    cardHover: "0 15px 50px rgba(16, 185, 129, 0.15)",
    cell: "0 4px 12px rgba(0,0,0,0.15)",
    cellHover: "0 6px 20px rgba(0,0,0,0.25)",
    glow: "0 0 20px rgba(16, 185, 129, 0.4)",
    goldGlow: "0 0 30px rgba(245, 158, 11, 0.5)",
  },

  // Border radius
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },

  // Difficulty colors
  difficulty: {
    EASY: {
      color: "#10b981",
      bg: "#d1fae5",
      label: "Dễ",
    },
    MEDIUM: {
      color: "#f59e0b",
      bg: "#fef3c7",
      label: "Trung bình",
    },
    HARD: {
      color: "#ef4444",
      bg: "#fee2e2",
      label: "Khó",
    },
  },

  // Star colors
  stars: {
    1: "#9ca3af",
    2: "#60a5fa",
    3: "#fbbf24",
  },

  // Animation durations
  animations: {
    fast: "0.15s",
    normal: "0.3s",
    slow: "0.5s",
    bounce: "0.6s",
  },
};

export default gameTheme;
