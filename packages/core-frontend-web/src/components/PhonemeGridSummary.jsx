import React from "react";

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
  ["M", "N", "NG"],
];

const vowelCellStyle = {
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
};

// Example: mapping issue names to groups (you'll want to refine this)
const ISSUE_TO_GROUP = {
  // "issueName": "FLEECE", etc.
};

export default function PhonemeGridSummary({ issueWordMap, issues }) {
  // Count annotations per group
  const groupCounts = {};
  issues.forEach((issue) => {
    const group = ISSUE_TO_GROUP[issue.name];
    if (!group) return;
    groupCounts[group] =
      (groupCounts[group] || 0) + (issueWordMap[issue.id]?.length || 0);
  });

  // Helper to render a cell
  const renderCell = (label) =>
    label ? (
      <div
        style={{
          minWidth: 40,
          minHeight: 24,
          textAlign: "center",
          background: groupCounts[label] ? "#ffd700" : "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 4,
          fontWeight: "bold",
          fontSize: 12,
        }}
        title={groupCounts[label] ? `${groupCounts[label]} annotations` : ""}
      >
        {label}
        {groupCounts[label] ? (
          <span style={{ fontSize: 10 }}> ({groupCounts[label]})</span>
        ) : (
          ""
        )}
      </div>
    ) : (
      <div />
    );

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Vowel grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
        }}
      >
        {VOWEL_GROUPS.flat().map((label, idx) => (
          <div
            key={idx}
            style={{
              ...vowelCellStyle,
              visibility: label ? "visible" : "hidden", // Hide null cells but keep their space
            }}
          >
            {label || ""}
          </div>
        ))}
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
  );
}
