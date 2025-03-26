import { useTheme } from "@/components/theme-provider";

export default function Stats() {
  const { theme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const baseUrl =
    "https://airtable.com/embed/appLislpXB2IAvxd3/shrqcDfgGWvtdMap2";

  return (
    <>
      <h1>Stats (across all Brazilian clients)</h1>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "533px",
        }}
      >
        <iframe
          className="airtable-embed"
          src={baseUrl}
          frameBorder="0"
          width="100%"
          height="100%"
          style={{
            background: "transparent",
            border: `1px solid ${isDark ? "#333" : "#ccc"}`,
            filter: isDark ? "invert(88%) hue-rotate(180deg)" : "none",
          }}
        ></iframe>
      </div>
    </>
  );
}
