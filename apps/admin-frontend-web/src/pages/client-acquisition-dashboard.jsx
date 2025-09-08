import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";

// Single source of truth for all funnel data
const funnelData = {
  // Traffic sources
  ig: {
    views: 538800,
  },
  email: {
    opens: 765,
  },

  // MG Sales Page Visits (with source attribution)
  mgSalesPageVisits: {
    total: 304,
    fromIgBio: 237,
    fromIgStory: 31,
    fromIgManychat: 15,
    fromIgDm: 0,
    fromEmailBroadcasts: 0,
    fromEmailAutomations: 0,
    fromUnknown: 21, // Calculated: 304 - (237 + 31 + 15 + 0 + 0 + 0) = 21
  },

  // MG Application Funnel
  mgApplication: {
    exited: 131, // 304 - 173 = 131 people who exited after sales page
    appFormPageVisits: 173,
    appAbandons: 152, // 173 - 21 = 152 people who abandoned the app form
    appCompletions: 21,
    nonQualifiedApps: 20, // 21 - 1 = 20 people who completed but weren't qualified
    qualifiedApps: 1,
  },

  // MG Selection Process
  mgSelection: {
    rejectedWoCovo: 0,
    contacted: 1,
    unresponsive: 0,
    begunConversation: 1,
    becameUnresponsive: 0,
    rejectedBasedOnConvo: 1,
    acceptedNotPaid: 0,
    rejectedAfterAcceptance: 0,
    paid: 0,
  },
};

// Color scheme for different categories
const categoryColors = {
  ig: "#E91E63", // Pink
  email: "#9C27B0", // Purple
  "mg-funnel": "#3F51B5", // Indigo
  "mg-selection": "#FF9800", // Orange
  "mg-sales": "#4CAF50", // Green
};

// Sankey Diagram Component
const SankeyDiagram = ({
  data,
  width = 1200,
  height = 400,
  title = "",
  leftPadding = 1,
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Constants
    const MIN_NODE_HEIGHT_PX = 30;

    // Create color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(categoryColors))
      .range(Object.values(categoryColors));

    // Create Sankey layout
    const sankeyGenerator = sankey()
      .nodeId((d) => d.id)
      .nodeWidth(15)
      .nodePadding(20)
      .extent([
        [leftPadding, 20],
        [width - 1, height - 20],
      ])
      .nodeAlign(sankeyCenter);

    // Filter out zero-value links and nodes
    const filteredData = {
      nodes: data.nodes,
      links: data.links.filter((link) => link.value > 0),
    };

    // Apply minimum height to node values before layout calculation
    const adjustedData = {
      nodes: filteredData.nodes.map((node) => ({
        ...node,
        value: Math.max(MIN_NODE_HEIGHT_PX, node.value || 0),
      })),
      links: filteredData.links, // Keep original link values for accurate flow representation
    };

    // Compute the layout
    const { nodes, links } = sankeyGenerator(adjustedData);

    // Create unique ID for gradients
    const uid = `sankey-${Math.random().toString(16).slice(2)}`;

    // Create nodes
    const node = svg
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => colorScale(d.category))
      .append("title")
      .text((d) => {
        const nodeValue = d.value || 0;
        const totalValue = nodes[0]?.value || 1;
        return `${d.name}\nCount: ${nodeValue.toLocaleString()}\nPercentage: ${(
          (nodeValue / totalValue) *
          100
        ).toFixed(1)}%`;
      });

    // Create links with gradients
    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.7)
      .selectAll("g")
      .data(links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    // Add gradients
    link
      .append("linearGradient")
      .attr("id", (d) => `${uid}-link-${d.index}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d) => d.source.x1)
      .attr("x2", (d) => d.target.x0)
      .call((gradient) =>
        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", (d) => colorScale(d.source.category))
          .attr("stop-opacity", 0.6)
      )
      .call((gradient) =>
        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", (d) => colorScale(d.target.category))
          .attr("stop-opacity", 0.3)
      );

    // Add link paths
    link
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => `url(#${uid}-link-${d.index})`)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", Math.max(2, d.width + 1));
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 0.7)
          .attr("stroke-width", Math.max(1, d.width));
      })
      .append("title")
      .text((d) => {
        const flowValue = d.value || 0;
        const conversionRate =
          d.source.value > 0
            ? ((flowValue / d.source.value) * 100).toFixed(1)
            : 0;
        return `${d.source.name} → ${
          d.target.name
        }\nFlow: ${flowValue.toLocaleString()}\nConversion: ${conversionRate}%`;
      });

    // Label positioning overrides - define once, use in both x and text-anchor
    const labelOverrides = {
      // Add specific node overrides here as needed
      "mg-sales-page-visits": "left",
      "exited-sales-page": "left",
      "mg-app-form-visits": "left",
      "mg-qualified-apps": "left",
      contacted: "left",
    };

    // Create node labels
    const label = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11)
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => {
        const overridePosition = labelOverrides[d.id];
        if (overridePosition) {
          // Use manual override
          return overridePosition === "left" ? d.x0 - 6 : d.x1 + 6;
        } else {
          // Use automatic positioning: left side of diagram gets labels on right, right side gets labels on left
          const isLeftSide = d.x0 < width / 2;
          return isLeftSide ? d.x1 + 6 : d.x0 - 6;
        }
      })
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => {
        const overridePosition = labelOverrides[d.id];
        if (overridePosition) {
          // Use manual override
          return overridePosition === "left" ? "end" : "start";
        } else {
          // Use automatic positioning: left side nodes get start anchor, right side nodes get end anchor
          const isLeftSide = d.x0 < width / 2;
          return isLeftSide ? "start" : "end";
        }
      })
      .text((d) => {
        const nodeValue = d.value || 0;
        return `${d.name} (${nodeValue.toLocaleString()})`;
      })
      .style("fill", "#ffffff")
      .style("font-weight", "500")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");
  }, [data, width, height]);

  return (
    <div className="relative w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="overflow-auto max-w-full">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

// Build Sankey data from source of truth
const buildSankeyData = (data) => {
  // 1. Traffic Funnel: MG Sales Page Visit Sources → MG Sales Page Visits
  const trafficFunnelData = {
    nodes: [
      {
        id: "mg-sp-via-ig-bio",
        name: "MG SP via IG Bio",
        category: "mg-funnel",
      },
      {
        id: "mg-sp-via-ig-story",
        name: "MG SP via IG Story",
        category: "mg-funnel",
      },
      {
        id: "mg-sp-via-ig-manychat",
        name: "MG SP via IG Manychat",
        category: "mg-funnel",
      },
      { id: "mg-sp-via-ig-dm", name: "MG SP via IG DM", category: "mg-funnel" },
      {
        id: "mg-sp-via-email-broadcast",
        name: "MG SP via Email Broadcast",
        category: "mg-funnel",
      },
      {
        id: "mg-sp-via-email-automation",
        name: "MG SP via Email Automation",
        category: "mg-funnel",
      },
      {
        id: "mg-sp-via-unknown",
        name: "MG SP via Unknown",
        category: "mg-funnel",
      },
      {
        id: "mg-sales-page-visits",
        name: "MG Sales Page Visits",
        category: "mg-funnel",
      },
    ],
    links: [
      {
        source: "mg-sp-via-ig-bio",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromIgBio,
      },
      {
        source: "mg-sp-via-ig-story",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromIgStory,
      },
      {
        source: "mg-sp-via-ig-manychat",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromIgManychat,
      },
      {
        source: "mg-sp-via-ig-dm",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromIgDm,
      },
      {
        source: "mg-sp-via-email-broadcast",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromEmailBroadcasts,
      },
      {
        source: "mg-sp-via-email-automation",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromEmailAutomations,
      },
      {
        source: "mg-sp-via-unknown",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits.fromUnknown,
      },
    ],
  };

  // 2. Application Funnel: MG Sales Page Visits → MG Qualified Apps
  const applicationFunnelData = {
    nodes: [
      {
        id: "mg-sales-page-visits",
        name: "MG Sales Page Visits",
        category: "mg-funnel",
      },
      {
        id: "exited-sales-page",
        name: "MG Sales Page Exits",
        category: "mg-selection",
      },
      {
        id: "mg-app-form-visits",
        name: "MG App Form Visits",
        category: "mg-funnel",
      },
      {
        id: "app-abandons",
        name: "MG App Abandons",
        category: "mg-selection",
      },
      {
        id: "mg-app-completions",
        name: "MG App Completions",
        category: "mg-funnel",
      },
      {
        id: "mg-non-qualified-apps",
        name: "MG Non-Qualified Apps",
        category: "mg-selection",
      },
      {
        id: "mg-qualified-apps",
        name: "MG Qualified Apps",
        category: "mg-funnel",
      },
    ],
    links: [
      {
        source: "mg-sales-page-visits",
        target: "exited-sales-page",
        value: data.mgApplication.exited,
      },
      {
        source: "mg-sales-page-visits",
        target: "mg-app-form-visits",
        value: data.mgApplication.appFormPageVisits,
      },
      {
        source: "mg-app-form-visits",
        target: "app-abandons",
        value: data.mgApplication.appAbandons,
      },
      {
        source: "mg-app-form-visits",
        target: "mg-app-completions",
        value: data.mgApplication.appCompletions,
      },
      {
        source: "mg-app-completions",
        target: "mg-non-qualified-apps",
        value: data.mgApplication.nonQualifiedApps,
      },
      {
        source: "mg-app-completions",
        target: "mg-qualified-apps",
        value: data.mgApplication.qualifiedApps,
      },
    ],
  };

  // 3. Selection Funnel: MG Qualified Apps → Sales Outcomes
  const selectionFunnelData = {
    nodes: [
      {
        id: "mg-qualified-apps",
        name: "MG Qualified Apps",
        category: "mg-funnel",
      },
      {
        id: "rejected-wo-convo",
        name: "Rejected w/o Convo",
        category: "mg-selection",
      },
      { id: "contacted", name: "Contacted", category: "mg-selection" },
      { id: "unresponsive", name: "Unresponsive", category: "mg-selection" },
      {
        id: "begun-conversation",
        name: "Began Conversation",
        category: "mg-selection",
      },
      {
        id: "became-unresponsive",
        name: "Became Unresponsive",
        category: "mg-selection",
      },
      {
        id: "rejected-based-on-convo",
        name: "Rejected Based on Convo",
        category: "mg-selection",
      },
      {
        id: "accepted-not-paid",
        name: "Accepted but Not Paid",
        category: "mg-selection",
      },
      {
        id: "rejected-after-acceptance",
        name: "Rejected After Acceptance",
        category: "mg-selection",
      },
      { id: "paid", name: "Paid", category: "mg-sales" },
    ],
    links: [
      {
        source: "mg-qualified-apps",
        target: "rejected-wo-convo",
        value: data.mgSelection.rejectedWoCovo,
      },
      {
        source: "mg-qualified-apps",
        target: "contacted",
        value: data.mgSelection.contacted,
      },
      {
        source: "contacted",
        target: "unresponsive",
        value: data.mgSelection.unresponsive,
      },
      {
        source: "contacted",
        target: "begun-conversation",
        value: data.mgSelection.begunConversation,
      },
      {
        source: "begun-conversation",
        target: "became-unresponsive",
        value: data.mgSelection.becameUnresponsive,
      },
      {
        source: "begun-conversation",
        target: "rejected-based-on-convo",
        value: data.mgSelection.rejectedBasedOnConvo,
      },
      {
        source: "begun-conversation",
        target: "accepted-not-paid",
        value: data.mgSelection.acceptedNotPaid,
      },
      {
        source: "accepted-not-paid",
        target: "rejected-after-acceptance",
        value: data.mgSelection.rejectedAfterAcceptance,
      },
      {
        source: "accepted-not-paid",
        target: "paid",
        value: data.mgSelection.paid,
      },
    ],
  };

  return { trafficFunnelData, applicationFunnelData, selectionFunnelData };
};

// Main Dashboard Component
const ClientAcquisitionDashboard = () => {
  const { trafficFunnelData, applicationFunnelData, selectionFunnelData } =
    buildSankeyData(funnelData);

  // Calculate summary statistics
  const summaryStats = {
    totalViews: funnelData.ig.views + funnelData.email.opens,
    totalConversions: funnelData.mgSelection.paid,
    conversionRate: (
      (funnelData.mgSelection.paid /
        (funnelData.ig.views + funnelData.email.opens)) *
      100
    ).toFixed(1),
    revenue: funnelData.mgSelection.paid * 1000, // Assuming $1000 per conversion
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Client Acquisition Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            MG (Mentorship Group) Funnel Analysis
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Views
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summaryStats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Conversions
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summaryStats.totalConversions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Conversion Rate
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summaryStats.conversionRate}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${summaryStats.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Data Source of Truth */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Source of Truth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Traffic Sources */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Traffic Sources
              </h4>
              <div className="text-sm space-y-1">
                <div>IG Views: {funnelData.ig.views.toLocaleString()}</div>
                <div>
                  Email Opens: {funnelData.email.opens.toLocaleString()}
                </div>
              </div>
            </div>

            {/* MG Sales Page Visits */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Sales Page Visits
              </h4>
              <div className="text-sm space-y-1">
                <div>Total: {funnelData.mgSalesPageVisits.total}</div>
                <div className="ml-4">
                  • From IG Bio: {funnelData.mgSalesPageVisits.fromIgBio}
                </div>
                <div className="ml-4">
                  • From IG Story: {funnelData.mgSalesPageVisits.fromIgStory}
                </div>
                <div className="ml-4">
                  • From IG Manychat:{" "}
                  {funnelData.mgSalesPageVisits.fromIgManychat}
                </div>
                <div className="ml-4">
                  • From IG DM: {funnelData.mgSalesPageVisits.fromIgDm}
                </div>
                <div className="ml-4">
                  • From Email Broadcast:{" "}
                  {funnelData.mgSalesPageVisits.fromEmailBroadcasts}
                </div>
                <div className="ml-4">
                  • From Email Automation:{" "}
                  {funnelData.mgSalesPageVisits.fromEmailAutomations}
                </div>
                <div className="ml-4">
                  • From Unknown: {funnelData.mgSalesPageVisits.fromUnknown}
                </div>
              </div>
            </div>

            {/* MG Application */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Application
              </h4>
              <div className="text-sm space-y-1">
                <div>Exited Sales Page: {funnelData.mgApplication.exited}</div>
                <div>
                  App Form Visits: {funnelData.mgApplication.appFormPageVisits}
                </div>
                <div>App Abandons: {funnelData.mgApplication.appAbandons}</div>
                <div>
                  App Completions: {funnelData.mgApplication.appCompletions}
                </div>
                <div>
                  Non-Qualified Apps:{" "}
                  {funnelData.mgApplication.nonQualifiedApps}
                </div>
                <div>
                  Qualified Apps: {funnelData.mgApplication.qualifiedApps}
                </div>
              </div>
            </div>

            {/* MG Selection */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Selection
              </h4>
              <div className="text-sm space-y-1">
                <div>Contacted: {funnelData.mgSelection.contacted}</div>
                <div>
                  Conversations: {funnelData.mgSelection.begunConversation}
                </div>
                <div>Accepted: {funnelData.mgSelection.acceptedNotPaid}</div>
                <div>Paid: {funnelData.mgSelection.paid}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sankey Diagrams */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={trafficFunnelData}
              width={1200}
              height={400}
              title="Traffic Funnel: MG Sales Page Visit Sources → MG Sales Page Visits"
              leftPadding={1}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={applicationFunnelData}
              width={1200}
              height={300}
              title="Application Funnel: MG Sales Page Visits → MG Qualified Apps"
              leftPadding={150}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={selectionFunnelData}
              width={1200}
              height={400}
              title="Selection Funnel: MG Qualified Apps → Sales Outcomes"
              leftPadding={120}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Channel Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
      </div>
    </ScrollArea>
  );
};

export default ClientAcquisitionDashboard;
