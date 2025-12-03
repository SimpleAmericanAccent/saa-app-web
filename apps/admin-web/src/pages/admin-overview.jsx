import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const AdminOverview = () => {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("/api/admin/overview");
      setOverview(data.overview);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <Button variant="outline" onClick={fetchOverview}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-2xl font-bold">{overview.totalUsers}</div>
                <div className="text-xs text-muted-foreground">
                  With quiz activity
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Trials</span>
                </div>
                <div className="text-2xl font-bold">
                  {overview.totalTrials.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Across all users
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Overall Accuracy</span>
                </div>
                <div className="text-2xl font-bold">
                  {overview.overallAccuracy}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Average across all users
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Activity</span>
                </div>
                <div className="text-2xl font-bold">
                  {overview.recentActivity.trials}
                </div>
                <div className="text-xs text-muted-foreground">
                  Trials in last 7 days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Recent Activity (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>New Trials</span>
                    <span className="font-medium">
                      {overview.recentActivity.trials}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Users</span>
                    <span className="font-medium">
                      {overview.recentActivity.newUsers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Active Contrasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overview.topContrasts.slice(0, 5).map((contrast, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{contrast.contrastName}</span>
                      <span className="text-sm font-medium">
                        {contrast.trialCount} trials
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
