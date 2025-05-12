import { useState, useMemo } from "react";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "core-frontend-web/src/components/ui/dropdown-menu";

// Define the grid structure and groupings
const VOWEL_GROUPS = [
  ["FLEECE", "GOOSE", "FACE"],
  ["KIT", "FOOT", "PRICE"],
  ["DRESS", "STRUT", "CHOICE"],
  ["TRAP", "LOT", "GOAT"],
  [null, null, "MOUTH"],
];

const CONSONANT_GROUPS = [
  ["P", "T", "K", "CH"],
  ["B", "D", "G", "J"],
  ["F", "TH", "S", "SH", "H"],
  ["V", "DH", "Z", "ZH"],
  ["L", "R", "W", "Y"],
  ["M", "N", "NG", null, "misc"],
];

const cellStyle = {
  minWidth: 60,
  maxWidth: 60,
  width: 60,
  minHeight: 28,
  textAlign: "center",
  background: "#222",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: 4,
  fontWeight: "bold",
  fontSize: 12,
  margin: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

// Example: grid label => target name in your data
const PHONEME_TO_TARGET = {
  FLEECE: "FLEECE",
  GOOSE: "GOOSE",
  FACE: "FACE",
  KIT: "KIT",
  FOOT: "FOOT",
  PRICE: "PRICE",
  DRESS: "DRESS",
  STRUT: "STRUT",
  CHOICE: "CHOICE",
  TRAP: "TRAP",
  LOT: "LOT",
  GOAT: "GOAT",
  MOUTH: "MOUTH",
  P: "P",
  T: "T",
  K: "K",
  CH: "CH",
  B: "B",
  D: "D",
  G: "G",
  J: "J",
  F: "F",
  TH: "THu",
  S: "S",
  SH: "SH",
  H: "H",
  V: "V",
  DH: "THv",
  Z: "Z",
  ZH: "ZH",
  L: "L",
  R: "R",
  W: "W",
  Y: "Y",
  M: "M",
  N: "N",
  NG: "NG",
  misc: "misc",
  // If your target names are different, map accordingly:
  // "CH": "Affricate_CH",
  // "TH": "Theta",
  // etc.
};

export default function PhonemeGridSummary({
  issueWordMap,
  issues,
  targetCounts,
  stats,
  selectedIssues,
  setSelectedIssues,
  issuesData,
}) {
  const [displayMode, setDisplayMode] = useState("heatmap"); // "count" | "percent" | "heatmap"
  const [highlightTop, setHighlightTop] = useState(0); // 0 = none, 3 = top 3, 5 = top 5
  const [hideZero, setHideZero] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null); // for click-to-filter
  const [includeMisc, setIncludeMisc] = useState(false); // Add this new state

  // Calculate adjusted counts and max count excluding misc if needed
  const { adjustedCounts, maxCount } = useMemo(() => {
    const counts = { ...targetCounts };
    if (!includeMisc) {
      delete counts.misc;
    }
    const max = Math.max(...Object.values(counts), 1);
    return { adjustedCounts: counts, maxCount: max };
  }, [targetCounts, includeMisc]);

  // Calculate totalAnnotations excluding misc if needed
  const totalAnnotations = useMemo(() => {
    if (includeMisc) return stats.annotatedWords;

    // Calculate total excluding misc
    const miscCount = targetCounts["misc"] || 0;
    return stats.annotatedWords - miscCount;
  }, [stats.annotatedWords, targetCounts, includeMisc]);

  // For sorting/highlighting
  const sortedGroups = Object.entries(targetCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([group]) => group);

  const topGroups = highlightTop > 0 ? sortedGroups.slice(0, highlightTop) : [];

  const isTargetSelected = (label) => {
    const targetName = PHONEME_TO_TARGET[label] || label;
    const target = issuesData.find((t) => t.name === targetName);
    if (!target) return false;
    return target.issues.every((issue) => selectedIssues[issue.id]);
  };

  const isTargetPartiallySelected = (label) => {
    const targetName = PHONEME_TO_TARGET[label] || label;
    const target = issuesData.find((t) => t.name === targetName);
    if (!target) return false;
    const selectedCount = target.issues.filter(
      (issue) => selectedIssues[issue.id]
    ).length;
    return selectedCount > 0 && selectedCount < target.issues.length;
  };

  const handlePhonemeClick = (label) => {
    const targetName = PHONEME_TO_TARGET[label] || label;
    const target = issuesData.find((t) => t.name === targetName);
    if (!target) return;
    const allSelected = isTargetSelected(label);
    const updated = { ...selectedIssues };
    target.issues.forEach((issue) => {
      updated[issue.id] = !allSelected;
    });
    setSelectedIssues(updated);
  };

  // Helper to render a cell
  const renderCell = (label, idx) => {
    if (!label)
      return (
        <div
          key={`empty-${idx}`}
          style={{ visibility: "hidden", ...cellStyle }}
        />
      );
    const targetName = PHONEME_TO_TARGET[label];
    const count = targetName ? targetCounts[targetName] || 0 : 0;
    // Calculate color factor - treat misc as zero when includeMisc is false
    const colorCount = label === "misc" && !includeMisc ? 0 : count;
    const factor = colorCount / maxCount;
    const percent = totalAnnotations
      ? Math.round((count / totalAnnotations) * 100)
      : 0;
    if (hideZero && count === 0) {
      return (
        <div
          key={`empty-${idx}`}
          style={{ visibility: "hidden", ...cellStyle }}
        />
      );
    }

    // Display value
    let displayValue = "";
    if (displayMode === "count") displayValue = count;
    else if (displayMode === "percent")
      displayValue = totalAnnotations
        ? Math.round((count / totalAnnotations) * 100) + "%"
        : "0%";
    else displayValue = ""; // For heatmap, you may want to use color only

    // Heatmap color
    // let background = "#222";
    // if (displayMode === "heatmap" && totalAnnotations) {
    //   const intensity = Math.round(
    //     (count / Math.max(...Object.values(targetCounts), 1)) * 200
    //   );
    //   background = `rgb(${255 - intensity},${255 - intensity},255)`; // blueish heatmap
    // }

    // Helper: interpolate between two colors
    function interpolateColor(color1, color2, factor) {
      const result = color1.slice();
      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
      }
      return `rgb(${result.join(",")})`;
    }

    const minColor = [255, 255, 200]; // light yellow
    const maxColor = [255, 80, 0]; // strong orange/red
    const background = interpolateColor(minColor, maxColor, factor);
    const textColor = factor > 0.5 ? "#fff" : "#222";

    // Highlight
    const isHighlighted = topGroups.includes(targetName);

    return (
      <div
        key={label || `empty-${idx}`}
        style={{
          ...cellStyle,
          background,
          color: textColor,
          border: isTargetSelected(label)
            ? "2px solid gold"
            : isTargetPartiallySelected(label)
            ? "2px dashed orange"
            : "1px solid #444",
          cursor: "pointer",
          opacity:
            !isTargetSelected(label) && !isTargetPartiallySelected(label)
              ? 0.3
              : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 0, // Add some top padding for the label
        }}
        title={`${label}: ${count} (${percent}%)`}
        onClick={() => handlePhonemeClick(label)}
      >
        {/* Centered label */}
        <div
          style={{
            minHeight: 20, // <-- adjust as needed (try 20-24px)
            marginBottom: "auto",
            fontSize: 14,
            lineHeight: 1.1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {label}
        </div>
        {/* Lower left: count */}
        <div
          style={{
            position: "absolute",
            left: 4,
            bottom: 2,
            fontSize: 10,
            fontWeight: "normal",
            opacity: 0.85,
          }}
        >
          {count}
        </div>
        {/* Lower right: percent */}
        <div
          style={{
            position: "absolute",
            right: 4,
            bottom: 2,
            fontSize: 10,
            fontWeight: "normal",
            opacity: 0.85,
          }}
        >
          {percent}%
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Options dropdown in top-right */}
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <Settings size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={hideZero}
              onCheckedChange={setHideZero}
            >
              Hide Zero-Annotation Cells
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={includeMisc}
              onCheckedChange={setIncludeMisc}
            >
              Include Misc in Totals
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {/* Vowel grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {VOWEL_GROUPS.flat().map((label, idx) => renderCell(label, idx))}
        </div>
        {/* Consonant grid */}
        <div>
          {CONSONANT_GROUPS.map((row, i) => (
            <div key={i} style={{ display: "flex" }}>
              {row.map((cell, j) => (
                <div key={j} style={{ margin: 1 }}>
                  {renderCell(cell)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
