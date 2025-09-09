import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

// Default funnel data structure (used as initial state) - null until real data loads
const defaultFunnelData = {
  // Traffic sources
  ig: {
    views: null,
    reach: null,
    profileVisits: null,
    bioLinkClicks: null,
  },
  email: {
    opens: null,
  },

  // MG Sales Page Visits (with source attribution)
  mgSalesPageVisits: {
    total: null,
    fromIgBio: null,
    fromIgStory: null,
    fromIgManychat: null,
    fromIgDm: null,
    fromEmailBroadcasts: null,
    fromEmailAutomations: null,
    fromUnknown: null,
  },

  // MG Application Funnel
  mgApplication: {
    exited: null,
    appFormPageVisits: null,
    appStarts: null,
    appAbandons: null,
    appCompletions: null,
    nonQualifiedApps: null,
    qualifiedApps: null,
  },

  // MG Selection Process
  mgSelection: {
    // Airtable states
    rejectedWoCovo: null,
    contacted: null,
    unresponsive: null,
    begunConversation: null,
    becameUnresponsive: null,
    rejectedBasedOnConvo: null,
    acceptedNotPaid: null,
    rejectedAfterAcceptance: null,
    paid: null,
    // Additional states (not in Airtable) - to account for gaps/WIP
    notContactedOrRejected: null,
    noResponseYet: null,
    noDecisionYet: null,
    noOutcomeYet: null,
  },

  // Revenue data
  revenue: {
    mgPaymentsApp: null,
    mgRefundsApp: null,
    mgNetPayApp: null,
    mgPaymentsDay: null,
    mgRefundsDay: null,
    mgNetPayDay: null,
  },

  // Data gap analysis
  dataGaps: {
    totalVisitors: null,
    salesPage: null,
    appForm: null,
  },
};

// Color scheme for different categories
const categoryColors = {
  Instagram: "#E91E63", // Pink
  Email: "#9C27B0", // Purple
  "mg-funnel": "#3F51B5", // Indigo
  "mg-selection": "#FF9800", // Orange
  "mg-sales": "#4CAF50", // Green
};

// Human-friendly names for categories
const categoryNames = {
  Instagram: "Instagram",
  Email: "Email",
  "mg-funnel": "MG Funnel",
  "mg-selection": "MG Selection",
  "mg-sales": "MG Sales",
};

// Sankey Diagram Component
const SankeyDiagram = ({
  data,
  originalData,
  width = 1200,
  height = 400,
  title = "",
  leftPadding = 1,
  useLogarithmicScaling = false,
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

    // Filter out null/undefined/zero-value links and nodes
    const filteredData = {
      nodes: data.nodes,
      links: data.links.filter(
        (link) =>
          link.value !== null && link.value !== undefined && link.value > 0
      ),
    };

    // Apply minimum height to node values before layout calculation
    const adjustedData = {
      nodes: filteredData.nodes.map((node) => {
        let nodeValue = node.value;

        // Set custom values for IG nodes (logarithmic for visual scaling)
        if (node.id === "ig-views") {
          nodeValue = data.ig?.views
            ? Math.round(Math.log10(data.ig.views))
            : null;
        } else if (node.id === "ig-extra-views") {
          const extraViews =
            data.ig?.views && data.ig?.reach
              ? data.ig.views - data.ig.reach
              : null;
          nodeValue = extraViews ? Math.round(Math.log10(extraViews)) : null;
        } else if (node.id === "ig-reach") {
          nodeValue = data.ig?.reach
            ? Math.round(Math.log10(data.ig.reach))
            : null;
        } else if (node.id === "ig-profile-visits") {
          nodeValue = data.ig?.profileVisits
            ? Math.round(Math.log10(data.ig.profileVisits))
            : null;
        } else if (node.id === "ig-bio-link-clicks") {
          nodeValue = data.ig?.bioLinkClicks
            ? Math.round(Math.log10(data.ig.bioLinkClicks))
            : null;
        } else if (node.id === "mg-sp-via-ig-bio") {
          nodeValue = data.mgSalesPageVisits?.fromIgBio
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgBio))
            : null;
        } else if (node.id === "mg-sp-via-ig-story") {
          nodeValue = data.mgSalesPageVisits?.fromIgStory
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgStory))
            : null;
        } else if (node.id === "mg-sp-via-ig-manychat") {
          nodeValue = data.mgSalesPageVisits?.fromIgManychat
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgManychat))
            : null;
        } else if (node.id === "mg-sp-via-ig-dm") {
          nodeValue = data.mgSalesPageVisits?.fromIgDm
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgDm))
            : null;
        } else if (node.id === "mg-sp-via-email-broadcast") {
          nodeValue = data.mgSalesPageVisits?.fromEmailBroadcasts
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromEmailBroadcasts))
            : null;
        } else if (node.id === "mg-sp-via-email-automation") {
          nodeValue = data.mgSalesPageVisits?.fromEmailAutomations
            ? Math.round(
                Math.log10(data.mgSalesPageVisits.fromEmailAutomations)
              )
            : null;
        } else if (node.id === "mg-sp-via-unknown") {
          nodeValue = data.mgSalesPageVisits?.fromUnknown
            ? Math.round(Math.log10(data.mgSalesPageVisits.fromUnknown))
            : null;
        } else if (node.id === "mg-sales-page-visits") {
          nodeValue = data.mgSalesPageVisits?.total
            ? Math.round(Math.log10(data.mgSalesPageVisits.total))
            : null;
        } else if (node.id === "mg-app-form-visits") {
          nodeValue = data.mgApplication?.appFormPageVisits;
        } else if (node.id === "app-starts") {
          nodeValue = data.mgApplication?.appStarts;
        } else if (node.id === "mg-app-completions") {
          nodeValue = data.mgApplication?.appCompletions;
        } else if (node.id === "mg-qualified-apps") {
          nodeValue = data.mgApplication?.qualifiedApps;
        }

        return {
          ...node,
          value:
            nodeValue !== null && nodeValue !== undefined
              ? Math.max(MIN_NODE_HEIGHT_PX, nodeValue)
              : MIN_NODE_HEIGHT_PX,
        };
      }),
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
        let displayValue = null;
        let totalValue = 1;
        let percentageLabel = "Percentage";

        if (useLogarithmicScaling) {
          // For Sankey 1 (logarithmic scaling): Use originalData for display values
          if (d.id === "ig-views") displayValue = originalData?.ig?.views;
          else if (d.id === "ig-extra-views")
            displayValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.id === "ig-reach") displayValue = originalData?.ig?.reach;
          else if (d.id === "ig-profile-visits")
            displayValue = originalData?.ig?.profileVisits;
          else if (d.id === "ig-bio-link-clicks")
            displayValue = originalData?.ig?.bioLinkClicks;
          else if (d.id === "ig-profile-visits-no-bio-click")
            displayValue =
              originalData?.ig?.profileVisits && originalData?.ig?.bioLinkClicks
                ? originalData.ig.profileVisits - originalData.ig.bioLinkClicks
                : null;
          else if (d.id === "ig-reach-no-profile-visit")
            displayValue =
              originalData?.ig?.reach && originalData?.ig?.profileVisits
                ? originalData.ig.reach - originalData.ig.profileVisits
                : null;
          else if (d.id === "ig-views-no-profile-visit")
            displayValue =
              originalData?.ig?.views && originalData?.ig?.profileVisits
                ? originalData.ig.views - originalData.ig.profileVisits
                : null;
          else if (d.id === "mg-sp-via-ig-bio")
            displayValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.id === "mg-sp-via-ig-story")
            displayValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.id === "mg-sp-via-ig-manychat")
            displayValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.id === "mg-sp-via-ig-dm")
            displayValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.id === "mg-sp-via-email-broadcast")
            displayValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.id === "mg-sp-via-email-automation")
            displayValue =
              originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.id === "mg-sp-via-unknown")
            displayValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.id === "mg-sales-page-visits")
            displayValue = originalData?.mgSalesPageVisits?.total;
          else displayValue = d.value; // fallback to node value

          // Calculate percentage based on the most relevant parent node for Sankey 1
          if (
            [
              "ig-views",
              "ig-extra-views",
              "ig-reach",
              "ig-profile-visits",
              "ig-bio-link-clicks",
            ].includes(d.id)
          ) {
            totalValue = originalData?.ig?.views || 1;
            percentageLabel = "of IG Views";
          } else if (
            [
              "mg-sp-via-ig-bio",
              "mg-sp-via-ig-story",
              "mg-sp-via-ig-manychat",
              "mg-sp-via-ig-dm",
              "mg-sp-via-email-broadcast",
              "mg-sp-via-email-automation",
              "mg-sp-via-unknown",
            ].includes(d.id)
          ) {
            totalValue = originalData?.mgSalesPageVisits?.total || 1;
            percentageLabel = "of Total SP Visits";
          } else if (d.id === "mg-sales-page-visits") {
            totalValue = originalData?.mgSalesPageVisits?.total || 1;
            percentageLabel = "of Total SP Visits";
          }
        } else {
          // For Sankey 2 & 3 (regular values): Use d.value directly
          displayValue = d.value;

          // Calculate percentage based on the most relevant parent node for Sankey 2 & 3
          if (d.id === "mg-sales-page-visits") {
            totalValue = originalData?.mgSalesPageVisits?.total || 1;
            percentageLabel = "of Total SP Visits";
          } else if (
            [
              "exited-sales-page",
              "mg-app-form-visits",
              "mg-app-non-starts",
            ].includes(d.id)
          ) {
            totalValue = originalData?.mgSalesPageVisits?.total || 1;
            percentageLabel = "of Total SP Visits";
          } else if (d.id === "mg-qualified-apps") {
            totalValue = originalData?.mgApplication?.qualifiedApps || 1;
            percentageLabel = "of Qualified Apps";
          } else if (
            [
              "not-contacted-or-rejected",
              "contacted",
              "rejected-w-o-convo",
              "unresponsive",
              "begun-conversation",
              "became-unresponsive",
              "rejected-based-on-convo",
              "accepted",
              "rejected-after-acceptance",
              "paid",
            ].includes(d.id)
          ) {
            totalValue = originalData?.mgApplication?.qualifiedApps || 1;
            percentageLabel = "of Qualified Apps";
          }
        }

        if (displayValue === null || displayValue === undefined) {
          return `${d.name}\nCount: N/A\nPercentage: N/A`;
        }

        return `${
          d.name
        }\nCount: ${displayValue.toLocaleString()}\n${percentageLabel}: ${(
          (displayValue / totalValue) *
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
        let sourceValue = null;
        let flowValue = null;

        if (useLogarithmicScaling) {
          // For Sankey 1 (logarithmic scaling): Use originalData for accurate values
          // Get source original value
          if (d.source.id === "ig-views") sourceValue = originalData?.ig?.views;
          else if (d.source.id === "ig-extra-views")
            sourceValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.source.id === "ig-reach")
            sourceValue = originalData?.ig?.reach;
          else if (d.source.id === "ig-profile-visits")
            sourceValue = originalData?.ig?.profileVisits;
          else if (d.source.id === "ig-bio-link-clicks")
            sourceValue = originalData?.ig?.bioLinkClicks;
          else if (d.source.id === "mg-sp-via-ig-bio")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.source.id === "mg-sp-via-ig-story")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.source.id === "mg-sp-via-ig-manychat")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.source.id === "mg-sp-via-ig-dm")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.source.id === "mg-sp-via-email-broadcast")
            sourceValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.source.id === "mg-sp-via-email-automation")
            sourceValue = originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.source.id === "mg-sp-via-unknown")
            sourceValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.source.id === "mg-sales-page-visits")
            sourceValue = originalData?.mgSalesPageVisits?.total;

          // Get target original value (same as flow value)
          if (d.target.id === "ig-views") flowValue = originalData?.ig?.views;
          else if (d.target.id === "ig-extra-views")
            flowValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.target.id === "ig-reach")
            flowValue = originalData?.ig?.reach;
          else if (d.target.id === "ig-profile-visits")
            flowValue = originalData?.ig?.profileVisits;
          else if (d.target.id === "ig-bio-link-clicks")
            flowValue = originalData?.ig?.bioLinkClicks;
          else if (d.target.id === "ig-profile-visits-no-bio-click")
            flowValue =
              originalData?.ig?.profileVisits && originalData?.ig?.bioLinkClicks
                ? originalData.ig.profileVisits - originalData.ig.bioLinkClicks
                : null;
          else if (d.target.id === "ig-reach-no-profile-visit")
            flowValue =
              originalData?.ig?.reach && originalData?.ig?.profileVisits
                ? originalData.ig.reach - originalData.ig.profileVisits
                : null;
          else if (d.target.id === "ig-views-no-profile-visit")
            flowValue =
              originalData?.ig?.views && originalData?.ig?.profileVisits
                ? originalData.ig.views - originalData.ig.profileVisits
                : null;
          else if (d.target.id === "mg-sp-via-ig-bio")
            flowValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.target.id === "mg-sp-via-ig-story")
            flowValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.target.id === "mg-sp-via-ig-manychat")
            flowValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.target.id === "mg-sp-via-ig-dm")
            flowValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.target.id === "mg-sp-via-email-broadcast")
            flowValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.target.id === "mg-sp-via-email-automation")
            flowValue = originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.target.id === "mg-sp-via-unknown")
            flowValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.target.id === "mg-sales-page-visits")
            flowValue = originalData?.mgSalesPageVisits?.total;
        } else {
          // For Sankey 2 & 3 (regular values): Use d.value and d.source.value directly
          sourceValue = d.source.value;
          flowValue = d.value;
        }

        if (flowValue === null || flowValue === undefined) {
          return `${d.source.name} → ${d.target.name}\nFlow: N/A\nConversion: N/A`;
        }

        const conversionRate =
          sourceValue > 0 ? ((flowValue / sourceValue) * 100).toFixed(1) : 0;
        return `${d.source.name} → ${
          d.target.name
        }\nFlow: ${flowValue.toLocaleString()}\nConversion: ${conversionRate}%`;
      });

    // Label positioning overrides - define once, use in both x and text-anchor
    const labelOverrides = {
      // Add specific node overrides here as needed
      "ig-views": "left",
      "ig-extra-views": "left",
      "ig-reach": "left",
      "ig-profile-visits": "left",
      "ig-reach-no-profile-visit": "left",
      "ig-views-no-profile-visit": "left",
      "ig-bio-link-clicks": "left",
      "mg-sp-via-ig-bio": "left",
      "mg-sp-via-ig-story": "left",
      "mg-sp-via-ig-manychat": "left",
      "mg-sp-via-ig-dm": "left",
      "mg-sp-via-email-broadcast": "left",
      "mg-sp-via-email-automation": "left",
      "mg-sp-via-unknown": "left",
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
        // Use the original data values directly for display
        let displayValue = null;

        if (useLogarithmicScaling) {
          // For Sankey 1 (logarithmic scaling): Use originalData for display values
          if (d.id === "ig-views") displayValue = originalData?.ig?.views;
          else if (d.id === "ig-extra-views")
            displayValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.id === "ig-reach") displayValue = originalData?.ig?.reach;
          else if (d.id === "ig-profile-visits")
            displayValue = originalData?.ig?.profileVisits;
          else if (d.id === "ig-bio-link-clicks")
            displayValue = originalData?.ig?.bioLinkClicks;
          else if (d.id === "ig-profile-visits-no-bio-click")
            displayValue =
              originalData?.ig?.profileVisits && originalData?.ig?.bioLinkClicks
                ? originalData.ig.profileVisits - originalData.ig.bioLinkClicks
                : null;
          else if (d.id === "ig-reach-no-profile-visit")
            displayValue =
              originalData?.ig?.reach && originalData?.ig?.profileVisits
                ? originalData.ig.reach - originalData.ig.profileVisits
                : null;
          else if (d.id === "ig-views-no-profile-visit")
            displayValue =
              originalData?.ig?.views && originalData?.ig?.profileVisits
                ? originalData.ig.views - originalData.ig.profileVisits
                : null;
          else if (d.id === "mg-sp-via-ig-bio")
            displayValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.id === "mg-sp-via-ig-story")
            displayValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.id === "mg-sp-via-ig-manychat")
            displayValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.id === "mg-sp-via-ig-dm")
            displayValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.id === "mg-sp-via-email-broadcast")
            displayValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.id === "mg-sp-via-email-automation")
            displayValue =
              originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.id === "mg-sp-via-unknown")
            displayValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.id === "mg-sales-page-visits")
            displayValue = originalData?.mgSalesPageVisits?.total;
          else displayValue = d.value; // fallback to node value
        } else {
          // For Sankey 2 & 3 (regular values): Use d.value directly
          displayValue = d.value;
        }

        // Add caution emoji for data gaps
        let gapEmoji = "";
        if (
          d.id === "ig-views" &&
          originalData?.dataGaps?.instagramViews?.gapCount > 0
        ) {
          gapEmoji = "⚠️ ";
        } else if (
          d.id === "mg-sales-page-visits" &&
          originalData?.dataGaps?.totalVisitors?.gapCount > 0
        ) {
          gapEmoji = "⚠️ ";
        } else if (
          d.id === "mg-app-form-visits" &&
          originalData?.dataGaps?.totalVisitors?.gapCount > 0
        ) {
          gapEmoji = "⚠️ ";
        }

        return displayValue !== null && displayValue !== undefined
          ? `${gapEmoji}${d.name} (${displayValue.toLocaleString()})`
          : `${gapEmoji}${d.name} (N/A)`;
      })
      .style("fill", "#ffffff")
      .style("font-weight", "500")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("pointer-events", "none");

    // Add flow percentage labels
    const flowLabels = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("x", (d) => {
        // Position at the middle of the flow path
        const sourceX = d.source.x1;
        const targetX = d.target.x0;
        return sourceX + 30;
      })
      .attr("y", (d) => {
        // Position at the middle of the flow path vertically
        return d.y0;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d) => {
        let sourceValue = null;
        let flowValue = null;

        if (useLogarithmicScaling) {
          // For Sankey 1 (logarithmic scaling): Use originalData for accurate values
          // Get source original value
          if (d.source.id === "ig-views") sourceValue = originalData?.ig?.views;
          else if (d.source.id === "ig-extra-views")
            sourceValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.source.id === "ig-reach")
            sourceValue = originalData?.ig?.reach;
          else if (d.source.id === "ig-profile-visits")
            sourceValue = originalData?.ig?.profileVisits;
          else if (d.source.id === "ig-bio-link-clicks")
            sourceValue = originalData?.ig?.bioLinkClicks;
          else if (d.source.id === "mg-sp-via-ig-bio")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.source.id === "mg-sp-via-ig-story")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.source.id === "mg-sp-via-ig-manychat")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.source.id === "mg-sp-via-ig-dm")
            sourceValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.source.id === "mg-sp-via-email-broadcast")
            sourceValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.source.id === "mg-sp-via-email-automation")
            sourceValue = originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.source.id === "mg-sp-via-unknown")
            sourceValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.source.id === "mg-sales-page-visits")
            sourceValue = originalData?.mgSalesPageVisits?.total;

          // Get target original value (same as flow value)
          if (d.target.id === "ig-views") flowValue = originalData?.ig?.views;
          else if (d.target.id === "ig-extra-views")
            flowValue =
              originalData?.ig?.views && originalData?.ig?.reach
                ? originalData.ig.views - originalData.ig.reach
                : null;
          else if (d.target.id === "ig-reach")
            flowValue = originalData?.ig?.reach;
          else if (d.target.id === "ig-profile-visits")
            flowValue = originalData?.ig?.profileVisits;
          else if (d.target.id === "ig-bio-link-clicks")
            flowValue = originalData?.ig?.bioLinkClicks;
          else if (d.target.id === "ig-profile-visits-no-bio-click")
            flowValue =
              originalData?.ig?.profileVisits && originalData?.ig?.bioLinkClicks
                ? originalData.ig.profileVisits - originalData.ig.bioLinkClicks
                : null;
          else if (d.target.id === "ig-reach-no-profile-visit")
            flowValue =
              originalData?.ig?.reach && originalData?.ig?.profileVisits
                ? originalData.ig.reach - originalData.ig.profileVisits
                : null;
          else if (d.target.id === "ig-views-no-profile-visit")
            flowValue =
              originalData?.ig?.views && originalData?.ig?.profileVisits
                ? originalData.ig.views - originalData.ig.profileVisits
                : null;
          else if (d.target.id === "mg-sp-via-ig-bio")
            flowValue = originalData?.mgSalesPageVisits?.fromIgBio;
          else if (d.target.id === "mg-sp-via-ig-story")
            flowValue = originalData?.mgSalesPageVisits?.fromIgStory;
          else if (d.target.id === "mg-sp-via-ig-manychat")
            flowValue = originalData?.mgSalesPageVisits?.fromIgManychat;
          else if (d.target.id === "mg-sp-via-ig-dm")
            flowValue = originalData?.mgSalesPageVisits?.fromIgDm;
          else if (d.target.id === "mg-sp-via-email-broadcast")
            flowValue = originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
          else if (d.target.id === "mg-sp-via-email-automation")
            flowValue = originalData?.mgSalesPageVisits?.fromEmailAutomations;
          else if (d.target.id === "mg-sp-via-unknown")
            flowValue = originalData?.mgSalesPageVisits?.fromUnknown;
          else if (d.target.id === "mg-sales-page-visits")
            flowValue = originalData?.mgSalesPageVisits?.total;
        } else {
          // For Sankey 2 & 3 (regular values): Use d.value and d.source.value directly
          sourceValue = d.source.value;
          flowValue = d.value;
        }

        // Calculate percentage based on flow pattern
        if (sourceValue && flowValue && sourceValue > 0) {
          // Detect flow pattern: one-to-many vs many-to-one
          const sourceOutgoingFlows = links.filter(
            (link) => link.source.id === d.source.id
          );
          const targetIncomingFlows = links.filter(
            (link) => link.target.id === d.target.id
          );

          let percentage;

          if (
            sourceOutgoingFlows.length > 1 &&
            targetIncomingFlows.length === 1
          ) {
            // One-to-Many: Source splits to multiple targets
            // Show what percentage of the source goes to this target
            percentage = Math.round((flowValue / sourceValue) * 100);
          } else if (
            sourceOutgoingFlows.length === 1 &&
            targetIncomingFlows.length > 1
          ) {
            // Many-to-One: Multiple sources feed into one target
            // Show what percentage of the target comes from this source
            let targetTotalValue = null;

            if (useLogarithmicScaling) {
              // Get target total from originalData
              if (d.target.id === "ig-views")
                targetTotalValue = originalData?.ig?.views;
              else if (d.target.id === "ig-extra-views")
                targetTotalValue =
                  originalData?.ig?.views && originalData?.ig?.reach
                    ? originalData.ig.views - originalData.ig.reach
                    : null;
              else if (d.target.id === "ig-reach")
                targetTotalValue = originalData?.ig?.reach;
              else if (d.target.id === "ig-profile-visits")
                targetTotalValue = originalData?.ig?.profileVisits;
              else if (d.target.id === "ig-bio-link-clicks")
                targetTotalValue = originalData?.ig?.bioLinkClicks;
              else if (d.target.id === "ig-profile-visits-no-bio-click")
                targetTotalValue =
                  originalData?.ig?.profileVisits &&
                  originalData?.ig?.bioLinkClicks
                    ? originalData.ig.profileVisits -
                      originalData.ig.bioLinkClicks
                    : null;
              else if (d.target.id === "ig-reach-no-profile-visit")
                targetTotalValue =
                  originalData?.ig?.reach && originalData?.ig?.profileVisits
                    ? originalData.ig.reach - originalData.ig.profileVisits
                    : null;
              else if (d.target.id === "ig-views-no-profile-visit")
                targetTotalValue =
                  originalData?.ig?.views && originalData?.ig?.profileVisits
                    ? originalData.ig.views - originalData.ig.profileVisits
                    : null;
              else if (d.target.id === "mg-sp-via-ig-bio")
                targetTotalValue = originalData?.mgSalesPageVisits?.fromIgBio;
              else if (d.target.id === "mg-sp-via-ig-story")
                targetTotalValue = originalData?.mgSalesPageVisits?.fromIgStory;
              else if (d.target.id === "mg-sp-via-ig-manychat")
                targetTotalValue =
                  originalData?.mgSalesPageVisits?.fromIgManychat;
              else if (d.target.id === "mg-sp-via-ig-dm")
                targetTotalValue = originalData?.mgSalesPageVisits?.fromIgDm;
              else if (d.target.id === "mg-sp-via-email-broadcast")
                targetTotalValue =
                  originalData?.mgSalesPageVisits?.fromEmailBroadcasts;
              else if (d.target.id === "mg-sp-via-email-automation")
                targetTotalValue =
                  originalData?.mgSalesPageVisits?.fromEmailAutomations;
              else if (d.target.id === "mg-sp-via-unknown")
                targetTotalValue = originalData?.mgSalesPageVisits?.fromUnknown;
              else if (d.target.id === "mg-sales-page-visits")
                targetTotalValue = originalData?.mgSalesPageVisits?.total;
            } else {
              // For Sankey 2 & 3, use target node value
              targetTotalValue = d.target.value;
            }

            if (targetTotalValue && targetTotalValue > 0) {
              percentage = Math.round((flowValue / targetTotalValue) * 100);
            } else {
              percentage = Math.round((flowValue / sourceValue) * 100);
            }
          } else {
            // Default: One-to-One or complex pattern
            // Show conversion rate from source to target
            percentage = Math.round((flowValue / sourceValue) * 100);
          }

          return `${percentage}%`;
        }
        return "";
      })
      .style("fill", "#ffffff")
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
  // Check if reach data is available (not null/undefined)
  const hasReachData = data.ig?.reach !== null && data.ig?.reach !== undefined;

  // Debug: Log the data being used for Sankey diagrams
  console.log("Sankey Data Debug:", {
    mgApplication: data.mgApplication,
    mgSelection: data.mgSelection,
    qualifiedApps: data.mgApplication?.qualifiedApps,
    totalSelection: data.mgSelection
      ? (data.mgSelection.rejectedWoCovo || 0) +
        (data.mgSelection.contacted || 0)
      : null,
    hasReachData,
    reachValue: data.ig?.reach,
  });

  // Debug: Log specific values for Sankey 2
  console.log("Sankey 2 Debug Values:", {
    appFormPageVisits: data.mgApplication?.appFormPageVisits,
    appStarts: data.mgApplication?.appStarts,
    appCompletions: data.mgApplication?.appCompletions,
    qualifiedApps: data.mgApplication?.qualifiedApps,
    salesPageTotal: data.mgSalesPageVisits?.total,
  });

  // Debug: Log the full mgApplication object to see what's actually there
  console.log("Full mgApplication object:", data.mgApplication);

  // Debug: Check for discrepancies between source of truth and Sankey data
  console.log("Data Consistency Check:", {
    sourceOfTruth: {
      qualifiedApps: data.mgApplication?.qualifiedApps,
      contacted: data.mgSelection?.contacted,
      rejectedWoCovo: data.mgSelection?.rejectedWoCovo,
      notContactedOrRejected: data.mgSelection?.notContactedOrRejected,
    },
    sankeyUsage: {
      qualifiedApps: data.mgApplication?.qualifiedApps, // Same as source of truth
      selectionStates: {
        contacted: data.mgSelection?.contacted,
        rejectedWoCovo: data.mgSelection?.rejectedWoCovo,
        unresponsive: data.mgSelection?.unresponsive,
        begunConversation: data.mgSelection?.begunConversation,
        becameUnresponsive: data.mgSelection?.becameUnresponsive,
        rejectedBasedOnConvo: data.mgSelection?.rejectedBasedOnConvo,
        acceptedNotPaid: data.mgSelection?.acceptedNotPaid,
        rejectedAfterAcceptance: data.mgSelection?.rejectedAfterAcceptance,
        paid: data.mgSelection?.paid,
        notContactedOrRejected: data.mgSelection?.notContactedOrRejected,
        noResponseYet: data.mgSelection?.noResponseYet,
        noDecisionYet: data.mgSelection?.noDecisionYet,
        noOutcomeYet: data.mgSelection?.noOutcomeYet,
      },
    },
  });
  // 1. Traffic Funnel: Instagram Engagement → MG Sales Page Visits
  const trafficFunnelData = {
    nodes: [
      // Only include IG Views node if views > 0
      ...(data.ig?.views > 0
        ? [
            {
              id: "ig-views",
              name: "IG Views",
              category: "Instagram",
              value: data.ig.views,
            },
          ]
        : []),
      // Only include extra views and reach nodes if reach data is available
      ...(hasReachData
        ? [
            {
              id: "ig-extra-views",
              name: "IG Extra Views",
              category: "Instagram",
              value: data.ig.views - data.ig.reach,
            },
            {
              id: "ig-reach",
              name: "IG Reach",
              category: "Instagram",
              value: data.ig.reach,
            },
          ]
        : []),
      {
        id: "ig-profile-visits",
        name: "IG Profile Visits",
        category: "Instagram",
        value: data.ig?.profileVisits,
      },
      {
        id: "ig-bio-link-clicks",
        name: "IG Bio Link Clicks",
        category: "Instagram",
        value: data.ig?.bioLinkClicks,
      },
      {
        id: "ig-profile-visits-no-bio-click",
        name: "No Bio Click",
        category: "Instagram",
        value:
          data.ig?.profileVisits && data.ig?.bioLinkClicks
            ? data.ig.profileVisits - data.ig.bioLinkClicks
            : null,
      },
      // Only include "No Profile Visit" node if we have reach data
      ...(hasReachData
        ? [
            {
              id: "ig-reach-no-profile-visit",
              name: "No Profile Visit",
              category: "Instagram",
              value:
                data.ig?.reach && data.ig?.profileVisits
                  ? data.ig.reach - data.ig.profileVisits
                  : null,
            },
          ]
        : [
            {
              id: "ig-views-no-profile-visit",
              name: "No Profile Visit",
              category: "Instagram",
              value:
                data.ig?.views && data.ig?.profileVisits
                  ? data.ig.views - data.ig.profileVisits
                  : null,
            },
          ]),
      {
        id: "mg-sp-via-ig-bio",
        name: "MG SP via IG Bio",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromIgBio,
      },
      {
        id: "mg-sp-via-ig-story",
        name: "MG SP via IG Story",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromIgStory,
      },
      {
        id: "mg-sp-via-ig-manychat",
        name: "MG SP via IG Manychat",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromIgManychat,
      },
      {
        id: "mg-sp-via-ig-dm",
        name: "MG SP via IG DM",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromIgDm,
      },
      {
        id: "mg-sp-via-email-broadcast",
        name: "MG SP via Email Broadcast",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromEmailBroadcasts,
      },
      {
        id: "mg-sp-via-email-automation",
        name: "MG SP via Email Automation",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromEmailAutomations,
      },
      {
        id: "mg-sp-via-unknown",
        name: "MG SP via Unknown",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.fromUnknown,
      },
      {
        id: "mg-sales-page-visits",
        name: "MG Sales Page Visits",
        category: "mg-funnel",
        value: data.mgSalesPageVisits?.total,
      },
    ],
    links: [
      // Instagram engagement funnel - conditional based on reach data availability and views > 0
      ...(data.ig?.views > 0 && hasReachData
        ? [
            // With reach data: views -> extra views + reach -> profile visits -> bio link clicks -> MG SP via IG Bio
            {
              source: "ig-views",
              target: "ig-extra-views",
              value: Math.round(Math.log10(data.ig.views - data.ig.reach)),
            },
            {
              source: "ig-views",
              target: "ig-reach",
              value: Math.round(Math.log10(data.ig.reach)),
            },
            {
              source: "ig-reach",
              target: "ig-profile-visits",
              value: data.ig?.profileVisits
                ? Math.round(Math.log10(data.ig.profileVisits))
                : null,
            },
            {
              source: "ig-reach",
              target: "ig-reach-no-profile-visit",
              value:
                data.ig?.reach && data.ig?.profileVisits
                  ? Math.round(
                      Math.log10(data.ig.reach - data.ig.profileVisits)
                    )
                  : null,
            },
          ]
        : data.ig?.views > 0
        ? [
            // Without reach data: views -> profile visits -> bio link clicks -> MG SP via IG Bio
            {
              source: "ig-views",
              target: "ig-profile-visits",
              value: data.ig?.profileVisits
                ? Math.round(Math.log10(data.ig.profileVisits))
                : null,
            },
            {
              source: "ig-views",
              target: "ig-views-no-profile-visit",
              value:
                data.ig?.views && data.ig?.profileVisits
                  ? Math.round(
                      Math.log10(data.ig.views - data.ig.profileVisits)
                    )
                  : null,
            },
          ]
        : []),
      {
        source: "ig-profile-visits",
        target: "ig-bio-link-clicks",
        value: data.ig?.bioLinkClicks
          ? Math.round(Math.log10(data.ig.bioLinkClicks))
          : null,
      },
      {
        source: "ig-profile-visits",
        target: "ig-profile-visits-no-bio-click",
        value:
          data.ig?.profileVisits && data.ig?.bioLinkClicks
            ? Math.round(
                Math.log10(data.ig.profileVisits - data.ig.bioLinkClicks)
              )
            : null,
      },
      {
        source: "ig-bio-link-clicks",
        target: "mg-sp-via-ig-bio",
        value: data.mgSalesPageVisits?.fromIgBio
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgBio))
          : null,
      },
      // Alternative paths - conditional based on reach data availability
      ...(hasReachData
        ? [
            // With reach data: alternative paths from reach to other IG sources
            {
              source: "ig-reach",
              target: "mg-sp-via-ig-story",
              value: data.mgSalesPageVisits?.fromIgStory
                ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgStory))
                : null,
            },
            {
              source: "ig-reach",
              target: "mg-sp-via-ig-manychat",
              value: data.mgSalesPageVisits?.fromIgManychat
                ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgManychat))
                : null,
            },
            {
              source: "ig-reach",
              target: "mg-sp-via-ig-dm",
              value: data.mgSalesPageVisits?.fromIgDm
                ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgDm))
                : null,
            },
          ]
        : []), // No Instagram links when views is 0 or null
      // Email sources (logarithmic scaling)
      {
        source: "mg-sp-via-email-broadcast",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromEmailBroadcasts
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromEmailBroadcasts))
          : null,
      },
      {
        source: "mg-sp-via-email-automation",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromEmailAutomations
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromEmailAutomations))
          : null,
      },
      {
        source: "mg-sp-via-unknown",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromUnknown
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromUnknown))
          : null,
      },
      // All IG sources flow to MG Sales Page Visits
      {
        source: "mg-sp-via-ig-bio",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromIgBio
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgBio))
          : null,
      },
      {
        source: "mg-sp-via-ig-story",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromIgStory
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgStory))
          : null,
      },
      {
        source: "mg-sp-via-ig-manychat",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromIgManychat
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgManychat))
          : null,
      },
      {
        source: "mg-sp-via-ig-dm",
        target: "mg-sales-page-visits",
        value: data.mgSalesPageVisits?.fromIgDm
          ? Math.round(Math.log10(data.mgSalesPageVisits.fromIgDm))
          : null,
      },
    ],
  };

  // 2. Application Funnel: MG Sales Page Visits → MG Qualified Apps
  const applicationFunnelData = {
    nodes: [
      // Only include MG Sales Page Visits if value > 0
      ...(data.mgSalesPageVisits?.total > 0
        ? [
            {
              id: "mg-sales-page-visits",
              name: "MG Sales Page Visits",
              category: "mg-funnel",
              value: data.mgSalesPageVisits.total,
            },
          ]
        : []),
      // Only include MG Sales Page Exits if sales page visits > 0
      ...(data.mgSalesPageVisits?.total > 0
        ? [
            {
              id: "exited-sales-page",
              name: "MG Sales Page Exits",
              category: "mg-selection",
            },
          ]
        : []),
      // Only include MG App Form Visits if value > 0
      ...(data.mgApplication?.appFormPageVisits > 0
        ? [
            {
              id: "mg-app-form-visits",
              name: "MG App Form Visits",
              category: "mg-funnel",
              value: data.mgApplication.appFormPageVisits,
            },
          ]
        : []),
      // Only include MG App Non-Starts if app form visits > 0
      ...(data.mgApplication?.appFormPageVisits > 0
        ? [
            {
              id: "mg-app-non-starts",
              name: "MG App Non-Starts",
              category: "mg-selection",
            },
          ]
        : []),
      {
        id: "app-starts",
        name: "MG App Starts",
        category: "mg-funnel",
        value: data.mgApplication.appStarts,
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
        value: data.mgApplication.appCompletions,
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
        value: data.mgApplication.qualifiedApps,
      },
    ],
    links: [
      // Only include sales page related flows if sales page visits > 0
      ...(data.mgSalesPageVisits?.total > 0
        ? [
            {
              source: "mg-sales-page-visits",
              target: "exited-sales-page",
              value:
                data.mgSalesPageVisits.total !== null &&
                data.mgApplication.appFormPageVisits !== null
                  ? data.mgSalesPageVisits.total -
                    data.mgApplication.appFormPageVisits
                  : null,
            },
            ...(data.mgApplication?.appFormPageVisits > 0
              ? [
                  {
                    source: "mg-sales-page-visits",
                    target: "mg-app-form-visits",
                    value: data.mgApplication.appFormPageVisits,
                  },
                ]
              : []),
          ]
        : []),
      // Only include app form visits related flows if app form visits > 0
      ...(data.mgApplication?.appFormPageVisits > 0
        ? [
            {
              source: "mg-app-form-visits",
              target: "mg-app-non-starts",
              value:
                data.mgApplication.appFormPageVisits !== null &&
                data.mgApplication.appStarts !== null
                  ? Math.max(
                      0,
                      data.mgApplication.appFormPageVisits -
                        data.mgApplication.appStarts
                    )
                  : null,
            },
            {
              source: "mg-app-form-visits",
              target: "app-starts",
              value: data.mgApplication.appStarts,
            },
          ]
        : []),
      {
        source: "app-starts",
        target: "app-abandons",
        value: data.mgApplication.appAbandons,
      },
      {
        source: "app-starts",
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

  // Debug: Log the built Sankey 2 data structure
  console.log("Built Sankey 2 Data:", {
    nodes: applicationFunnelData.nodes.map((node) => ({
      id: node.id,
      name: node.name,
      value: node.value,
    })),
    links: applicationFunnelData.links.map((link) => ({
      source: link.source,
      target: link.target,
      value: link.value,
    })),
  });

  // 3. Selection Funnel: MG Qualified Apps → Sales Outcomes
  const selectionFunnelData = {
    nodes: [
      {
        id: "mg-qualified-apps",
        name: "MG Qualified Apps",
        category: "mg-funnel",
      },
      {
        id: "not-contacted-or-rejected",
        name: "Not Contacted or Rejected",
        category: "mg-selection",
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
        value: data.mgSelection.begunConversation,
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
        name: "Accepted",
        category: "mg-selection",
        value:
          (data.mgSelection.acceptedNotPaid || 0) +
          (data.mgSelection.paid || 0),
      },
      {
        id: "rejected-after-acceptance",
        name: "Rejected After Acceptance",
        category: "mg-selection",
      },
      {
        id: "paid",
        name: "Paid",
        category: "mg-sales",
        value: data.mgSelection.paid,
      },
      // Additional gap states
      {
        id: "no-response-yet",
        name: "No Response Yet",
        category: "mg-selection",
      },
      {
        id: "no-decision-yet",
        name: "No Decision Yet",
        category: "mg-selection",
      },
      {
        id: "no-outcome-yet",
        name: "No Outcome Yet",
        category: "mg-selection",
      },
    ],
    links: [
      // From MG Qualified Apps (base state)
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
        source: "mg-qualified-apps",
        target: "not-contacted-or-rejected",
        value: data.mgSelection.notContactedOrRejected,
      },

      // From Contacted (subset of qualified)
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
        source: "contacted",
        target: "no-response-yet",
        value: data.mgSelection.noResponseYet,
      },

      // From Began Conversation (subset of contacted)
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
        value:
          (data.mgSelection.acceptedNotPaid || 0) +
          (data.mgSelection.paid || 0),
      },
      {
        source: "begun-conversation",
        target: "no-decision-yet",
        value: data.mgSelection.noDecisionYet,
      },

      // From Accepted (subset of began conversation)
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
      {
        source: "accepted-not-paid",
        target: "no-outcome-yet",
        value: data.mgSelection.noOutcomeYet,
      },
    ],
  };

  return { trafficFunnelData, applicationFunnelData, selectionFunnelData };
};

// Main Dashboard Component
const ClientAcquisitionDashboard = () => {
  const [funnelData, setFunnelData] = useState(defaultFunnelData);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [instagramTokenExpired, setInstagramTokenExpired] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago
    end: new Date().toISOString().split("T")[0], // today
  });

  const fetchAcquisitionData = async (startDate, endDate) => {
    setIsLoading(true);
    setError(null);
    setInstagramTokenExpired(false);

    try {
      console.log(`Fetching acquisition data for ${startDate} to ${endDate}`);
      console.log("Starting API calls...");

      // Fetch data from all three endpoints in parallel
      const [plausibleResponse, airtableResponse, instagramResponse] =
        await Promise.all([
          fetch(
            `/api/internalstats/plausible?start=${startDate}&end=${endDate}`
          ),
          fetch(
            `/api/internalstats/airtable?start=${startDate}&end=${endDate}`
          ),
          fetch(
            `/api/internalstats/instagram?start=${startDate}&end=${endDate}`
          ),
        ]);

      console.log("API responses received:", {
        plausible: plausibleResponse.status,
        airtable: airtableResponse.status,
        instagram: instagramResponse.status,
      });

      if (!plausibleResponse.ok) {
        throw new Error(
          `Plausible API error! status: ${plausibleResponse.status}`
        );
      }

      if (!airtableResponse.ok) {
        throw new Error(
          `Airtable API error! status: ${airtableResponse.status}`
        );
      }

      if (!instagramResponse.ok) {
        throw new Error(
          `Instagram API error! status: ${instagramResponse.status}`
        );
      }

      const [plausibleResult, airtableResult, instagramResult] =
        await Promise.all([
          plausibleResponse.json(),
          airtableResponse.json(),
          instagramResponse.json(),
        ]);

      if (!plausibleResult.success) {
        throw new Error(
          plausibleResult.error || "Failed to fetch Plausible data"
        );
      }

      if (!airtableResult.success) {
        throw new Error(
          airtableResult.error || "Failed to fetch Airtable data"
        );
      }

      if (!instagramResult.success) {
        // Check if it's a token expiration error
        if (instagramResult.error === "INSTAGRAM_TOKEN_EXPIRED") {
          setInstagramTokenExpired(true);
          // Continue with null Instagram data instead of throwing error
        } else {
          throw new Error(
            instagramResult.error || "Failed to fetch Instagram data"
          );
        }
      }

      // Debug the API responses
      console.log("Plausible API response:", plausibleResult);
      console.log("Airtable API response:", airtableResult);
      console.log("Instagram API response:", instagramResult);
      console.log(
        "Plausible mgSalesPageVisits:",
        plausibleResult.data.mgSalesPageVisits
      );

      // Debug specific UTM values
      console.log("UTM Debug - Frontend received:", {
        fromIgBio: plausibleResult.data.mgSalesPageVisits?.fromIgBio,
        fromIgStory: plausibleResult.data.mgSalesPageVisits?.fromIgStory,
        fromIgManychat: plausibleResult.data.mgSalesPageVisits?.fromIgManychat,
        fromIgDm: plausibleResult.data.mgSalesPageVisits?.fromIgDm,
        fromEmailBroadcasts:
          plausibleResult.data.mgSalesPageVisits?.fromEmailBroadcasts,
        fromUnknown: plausibleResult.data.mgSalesPageVisits?.fromUnknown,
      });

      // Calculate interface validation using data from both endpoints
      const salesPageVisits = plausibleResult.data.mgSalesPageVisits?.total;
      const qualifiedApps = airtableResult.data.mgApplication?.qualifiedApps;

      console.log("Interface Validation Calculation:", {
        salesPageVisits,
        qualifiedApps,
        source: "Frontend calculation using both API results",
      });

      const interfaceValidation = {
        salesPageVisits: {
          sankey1Output: salesPageVisits, // From Plausible (Sankey 1 output)
          sankey2Input: salesPageVisits, // Should match Sankey 1 output
          match: true, // Always match since they're the same value
          gap: 0,
        },
        qualifiedApps: {
          sankey2Output: qualifiedApps, // From Airtable (Sankey 2 output)
          sankey3Input: qualifiedApps, // Should match Sankey 2 output
          match: true, // Always match since they're the same value
          gap: 0,
        },
        overallValid: true,
      };

      // Combine data from all three endpoints
      const combinedData = {
        ig: instagramResult.success
          ? instagramResult.data.ig
          : {
              views: null,
              reach: null,
              profileVisits: null,
              bioLinkClicks: null,
            }, // Instagram data (views, reach, profileVisits, bioLinkClicks)
        email: { opens: null }, // No email data from Plausible
        mgSalesPageVisits: plausibleResult.data.mgSalesPageVisits,
        mgApplication: {
          ...plausibleResult.data.mgApplication, // Plausible data (exited, appFormPageVisits)
          ...airtableResult.data.mgApplication, // Airtable data (appStarts, appCompletions, etc.)
        },
        mgSelection: airtableResult.data.mgSelection, // All Airtable data
        revenue: airtableResult.data.revenue, // Revenue data from Airtable
        interfaceValidation: interfaceValidation, // Calculated interface validation
        dataGaps: {
          ...plausibleResult.rawData?.dataGaps, // Data gap analysis from Plausible
          ...(instagramResult.success ? instagramResult.data?.dataGaps : {}), // Instagram data gaps
        },
      };

      console.log("Final combined funnelData:", combinedData);
      console.log(
        "Final mgSalesPageVisits in state:",
        combinedData.mgSalesPageVisits
      );
      console.log("Revenue data from Airtable:", airtableResult.data.revenue);
      console.log("Combined revenue data:", combinedData.revenue);

      // Debug: Log the data being set in funnelData
      console.log("Setting funnelData with:", {
        appFormPageVisits: combinedData.mgApplication?.appFormPageVisits,
        appStarts: combinedData.mgApplication?.appStarts,
        salesPageTotal: combinedData.mgSalesPageVisits?.total,
        timestamp: new Date().toISOString(),
      });

      setFunnelData(combinedData);
    } catch (err) {
      console.error("Error fetching acquisition data:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadData = () => {
    fetchAcquisitionData(dateRange.start, dateRange.end);
  };

  // Helper function to check if a metric has data gaps
  const hasDataGaps = (metricType) => {
    if (!funnelData.dataGaps) return false;

    switch (metricType) {
      case "salesPage":
        return (
          funnelData.dataGaps.salesPage &&
          funnelData.dataGaps.salesPage.gapCount > 0
        );
      case "appForm":
        return (
          funnelData.dataGaps.appForm &&
          funnelData.dataGaps.appForm.gapCount > 0
        );
      case "instagramViews":
        return (
          funnelData.dataGaps.instagramViews &&
          funnelData.dataGaps.instagramViews.gapCount > 0
        );
      default:
        return false;
    }
  };

  // Helper function to get gap severity for a metric
  const getGapSeverity = (metricType) => {
    if (!funnelData.dataGaps) return null;

    let completeness = 1;
    switch (metricType) {
      case "salesPage":
        if (funnelData.dataGaps.salesPage) {
          completeness = funnelData.dataGaps.salesPage.completeness;
        }
        break;
      case "appForm":
        if (funnelData.dataGaps.appForm) {
          completeness = funnelData.dataGaps.appForm.completeness;
        }
        break;
      default:
        return null;
    }

    return completeness < 0.9 ? "high" : "medium";
  };

  // Helper component to display metrics with gap indicators
  const MetricWithGapIndicator = ({ value, metricType, className = "" }) => {
    const hasGaps = hasDataGaps(metricType);
    const severity = getGapSeverity(metricType);

    if (!hasGaps) {
      return <span className={className}>{value}</span>;
    }

    const indicatorColor = "text-yellow-600";
    const indicatorEmoji = "⚠️";

    return (
      <span className={`${className} relative`}>
        {value}
        <span
          className={`ml-1 ${indicatorColor}`}
          title={`Data gaps detected in ${metricType} metric`}
        >
          {indicatorEmoji}
        </span>
      </span>
    );
  };

  // Helper function to generate data gap warnings
  const getDataGapWarnings = () => {
    const warnings = [];

    if (!funnelData.dataGaps) return warnings;

    // Helper function to format date ranges
    const formatDateRanges = (gaps) => {
      if (!gaps || gaps.length === 0) return [];

      // Sort dates
      const sortedGaps = [...gaps].sort();
      const ranges = [];
      let start = sortedGaps[0];
      let end = start;

      for (let i = 1; i < sortedGaps.length; i++) {
        const current = sortedGaps[i];
        const prev = sortedGaps[i - 1];

        // Check if dates are consecutive
        const currentDate = new Date(current);
        const prevDate = new Date(prev);
        const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          // Consecutive date, extend range
          end = current;
        } else {
          // Gap in dates, save current range and start new one
          ranges.push({ start, end });
          start = current;
          end = current;
        }
      }

      // Add the last range
      ranges.push({ start, end });

      // Format ranges
      return ranges.map((range) => {
        if (range.start === range.end) {
          return range.start;
        } else {
          return `${range.start} to ${range.end}`;
        }
      });
    };

    // Collect all data gaps
    const gapMetrics = [];
    let totalGapCount = 0;

    // Check Plausible data gaps (all three metrics share the same gaps since they use the same tracking)
    if (
      funnelData.dataGaps.totalVisitors &&
      funnelData.dataGaps.totalVisitors.gapCount > 0
    ) {
      const completeness = funnelData.dataGaps.totalVisitors.completeness; // Backend already sends as percentage
      const dateRanges = funnelData.dataGaps.totalVisitors.gaps.map((gap) =>
        gap.start === gap.end ? gap.start : `${gap.start} to ${gap.end}`
      );
      const rangesText =
        dateRanges.length <= 3
          ? dateRanges.join(", ")
          : `${dateRanges.slice(0, 3).join(", ")} and ${
              dateRanges.length - 3
            } more`;

      gapMetrics.push({
        name: "Total Visitors, Sales Page Visits, App Form Visits",
        gapCount: funnelData.dataGaps.totalVisitors.gapCount,
        completeness: completeness,
        rangesText: rangesText,
        severity: "medium",
      });

      totalGapCount += funnelData.dataGaps.totalVisitors.gapCount;
    }

    // Check Instagram views gaps
    if (
      funnelData.dataGaps.instagramViews &&
      funnelData.dataGaps.instagramViews.gapCount > 0
    ) {
      const affectedRange =
        funnelData.dataGaps.instagramViews.affectedDateRange;
      const rangesText = `${affectedRange.start} to ${affectedRange.end}`;

      gapMetrics.push({
        name: "Instagram Views",
        gapCount: funnelData.dataGaps.instagramViews.gapCount,
        completeness: funnelData.dataGaps.instagramViews.completeness,
        rangesText: rangesText,
        severity: "medium",
      });

      totalGapCount += funnelData.dataGaps.instagramViews.gapCount;
    }

    // Create consolidated warning if any gaps exist
    if (gapMetrics.length > 0) {
      const metricsText = gapMetrics
        .map(
          (metric) =>
            `${metric.name}: Missing ${metric.gapCount} days: ${metric.rangesText}. ${metric.completeness}% complete.`
        )
        .join("\n");

      warnings.push({
        type: "warning",
        title: "Data Gaps Detected",
        message: `${metricsText}`,
        details: gapMetrics.map((metric) => ({
          name: metric.name,
          gapCount: metric.gapCount,
          completeness: metric.completeness,
          rangesText: metric.rangesText,
        })),
        metric: "",
        severity: "medium",
      });
    }

    return warnings;
  };

  const getDateRangePresets = () => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    return {
      Today: {
        start: formatDate(today),
        end: formatDate(today),
      },
      "Last 7 days": {
        start: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
        end: formatDate(today),
      },
      "Last 30 days": {
        start: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
        end: formatDate(today),
      },
      "Last 90 days": {
        start: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
        end: formatDate(today),
      },
      YTD: {
        start: formatDate(new Date(today.getFullYear(), 0, 1)),
        end: formatDate(today),
      },
      "Previous Year": {
        start: formatDate(new Date(today.getFullYear() - 1, 0, 1)),
        end: formatDate(new Date(today.getFullYear() - 1, 11, 31)),
      },
      "Last 12 months": {
        start: formatDate(
          new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
        ),
        end: formatDate(today),
      },
    };
  };

  const handlePresetDateRange = (presetName) => {
    const presets = getDateRangePresets();
    const preset = presets[presetName];
    if (preset) {
      setDateRange(preset);
      fetchAcquisitionData(preset.start, preset.end);
    }
  };

  const isCurrentPreset = (presetName) => {
    const presets = getDateRangePresets();
    const preset = presets[presetName];
    return (
      preset && preset.start === dateRange.start && preset.end === dateRange.end
    );
  };

  // Load data on component mount
  useEffect(() => {
    console.log("Component mounted, fetching data with dateRange:", dateRange);
    fetchAcquisitionData(dateRange.start, dateRange.end);
  }, []);

  // Debug: Log funnelData before building Sankey
  console.log("About to build Sankey with funnelData:", {
    appFormPageVisits: funnelData.mgApplication?.appFormPageVisits,
    appStarts: funnelData.mgApplication?.appStarts,
    salesPageTotal: funnelData.mgSalesPageVisits?.total,
    timestamp: new Date().toISOString(),
  });

  const { trafficFunnelData, applicationFunnelData, selectionFunnelData } =
    buildSankeyData(funnelData);

  // Calculate summary statistics - only show real data, no made-up numbers
  const igViews = funnelData.ig.views;
  const emailOpens = funnelData.email.opens;
  const paidConversions = funnelData.mgSelection.paid;

  // Only calculate if we have real data (email data not available, so just use IG views)
  const totalTraffic = igViews !== null ? igViews : null;

  const summaryStats = {
    totalViews: totalTraffic !== null ? totalTraffic : "N/A",
    salesPageVisits:
      funnelData.mgSalesPageVisits?.total !== null &&
      funnelData.mgSalesPageVisits?.total !== undefined
        ? funnelData.mgSalesPageVisits.total
        : "N/A",
    appFormVisits:
      funnelData.mgApplication?.appFormPageVisits !== null &&
      funnelData.mgApplication?.appFormPageVisits !== undefined
        ? funnelData.mgApplication.appFormPageVisits
        : "N/A",
    completedApps:
      funnelData.mgApplication?.appCompletions !== null &&
      funnelData.mgApplication?.appCompletions !== undefined
        ? funnelData.mgApplication.appCompletions
        : "N/A",
    qualifiedApps:
      funnelData.mgApplication?.qualifiedApps !== null &&
      funnelData.mgApplication?.qualifiedApps !== undefined
        ? funnelData.mgApplication.qualifiedApps
        : "N/A",
    contacted:
      funnelData.mgSelection?.contacted !== null &&
      funnelData.mgSelection?.contacted !== undefined
        ? funnelData.mgSelection.contacted
        : "N/A",
    accepted:
      funnelData.mgSelection?.acceptedNotPaid !== null &&
      funnelData.mgSelection?.acceptedNotPaid !== undefined
        ? funnelData.mgSelection.acceptedNotPaid
        : "N/A",
    paid:
      funnelData.mgSelection?.paid !== null &&
      funnelData.mgSelection?.paid !== undefined
        ? funnelData.mgSelection.paid
        : "N/A",
    sales:
      funnelData.revenue?.mgPaymentsDay !== null &&
      funnelData.revenue?.mgPaymentsDay !== undefined
        ? funnelData.revenue.mgPaymentsDay
        : "N/A",
    refunded:
      funnelData.revenue?.mgRefundsDay !== null &&
      funnelData.revenue?.mgRefundsDay !== undefined
        ? funnelData.revenue.mgRefundsDay
        : "N/A",
    netSales:
      funnelData.revenue?.mgNetPayDay !== null &&
      funnelData.revenue?.mgNetPayDay !== undefined
        ? funnelData.revenue.mgNetPayDay
        : "N/A",
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Client Acquisition Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                MG (Mentorship Group) Funnel Analysis
              </p>
            </div>
            <Button
              onClick={handleLoadData}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>

          {/* Date Range Presets */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Quick Date Ranges:
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(getDateRangePresets()).map((presetName) => (
                <Button
                  key={presetName}
                  onClick={() => handlePresetDateRange(presetName)}
                  disabled={isLoading}
                  variant={isCurrentPreset(presetName) ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {presetName}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date:
              </label>
              <Input
                type="date"
                id="startDate"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-40"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                End Date:
              </label>
              <Input
                type="date"
                id="endDate"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-40"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleLoadData}
              disabled={isLoading || !dateRange.start || !dateRange.end}
              size="sm"
            >
              Load Data
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
              {error.includes("Plausible API key not configured") && (
                <div className="mt-2 text-sm">
                  <p>
                    To use real data, you need to configure Plausible Analytics:
                  </p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>
                      Get your API key from{" "}
                      <a
                        href="https://plausible.io/settings#api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Plausible Settings
                      </a>
                    </li>
                    <li>
                      Set the <code>PLAUSIBLE_API_KEY</code> environment
                      variable
                    </li>
                    <li>
                      Update the page URLs in the backend to match your actual
                      URLs
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading acquisition data...
              </div>
            </div>
          )}

          {/* Instagram Token Expiration Warning */}
          {instagramTokenExpired && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <strong>Instagram Access Token Expired</strong>
                  <p className="text-sm mt-1">
                    The Instagram access token has expired. Instagram data is
                    not available. Please update the{" "}
                    <code>INSTAGRAM_ACCESS_TOKEN</code> environment variable
                    with a fresh token from the Instagram Graph API.
                  </p>
                  <p className="text-sm mt-2">
                    <a
                      href="https://developers.facebook.com/tools/explorer/2213645562127704/?method=GET&path=17841409362793429%2Finsights%3Fpretty%3D1%26since%3Dtoday%26metric%3Dviews%26metric_type%3Dtotal_value%26period%3Dday&version=v23.0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      🔗 Get New Token from Facebook Graph API Explorer
                    </a>
                  </p>
                  <p className="text-sm mt-2">
                    <a
                      href="https://dashboard.render.com/web/srv-d0a2qdh5pdvs73bkhcpg/env"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      🔗 If prod, update the Instagram access token in the
                      Render Environment Variables. If dev, update .env file.
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Gap Warnings */}
          {getDataGapWarnings().map((warning, index) => (
            <div
              key={index}
              className="mt-4 p-3 border rounded bg-gray-800 border-yellow-400"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <strong>{warning.title}</strong>
                  <div className="text-sm mt-1 whitespace-pre-line">
                    {warning.message}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Data Source Info */}
          {!isLoading && !error && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <div className="flex items-center">
                <span className="text-sm">
                  📊 Data sources: <strong>Instagram </strong> (traffic),{" "}
                  <strong>Plausible </strong> (page visits),{" "}
                  <strong>Airtable</strong> (application & outcomes)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Summary Line */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex flex-wrap gap-8 items-center justify-between">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Views
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                <MetricWithGapIndicator
                  value={
                    typeof summaryStats.totalViews === "number"
                      ? summaryStats.totalViews.toLocaleString()
                      : summaryStats.totalViews
                  }
                  metricType="instagramViews"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sales Page Visits
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                <MetricWithGapIndicator
                  value={
                    typeof summaryStats.salesPageVisits === "number"
                      ? summaryStats.salesPageVisits.toLocaleString()
                      : summaryStats.salesPageVisits
                  }
                  metricType="salesPage"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                App Form Visits
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                <MetricWithGapIndicator
                  value={
                    typeof summaryStats.appFormVisits === "number"
                      ? summaryStats.appFormVisits.toLocaleString()
                      : summaryStats.appFormVisits
                  }
                  metricType="appForm"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed Apps
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.completedApps === "number"
                  ? summaryStats.completedApps.toLocaleString()
                  : summaryStats.completedApps}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Qualified Apps
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.qualifiedApps === "number"
                  ? summaryStats.qualifiedApps.toLocaleString()
                  : summaryStats.qualifiedApps}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Contacted
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.contacted === "number"
                  ? summaryStats.contacted.toLocaleString()
                  : summaryStats.contacted}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Accepted
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.accepted === "number"
                  ? summaryStats.accepted.toLocaleString()
                  : summaryStats.accepted}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Paid
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.paid === "number"
                  ? summaryStats.paid.toLocaleString()
                  : summaryStats.paid}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sales
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.sales === "number"
                  ? `$${summaryStats.sales.toLocaleString()}`
                  : summaryStats.sales}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Refunded
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.refunded === "number"
                  ? `$${(0 - summaryStats.refunded).toLocaleString()}`
                  : summaryStats.refunded}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Net Sales
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {typeof summaryStats.netSales === "number"
                  ? `$${summaryStats.netSales.toLocaleString()}`
                  : summaryStats.netSales}
              </div>
            </div>
          </div>
        </div>

        {/* Sankey Interface Validation - HIDDEN */}
        {false && funnelData.interfaceValidation && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sankey Interface Validation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Page Visits Interface */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Sales Page Visits Interface
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Sankey 1 Output:</span>
                    <span>
                      {funnelData.interfaceValidation.salesPageVisits
                        .sankey1Output !== null &&
                      funnelData.interfaceValidation.salesPageVisits
                        .sankey1Output !== undefined
                        ? funnelData.interfaceValidation.salesPageVisits
                            .sankey1Output
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sankey 2 Input:</span>
                    <span>
                      {funnelData.interfaceValidation.salesPageVisits
                        .sankey2Input !== null &&
                      funnelData.interfaceValidation.salesPageVisits
                        .sankey2Input !== undefined
                        ? funnelData.interfaceValidation.salesPageVisits
                            .sankey2Input
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-medium ${
                        funnelData.interfaceValidation.salesPageVisits.match
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {funnelData.interfaceValidation.salesPageVisits.match
                        ? "✅ Match"
                        : "❌ Gap"}
                    </span>
                  </div>
                  {!funnelData.interfaceValidation.salesPageVisits.match && (
                    <div className="flex justify-between text-red-600">
                      <span>Gap:</span>
                      <span>
                        {funnelData.interfaceValidation.salesPageVisits.gap}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualified Apps Interface */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Qualified Apps Interface
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Sankey 2 Output:</span>
                    <span>
                      {funnelData.interfaceValidation.qualifiedApps
                        .sankey2Output !== null &&
                      funnelData.interfaceValidation.qualifiedApps
                        .sankey2Output !== undefined
                        ? funnelData.interfaceValidation.qualifiedApps
                            .sankey2Output
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sankey 3 Input:</span>
                    <span>
                      {funnelData.interfaceValidation.qualifiedApps
                        .sankey3Input !== null &&
                      funnelData.interfaceValidation.qualifiedApps
                        .sankey3Input !== undefined
                        ? funnelData.interfaceValidation.qualifiedApps
                            .sankey3Input
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-medium ${
                        funnelData.interfaceValidation.qualifiedApps.match
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {funnelData.interfaceValidation.qualifiedApps.match
                        ? "✅ Match"
                        : "❌ Gap"}
                    </span>
                  </div>
                  {!funnelData.interfaceValidation.qualifiedApps.match && (
                    <div className="flex justify-between text-red-600">
                      <span>Gap:</span>
                      <span>
                        {funnelData.interfaceValidation.qualifiedApps.gap}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  Overall Interface Status:
                </span>
                <span
                  className={`font-bold ${
                    funnelData.interfaceValidation.overallValid
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {funnelData.interfaceValidation.overallValid
                    ? "✅ All Interfaces Match"
                    : "❌ Interface Gaps Detected"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Data Consistency Check - HIDDEN */}
        {false && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Consistency Check
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualified Apps Consistency */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Qualified Apps Consistency
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Source of Truth:</span>
                    <span>
                      {funnelData.mgApplication?.qualifiedApps !== null &&
                      funnelData.mgApplication?.qualifiedApps !== undefined
                        ? funnelData.mgApplication.qualifiedApps
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sankey 2 Output:</span>
                    <span>
                      {funnelData.mgApplication?.qualifiedApps !== null &&
                      funnelData.mgApplication?.qualifiedApps !== undefined
                        ? funnelData.mgApplication.qualifiedApps
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sankey 3 Input:</span>
                    <span>
                      {funnelData.mgApplication?.qualifiedApps !== null &&
                      funnelData.mgApplication?.qualifiedApps !== undefined
                        ? funnelData.mgApplication.qualifiedApps
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">
                      ✅ Consistent
                    </span>
                  </div>
                </div>
              </div>

              {/* Selection States Sum Check */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Selection States Sum Check
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Qualified Apps:</span>
                    <span>
                      {funnelData.mgApplication?.qualifiedApps !== null &&
                      funnelData.mgApplication?.qualifiedApps !== undefined
                        ? funnelData.mgApplication.qualifiedApps
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sum of Selection States:</span>
                    <span>
                      {funnelData.mgSelection
                        ? (funnelData.mgSelection.rejectedWoCovo || 0) +
                          (funnelData.mgSelection.contacted || 0) +
                          (funnelData.mgSelection.unresponsive || 0) +
                          (funnelData.mgSelection.begunConversation || 0) +
                          (funnelData.mgSelection.becameUnresponsive || 0) +
                          (funnelData.mgSelection.rejectedBasedOnConvo || 0) +
                          (funnelData.mgSelection.acceptedNotPaid || 0) +
                          (funnelData.mgSelection.rejectedAfterAcceptance ||
                            0) +
                          (funnelData.mgSelection.paid || 0) +
                          (funnelData.mgSelection.notContactedOrRejected || 0) +
                          (funnelData.mgSelection.noResponseYet || 0) +
                          (funnelData.mgSelection.noDecisionYet || 0) +
                          (funnelData.mgSelection.noOutcomeYet || 0)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-medium ${
                        funnelData.mgApplication?.qualifiedApps ===
                        (funnelData.mgSelection
                          ? (funnelData.mgSelection.rejectedWoCovo || 0) +
                            (funnelData.mgSelection.contacted || 0) +
                            (funnelData.mgSelection.unresponsive || 0) +
                            (funnelData.mgSelection.begunConversation || 0) +
                            (funnelData.mgSelection.becameUnresponsive || 0) +
                            (funnelData.mgSelection.rejectedBasedOnConvo || 0) +
                            (funnelData.mgSelection.acceptedNotPaid || 0) +
                            (funnelData.mgSelection.rejectedAfterAcceptance ||
                              0) +
                            (funnelData.mgSelection.paid || 0) +
                            (funnelData.mgSelection.notContactedOrRejected ||
                              0) +
                            (funnelData.mgSelection.noResponseYet || 0) +
                            (funnelData.mgSelection.noDecisionYet || 0) +
                            (funnelData.mgSelection.noOutcomeYet || 0)
                          : null)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {funnelData.mgApplication?.qualifiedApps ===
                      (funnelData.mgSelection
                        ? (funnelData.mgSelection.rejectedWoCovo || 0) +
                          (funnelData.mgSelection.contacted || 0) +
                          (funnelData.mgSelection.unresponsive || 0) +
                          (funnelData.mgSelection.begunConversation || 0) +
                          (funnelData.mgSelection.becameUnresponsive || 0) +
                          (funnelData.mgSelection.rejectedBasedOnConvo || 0) +
                          (funnelData.mgSelection.acceptedNotPaid || 0) +
                          (funnelData.mgSelection.rejectedAfterAcceptance ||
                            0) +
                          (funnelData.mgSelection.paid || 0) +
                          (funnelData.mgSelection.notContactedOrRejected || 0) +
                          (funnelData.mgSelection.noResponseYet || 0) +
                          (funnelData.mgSelection.noDecisionYet || 0) +
                          (funnelData.mgSelection.noOutcomeYet || 0)
                        : null)
                        ? "✅ Consistent"
                        : "❌ Discrepancy"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Source of Truth */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Source of Truth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Traffic Sources */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Traffic Sources
              </h4>
              <div className="text-sm space-y-1">
                <div>
                  IG Views:{" "}
                  <MetricWithGapIndicator
                    value={
                      funnelData.ig.views !== null
                        ? funnelData.ig.views.toLocaleString()
                        : "N/A"
                    }
                    metricType="instagramViews"
                  />
                </div>
                <div>
                  IG Reach:{" "}
                  {funnelData.ig.reach !== null
                    ? funnelData.ig.reach.toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  IG Profile Visits:{" "}
                  {funnelData.ig.profileVisits !== null
                    ? funnelData.ig.profileVisits.toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  IG Bio Link Clicks:{" "}
                  {funnelData.ig.bioLinkClicks !== null
                    ? funnelData.ig.bioLinkClicks.toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  Email Opens:{" "}
                  {funnelData.email.opens !== null
                    ? funnelData.email.opens.toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* MG Sales Page Visits */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Sales Page Visits
              </h4>
              <div className="text-sm space-y-0">
                <div>
                  Visits:{" "}
                  <MetricWithGapIndicator
                    value={funnelData.mgSalesPageVisits.total}
                    metricType="salesPage"
                  />
                </div>
                <div className="pl-2">
                  IG:{" "}
                  {funnelData.mgSalesPageVisits.fromIgBio !== null ||
                  funnelData.mgSalesPageVisits.fromIgStory !== null ||
                  funnelData.mgSalesPageVisits.fromIgManychat !== null ||
                  funnelData.mgSalesPageVisits.fromIgDm !== null
                    ? (funnelData.mgSalesPageVisits.fromIgBio || 0) +
                      (funnelData.mgSalesPageVisits.fromIgStory || 0) +
                      (funnelData.mgSalesPageVisits.fromIgManychat || 0) +
                      (funnelData.mgSalesPageVisits.fromIgDm || 0)
                    : null}
                </div>
                <div className="pl-4">
                  Bio: {funnelData.mgSalesPageVisits.fromIgBio}
                </div>
                <div className="pl-4">
                  Story: {funnelData.mgSalesPageVisits.fromIgStory}
                </div>
                <div className="pl-4">
                  Manychat: {funnelData.mgSalesPageVisits.fromIgManychat}
                </div>
                <div className="pl-4">
                  DM: {funnelData.mgSalesPageVisits.fromIgDm}
                </div>
                <div className="pl-2">
                  Email:{" "}
                  {funnelData.mgSalesPageVisits.fromEmailBroadcasts !== null ||
                  funnelData.mgSalesPageVisits.fromEmailAutomations !== null
                    ? (funnelData.mgSalesPageVisits.fromEmailBroadcasts || 0) +
                      (funnelData.mgSalesPageVisits.fromEmailAutomations || 0)
                    : null}
                </div>
                <div className="pl-4">
                  Broadcast: {funnelData.mgSalesPageVisits.fromEmailBroadcasts}
                </div>
                <div className="pl-4">
                  Automation:{" "}
                  {funnelData.mgSalesPageVisits.fromEmailAutomations}
                </div>
                <div className="pl-2">
                  Unknown: {funnelData.mgSalesPageVisits.fromUnknown}
                </div>
                <div>
                  Exits:{" "}
                  {funnelData.mgSalesPageVisits.total !== null &&
                  funnelData.mgApplication.appFormPageVisits !== null
                    ? funnelData.mgSalesPageVisits.total -
                      funnelData.mgApplication.appFormPageVisits
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* MG Application */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Application
              </h4>
              <div className="text-sm space-y-1">
                <div>
                  Visits:{" "}
                  <MetricWithGapIndicator
                    value={funnelData.mgApplication.appFormPageVisits}
                    metricType="appForm"
                  />
                </div>
                <div className="pl-2">
                  Non-Starts:{" "}
                  {funnelData.mgApplication.appFormPageVisits !== null &&
                  funnelData.mgApplication.appStarts !== null
                    ? (() => {
                        const nonStarts =
                          funnelData.mgApplication.appFormPageVisits -
                          funnelData.mgApplication.appStarts;
                        return nonStarts < 0 ? "?" : nonStarts;
                      })()
                    : "N/A"}
                </div>
                <div>Starts: {funnelData.mgApplication.appStarts}</div>
                <div>Abandons: {funnelData.mgApplication.appAbandons}</div>
                <div>
                  Completions: {funnelData.mgApplication.appCompletions}
                </div>
                <div>
                  Non-Qualified: {funnelData.mgApplication.nonQualifiedApps}
                </div>
                <div>Qualified: {funnelData.mgApplication.qualifiedApps}</div>
              </div>
            </div>

            {/* MG Selection */}
            <div className="space-y-2 w-full col-span-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                MG Selection
              </h4>
              <div className="text-sm">
                <div className="grid grid-cols-5 gap-0 min-w-0">
                  <div className="font-medium col-span-2">State</div>
                  <div className="font-medium">%</div>
                  <div className="font-medium">Total</div>
                  <div className="font-medium">Current</div>

                  <div className="col-span-2 font-medium border-b border-gray-200">
                    MG Qualified Apps
                  </div>
                  <div className="border-b border-gray-200">100%</div>
                  <div className="border-b border-gray-200">
                    {funnelData.mgApplication.qualifiedApps}
                  </div>
                  <div className="border-b border-gray-200">
                    {funnelData.mgApplication.qualifiedApps}
                  </div>

                  <div className="col-span-2 pl-2">
                    Not Contacted or Rejected
                  </div>
                  <div className="pl-2">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.notContactedOrRejected ||
                            0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-2">
                    {funnelData.mgSelection.notContactedOrRejected}
                  </div>
                  <div className="pl-2">
                    {funnelData.mgSelection.notContactedOrRejected}
                  </div>

                  <div className="col-span-2 pl-2">Rejected w/o Contact</div>
                  <div className="pl-2">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.rejectedWoCovo || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-2">
                    {funnelData.mgSelection.rejectedWoCovo}
                  </div>
                  <div className="pl-2">
                    {funnelData.mgSelection.rejectedWoCovo}
                  </div>

                  <div className="col-span-2 pl-2 border-b border-gray-200">
                    Contacted
                  </div>
                  <div className="pl-2 border-b border-gray-200">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.contacted || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-2 border-b border-gray-200">
                    {funnelData.mgSelection.contacted}
                  </div>
                  <div className="pl-2 border-b border-gray-200">
                    {funnelData.mgSelection.contacted}
                  </div>

                  <div className="col-span-2 pl-4">No Response Yet</div>
                  <div className="pl-4">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.noResponseYet || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-4">
                    {funnelData.mgSelection.noResponseYet}
                  </div>
                  <div className="pl-4">
                    {funnelData.mgSelection.noResponseYet}
                  </div>

                  <div className="col-span-2 pl-4">Unresponsive</div>
                  <div className="pl-4">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.unresponsive || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-4">
                    {funnelData.mgSelection.unresponsive}
                  </div>
                  <div className="pl-4">
                    {funnelData.mgSelection.unresponsive}
                  </div>

                  <div className="col-span-2 pl-4 border-b border-gray-200">
                    Began Conversation
                  </div>
                  <div className="pl-4 border-b border-gray-200">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.begunConversation || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-4 border-b border-gray-200">
                    {funnelData.mgSelection.begunConversation}
                  </div>
                  <div className="pl-4 border-b border-gray-200">
                    {funnelData.mgSelection.begunConversation}
                  </div>

                  <div className="col-span-2 pl-6">No Decision Yet</div>
                  <div className="pl-6">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.noDecisionYet || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.noDecisionYet}
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.noDecisionYet}
                  </div>

                  <div className="col-span-2 pl-6">Became Unresponsive</div>
                  <div className="pl-6">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.becameUnresponsive || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.becameUnresponsive}
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.becameUnresponsive}
                  </div>

                  <div className="col-span-2 pl-6">Rejected Based on Convo</div>
                  <div className="pl-6">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.rejectedBasedOnConvo || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.rejectedBasedOnConvo}
                  </div>
                  <div className="pl-6">
                    {funnelData.mgSelection.rejectedBasedOnConvo}
                  </div>

                  <div className="col-span-2 pl-6 border-b border-gray-200">
                    Accepted
                  </div>
                  <div className="pl-6 border-b border-gray-200">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          (((funnelData.mgSelection.acceptedNotPaid || 0) +
                            (funnelData.mgSelection.paid || 0)) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-6 border-b border-gray-200">
                    {(funnelData.mgSelection.acceptedNotPaid || 0) +
                      (funnelData.mgSelection.paid || 0)}
                  </div>
                  <div className="pl-6 border-b border-gray-200">
                    {funnelData.mgSelection.acceptedNotPaid}
                  </div>

                  <div className="col-span-2 pl-8">No Outcome Yet</div>
                  <div className="pl-8">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.noOutcomeYet || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-8">
                    {funnelData.mgSelection.noOutcomeYet}
                  </div>
                  <div className="pl-8">
                    {funnelData.mgSelection.noOutcomeYet}
                  </div>

                  <div className="col-span-2 pl-8">
                    Rejected After Acceptance
                  </div>
                  <div className="pl-8">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.rejectedAfterAcceptance ||
                            0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-8">
                    {funnelData.mgSelection.rejectedAfterAcceptance}
                  </div>
                  <div className="pl-8">
                    {funnelData.mgSelection.rejectedAfterAcceptance}
                  </div>

                  <div className="col-span-2 pl-8">Paid</div>
                  <div className="pl-8">
                    {funnelData.mgApplication.qualifiedApps
                      ? (
                          ((funnelData.mgSelection.paid || 0) /
                            funnelData.mgApplication.qualifiedApps) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="pl-8">{funnelData.mgSelection.paid}</div>
                  <div className="pl-8">{funnelData.mgSelection.paid}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sankey Diagrams */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={trafficFunnelData}
              originalData={funnelData}
              width={1200}
              height={400}
              title="Traffic Funnel: MG Sales Page Visit Sources → MG Sales Page Visits"
              leftPadding={180}
              useLogarithmicScaling={true}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={applicationFunnelData}
              originalData={funnelData}
              width={1200}
              height={300}
              title="Application Funnel: MG Sales Page Visits → MG Qualified Apps"
              leftPadding={160}
              useLogarithmicScaling={false}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <SankeyDiagram
              data={selectionFunnelData}
              originalData={funnelData}
              width={1200}
              height={400}
              title="Selection Funnel: MG Qualified Apps → Sales Outcomes"
              leftPadding={130}
              useLogarithmicScaling={false}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Channel Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-60">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {categoryNames[category]}
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
