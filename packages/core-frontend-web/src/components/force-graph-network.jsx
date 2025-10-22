import React, { useCallback, useRef, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import wlsData from "core-frontend-web/src/data/wls-data.json";
import * as d3 from "d3";

// Custom Panel component
const Panel = ({ position, children, className }) => {
  const positionStyles = {
    "top-left": { top: 80, left: 10 },
    "top-right": { top: 80, right: 10 },
    "bottom-left": { bottom: 10, left: 10 },
  };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        zIndex: 1000,
      }}
      className={className}
    >
      {children}
    </div>
  );
};

const ForceGraphNetwork = ({ data }) => {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);

  // Force parameters state with values from working configuration
  const [chargeStrength, setChargeStrength] = useState(-2000);
  const [linkStrength, setLinkStrength] = useState(0.3);
  const [linkDistance, setLinkDistance] = useState(10);
  const [centeringForce, setCenteringForce] = useState(0.1);

  // Clean label helper function
  const cleanLabel = useCallback((label) => {
    if (!label) return "";
    return String(label)
      .replace(/^undefined:\s*/, "")
      .trim();
  }, []);

  // Transform and validate data
  const graphData = React.useMemo(() => {
    if (!data || !data.nodes || !data.edges) {
      return { nodes: [], links: [] };
    }

    // Create a map of all nodes for quick lookup
    const nodeMap = new Map(
      data.nodes.map((node) => {
        return [
          node.id,
          {
            ...node,
            label: cleanLabel(node.label),
            // Keep original ID, don't try to clean it
            id: node.id,
          },
        ];
      })
    );

    // Only create links between nodes that exist
    const validLinks = data.edges
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .map((edge) => ({
        source: edge.from,
        target: edge.to,
      }));

    // Calculate edge counts for each node
    const edgeCounts = new Map();
    validLinks.forEach((link) => {
      edgeCounts.set(link.source, (edgeCounts.get(link.source) || 0) + 1);
      edgeCounts.set(link.target, (edgeCounts.get(link.target) || 0) + 1);
    });

    // Add edge counts to nodes
    const nodesWithCounts = Array.from(nodeMap.values()).map((node) => ({
      ...node,
      edgeCount: edgeCounts.get(node.id) || 0,
    }));

    return {
      nodes: nodesWithCounts,
      links: validLinks,
    };
  }, [data, cleanLabel]);

  // Initialize graph
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return;

    const fg = fgRef.current;

    // Get max edges for scaling
    const maxEdges = Math.max(...graphData.nodes.map((n) => n.edgeCount));

    // Create the force simulation directly
    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "charge",
        d3.forceManyBody().strength((d) => {
          // Scale charge based on connections
          const connectionScale = 0.5 + 1.5 * (d.edgeCount / maxEdges); // 0.5x to 2x

          // Stronger repulsion between same type nodes
          const sameTypeNodes = graphData.nodes.filter(
            (n) => n.type === d.type
          ).length;
          const baseCharge =
            d.type === "pronunciation" ? chargeStrength * 1.5 : chargeStrength;

          return (
            baseCharge *
            (sameTypeNodes / graphData.nodes.length) *
            connectionScale
          );
        })
      )
      .force("center", d3.forceCenter(0, 0))
      .force(
        "collision",
        d3.forceCollide().radius((d) => {
          // Scale collision radius based on connections
          const baseSize = 45;
          const scale = 1 + 0.5 * (d.edgeCount / maxEdges);
          return baseSize * scale;
        })
      )
      .force(
        "x",
        d3.forceX().strength((d) => {
          // More connected nodes have stronger centering force
          const scale = 0.5 + 1.5 * (d.edgeCount / maxEdges); // 0.5x to 2x
          return centeringForce * scale;
        })
      )
      .force(
        "y",
        d3.forceY().strength((d) => {
          // More connected nodes have stronger centering force
          const scale = 0.5 + 1.5 * (d.edgeCount / maxEdges); // 0.5x to 2x
          return centeringForce * scale;
        })
      )
      .velocityDecay(0.7);

    // Add link force after nodes are initialized
    if (graphData.links.length) {
      simulation.force(
        "link",
        d3
          .forceLink(graphData.links)
          .id((d) => d.id)
          .distance((link) => {
            // Get the source and target nodes
            const source = graphData.nodes.find((n) => n.id === link.source.id);
            const target = graphData.nodes.find((n) => n.id === link.target.id);

            // If linking between different types (lex set to spelling), use shorter distance
            const baseDistance =
              source && target && source.type !== target.type
                ? linkDistance * 0.5 // Shorter distance for lex set - spelling connections
                : linkDistance * 2; // Longer distance for same-type connections

            // Scale distance based on average connection count of source and target
            const avgConnections =
              (source.edgeCount + target.edgeCount) / (2 * maxEdges);
            const distanceScale = 1 - 0.5 * avgConnections; // More connected = shorter distance (0.5x to 1x)

            return baseDistance * distanceScale;
          })
          .strength((link) => {
            // Get the source and target nodes
            const source = graphData.nodes.find((n) => n.id === link.source.id);
            const target = graphData.nodes.find((n) => n.id === link.target.id);

            // Base strength - stronger between different types
            const baseStrength =
              source && target && source.type !== target.type
                ? linkStrength * 2 // Stronger attraction between different types
                : linkStrength * 0.5; // Weaker attraction between same types

            // Scale strength based on average connection count of source and target
            const avgConnections =
              (source.edgeCount + target.edgeCount) / (2 * maxEdges);
            const strengthScale = 1 + avgConnections; // More connected = stronger attraction (1x to 2x)

            return baseStrength * strengthScale;
          })
      );
    }

    // Update the ForceGraph's forces
    fg.d3Force("charge", simulation.force("charge"));
    fg.d3Force("center", simulation.force("center"));
    fg.d3Force("collision", simulation.force("collision"));
    fg.d3Force("x", simulation.force("x"));
    fg.d3Force("y", simulation.force("y"));
    fg.d3Force("link", simulation.force("link"));

    // Set initial zoom to fit content
    setTimeout(() => {
      fg.zoomToFit(400, 75);
    }, 100);

    // Handle window resize
    const handleResize = () => {
      fg.zoomToFit(400, 75);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [graphData, chargeStrength, linkStrength, linkDistance, centeringForce]);

  // Get examples for a node and its connections
  const getRelatedExamples = useCallback(
    (node, connectedNodes) => {
      if (!node) return [];

      // Get the connected node objects - convert Set to Array before mapping
      const connectedNodeObjects = Array.from(connectedNodes)
        .map((id) => graphData.nodes.find((n) => n.id === id))
        .filter(Boolean);

      if (node.type === "pronunciation") {
        // For pronunciation nodes (lexical sets), show examples for each connected spelling
        const vowelData = wlsData.vowels[cleanLabel(node.label)];
        if (!vowelData) return [];

        // Only show spellings that are in our connected nodes
        const connectedSpellings = connectedNodeObjects.map((n) =>
          cleanLabel(n.label)
        );
        return vowelData.spellings
          .filter((spelling) => connectedSpellings.includes(spelling.pattern))
          .map((spelling) => ({
            nodeId: connectedNodeObjects.find(
              (n) => cleanLabel(n.label) === spelling.pattern
            ).id,
            pattern: spelling.pattern,
            example: spelling.examples[0] || "",
          }));
      } else {
        // For spelling nodes, show examples from each connected lexical set
        const examples = [];
        connectedNodeObjects.forEach((connectedNode) => {
          const vowelData = wlsData.vowels[cleanLabel(connectedNode.label)];
          if (vowelData) {
            const spelling = vowelData.spellings.find(
              (s) => s.pattern === cleanLabel(node.label)
            );
            if (spelling && spelling.examples.length > 0) {
              examples.push({
                nodeId: connectedNode.id,
                lexSet: cleanLabel(connectedNode.label),
                example: spelling.examples[0],
              });
            }
          }
        });
        return examples;
      }
    },
    [graphData.nodes, cleanLabel]
  );

  // Draw a tooltip for a specific node
  const drawTooltip = useCallback(
    (ctx, node, examples, offsetY = 0) => {
      const fontSize = 14;
      const padding = 8;
      ctx.font = `${fontSize}px Sans-Serif`;

      // Just take one example if we have multiple
      const example = examples[0];
      if (!example) return 0;

      // Format the example text - just show the example word without labels/colons
      const tooltipText = example.example;

      // Calculate dimensions for tooltip
      const lineHeight = fontSize + 4;
      const textWidth = ctx.measureText(tooltipText).width;
      const exampleBoxWidth = textWidth + 2 * padding;
      const exampleBoxHeight = lineHeight + padding * 2;

      // Get node dimensions for positioning
      const label = `${cleanLabel(node.label)} (${node.edgeCount})`;
      const nodeTextWidth = ctx.measureText(label).width;
      const nodeBoxWidth = nodeTextWidth + 2 * padding;
      const nodeBoxHeight = fontSize + 2 * padding;

      // Add shadow to tooltip
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;

      const isDarkMode = document.documentElement.classList.contains("dark");
      // Draw tooltip background with slight transparency
      ctx.fillStyle = isDarkMode ? "rgba(30,41,59,0.95)" : "rgba(0,0,0,0.9)"; // slate-800 for dark mode
      const tooltipY =
        node.y - nodeBoxHeight / 2 - exampleBoxHeight - 5 + offsetY;
      ctx.fillRect(
        node.x - exampleBoxWidth / 2,
        tooltipY,
        exampleBoxWidth,
        exampleBoxHeight
      );

      // Reset shadow for text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw tooltip text
      ctx.fillStyle = "#fff"; // Always white text for better contrast
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tooltipText, node.x, tooltipY + exampleBoxHeight / 2);

      return exampleBoxHeight + 5; // Return height for stacking
    },
    [cleanLabel]
  );

  // Get connected nodes for a given node
  const getConnectedNodeIds = useCallback(
    (node) => {
      if (!node) return new Set();
      const connectedIds = new Set();
      graphData.links.forEach((link) => {
        if (link.source.id === node.id) {
          connectedIds.add(link.target.id);
        } else if (link.target.id === node.id) {
          connectedIds.add(link.source.id);
        }
      });
      return connectedIds;
    },
    [graphData.links]
  );

  // Get node color based on type and connection status
  const getNodeColor = useCallback(
    (node, isConnected, isHovered) => {
      // Calculate color intensity based on number of connections
      const maxEdges = Math.max(...graphData.nodes.map((n) => n.edgeCount));
      const intensity = 0.4 + 0.6 * (node.edgeCount / maxEdges); // Range from 40% to 100% intensity

      let baseColor;
      const isDarkMode = document.documentElement.classList.contains("dark");

      if (node.type === "spelling") {
        baseColor = isDarkMode ? d3.rgb(34, 197, 94) : d3.rgb(76, 175, 80); // green-500/green-400
      } else {
        baseColor = isDarkMode ? d3.rgb(59, 130, 246) : d3.rgb(33, 150, 243); // blue-500/blue-400
      }

      // Dim unconnected nodes when hovering
      if (hoveredNode && !isConnected && !isHovered) {
        const dimColor = isDarkMode ? 50 : 255;
        return d3
          .rgb(
            baseColor.r * 0.6 + dimColor * 0.4,
            baseColor.g * 0.6 + dimColor * 0.4,
            baseColor.b * 0.6 + dimColor * 0.4
          )
          .toString();
      }

      // Adjust color intensity based on connections
      return d3
        .rgb(
          baseColor.r * intensity,
          baseColor.g * intensity,
          baseColor.b * intensity
        )
        .toString();
    },
    [graphData.nodes, hoveredNode]
  );

  // Update link colors for dark mode
  const getLinkColor = useCallback(
    (link) => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      if (!hoveredNode) return isDarkMode ? "#666" : "#999";
      return link.source.id === hoveredNode.id ||
        link.target.id === hoveredNode.id
        ? isDarkMode
          ? "#ccc"
          : "#333"
        : isDarkMode
        ? "#333"
        : "#eee";
    },
    [hoveredNode]
  );

  // Calculate node size based on connections
  const getNodeSize = useCallback(
    (node) => {
      const fontSize = 14;
      const padding = 8;
      const baseHeight = fontSize + 2 * padding;

      // Scale factor based on connections (1 to 1.5)
      const maxEdges = Math.max(...graphData.nodes.map((n) => n.edgeCount));
      const scale = 1 + 0.5 * (node.edgeCount / maxEdges);

      return baseHeight * scale;
    },
    [graphData.nodes]
  );

  if (!graphData.nodes.length) {
    return <div className="text-foreground">No data available</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        position: "relative",
        marginTop: "64px",
      }}
      className="bg-background"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = `${cleanLabel(node.label)} (${node.edgeCount})`;
          const fontSize = 14;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const padding = 8;
          const boxWidth = textWidth + 2 * padding;
          const boxHeight = getNodeSize(node);

          const connectedNodes = hoveredNode
            ? getConnectedNodeIds(hoveredNode)
            : new Set();
          const isConnected = hoveredNode
            ? node.id === hoveredNode.id || connectedNodes.has(node.id)
            : false;

          // Add glow effect for connected nodes when hovering
          if (hoveredNode && isConnected) {
            const isDarkMode =
              document.documentElement.classList.contains("dark");
            ctx.shadowColor =
              node.type === "spelling"
                ? isDarkMode
                  ? "#22c55e"
                  : "#4CAF50" // green-500/green-400
                : isDarkMode
                ? "#3b82f6"
                : "#2196F3"; // blue-500/blue-400
            ctx.shadowBlur = 15;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          // Draw background with appropriate color
          ctx.fillStyle = getNodeColor(node, isConnected, node === hoveredNode);
          ctx.fillRect(
            node.x - boxWidth / 2,
            node.y - boxHeight / 2,
            boxWidth,
            boxHeight
          );

          // Reset shadow for text
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;

          // Draw text with appropriate color
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const isDarkMode =
            document.documentElement.classList.contains("dark");
          ctx.fillStyle =
            hoveredNode && !isConnected
              ? isDarkMode
                ? "rgba(255,255,255,0.4)"
                : "rgba(0,0,0,0.4)"
              : "#fff"; // Always white text for better contrast on colored nodes
          ctx.fillText(label, node.x, node.y);
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          const label = `${cleanLabel(node.label)} (${node.edgeCount})`;
          const fontSize = 14;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const padding = 8;
          const boxWidth = textWidth + 2 * padding;
          const boxHeight = getNodeSize(node);

          ctx.fillStyle = color;
          ctx.fillRect(
            node.x - boxWidth / 2,
            node.y - boxHeight / 2,
            boxWidth,
            boxHeight
          );
        }}
        onNodeHover={setHoveredNode}
        linkColor={getLinkColor}
        linkLineDash={[4, 4]}
        linkWidth={(link) => {
          if (!hoveredNode) return 2;
          return link.source.id === hoveredNode.id ||
            link.target.id === hoveredNode.id
            ? 3
            : 1;
        }}
        // Add a custom render callback to draw tooltips after everything else
        onRenderFramePost={(ctx, rootGroup) => {
          if (!hoveredNode) return;

          const connectedNodes = getConnectedNodeIds(hoveredNode);

          // Draw tooltips only for connected nodes
          Array.from(connectedNodes).forEach((nodeId) => {
            const node = graphData.nodes.find((n) => n.id === nodeId);
            if (!node) return;

            let example = "";
            if (hoveredNode.type === "pronunciation") {
              // If hovering a pronunciation node, show the example for this spelling
              const vowelData = wlsData.vowels[cleanLabel(hoveredNode.label)];
              if (vowelData) {
                const spelling = vowelData.spellings.find(
                  (s) => s.pattern === cleanLabel(node.label)
                );
                if (spelling && spelling.examples.length > 0) {
                  example = spelling.examples[0];
                }
              }
            } else {
              // If hovering a spelling node, show the example for this lexical set
              const vowelData = wlsData.vowels[cleanLabel(node.label)];
              if (vowelData) {
                const spelling = vowelData.spellings.find(
                  (s) => s.pattern === cleanLabel(hoveredNode.label)
                );
                if (spelling && spelling.examples.length > 0) {
                  example = spelling.examples[0];
                }
              }
            }

            if (example) {
              drawTooltip(ctx, node, [{ example }]);
            }
          });
        }}
        cooldownTicks={50}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        minZoom={0.2}
        maxZoom={2.5}
      />

      {/* Legend */}
      <Panel
        position="top-right"
        className="bg-background border p-2 rounded shadow-sm"
      >
        <div className="text-sm text-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded"></div>
            <span>Lexical Sets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded"></div>
            <span>Spelling Patterns</span>
          </div>
        </div>
      </Panel>

      {/* Controls */}
      <Panel
        position="bottom-left"
        className="bg-background border p-4 rounded shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Repulsion Force ({chargeStrength})
            </label>
            <input
              type="range"
              min="-2000"
              max="-100"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Link Strength ({linkStrength})
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={linkStrength}
              onChange={(e) => setLinkStrength(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Link Distance ({linkDistance})
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Centering Force ({centeringForce})
            </label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={centeringForce}
              onChange={(e) => setCenteringForce(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default ForceGraphNetwork;
