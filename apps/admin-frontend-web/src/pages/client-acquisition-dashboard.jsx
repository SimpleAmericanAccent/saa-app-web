import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";

// Mock data for client acquisition funnel
const mockData = {
  nodes: [
    // IG Stage
    { id: "ig-views", name: "IG Views", category: "ig" },
    { id: "ig-clicks", name: "IG Clicks", category: "ig" },

    // Email Stage
    { id: "email-opens", name: "Email Opens", category: "email" },
    { id: "email-clicks", name: "Email Clicks", category: "email" },
    { id: "email-non-clicks", name: "Email Non Clicks", category: "email" },

    // Website Stage
    { id: "sales-page-visits", name: "Sales Page Visits", category: "website" },
    {
      id: "app-form-page-visits",
      name: "App Form Page Visits",
      category: "website",
    },

    // App Form Stage
    { id: "app-completions", name: "App Completions", category: "app-form" },
    { id: "qualified-apps", name: "Qualified Apps", category: "app-form" },

    // Follow-up Stage
    {
      id: "rejected-wo-convo",
      name: "Rejected w/o Convo",
      category: "follow-up",
    },
    { id: "contacted", name: "Contacted", category: "follow-up" },
    { id: "unresponsive", name: "Unresponsive", category: "follow-up" },
    {
      id: "begun-conversation",
      name: "Began Conversation",
      category: "follow-up",
    },
    {
      id: "became-unresponsive",
      name: "Became Unresponsive",
      category: "follow-up",
    },
    {
      id: "rejected-based-on-convo",
      name: "Rejected Based on Convo",
      category: "follow-up",
    },
    {
      id: "accepted-not-paid",
      name: "Accepted but Not Paid",
      category: "follow-up",
    },

    // Sales Stage
    { id: "not-paid", name: "Not Paid", category: "sales" },
    { id: "paid-amount", name: "Paid Something", category: "sales" },
  ],
  links: [
    // IG flows
    { source: "ig-views", target: "ig-clicks", value: 1000 },
    { source: "ig-clicks", target: "sales-page-visits", value: 150 },

    // Email flows - Email Opens represents total emails, clicks are subset
    { source: "email-opens", target: "email-clicks", value: 100 },
    { source: "email-opens", target: "email-non-clicks", value: 1000 },
    { source: "email-clicks", target: "sales-page-visits", value: 200 },

    // Website flows
    { source: "sales-page-visits", target: "app-form-page-visits", value: 300 },
    { source: "app-form-page-visits", target: "app-completions", value: 180 },
    { source: "app-completions", target: "qualified-apps", value: 120 },

    // Follow-up flows
    { source: "qualified-apps", target: "rejected-wo-convo", value: 20 },
    { source: "qualified-apps", target: "contacted", value: 100 },
    { source: "contacted", target: "unresponsive", value: 30 },
    { source: "contacted", target: "begun-conversation", value: 70 },
    { source: "begun-conversation", target: "became-unresponsive", value: 15 },
    {
      source: "begun-conversation",
      target: "rejected-based-on-convo",
      value: 25,
    },
    { source: "begun-conversation", target: "accepted-not-paid", value: 30 },

    // Sales flows
    { source: "accepted-not-paid", target: "not-paid", value: 20 },
    { source: "accepted-not-paid", target: "paid-amount", value: 10 },
  ],
};

// Color scheme for different categories
const categoryColors = {
  ig: "#E91E63", // Pink
  email: "#9C27B0", // Purple
  website: "#3F51B5", // Indigo
  "app-form": "#2196F3", // Blue
  "follow-up": "#FF9800", // Orange
  sales: "#4CAF50", // Green
};

const SankeyDiagram = ({ data, width = 1200, height = 600 }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  // Calculate node values for tooltips
  const calculateNodeValues = (data) => {
    const nodeValues = {};

    // Initialize all nodes with 0
    data.nodes.forEach((node) => {
      nodeValues[node.id] = 0;
    });

    // For each node, calculate the total flow through it
    data.nodes.forEach((node) => {
      // Sum of all outgoing links from this node
      const outgoing = data.links
        .filter((link) => link.source === node.id)
        .reduce((sum, link) => sum + link.value, 0);

      // Sum of all incoming links to this node
      const incoming = data.links
        .filter((link) => link.target === node.id)
        .reduce((sum, link) => sum + link.value, 0);

      // For source nodes (no incoming links), use outgoing flow
      // For intermediate/target nodes, use incoming flow
      if (incoming === 0) {
        // This is a source node - use outgoing flow
        nodeValues[node.id] = outgoing;
      } else {
        // This is a target or intermediate node - use incoming flow
        nodeValues[node.id] = incoming;
      }
    });

    return nodeValues;
  };

  const nodeValues = calculateNodeValues(data);

  // Calculate conversion rates for tooltips
  const calculateConversionRate = (sourceId, targetId, value) => {
    const sourceValue = nodeValues[sourceId] || 0;
    return sourceValue > 0 ? ((value / sourceValue) * 100).toFixed(1) : 0;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create Sankey layout
    const sankeyGenerator = sankey()
      .nodeId((d) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 1],
      ]);

    const { nodes, links } = sankeyGenerator(data);

    // Create gradient definitions for links
    const defs = svg.append("defs");

    links.forEach((link) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${link.source.id}-${link.target.id}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", link.source.x1)
        .attr("x2", link.target.x0);

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", categoryColors[link.source.category] || "#ccc")
        .attr("stop-opacity", 0.6);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", categoryColors[link.target.category] || "#ccc")
        .attr("stop-opacity", 0.3);
    });

    // Create links
    const link = svg
      .append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", (d) => `url(#gradient-${d.source.id}-${d.target.id})`)
      .attr("stroke", (d) => categoryColors[d.source.category] || "#ccc")
      .attr("stroke-width", (d) => Math.max(1, d.width || 1))
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke-width", Math.max(2, (d.width || 1) + 1));
        const rect = svgRef.current.getBoundingClientRect();
        const conversionRate = calculateConversionRate(
          d.source.id,
          d.target.id,
          d.value
        );
        setTooltip({
          visible: true,
          content: `${d.source.name} → ${
            d.target.name
          }<br/>Flow: ${d.value.toLocaleString()}<br/>Conversion: ${conversionRate}%`,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("opacity", 0.7)
          .attr("stroke-width", Math.max(1, d.width || 1));
        setTooltip({ visible: false, content: "", x: 0, y: 0 });
      });

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => categoryColors[d.category] || "#ccc")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        const rect = svgRef.current.getBoundingClientRect();
        const total = nodeValues[mockData.nodes[0].id] || 1;
        const percentage = ((nodeValues[d.id] / total) * 100).toFixed(1);
        setTooltip({
          visible: true,
          content: `${d.name}<br/>Count: ${(
            nodeValues[d.id] || 0
          ).toLocaleString()}<br/>Percentage: ${percentage}%`,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      })
      .on("mouseout", function () {
        setTooltip({ visible: false, content: "", x: 0, y: 0 });
      });

    // Add labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("fill", "#ffffff")
      .style("font-weight", "500")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");

    // Add absolute value labels for key nodes
    const valueLabel = svg
      .append("g")
      .selectAll("text")
      .data(nodes.filter((d) => nodeValues[d.id] > 0))
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2 + 15)
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => (nodeValues[d.id] || 0).toLocaleString())
      .style("font-size", "10px")
      .style("font-family", "sans-serif")
      .style("fill", "#ffffff")
      .style("font-weight", "600")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none")
      .style("opacity", 0.9);

    // Add percentage labels for key nodes
    const percentageLabel = svg
      .append("g")
      .selectAll("text")
      .data(nodes.filter((d) => nodeValues[d.id] > 0))
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2 + 28)
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => {
        const total = nodeValues[mockData.nodes[0].id] || 1;
        const percentage = ((nodeValues[d.id] / total) * 100).toFixed(1);
        return `${percentage}%`;
      })
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .style("fill", "#ffffff")
      .style("font-weight", "400")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none")
      .style("opacity", 0.7);
  }, [data, width, height]);

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="max-w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      />
      {tooltip.visible && (
        <div
          className="absolute bg-gray-800 text-white p-2 rounded shadow-lg pointer-events-none z-10 text-sm"
          style={{
            left: Math.min(tooltip.x + 10, width - 150),
            top: Math.max(tooltip.y - 10, 10),
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

const ClientAcquisitionDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate node values from links
  const calculateNodeValues = (data) => {
    const nodeValues = {};

    // Initialize all nodes with 0
    data.nodes.forEach((node) => {
      nodeValues[node.id] = 0;
    });

    // For each node, calculate the total flow through it
    data.nodes.forEach((node) => {
      // Sum of all outgoing links from this node
      const outgoing = data.links
        .filter((link) => link.source === node.id)
        .reduce((sum, link) => sum + link.value, 0);

      // Sum of all incoming links to this node
      const incoming = data.links
        .filter((link) => link.target === node.id)
        .reduce((sum, link) => sum + link.value, 0);

      // For source nodes (no incoming links), use outgoing flow
      // For intermediate/target nodes, use incoming flow
      if (incoming === 0) {
        // This is a source node - use outgoing flow
        nodeValues[node.id] = outgoing;
      } else {
        // This is a target or intermediate node - use incoming flow
        nodeValues[node.id] = incoming;
      }
    });

    return nodeValues;
  };

  const nodeValues = calculateNodeValues(mockData);

  // Calculate conversion rate from previous stage
  const getConversionFromPreviousStage = (nodeId) => {
    // Find incoming links to this node
    const incomingLinks = mockData.links.filter(
      (link) => link.target === nodeId
    );
    if (incomingLinks.length === 0) return "N/A";

    // Get the total incoming flow
    const totalIncoming = incomingLinks.reduce(
      (sum, link) => sum + link.value,
      0
    );

    // For each incoming link, calculate the conversion rate from its source
    // and then average them if there are multiple sources
    const conversionRates = incomingLinks.map((link) => {
      const sourceValue = nodeValues[link.source] || 0;
      return sourceValue > 0 ? (link.value / sourceValue) * 100 : 0;
    });

    // If all links come from the same source, use that conversion rate
    // Otherwise, calculate a weighted average
    if (conversionRates.length === 1) {
      return conversionRates[0].toFixed(1) + "%";
    } else {
      // Weighted average based on link values
      const weightedSum = incomingLinks.reduce((sum, link, index) => {
        return sum + conversionRates[index] * link.value;
      }, 0);
      const totalWeight = totalIncoming;
      return totalWeight > 0
        ? (weightedSum / totalWeight).toFixed(1) + "%"
        : "N/A";
    }
  };

  // Mock summary statistics
  const summaryStats = {
    totalViews: 1800,
    totalConversions: 10,
    conversionRate: 0.56,
    revenue: 15000,
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Client Acquisition Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track the flow of prospects through your acquisition funnel
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <button
              onClick={() => setIsLoading(!isLoading)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Sankey Diagram */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acquisition Funnel Flow
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Visual representation of how prospects move through your
              acquisition channels
            </p>
          </div>

          <div className="overflow-auto max-w-full">
            <SankeyDiagram data={mockData} width={1200} height={600} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-pink-600 dark:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {summaryStats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversions
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {summaryStats.totalConversions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {summaryStats.conversionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${summaryStats.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Channel Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {category.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stage Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    From Previous Stage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockData.nodes.map((node, index) => (
                  <tr key={node.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {node.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded mr-2"
                          style={{
                            backgroundColor: categoryColors[node.category],
                          }}
                        />
                        {node.category.replace("-", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {(nodeValues[node.id] || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {index === 0
                        ? "100%"
                        : `${(
                            ((nodeValues[node.id] || 0) /
                              (nodeValues[mockData.nodes[0].id] || 1)) *
                            100
                          ).toFixed(1)}%`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getConversionFromPreviousStage(node.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ClientAcquisitionDashboard;
