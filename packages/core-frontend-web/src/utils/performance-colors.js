// Performance color definitions - single source of truth with gradients
export const PERFORMANCE_LEVELS = {
  PERFECT: {
    min: 100,
    max: 100,
    label: "100%",
    color: "green",
    textClass: "text-green-500",
    borderClass: "border-green-500",
    bgClass: "bg-green-500",
  },
  GOOD: {
    min: 80,
    max: 99,
    label: "80%+",
    color: "blue",
    textClass: "text-blue-500",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-500",
  },
  FAIR: {
    min: 60,
    max: 79,
    label: "60%+",
    color: "yellow",
    textClass: "text-yellow-500",
    borderClass: "border-yellow-500",
    bgClass: "bg-yellow-500",
  },
  NEEDS_PRACTICE: {
    min: 0,
    max: 59,
    label: "<60%",
    color: "red",
    textClass: "text-red-500",
    borderClass: "border-red-500",
    bgClass: "bg-red-500",
  },
};

// Color definitions for gradient calculation
const GRADIENT_COLORS = {
  red: { r: 239, g: 68, b: 68 }, // red-500
  yellow: { r: 234, g: 179, b: 8 }, // yellow-500
  green: { r: 34, g: 197, b: 94 }, // green-500
};

// Calculate gradient color between two colors based on percentage
const interpolateColor = (color1, color2, percentage) => {
  const r = Math.round(color1.r + (color2.r - color1.r) * percentage);
  const g = Math.round(color1.g + (color2.g - color1.g) * percentage);
  const b = Math.round(color1.b + (color2.b - color1.b) * percentage);
  return `rgb(${r}, ${g}, ${b})`;
};

// Get gradient color for a percentage
const getGradientColor = (percentage) => {
  if (percentage <= 60) {
    return interpolateColor(GRADIENT_COLORS.red, GRADIENT_COLORS.red, 0);
  } else if (percentage <= 80) {
    // Interpolate between red and yellow (60-80%)
    const progress = (percentage - 60) / 20; // 0 to 1
    return interpolateColor(
      GRADIENT_COLORS.red,
      GRADIENT_COLORS.yellow,
      progress
    );
  } else {
    // Interpolate between yellow and green (80-100%)
    const progress = (percentage - 80) / 20; // 0 to 1
    return interpolateColor(
      GRADIENT_COLORS.yellow,
      GRADIENT_COLORS.green,
      progress
    );
  }
};

// Get performance level for a given percentage (for backward compatibility)
export const getPerformanceLevel = (percentage) => {
  if (percentage >= 100) return PERFORMANCE_LEVELS.PERFECT;
  if (percentage >= 80) return PERFORMANCE_LEVELS.GOOD;
  if (percentage >= 60) return PERFORMANCE_LEVELS.FAIR;
  return PERFORMANCE_LEVELS.NEEDS_PRACTICE;
};

// Get text color class for a percentage (using gradient)
export const getTextColorClass = (percentage) => {
  if (percentage <= 60) return "text-red-500";
  if (percentage <= 80) return "text-yellow-500";
  return "text-green-500";
};

// Get border color class for a percentage (using gradient)
export const getBorderColorClass = (percentage) => {
  if (percentage <= 60) return "border-red-500";
  if (percentage <= 80) return "border-yellow-500";
  return "border-green-500";
};

// Get background color class for a percentage (using gradient)
export const getBgColorClass = (percentage) => {
  if (percentage <= 60) return "bg-red-500";
  if (percentage <= 80) return "bg-yellow-500";
  return "bg-green-500";
};

// Get gradient color style for a percentage
export const getGradientColorStyle = (percentage) => {
  const color = getGradientColor(percentage);
  return { color };
};

// Get gradient border style for a percentage
export const getGradientBorderStyle = (percentage) => {
  const color = getGradientColor(percentage);
  return { borderColor: color };
};

// Get subdued gradient border style for a percentage (when fewer than 30 trials)
export const getSubduedGradientBorderStyle = (percentage) => {
  const color = getGradientColor(percentage);
  // Convert to HSL to make it more subdued
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  // Make it more subdued by reducing lightness and saturation
  const subduedL = Math.max(0.3, (l / 255) * 0.6); // Reduce lightness to 60%
  const subduedS = 0.3; // Reduce saturation to 30%

  // Convert back to RGB (simplified conversion)
  const factor = 0.3; // Overall reduction factor
  const subduedR = Math.round(r * factor);
  const subduedG = Math.round(g * factor);
  const subduedB = Math.round(b * factor);

  return { borderColor: `rgb(${subduedR}, ${subduedG}, ${subduedB})` };
};

// Get subdued gradient color style for a percentage (when fewer than 30 trials)
export const getSubduedGradientColorStyle = (percentage) => {
  const color = getGradientColor(percentage);
  // Convert to HSL to make it more subdued
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  // Make it more subdued by reducing lightness and saturation
  const subduedL = Math.max(0.3, (l / 255) * 0.6); // Reduce lightness to 60%
  const subduedS = 0.3; // Reduce saturation to 30%

  // Convert back to RGB (simplified conversion)
  const factor = 0.5; // Overall reduction factor
  const subduedR = Math.round(r * factor);
  const subduedG = Math.round(g * factor);
  const subduedB = Math.round(b * factor);

  return { color: `rgb(${subduedR}, ${subduedG}, ${subduedB})` };
};

// Get gradient background style for a percentage
export const getGradientBgStyle = (percentage) => {
  const color = getGradientColor(percentage);
  return { backgroundColor: color };
};

// Get performance message for a percentage
export const getPerformanceMessage = (percentage) => {
  const level = getPerformanceLevel(percentage);

  switch (level) {
    case PERFORMANCE_LEVELS.PERFECT:
      return "Perfect! You've mastered this sound distinction!";
    case PERFORMANCE_LEVELS.GOOD:
      return "Good work! You have a solid grasp of this distinction.";
    case PERFORMANCE_LEVELS.FAIR:
      return "Fair performance. More practice will help you improve.";
    case PERFORMANCE_LEVELS.NEEDS_PRACTICE:
      return "This distinction needs more practice. Don't give up!";
    default:
      return "Keep practicing!";
  }
};

// Get performance level name for a percentage
export const getPerformanceLevelName = (percentage) => {
  const level = getPerformanceLevel(percentage);

  switch (level) {
    case PERFORMANCE_LEVELS.PERFECT:
      return "Perfect";
    case PERFORMANCE_LEVELS.GOOD:
      return "Good";
    case PERFORMANCE_LEVELS.FAIR:
      return "Fair";
    case PERFORMANCE_LEVELS.NEEDS_PRACTICE:
      return "Needs Practice";
    default:
      return "Unknown";
  }
};

// Generate gradient number line legend
export const getGradientNumberLineLegend = () => {
  return {
    gradientStyle: {
      background: `linear-gradient(to right, 
        ${getGradientColor(0)} 0%, 
        ${getGradientColor(30)} 30%, 
        ${getGradientColor(60)} 60%, 
        ${getGradientColor(80)} 80%, 
        ${getGradientColor(100)} 100%)`,
      height: "8px",
      borderRadius: "4px",
      position: "relative",
      marginBottom: "8px",
    },
    markers: [
      { percentage: 0, label: "0%", left: "0%" },
      { percentage: 60, label: "60%", left: "60%" },
      { percentage: 80, label: "80%", left: "80%" },
      { percentage: 100, label: "100%", left: "100%" },
    ],
  };
};

// Helper function to get quiz card text color class and style
export const getQuizCardTextProps = (previousResult, isConsonant = false) => {
  const baseClass = isConsonant
    ? "text-[11px] sm:text-xs font-bold mt-1"
    : "text-xs font-bold mt-1";

  if (!previousResult) {
    return {
      className: `${baseClass} text-muted-foreground`,
      style: {},
    };
  }

  // Check if we have enough trials for reliable statistics
  const totalTrials =
    previousResult.recentTotalTrials || previousResult.totalTrials || 0;
  const percentage =
    previousResult.recentPercentage || previousResult.percentage;

  if (totalTrials >= 30) {
    return {
      className: baseClass,
      style: getGradientColorStyle(percentage),
    };
  } else {
    return {
      className: baseClass,
      style: getSubduedGradientColorStyle(percentage),
    };
  }
};
