// tbd
import express from "express";
import https from "https";

const cache = {
  data: [],
  lastFetched: null,
};

function isDataInCache(startDate, endDate) {
  return (
    cache.data.length > 0 &&
    new Date(cache.lastFetched) > new Date() - 1000 * 60 * 5 && // Check if the data was fetched in the last 5 minutes
    cache.data.some((record) => {
      // Check if the requested range is already in the cache
      const recordDate = record.fields.Date; // Assuming the date field is named 'Date' in Airtable
      return recordDate >= startDate && recordDate <= endDate; // Check if the record date is within the requested range
    })
  );
}

const internalStatsRouter = express.Router();

internalStatsRouter.get("/loadrange", async (req, res) => {
  const airtableOps = req.app.locals.airtableOps;
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send("Start and end dates are required.");
  }

  // Check if requested range is already in the cache
  if (isDataInCache(start, end)) {
    console.log("Serving from cache");
    const filteredData = cache.data.filter((record) => {
      const recordDate = record.fields.Date;
      return recordDate >= start && recordDate <= end;
    });
    return res.json(filteredData);
  }

  console.log("Fetching from Airtable");

  try {
    let allRecords = await airtableOps.fetchAirtableRecords("Days"); // Fetch all records from Airtable and store them in allRecords array

    // Filter records by date range
    const filteredData = allRecords.filter((record) => {
      const recordDate = record.fields.Date;
      return recordDate >= start && recordDate <= end;
    });

    // Update cache
    cache.data = allRecords; // Store all records in cache
    cache.lastFetched = new Date().toISOString(); // Update the last fetched time

    res.json(filteredData); // Send the filtered data to the client
  } catch (e) {
    console.error(`Error fetching data: ${e.message}`);
    res.status(500).send("Error fetching data from Airtable");
  }
});

// GET /api/internalstats/airtable
// Get MG selection funnel data from Airtable
internalStatsRouter.get("/airtable", async (req, res) => {
  const airtableOps = req.app.locals.airtableOps;
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send("Start and end dates are required.");
  }

  try {
    const airtableData = await airtableOps.fetchAirtableRecords("Days");

    // Debug: Show available field names
    if (airtableData && airtableData.length > 0) {
      console.log(
        "Available Airtable field names:",
        Object.keys(airtableData[0].fields)
      );
    }

    // Filter by date range
    const filteredAirtableData = airtableData.filter((record) => {
      const recordDate = record.fields.Date;
      return recordDate >= start && recordDate <= end;
    });

    // Sum up the real data from Airtable
    const airtableStats = filteredAirtableData.reduce(
      (acc, record) => {
        const fields = record.fields;
        // Helper function to sum array fields
        const sumArray = (arr) =>
          arr ? arr.reduce((sum, val) => sum + val, 0) : 0;

        acc.appStarts += sumArray(fields["app starts"]);
        acc.completed += sumArray(fields.completed);
        acc.qualifiedApps += sumArray(fields["MG $ Y"]); // Direct from Airtable
        acc.mgPaid += sumArray(fields["MG paid"]);
        acc.acceptedButNotPaid += sumArray(fields["MG accepted but not paid"]);
        acc.rejectedWoCovo += sumArray(fields["Rejected w/o convo"]);
        acc.contacted += sumArray(fields["Contacted"]);
        acc.unresponsive += sumArray(fields["Unresponsive"]);
        acc.beganConversation += sumArray(fields["began conversation"]);
        acc.rejectedBasedOnConvo += sumArray(fields["Rejected based on convo"]);
        acc.becameUnresponsive += sumArray(
          fields["became unresponsive mid-convo"]
        );
        acc.acceptedThenRejected += sumArray(
          fields["MG accepted then rejected"]
        );
        acc.tbd += sumArray(fields["TBD"]);

        // Revenue fields
        acc.mgPaymentsApp += sumArray(fields["mg_pay_app_attribution"]);
        acc.mgRefundsApp += sumArray(fields["mg_refund_app_attribution"]);
        acc.mgNetPayApp += sumArray(fields["mg_netpay_app_attribution"]);
        acc.mgPaymentsDay += sumArray(fields["mg_pay_day_attribution"]);
        acc.mgRefundsDay += sumArray(fields["mg_refund_day_attribution"]);
        acc.mgNetPayDay += sumArray(fields["mg_netpay_day_attribution"]);

        return acc;
      },
      {
        appStarts: 0,
        completed: 0,
        qualifiedApps: 0,
        mgPaid: 0,
        acceptedButNotPaid: 0,
        rejectedWoCovo: 0,
        contacted: 0,
        unresponsive: 0,
        beganConversation: 0,
        rejectedBasedOnConvo: 0,
        becameUnresponsive: 0,
        acceptedThenRejected: 0,
        tbd: 0,
        mgPaymentsApp: 0,
        mgRefundsApp: 0,
        mgNetPayApp: 0,
        mgPaymentsDay: 0,
        mgRefundsDay: 0,
        mgNetPayDay: 0,
      }
    );

    // Calculate derived values
    const appCompletions =
      airtableStats.completed !== null && airtableStats.completed !== undefined
        ? airtableStats.completed
        : null;
    // SEQUENTIAL FLOW LOGIC:
    // Each person can only be in ONE state, but states imply previous states
    //
    // Correct Hierarchy:
    // 1. Qualified Apps (base state)
    //    -> rejected w/o convo, contacted, not contacted or rejected
    // 2. Contacted (subset of qualified)
    //    -> unresponsive, began convo, no response yet
    // 3. Began Conversation (subset of contacted)
    //    -> became unresponsive, rejected based on convo, no decision yet, accepted
    // 4. Accepted (subset of began conversation)
    //    -> accepted then rejected, paid, no outcome yet

    // Step 1: Get total qualified apps directly from Airtable
    const totalQualifiedApps =
      airtableStats.qualifiedApps > 0 ? airtableStats.qualifiedApps : null;

    // Step 2: Calculate total contacted (all people who were contacted)
    // This includes: contacted + unresponsive + beganConversation + all downstream states
    const totalContacted =
      airtableStats.contacted +
      airtableStats.unresponsive +
      airtableStats.beganConversation +
      airtableStats.rejectedBasedOnConvo +
      airtableStats.becameUnresponsive +
      airtableStats.acceptedButNotPaid +
      airtableStats.mgPaid +
      airtableStats.acceptedThenRejected;

    // Step 3: Calculate total who began conversation
    // This includes: beganConversation + all downstream states
    const totalBeganConversation =
      airtableStats.beganConversation +
      airtableStats.rejectedBasedOnConvo +
      airtableStats.becameUnresponsive +
      airtableStats.acceptedButNotPaid +
      airtableStats.mgPaid +
      airtableStats.acceptedThenRejected;

    // Step 4: Calculate total accepted
    // This includes: acceptedButNotPaid + mgPaid + acceptedThenRejected
    const totalAccepted =
      airtableStats.acceptedButNotPaid +
      airtableStats.mgPaid +
      airtableStats.acceptedThenRejected;

    // Debug: Show sequential flow calculation
    console.log("Sequential Flow Calculation:", {
      // Raw Airtable values
      rawValues: {
        mgPaid: airtableStats.mgPaid,
        acceptedButNotPaid: airtableStats.acceptedButNotPaid,
        rejectedWoCovo: airtableStats.rejectedWoCovo, // NOT contacted
        contacted: airtableStats.contacted,
        unresponsive: airtableStats.unresponsive,
        beganConversation: airtableStats.beganConversation,
        rejectedBasedOnConvo: airtableStats.rejectedBasedOnConvo,
        becameUnresponsive: airtableStats.becameUnresponsive,
        acceptedThenRejected: airtableStats.acceptedThenRejected,
        tbd: airtableStats.tbd,
      },
      // Calculated flows
      flows: {
        totalCompletedApps: airtableStats.completed, // All completed applications
        totalQualifiedApps: totalQualifiedApps, // Actually qualified for MG (sum of all selection states)
        totalContacted: totalContacted, // Qualified apps MINUS rejected w/o convo
        totalBeganConversation: totalBeganConversation,
        totalAccepted: totalAccepted,
        totalPaid: airtableStats.mgPaid,
        rejectedWithoutContact: airtableStats.rejectedWoCovo, // Separate category
      },
    });

    const qualifiedApps = totalQualifiedApps;
    const nonQualifiedApps =
      airtableStats.completed !== null &&
      airtableStats.completed !== undefined &&
      qualifiedApps !== null
        ? Math.max(0, airtableStats.completed - qualifiedApps)
        : null;
    const appAbandons =
      airtableStats.appStarts > 0 &&
      appCompletions !== null &&
      appCompletions !== undefined
        ? Math.max(0, airtableStats.appStarts - appCompletions)
        : null;

    // Set individual variables using sequential flow logic
    // These represent the calculated totals (not raw Airtable values)
    const contacted = totalContacted;
    const unresponsive =
      airtableStats.unresponsive !== null &&
      airtableStats.unresponsive !== undefined
        ? airtableStats.unresponsive
        : null;
    const begunConversation = totalBeganConversation;
    const paid =
      airtableStats.mgPaid !== null && airtableStats.mgPaid !== undefined
        ? airtableStats.mgPaid
        : null;
    const rejected =
      airtableStats.rejectedBasedOnConvo !== null &&
      airtableStats.rejectedBasedOnConvo !== undefined
        ? airtableStats.rejectedBasedOnConvo
        : null;
    const rejectedWoCovo =
      airtableStats.rejectedWoCovo !== null &&
      airtableStats.rejectedWoCovo !== undefined
        ? airtableStats.rejectedWoCovo
        : null;
    const becameUnresponsive =
      airtableStats.becameUnresponsive !== null &&
      airtableStats.becameUnresponsive !== undefined
        ? airtableStats.becameUnresponsive
        : null;
    const acceptedThenRejected =
      airtableStats.acceptedThenRejected !== null &&
      airtableStats.acceptedThenRejected !== undefined
        ? airtableStats.acceptedThenRejected
        : null;
    const appStarts =
      airtableStats.appStarts !== null && airtableStats.appStarts !== undefined
        ? airtableStats.appStarts
        : null;

    // "Accepted but not paid" = total accepted (includes all accepted regardless of payment status)
    const acceptedButNotPaid = totalAccepted;

    // ADDITIONAL STATES (not in Airtable) - to account for gaps/WIP
    // These represent people who are in transition or waiting states

    // Calculate potential gaps in the flow
    const totalTrackedInAirtable =
      airtableStats.mgPaid +
      airtableStats.acceptedButNotPaid +
      airtableStats.rejectedWoCovo +
      airtableStats.contacted +
      airtableStats.unresponsive +
      airtableStats.beganConversation +
      airtableStats.rejectedBasedOnConvo +
      airtableStats.becameUnresponsive +
      airtableStats.acceptedThenRejected +
      airtableStats.tbd;

    // Gap analysis: Calculate missing states based on hierarchy
    // 1. "Not contacted or rejected" = qualified - contacted - rejected w/o convo
    const notContactedOrRejected =
      totalQualifiedApps !== null &&
      totalContacted !== null &&
      airtableStats.rejectedWoCovo !== null
        ? Math.max(
            0,
            totalQualifiedApps - totalContacted - airtableStats.rejectedWoCovo
          )
        : null;

    // 2. "No response yet" = contacted - unresponsive - began conversation
    const noResponseYet =
      totalContacted !== null &&
      airtableStats.unresponsive !== null &&
      totalBeganConversation !== null
        ? Math.max(
            0,
            totalContacted - airtableStats.unresponsive - totalBeganConversation
          )
        : null;

    // 3. "No decision yet" = began conversation - became unresponsive - rejected based on convo - accepted
    const noDecisionYet =
      totalBeganConversation !== null &&
      airtableStats.becameUnresponsive !== null &&
      airtableStats.rejectedBasedOnConvo !== null &&
      totalAccepted !== null
        ? Math.max(
            0,
            totalBeganConversation -
              airtableStats.becameUnresponsive -
              airtableStats.rejectedBasedOnConvo -
              totalAccepted
          )
        : null;

    // 4. "No outcome yet" = accepted - accepted then rejected - paid
    const noOutcomeYet =
      totalAccepted !== null &&
      airtableStats.acceptedThenRejected !== null &&
      airtableStats.mgPaid !== null
        ? Math.max(
            0,
            totalAccepted -
              airtableStats.acceptedThenRejected -
              airtableStats.mgPaid
          )
        : null;

    // Debug: Show gap analysis
    console.log("Gap Analysis:", {
      totalQualifiedApps: totalQualifiedApps,
      totalContacted: totalContacted,
      totalBeganConversation: totalBeganConversation,
      totalAccepted: totalAccepted,
      totalTrackedInAirtable: totalTrackedInAirtable,
      notContactedOrRejected: notContactedOrRejected,
      noResponseYet: noResponseYet,
      noDecisionYet: noDecisionYet,
      noOutcomeYet: noOutcomeYet,
    });

    // SANKEY INTERFACE VALIDATION
    // The 3 Sankey diagrams should have 2 shared interfaces:
    // 1. MG Sales Page Visits (between Sankey 1 and 2)
    // 2. MG Qualified Apps (between Sankey 2 and 3)

    // Get sales page visits from Plausible for interface validation
    let totalSalesPageVisits = null;
    try {
      const plausibleResponse = await fetch(
        `https://plausible.io/api/v2/query?site_id=${process.env.PLAUSIBLE_SITE_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
          },
          body: JSON.stringify({
            metrics: ["visitors"],
            filters: [["contains", "event:page", ["/mg-mw-new"]]],
            date_range: [start, end],
          }),
        }
      );

      if (plausibleResponse.ok) {
        const plausibleData = await plausibleResponse.json();
        const firstResult = plausibleData.results?.[0];
        totalSalesPageVisits = firstResult?.metrics?.[0] || null;
      }
    } catch (plausibleError) {
      console.log(
        "Could not fetch Plausible data for interface validation:",
        plausibleError.message
      );
    }

    // Calculate what each Sankey should show for shared interfaces
    const sankey1Output = totalSalesPageVisits; // From Plausible (Sankey 1 output)
    const sankey2Input = totalSalesPageVisits; // Should match Sankey 1 output
    const sankey2Output = qualifiedApps; // From Airtable (Sankey 2 output)
    const sankey3Input = qualifiedApps; // Should match Sankey 2 output

    // Validation equations
    const salesPageInterfaceMatch = sankey1Output === sankey2Input;
    const qualifiedAppsInterfaceMatch = sankey2Output === sankey3Input;

    // Flag gaps/inconsistencies
    const interfaceValidation = {
      salesPageVisits: {
        sankey1Output: sankey1Output,
        sankey2Input: sankey2Input,
        match: salesPageInterfaceMatch,
        gap: salesPageInterfaceMatch
          ? 0
          : Math.abs((sankey1Output || 0) - (sankey2Input || 0)),
      },
      qualifiedApps: {
        sankey2Output: sankey2Output,
        sankey3Input: sankey3Input,
        match: qualifiedAppsInterfaceMatch,
        gap: qualifiedAppsInterfaceMatch
          ? 0
          : Math.abs((sankey2Output || 0) - (sankey3Input || 0)),
      },
      overallValid: salesPageInterfaceMatch && qualifiedAppsInterfaceMatch,
    };

    console.log("Sankey Interface Validation:", interfaceValidation);

    // Debug: Show what the actual Sankey values should be
    console.log("Sankey Debug Values:", {
      qualifiedApps: qualifiedApps,
      totalContacted: totalContacted,
      mgSelection: {
        rejectedWoCovo: rejectedWoCovo,
        contacted: contacted,
        unresponsive: unresponsive,
        begunConversation: begunConversation,
        becameUnresponsive: becameUnresponsive,
        rejectedBasedOnConvo: rejected,
        acceptedNotPaid: acceptedButNotPaid,
        rejectedAfterAcceptance: acceptedThenRejected,
        paid: paid,
      },
    });

    console.log("Airtable stats:", airtableStats);
    console.log("Individual Airtable fields:", {
      mgPaid: airtableStats.mgPaid,
      acceptedButNotPaid: airtableStats.acceptedButNotPaid,
      rejectedWoCovo: airtableStats.rejectedWoCovo,
      contacted: airtableStats.contacted,
      unresponsive: airtableStats.unresponsive,
      beganConversation: airtableStats.beganConversation,
      rejectedBasedOnConvo: airtableStats.rejectedBasedOnConvo,
      becameUnresponsive: airtableStats.becameUnresponsive,
      acceptedThenRejected: airtableStats.acceptedThenRejected,
      tbd: airtableStats.tbd,
    });
    console.log("Revenue fields:", {
      mgPaymentsApp: airtableStats.mgPaymentsApp,
      mgRefundsApp: airtableStats.mgRefundsApp,
      mgNetPayApp: airtableStats.mgNetPayApp,
      mgPaymentsDay: airtableStats.mgPaymentsDay,
      mgRefundsDay: airtableStats.mgRefundsDay,
      mgNetPayDay: airtableStats.mgNetPayDay,
    });

    const airtableResponseData = {
      mgApplication: {
        appStarts: appStarts,
        appCompletions: appCompletions,
        appAbandons: appAbandons,
        nonQualifiedApps: nonQualifiedApps,
        qualifiedApps: qualifiedApps,
      },
      mgSelection: {
        // Airtable states
        rejectedWoCovo: rejectedWoCovo,
        contacted: contacted,
        unresponsive: unresponsive,
        begunConversation: begunConversation,
        becameUnresponsive: becameUnresponsive,
        rejectedBasedOnConvo: rejected,
        acceptedNotPaid: acceptedButNotPaid,
        rejectedAfterAcceptance: acceptedThenRejected,
        paid: paid,
        // Additional states (not in Airtable) - to account for gaps/WIP
        notContactedOrRejected: notContactedOrRejected,
        noResponseYet: noResponseYet,
        noDecisionYet: noDecisionYet,
        noOutcomeYet: noOutcomeYet,
      },
      // Sankey interface validation
      interfaceValidation: interfaceValidation,
      // Revenue data
      revenue: {
        mgPaymentsApp: airtableStats.mgPaymentsApp,
        mgRefundsApp: airtableStats.mgRefundsApp,
        mgNetPayApp: airtableStats.mgNetPayApp,
        mgPaymentsDay: airtableStats.mgPaymentsDay,
        mgRefundsDay: airtableStats.mgRefundsDay,
        mgNetPayDay: airtableStats.mgNetPayDay,
      },
    };

    res.json({
      success: true,
      data: airtableResponseData,
    });
  } catch (airtableError) {
    console.error("Error fetching Airtable data:", airtableError);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Airtable data",
    });
  }
});

// GET /api/internalstats/plausible
// Get client acquisition funnel data from Plausible Analytics
internalStatsRouter.get("/plausible", async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send("Start and end dates are required.");
  }

  // Plausible API configuration
  const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY;
  const PLAUSIBLE_SITE_ID =
    process.env.PLAUSIBLE_SITE_ID || "simpleamericanaccent.com";

  if (!PLAUSIBLE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Plausible API key not configured",
    });
  }

  try {
    // Helper function to make Plausible API requests
    const fetchPlausibleData = async (filters = [], dimensions = []) => {
      const requestBody = {
        site_id: PLAUSIBLE_SITE_ID,
        metrics: ["visitors"],
        date_range: [start, end],
      };

      // Add filters if they exist
      if (filters && filters.length > 0) {
        requestBody.filters = filters;
      }

      // Add dimensions if they exist
      if (dimensions && dimensions.length > 0) {
        requestBody.dimensions = dimensions;
      }

      console.log(
        "Plausible API request:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("https://plausible.io/api/v2/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PLAUSIBLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Plausible API error response:", errorText);
        throw new Error(
          `Plausible API error: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    };

    // Helper function to check if date range overlaps with Plausible inactive periods
    const getPlausibleInactivePeriods = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Known inactive periods:
      // 1. Before July 3, 2025 (not using Plausible yet)
      // 2. Aug 17, 2025 to Aug 29, 2025 (subscription paused)
      const plausibleStartDate = new Date("2025-07-03");
      const subscriptionPauseStart = new Date("2025-08-17");
      const subscriptionPauseEnd = new Date("2025-08-29");

      const inactivePeriods = [];

      // Check if range includes pre-Plausible period (before July 3, 2025)
      if (start < plausibleStartDate) {
        const prePlausibleEnd =
          end < plausibleStartDate ? end : new Date("2025-07-02");
        inactivePeriods.push({
          start: start.toISOString().split("T")[0],
          end: prePlausibleEnd.toISOString().split("T")[0],
          reason: "Plausible tracking not yet active",
        });
      }

      // Check if range includes subscription pause period (Aug 17-29, 2025)
      if (start <= subscriptionPauseEnd && end >= subscriptionPauseStart) {
        const pauseStart =
          start > subscriptionPauseStart ? start : subscriptionPauseStart;
        const pauseEnd =
          end < subscriptionPauseEnd ? end : subscriptionPauseEnd;
        inactivePeriods.push({
          start: pauseStart.toISOString().split("T")[0],
          end: pauseEnd.toISOString().split("T")[0],
          reason: "Plausible subscription paused",
        });
      }

      return inactivePeriods;
    };

    // Get total visitors
    const totalVisitorsData = await fetchPlausibleData([]);
    console.log("Total visitors response:", totalVisitorsData);

    // Get Plausible inactive periods based on known tracking gaps
    const plausibleInactivePeriods = getPlausibleInactivePeriods(start, end);

    // Convert inactive periods to data gap format for consistency
    const totalVisitorsGaps =
      plausibleInactivePeriods.length > 0
        ? (() => {
            const totalDays =
              Math.ceil(
                (new Date(end).getTime() - new Date(start).getTime()) /
                  (1000 * 3600 * 24)
              ) + 1;
            const gapDays = plausibleInactivePeriods.reduce((total, period) => {
              const periodStart = new Date(period.start);
              const periodEnd = new Date(period.end);
              const days =
                Math.ceil(
                  (periodEnd.getTime() - periodStart.getTime()) /
                    (1000 * 3600 * 24)
                ) + 1;
              return total + days;
            }, 0);
            const availableDays = totalDays - gapDays;
            const completeness = Math.round((availableDays / totalDays) * 100);

            return {
              gapCount: gapDays,
              completeness: completeness,
              gaps: plausibleInactivePeriods,
            };
          })()
        : null;

    // Use same gaps for all Plausible metrics since they all use the same tracking
    const salesPageGaps = totalVisitorsGaps;
    const appFormGaps = totalVisitorsGaps;

    console.log("Data gap analysis:", {
      totalVisitors: totalVisitorsGaps,
      salesPage: salesPageGaps,
      appForm: appFormGaps,
    });

    // Try to get page-specific data using dimensions
    const pageData = await fetchPlausibleData([], ["event:page"]);
    console.log("Page data response:", pageData);

    // Try to get sales page specific data
    const salesPageData = await fetchPlausibleData([
      ["contains", "event:page", ["/mg-mw-new"]],
    ]);
    console.log("Sales page data response:", salesPageData);

    // Try to get app form specific data
    const appFormData = await fetchPlausibleData([
      ["contains", "event:page", ["/mg-app-new"]],
    ]);
    console.log("App form data response:", appFormData);

    // Get UTM source breakdowns for sales page visits using dimensions
    // Get all UTM data for sales page visits, then filter in code
    const utmData = await fetchPlausibleData(
      [["contains", "event:page", ["/mg-mw-new"]]],
      ["visit:utm_source", "visit:utm_medium", "visit:utm_campaign"]
    );
    console.log("UTM data response:", utmData);

    // Debug the actual data structure
    if (totalVisitorsData.results && totalVisitorsData.results[0]) {
      console.log("First result:", totalVisitorsData.results[0]);
      console.log("Metrics array:", totalVisitorsData.results[0].metrics);
      console.log(
        "Available properties:",
        Object.keys(totalVisitorsData.results[0])
      );
    }

    // Get total visitors - the metrics array contains the values in order
    const firstResult = totalVisitorsData.results?.[0];
    const totalVisitors = firstResult?.metrics?.[0] || null;

    console.log("Extracted totalVisitors:", totalVisitors);

    // Debug page data responses
    if (salesPageData.results && salesPageData.results.length > 0) {
      console.log("Sales page results:", salesPageData.results);
    }
    if (appFormData.results && appFormData.results.length > 0) {
      console.log("App form results:", appFormData.results);
    }
    if (pageData.results && pageData.results.length > 0) {
      console.log("All pages data (first 5):", pageData.results.slice(0, 5));
    }

    // Debug UTM data responses
    console.log("UTM dimension data:", utmData);

    // Try to extract real page data, return null if no data
    const realSalesPageVisits =
      salesPageData.results?.[0]?.metrics?.[0] || null;
    const realAppFormVisits = appFormData.results?.[0]?.metrics?.[0] || null;

    // Extract UTM source data from dimension results
    let realFromIgBio = null;
    let realFromIgStory = null;
    let realFromIgManychat = null;
    let realFromIgDm = null;
    let realFromEmail = null;

    if (utmData.results && utmData.results.length > 0) {
      console.log("Processing UTM dimension results:", utmData.results);
      console.log("Number of UTM results:", utmData.results.length);

      // Process each UTM combination result
      utmData.results.forEach((result) => {
        // UTM dimensions are in an array, not an object
        const utmSource = result.dimensions?.[0];
        const utmMedium = result.dimensions?.[1];
        const utmCampaign = result.dimensions?.[2];
        const visitors = result.metrics?.[0] || 0;

        console.log(
          `UTM: source=${utmSource}, medium=${utmMedium}, campaign=${utmCampaign}, visitors=${visitors}`
        );

        // Match IG sources
        if (utmSource === "ig" && utmMedium === "social") {
          switch (utmCampaign) {
            case "bio":
              realFromIgBio = visitors;
              break;
            case "stories":
              realFromIgStory = visitors;
              break;
            case "manychat":
              realFromIgManychat = visitors;
              break;
            case "dm":
              realFromIgDm = visitors;
              break;
          }
        }

        // Match email sources
        if (utmSource === "saa_ac" && utmMedium === "email") {
          realFromEmail = (realFromEmail || 0) + visitors; // Sum all email campaigns
        }
      });
    }

    // Use real data only, return null if no data
    const totalSalesPageVisits = realSalesPageVisits;
    const totalAppFormVisits = realAppFormVisits;

    console.log("Page data summary:", {
      totalVisitors,
      realSalesPageVisits,
      realAppFormVisits,
      totalSalesPageVisits,
      totalAppFormVisits,
      realFromIgBio,
      realFromIgStory,
      realFromIgManychat,
      realFromIgDm,
      realFromEmail,
      hasRealData: realSalesPageVisits > 0 || realAppFormVisits > 0,
    });

    console.log("Data summary:", {
      totalVisitors,
      totalSalesPageVisits,
      totalAppFormVisits,
    });

    // Use real UTM source attribution data
    const fromIgBio = realFromIgBio;
    const fromIgStory = realFromIgStory;
    const fromIgManychat = realFromIgManychat;
    const fromIgDm = realFromIgDm;
    const fromEmail = realFromEmail;

    // Calculate unknown sources as total minus known sources
    const knownSources =
      (fromIgBio || 0) +
      (fromIgStory || 0) +
      (fromIgManychat || 0) +
      (fromIgDm || 0) +
      (fromEmail || 0);
    const fromUnknown =
      totalSalesPageVisits !== null && knownSources > 0
        ? Math.max(0, totalSalesPageVisits - knownSources)
        : null;

    console.log("Final UTM data being returned:", {
      fromIgBio,
      fromIgStory,
      fromIgManychat,
      fromIgDm,
      fromEmail,
      fromUnknown,
    });

    // Get real Airtable data for app completions and outcomes
    let appAbandons = null;
    let appCompletions = null;
    let exited = null;
    let qualifiedApps = null;
    let nonQualifiedApps = null;
    // Airtable data is now handled by the separate /airtable endpoint

    const aggregatedData = {
      mgSalesPageVisits: {
        total: totalSalesPageVisits,
        fromIgBio: fromIgBio,
        fromIgStory: fromIgStory,
        fromIgManychat: fromIgManychat,
        fromIgDm: fromIgDm,
        fromEmailBroadcasts: fromEmail, // This is total email for now
        fromEmailAutomations: null, // Would need separate UTM campaign tracking
        fromUnknown: fromUnknown,
      },
      mgApplication: {
        exited: exited,
        appFormPageVisits: totalAppFormVisits,
        appStarts: null, // Now handled by /airtable endpoint
        appAbandons: null, // Now handled by /airtable endpoint
        appCompletions: null, // Now handled by /airtable endpoint
        nonQualifiedApps: null, // Now handled by /airtable endpoint
        qualifiedApps: null, // Now handled by /airtable endpoint
      },
      mgSelection: {
        rejectedWoCovo: null, // Now handled by /airtable endpoint
        contacted: null, // Now handled by /airtable endpoint
        unresponsive: null, // Now handled by /airtable endpoint
        begunConversation: null, // Now handled by /airtable endpoint
        becameUnresponsive: null, // Now handled by /airtable endpoint
        rejectedBasedOnConvo: null, // Now handled by /airtable endpoint
        acceptedNotPaid: null, // Now handled by /airtable endpoint
        rejectedAfterAcceptance: null, // Now handled by /airtable endpoint
        paid: null, // Now handled by /airtable endpoint
      },
    };

    res.json({
      success: true,
      data: aggregatedData,
      dateRange: { start, end },
      source: "plausible",
      rawData: {
        totalVisitors,
        salesPageVisits: totalSalesPageVisits,
        appFormVisits: totalAppFormVisits,
        estimated: true,
        sourceAttribution: {
          fromIgBio,
          fromIgStory,
          fromIgManychat,
          fromIgDm,
          fromEmail,
          fromUnknown,
        },
        dataGaps: {
          totalVisitors: totalVisitorsGaps,
          salesPage: salesPageGaps,
          appForm: appFormGaps,
        },
      },
    });
  } catch (e) {
    console.error(
      `Error fetching acquisition data from Plausible: ${e.message}`
    );

    // Return fallback data to prevent frontend NaN errors
    const fallbackData = {
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
      mgApplication: {
        exited: null,
        appFormPageVisits: null,
        appAbandons: null,
        appCompletions: null,
        nonQualifiedApps: null,
        qualifiedApps: null,
      },
      mgSelection: {
        rejectedWoCovo: null,
        contacted: null,
        unresponsive: null,
        begunConversation: null,
        becameUnresponsive: null,
        rejectedBasedOnConvo: null,
        acceptedNotPaid: null,
        rejectedAfterAcceptance: null,
        paid: null,
      },
    };

    res.json({
      success: true,
      data: fallbackData,
      dateRange: { start, end },
      source: "plausible-fallback",
      error: `API Error: ${e.message}`,
      rawData: {
        totalVisitors: 0,
        salesPageVisits: 0,
        appFormVisits: 0,
        referrerData: [],
      },
    });
  }
});

// Instagram API endpoint
internalStatsRouter.get("/instagram", async (req, res) => {
  const { start, end } = req.query;

  console.log("Instagram API endpoint called with:", { start, end });

  if (!start || !end) {
    return res.status(400).json({
      success: false,
      error: "Start and end dates are required",
    });
  }

  // Check if this is a "today" request (same start and end date)
  const isTodayRequest = start === end;
  const today = new Date().toISOString().split("T")[0];
  const isTodayDate = start === today && end === today;
  const isEndDateToday = end === today;

  // Check for temporary token in request headers or query params
  const tempToken =
    req.headers["x-instagram-token"] || req.query.instagram_token;
  const INSTAGRAM_ACCESS_TOKEN =
    tempToken || process.env.INSTAGRAM_ACCESS_TOKEN;
  const INSTAGRAM_BUSINESS_ACCOUNT_ID =
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  console.log("Instagram API credentials check:", {
    hasAccessToken: !!INSTAGRAM_ACCESS_TOKEN,
    hasBusinessAccountId: !!INSTAGRAM_BUSINESS_ACCOUNT_ID,
    accessTokenLength: INSTAGRAM_ACCESS_TOKEN?.length || 0,
    businessAccountId: INSTAGRAM_BUSINESS_ACCOUNT_ID || "not set",
  });

  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.log("Instagram API credentials missing, returning fallback data");
    return res.json({
      success: true,
      data: {
        ig: {
          views: null,
          reach: null,
          profileVisits: null,
          bioLinkClicks: null,
        },
      },
      dateRange: { start, end },
      source: "instagram-fallback",
      error: "Instagram API credentials not configured",
    });
  }

  try {
    // Extract totals from the data
    const extractTotal = (data, metricName) => {
      console.log(`=== EXTRACTING TOTAL FOR ${metricName.toUpperCase()} ===`);
      console.log(`Raw data:`, JSON.stringify(data, null, 2));

      if (!data) {
        console.log(`❌ ${metricName}: No data received`);
        return null;
      }

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log(`❌ ${metricName}: No data array or empty array`);
        console.log(`Data structure:`, data);
        return null;
      }

      const firstDataItem = data.data[0];
      console.log(
        `${metricName} first data item:`,
        JSON.stringify(firstDataItem, null, 2)
      );

      // Check for total_value structure (when using metric_type=total_value)
      if (
        firstDataItem.total_value &&
        typeof firstDataItem.total_value.value === "number"
      ) {
        console.log(
          `✅ ${metricName} found total_value:`,
          firstDataItem.total_value.value
        );
        return firstDataItem.total_value.value;
      }

      // Check for values array structure (when not using metric_type=total_value)
      if (firstDataItem.values && Array.isArray(firstDataItem.values)) {
        const total = firstDataItem.values.reduce(
          (sum, day) => sum + (day.value || 0),
          0
        );
        console.log(
          `✅ ${metricName} calculated total from values array:`,
          total
        );
        return total;
      }

      console.log(`❌ ${metricName}: No total_value or values array found`);
      console.log(`Available properties:`, Object.keys(firstDataItem));
      return null;
    };

    // Helper function to calculate date chunks for metrics that need chunking
    const getDateChunks = (startDate, endDate, maxDays = 30) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const chunks = [];

      let currentStart = new Date(start);

      while (currentStart < end) {
        const currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + maxDays - 1);

        // Don't go beyond the requested end date
        if (currentEnd > end) {
          currentEnd.setTime(end.getTime());
        }

        chunks.push({
          since: currentStart.toISOString().split("T")[0],
          until: currentEnd.toISOString().split("T")[0],
        });

        // Move to next chunk
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      return chunks;
    };

    // Helper function to make Instagram Graph API requests
    const fetchInstagramData = async (
      metric,
      period = "day",
      metricType = null,
      useChunking = false
    ) => {
      const url = `https://graph.facebook.com/v23.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights`;

      // For Instagram API, use special handling for today requests
      let instagramStart, instagramEnd;
      if (isTodayDate) {
        // For same-day requests (Today button), use since=today and omit until
        instagramStart = "today";
        instagramEnd = null; // Don't send until parameter
      } else if (isEndDateToday) {
        // For ranges ending today, use actual start date and until=today
        instagramStart = start;
        instagramEnd = "today";
      } else {
        // For other ranges, use normal date format
        instagramStart = start;
        instagramEnd = end;
      }

      // Calculate if we need chunking (more than 30 days)
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const needsChunking = useChunking && daysDiff > 30;

      console.log(`Instagram API request for ${metric}:`, {
        start,
        end,
        instagramStart,
        instagramEnd,
        daysDiff,
        useChunking,
        needsChunking,
        isTodayDate,
        isEndDateToday,
      });

      if (needsChunking) {
        console.log(`Using chunking for ${metric} (${daysDiff} days)`);
        const chunks = getDateChunks(start, end, 30);

        let totalValue = 0;
        const allResponses = [];

        for (const chunk of chunks) {
          const params = new URLSearchParams({
            metric: metric,
            period: period,
            since: chunk.since,
            until: chunk.until,
            access_token: INSTAGRAM_ACCESS_TOKEN,
          });

          // Add metric_type parameter if specified
          if (metricType) {
            params.append("metric_type", metricType);
          }

          console.log(
            `Instagram API request for ${metric} chunk ${chunk.since} to ${chunk.until}:`,
            url + "?" + params.toString()
          );

          const response = await fetch(url + "?" + params.toString());

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Instagram API error for ${metric} chunk:`,
              errorText
            );

            // Check for token expiration
            if (
              response.status === 401 ||
              errorText.includes("access_token") ||
              errorText.includes("expired")
            ) {
              throw new Error(`INSTAGRAM_TOKEN_EXPIRED: ${errorText}`);
            }

            throw new Error(
              `Instagram API error: ${response.status} - ${errorText}`
            );
          }

          const chunkData = await response.json();
          allResponses.push(chunkData);

          // Extract value from this chunk and add to total
          const chunkValue = extractTotal(chunkData, `${metric}_chunk`);
          console.log(
            `DEBUG: ${metric} chunk ${chunk.since} to ${chunk.until} value:`,
            chunkValue
          );
          if (chunkValue !== null) {
            totalValue += chunkValue;
          }
        }

        console.log(
          `Total ${metric} from ${chunks.length} chunks:`,
          totalValue
        );

        // Return a mock response structure that matches what extractTotal expects
        return {
          data: [
            {
              total_value: {
                value: totalValue,
              },
            },
          ],
        };
      } else {
        // Single request for the full date range
        const params = new URLSearchParams({
          metric: metric,
          period: period,
          since: instagramStart,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        });

        // Only add until parameter if instagramEnd is not null
        if (instagramEnd !== null) {
          params.append("until", instagramEnd);
        }

        // Add metric_type parameter if specified
        if (metricType) {
          params.append("metric_type", metricType);
        }

        console.log(
          `Instagram API request for ${metric}:`,
          url + "?" + params.toString()
        );

        const response = await fetch(url + "?" + params.toString());

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Instagram API error for ${metric}:`, errorText);

          // Check for token expiration
          if (
            response.status === 401 ||
            errorText.includes("access_token") ||
            errorText.includes("expired")
          ) {
            throw new Error(`INSTAGRAM_TOKEN_EXPIRED: ${errorText}`);
          }

          throw new Error(
            `Instagram API error: ${response.status} - ${errorText}`
          );
        }

        const responseData = await response.json();
        console.log(
          `DEBUG: ${metric} single request response:`,
          JSON.stringify(responseData, null, 2)
        );
        return responseData;
      }
    };

    // Special handling for reach metric - return null for >30 day ranges
    // Note: Reach cannot be chunked because it's a unique audience metric
    // Summing reach across chunks would double-count users reached in multiple periods
    const fetchReachWithFallback = async () => {
      // Check if date range is over 30 days
      const startDate = new Date(start);
      const endDate = new Date(end);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      if (daysDiff > 30) {
        console.log(
          `Reach requested for ${daysDiff} days - returning null (cannot sum unique audience across periods)`
        );
        // Return null data structure that extractTotal will handle
        return { data: [] };
      }

      try {
        // Try full range for ≤30 days
        return await fetchInstagramData("reach", "day", null, false);
      } catch (error) {
        console.error("Reach API error:", error.message);
        // Return null data structure that extractTotal will handle
        return { data: [] };
      }
    };

    // Fetch Instagram metrics
    const [viewsData, reachData, profileViewsData, websiteClicksData] =
      await Promise.all([
        fetchInstagramData("views", "day", "total_value", true), // Views with chunking
        fetchReachWithFallback(), // Reach with fallback to last 30 days if full range fails
        fetchInstagramData("profile_views", "day", "total_value", true), // Profile views with chunking
        fetchInstagramData("website_clicks", "day", "total_value", true), // Bio link clicks with chunking
      ]);

    console.log("Instagram API responses:", {
      views: viewsData,
      reach: reachData,
      profileViews: profileViewsData,
      websiteClicks: websiteClicksData,
    });

    // Debug: Log the raw data structure for views specifically
    console.log(
      "DEBUG: Views data structure:",
      JSON.stringify(viewsData, null, 2)
    );

    const views = extractTotal(viewsData, "views");
    const reach = extractTotal(reachData, "reach");
    const profileVisits = extractTotal(profileViewsData, "profile_views");
    const bioLinkClicks = extractTotal(websiteClicksData, "website_clicks");

    console.log("🎯 FINAL EXTRACTED INSTAGRAM METRICS:", {
      views: views,
      reach: reach,
      profileVisits: profileVisits,
      bioLinkClicks: bioLinkClicks,
    });
    console.log("🔍 Views specifically:", views, typeof views);

    // Check if reach was excluded due to >30 day range
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const reachExcluded = daysDiff > 30;

    // Check if date range includes dates before Feb 23, 2025 (when Instagram views data became available)
    const instagramViewsCutoffDate = new Date("2025-02-23");
    const hasPreCutoffDates = startDate < instagramViewsCutoffDate;

    res.json({
      success: true,
      data: {
        ig: {
          views,
          reach,
          profileVisits,
          bioLinkClicks,
        },
        dataGaps: {
          instagramViews: hasPreCutoffDates
            ? {
                gapCount: (() => {
                  const gapStartDate = new Date(start);
                  const gapEndDate = new Date(
                    endDate < instagramViewsCutoffDate ? end : "2025-02-22"
                  );
                  const timeDiff =
                    gapEndDate.getTime() - gapStartDate.getTime();
                  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
                })(),
                completeness: (() => {
                  const totalStartDate = new Date(start);
                  const totalEndDate = new Date(end);
                  const totalDays =
                    Math.ceil(
                      (totalEndDate.getTime() - totalStartDate.getTime()) /
                        (1000 * 3600 * 24)
                    ) + 1;

                  // Calculate how many days in the range are before Feb 23, 2025 (gap days)
                  const rangeStartDate = new Date(start);
                  const rangeEndDate = new Date(end);
                  const cutoffDate = new Date("2025-02-23");

                  let gapDays = 0;

                  // If the entire range is before the cutoff, all days are gap days
                  if (rangeEndDate < cutoffDate) {
                    gapDays = totalDays;
                  }
                  // If the range starts before the cutoff, count days from start to Feb 22, 2025
                  else if (rangeStartDate < cutoffDate) {
                    const gapEndDate = new Date("2025-02-22");
                    gapDays =
                      Math.ceil(
                        (gapEndDate.getTime() - rangeStartDate.getTime()) /
                          (1000 * 3600 * 24)
                      ) + 1;
                  }
                  // If the range starts after the cutoff, no gap days
                  else {
                    gapDays = 0;
                  }

                  const availableDays = totalDays - gapDays;
                  const completeness = Math.round(
                    (availableDays / totalDays) * 100
                  );

                  return completeness;
                })(),
                affectedDateRange: {
                  start: start,
                  end: endDate < instagramViewsCutoffDate ? end : "2025-02-22",
                },
              }
            : null,
        },
      },
      dateRange: { start, end },
      source: "instagram",
      warnings: reachExcluded
        ? [
            "Reach data not available for date ranges >30 days (unique audience cannot be summed across periods)",
          ]
        : undefined,
    });
  } catch (e) {
    console.error("Error fetching Instagram data:", e);

    // Check if it's a token expiration error
    if (e.message.includes("INSTAGRAM_TOKEN_EXPIRED")) {
      return res.json({
        success: false,
        error: "INSTAGRAM_TOKEN_EXPIRED",
        message:
          "Instagram access token has expired. Please update the token in the environment variables.",
        data: {
          ig: {
            views: null,
            reach: null,
            profileVisits: null,
            bioLinkClicks: null,
          },
        },
        dateRange: { start, end },
        source: "instagram-error",
      });
    }

    // Return fallback data with null values for other errors
    res.json({
      success: true,
      data: {
        ig: {
          views: null,
          reach: null,
          profileVisits: null,
          bioLinkClicks: null,
        },
      },
      dateRange: { start, end },
      source: "instagram-fallback",
      error: `API Error: ${e.message}`,
      warnings: undefined,
    });
  }
});

export default internalStatsRouter;
