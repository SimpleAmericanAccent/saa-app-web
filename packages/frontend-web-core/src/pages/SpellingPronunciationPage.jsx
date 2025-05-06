import React, { useState, useEffect } from "react";
import ForceGraphNetwork from "../components/ForceGraphNetwork";
import wlsData from "frontend-web-core/src/data/wls-data.json";

const SpellingPronunciationPage = () => {
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    // Add overflow hidden to body and html
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.documentElement.style.overflow = "hidden";

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Transform WLS data into network format
    const nodes = [];
    const edges = [];
    let nodeId = 1;
    const spellingIdMap = new Map();

    // Process each vowel
    Object.entries(wlsData.vowels).forEach(([vowelName, vowelData]) => {
      // Add vowel node
      const vowelId = nodeId++;
      nodes.push({
        id: vowelId,
        type: "pronunciation",
        label: vowelName,
      });

      // Process spelling patterns for this vowel
      vowelData.spellings.forEach((spelling) => {
        let spellingId;

        // Reuse existing spelling node if pattern already exists
        if (spellingIdMap.has(spelling.pattern)) {
          spellingId = spellingIdMap.get(spelling.pattern);
        } else {
          // Create new spelling node
          spellingId = nodeId++;
          spellingIdMap.set(spelling.pattern, spellingId);
          nodes.push({
            id: spellingId,
            type: "spelling",
            label: spelling.pattern,
          });
        }

        // Add edge between vowel and spelling
        edges.push({
          from: vowelId,
          to: spellingId,
        });
      });
    });

    setNetworkData({ nodes, edges });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <ForceGraphNetwork data={networkData} />
    </div>
  );
};

export default SpellingPronunciationPage;
