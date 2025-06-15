import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const StatTable = ({ title, stats }) => {
  return (
    <div className="inline-block border rounded-lg">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(stats).map(([key, value]) => (
            <React.Fragment key={key}>
              <div className="text-muted-foreground text-sm">{key}</div>
              <div className="font-bold text-right">
                {typeof value === "number" && value.toString().includes(".")
                  ? `$${value.toFixed(2)}`
                  : value}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    content: 0,
    conversations: 0,
    clientHelp: 0,
    other: 0,
    total: 0,
    posts: 0,
    reels: 0,
    images: 0,
    carousels: 0,
    nonReelVideos: 0,
    totalImpressions: 0,
    totalReach: 0,
    profileViews: 0,
    profileBioLinkClicks: 0,
    appStarts: 0,
    wEmail: 0,
    completed: 0,
    mgDollarY: 0,
    viaIGBioLink: 0,
    viaIGManychat: 0,
    viaIGStories: 0,
    viaEmail: 0,
    mgPaid: 0,
    acceptedButNotPaid: 0,
    tbd: 0,
    rejected: 0,
    mg_pmts_app: 0,
    mg_refunds_app: 0,
    mg_netpay_app: 0,
    mg_pmts_day: 0,
    mg_refunds_day: 0,
    mg_netpay_day: 0,
    all_pmts_day: 0,
    all_refunds_day: 0,
    all_netpay_day: 0,
  });

  const dashboardConfig = {
    "Time Tracking": {
      Total: stats.total,
      Content: stats.content,
      Convos: stats.conversations,
      "Client Help": stats.clientHelp,
      Other: stats.other,
    },
    "Content Posted": {
      Total: stats.posts,
      Reels: stats.reels,
      Images: stats.images,
      Carousels: stats.carousels,
      "N-R Vids": stats.nonReelVideos,
    },
    Engagement: {
      Impressions: stats.totalImpressions,
      Reach: stats.totalReach,
      "Profile Visits": stats.profileViews,
      "Bio Link Clicks": stats.profileBioLinkClicks,
    },
    "App Start Origins": {
      "Bio Link": stats.viaIGBioLink,
      Manychat: stats.viaIGManychat,
      Stories: stats.viaIGStories,
      Email: stats.viaEmail,
    },
    "App Stats": {
      Starts: stats.appStarts,
      "W/ Email": stats.wEmail,
      Completed: stats.completed,
      "MG $ Y": stats.mgDollarY,
    },
    "MG App Outcomes": {
      TBD: stats.tbd,
      Rejected: stats.rejected,
      "Yes (Not Paid)": stats.acceptedButNotPaid,
      Paid: stats.mgPaid,
    },
    "MG Sales (App Attribution)": {
      Pmts: stats.mg_pmts_app,
      Refunds: stats.mg_refunds_app,
      Net: stats.mg_netpay_app,
    },
    "MG Cashflow (Day Attribution)": {
      Pmts: stats.mg_pmts_day,
      Refunds: stats.mg_refunds_day,
      Net: stats.mg_netpay_day,
    },
    "All Cashflow (Day Attribution)": {
      Pmts: stats.all_pmts_day,
      Refunds: stats.all_refunds_day,
      Net: stats.all_netpay_day,
    },
  };

  const getTodayLocal = () => {
    const today = new Date();
    return today.toLocaleDateString("en-CA");
  };

  const calculatePastDateLocal = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toLocaleDateString("en-CA");
  };

  const loadData = async (start, end) => {
    if (!start || !end) {
      console.error("Please select both a start and end date.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/data/loadRange?start=${start}&end=${end}`);
      const data = await response.json();

      const filteredData = data.filter((record) => {
        const recordDate = new Date(record.fields.Date);
        return recordDate >= new Date(start) && recordDate <= new Date(end);
      });

      const totals = filteredData.reduce(
        (acc, record) => {
          const fields = record.fields;

          // Parse monetary values
          const parseMonetaryValue = (field) => {
            if (!field || !field.length) return 0;
            const value =
              typeof field[0] === "string"
                ? field[0].replace(/[^0-9.-]+/g, "")
                : field[0];
            return parseFloat(value) || 0;
          };

          const mg_pmts_app = parseMonetaryValue(fields.mg_pay_app_attribution);
          const mg_refunds_app = parseMonetaryValue(
            fields.mg_refund_app_attribution
          );
          const mg_netpay_app = parseMonetaryValue(
            fields.mg_netpay_app_attribution
          );
          const mg_pmts_day = parseMonetaryValue(fields.mg_pay_day_attribution);
          const mg_refunds_day = parseMonetaryValue(
            fields.mg_refund_day_attribution
          );
          const mg_netpay_day = parseMonetaryValue(
            fields.mg_netpay_day_attribution
          );
          const all_pmts_day = parseMonetaryValue(fields.all_pmts_day);
          const all_refunds_day = parseMonetaryValue(fields.all_refunds_day);
          const all_netpay_day = parseMonetaryValue(fields.all_netpay_day);

          // Numeric fields
          acc.content += fields.Content || 0;
          acc.conversations += fields.Conversations || 0;
          acc.clientHelp += fields["Client Help"] || 0;
          acc.other += fields.Other || 0;
          acc.total += fields.Total || 0;

          // Array fields
          const sumArray = (arr) =>
            arr ? arr.reduce((sum, val) => sum + val, 0) : 0;

          acc.posts += sumArray(fields.posts);
          acc.reels += sumArray(fields.reels);
          acc.images += sumArray(fields.images);
          acc.carousels += sumArray(fields.carousels);
          acc.nonReelVideos += sumArray(fields.nonReelVideos);
          acc.totalImpressions += sumArray(fields.total_impressions);
          acc.totalReach += sumArray(fields.total_reach);
          acc.profileViews += sumArray(fields.profile_views);
          acc.profileBioLinkClicks += sumArray(fields.profile_bio_link_clicks);
          acc.appStarts += sumArray(fields["app starts"]);
          acc.wEmail += sumArray(fields["w email"]);
          acc.completed += sumArray(fields.completed);
          acc.mgDollarY += sumArray(fields["MG $ Y"]);
          acc.viaIGBioLink += sumArray(fields["via IG bio link"]);
          acc.viaIGManychat += sumArray(fields["via IG Manychat"]);
          acc.viaIGStories += sumArray(fields["via IG Stories"]);
          acc.viaEmail += sumArray(fields["via Email"]);
          acc.mgPaid += sumArray(fields["MG paid"]);
          acc.acceptedButNotPaid += sumArray(fields["accepted but not paid"]);
          acc.tbd += sumArray(fields["TBD"]);
          acc.rejected += sumArray(fields["rejected"]);

          // Monetary values
          acc.mg_pmts_app += mg_pmts_app;
          acc.mg_refunds_app += mg_refunds_app;
          acc.mg_netpay_app += mg_netpay_app;
          acc.mg_pmts_day += mg_pmts_day;
          acc.mg_refunds_day += mg_refunds_day;
          acc.mg_netpay_day += mg_netpay_day;
          acc.all_pmts_day += all_pmts_day;
          acc.all_refunds_day += all_refunds_day;
          acc.all_netpay_day += all_netpay_day;

          return acc;
        },
        { ...stats }
      );

      // Convert time values to hours
      totals.content = Math.floor((totals.content / 3600) * 100) / 100;
      totals.conversations =
        Math.floor((totals.conversations / 3600) * 100) / 100;
      totals.clientHelp = Math.floor((totals.clientHelp / 3600) * 100) / 100;
      totals.other = Math.floor((totals.other / 3600) * 100) / 100;
      totals.total = Math.floor((totals.total / 3600) * 100) / 100;

      setStats(totals);
    } catch (error) {
      console.log(error);
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRange = (range) => {
    const today = getTodayLocal();
    let start = today;

    switch (range) {
      case "today":
        start = today;
        break;
      case "thisWeek":
        const todayDate = new Date();
        const startOfWeek = new Date(
          todayDate.setDate(todayDate.getDate() - todayDate.getDay() + 1)
        );
        start = startOfWeek.toLocaleDateString("en-CA");
        break;
      case "last7Days":
        start = calculatePastDateLocal(7);
        break;
      case "last30Days":
        start = calculatePastDateLocal(30);
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(today);
    loadData(start, today);
  };

  useEffect(() => {
    const today = getTodayLocal();
    setStartDate(today);
    setEndDate(today);
    loadData(today, today);
  }, []);

  return (
    <div className="h-screen">
      <header className="p-6 bg-background border-b">
        <div className="container mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Date(s)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleQuickRange("today")}
                  disabled={isLoading}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickRange("thisWeek")}
                  disabled={isLoading}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickRange("last7Days")}
                  disabled={isLoading}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickRange("last30Days")}
                  disabled={isLoading}
                >
                  Last 30 Days
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start:
                  </label>
                  <Input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End:
                  </label>
                  <Input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => loadData(startDate, endDate)}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <ScrollArea className="h-full">
        <div className="container mx-auto p-2">
          <div className="flex flex-wrap gap-4">
            {Object.entries(dashboardConfig).map(([title, stats]) => (
              <StatTable key={title} title={title} stats={stats} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Dashboard;
