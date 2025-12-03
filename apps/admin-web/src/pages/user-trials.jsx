import React, { useState, useEffect } from "react";
import { fetchData } from "frontend/src/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  User,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Download,
} from "lucide-react";

// Performance color utilities (simplified version from user app)
const getGradientColor = (percentage) => {
  if (percentage <= 60) {
    return "rgb(239, 68, 68)"; // red-500
  } else if (percentage <= 80) {
    // Interpolate between red and yellow (60-80%)
    const progress = (percentage - 60) / 20;
    const r = Math.round(239 + (234 - 239) * progress);
    const g = Math.round(68 + (179 - 68) * progress);
    const b = Math.round(68 + (8 - 68) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Interpolate between yellow and green (80-100%)
    const progress = (percentage - 80) / 20;
    const r = Math.round(234 + (34 - 234) * progress);
    const g = Math.round(179 + (197 - 179) * progress);
    const b = Math.round(8 + (94 - 8) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const getGradientColorStyle = (percentage) => {
  const color = getGradientColor(percentage);
  return { color };
};

const getGradientBorderStyle = (percentage) => {
  const color = getGradientColor(percentage);
  return { borderColor: color };
};

// Compact ScoreBar component for contrast performance (matches user app styling)
const ContrastScoreBar = ({
  correct,
  total,
  contrastName,
  viewMode = "total",
  deltaData = null,
  lastTrialDate = null,
}) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = total - correct;
  const hasData = total > 0;

  return (
    <div className="relative z-10 flex flex-col">
      <div className="font-semibold text-xs mx-auto">{contrastName}</div>
      <div className="flex flex-col gap-1">
        {viewMode === "delta" && deltaData ? (
          // Delta view: delta above, first/last below
          <>
            {/* Delta percentage above the bar */}
            <div className="flex justify-center">
              <span
                className={`text-xs font-bold ${
                  deltaData.delta >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {deltaData.delta >= 0 ? "+" : ""}
                {deltaData.delta}%
              </span>
            </div>
          </>
        ) : (
          // Single view: show just the percentage
          <div className="flex gap-1 mx-auto">
            <span style={getGradientColorStyle(percentage)}>{percentage}%</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          {hasData ? (
            <>
              {/* Correct segment */}
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${(correct / total) * 100}%`,
                  backgroundColor: getGradientColor(percentage),
                }}
              />
              {/* Wrong segment */}
              <div
                className="absolute top-0 h-full bg-red-700"
                style={{
                  left: `${(correct / total) * 100}%`,
                  width: `${(wrong / total) * 100}%`,
                }}
              />
            </>
          ) : (
            /* Full gray bar for no data */
            <div
              className="absolute left-0 top-0 h-full bg-neutral-800"
              style={{ width: "100%" }}
            />
          )}
        </div>

        {/* First and last percentages below the bar */}
        {viewMode === "delta" && deltaData ? (
          <div className="flex justify-between items-center gap-0">
            <div className="flex flex-col items-center">
              <span
                className="text-[9px] sm:text-xs"
                style={getGradientColorStyle(deltaData.first30.percentage)}
              >
                {deltaData.first30.percentage}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                className="text-[9px] sm:text-xs"
                style={getGradientColorStyle(deltaData.last30.percentage)}
              >
                {deltaData.last30.percentage}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[9px] sm:text-[11px] text-muted-foreground text-center">
            {hasData
              ? total >= 30
                ? "✅ 30 done"
                : `⚠️ ${30 - total} left to 30`
              : "⚠️ Not started"}
          </div>
        )}
        {lastTrialDate && (
          <div className="absolute top-1 right-1 text-[8px] text-muted-foreground">
            {new Date(lastTrialDate).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const UserTrialsAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrials, setUserTrials] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    hasMore: true,
    totalLoaded: 0,
  });
  const [contrastViewMode, setContrastViewMode] = useState("total"); // "total", "first30", "last30", "delta"
  const [allContrasts, setAllContrasts] = useState({}); // Store all available contrasts

  // Fetch all available contrasts
  const fetchAllContrasts = async () => {
    try {
      const data = await fetchData("/api/quiz/contrasts");
      const contrastsByCategory = {};
      data.contrasts.forEach((contrast) => {
        if (!contrastsByCategory[contrast.category]) {
          contrastsByCategory[contrast.category] = {};
        }
        contrastsByCategory[contrast.category][contrast.name] = {
          key: contrast.key,
          name: contrast.name,
          category: contrast.category,
          description: contrast.description,
        };
      });
      setAllContrasts(contrastsByCategory);
    } catch (error) {
      console.error("Error fetching contrasts:", error);
    }
  };

  // Fetch all users with quiz activity
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("/api/admin/users/quiz-activity");
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trials for a specific user
  const fetchUserTrials = async (userId, reset = true) => {
    if (reset) {
      setIsLoading(true);
      setPagination({ limit: 100, offset: 0, hasMore: true, totalLoaded: 0 });
    }

    try {
      let data;
      if (reset) {
        // On initial load, try to get all trials at once
        data = await fetchData(`/api/admin/users/${userId}/trials?limit=10000`);
      } else {
        // For pagination, use the normal limit
        const currentOffset = pagination.offset;
        data = await fetchData(
          `/api/admin/users/${userId}/trials?limit=${pagination.limit}&offset=${currentOffset}`
        );
      }

      if (reset) {
        setUserTrials(data.trials);
        // Use pagination info from backend
        setPagination((prev) => ({
          ...prev,
          hasMore: data.pagination?.hasMore || false,
          totalLoaded: data.trials.length,
          total: data.pagination?.total || data.trials.length,
        }));
      } else {
        setUserTrials((prev) => [...prev, ...data.trials]);

        // Use pagination info from backend
        const newTotalLoaded = pagination.totalLoaded + data.trials.length;

        setPagination((prev) => ({
          ...prev,
          offset: prev.offset + prev.limit,
          hasMore: data.pagination?.hasMore || false,
          totalLoaded: newTotalLoaded,
          total: data.pagination?.total || prev.total,
        }));
      }
    } catch (error) {
      console.error("Error fetching user trials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more trials for the selected user
  const loadMoreTrials = async () => {
    if (selectedUser && pagination.hasMore && !isLoading) {
      await fetchUserTrials(selectedUser.id, false);
    }
  };

  // Load all trials for the selected user
  const loadAllTrials = async () => {
    if (selectedUser && !isLoading) {
      setIsLoading(true);
      try {
        const data = await fetchData(
          `/api/admin/users/${selectedUser.id}/trials?limit=10000`
        );
        setUserTrials(data.trials);
        setPagination((prev) => ({
          ...prev,
          hasMore: false,
          totalLoaded: data.trials.length,
          total: data.pagination?.total || data.trials.length,
        }));
      } catch (error) {
        console.error("Error loading all trials:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fetch stats for a specific user
  const fetchUserStats = async (userId) => {
    try {
      const data = await fetchData(`/api/admin/users/${userId}/stats`);
      setUserStats(data.stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserTrials(user.id);
    fetchUserStats(user.id);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter trials based on date
  const filteredTrials = userTrials.filter((trial) => {
    if (!filterDate) return true;
    const trialDate = new Date(trial.createdAt).toISOString().split("T")[0];
    return trialDate === filterDate;
  });

  // Calculate trial statistics
  const getTrialStats = (trials, viewMode = "total") => {
    if (!trials.length) return null;

    let filteredTrials = trials;
    let deltaData = null;

    // Filter trials based on view mode
    if (viewMode === "first30") {
      // Get first 30 trials for each contrast
      const contrastTrials = {};
      trials.forEach((trial) => {
        const contrast = trial.contrastName || "Unknown";
        if (!contrastTrials[contrast]) {
          contrastTrials[contrast] = [];
        }
        if (contrastTrials[contrast].length < 30) {
          contrastTrials[contrast].push(trial);
        }
      });
      filteredTrials = Object.values(contrastTrials).flat();
    } else if (viewMode === "last30") {
      // Get last 30 trials for each contrast
      const contrastTrials = {};
      trials.forEach((trial) => {
        const contrast = trial.contrastName || "Unknown";
        if (!contrastTrials[contrast]) {
          contrastTrials[contrast] = [];
        }
        contrastTrials[contrast].push(trial);
      });
      // Keep only the last 30 for each contrast
      Object.keys(contrastTrials).forEach((contrast) => {
        contrastTrials[contrast] = contrastTrials[contrast].slice(-30);
      });
      filteredTrials = Object.values(contrastTrials).flat();
    } else if (viewMode === "delta") {
      // Calculate delta between first 30 and last 30 for each contrast
      const contrastTrials = {};
      trials.forEach((trial) => {
        const contrast = trial.contrastName || "Unknown";
        if (!contrastTrials[contrast]) {
          contrastTrials[contrast] = [];
        }
        contrastTrials[contrast].push(trial);
      });

      // Calculate delta data for each contrast
      deltaData = {};
      Object.keys(contrastTrials).forEach((contrast) => {
        const contrastTrialsList = contrastTrials[contrast];
        const first30 = contrastTrialsList.slice(0, 30);
        const last30 = contrastTrialsList.slice(-30);

        const first30Correct = first30.filter((t) => t.isCorrect).length;
        const last30Correct = last30.filter((t) => t.isCorrect).length;
        const first30Percentage =
          first30.length > 0
            ? Math.round((first30Correct / first30.length) * 100)
            : 0;
        const last30Percentage =
          last30.length > 0
            ? Math.round((last30Correct / last30.length) * 100)
            : 0;
        const deltaPercentage = last30Percentage - first30Percentage;

        deltaData[contrast] = {
          first30: {
            total: first30.length,
            correct: first30Correct,
            percentage: first30Percentage,
          },
          last30: {
            total: last30.length,
            correct: last30Correct,
            percentage: last30Percentage,
          },
          delta: deltaPercentage,
        };
      });

      // For delta view, we'll use the last 30 data for the main display
      Object.keys(contrastTrials).forEach((contrast) => {
        contrastTrials[contrast] = contrastTrials[contrast].slice(-30);
      });
      filteredTrials = Object.values(contrastTrials).flat();
    }

    const total = filteredTrials.length;
    const correct = filteredTrials.filter((t) => t.isCorrect).length;
    const accuracy = Math.round((correct / total) * 100);

    const byContrast = filteredTrials.reduce((acc, trial) => {
      const contrast = trial.contrastName || "Unknown";
      if (!acc[contrast]) {
        acc[contrast] = { total: 0, correct: 0 };
      }
      acc[contrast].total++;
      if (trial.isCorrect) acc[contrast].correct++;
      return acc;
    }, {});

    const byDate = filteredTrials.reduce((acc, trial) => {
      const date = new Date(trial.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, correct: 0 };
      }
      acc[date].total++;
      if (trial.isCorrect) acc[date].correct++;
      return acc;
    }, {});

    // Group contrasts by category
    const byCategory = filteredTrials.reduce((acc, trial) => {
      const category = trial.contrastCategory || "unknown";
      if (!acc[category]) {
        acc[category] = {};
      }
      const contrast = trial.contrastName || "Unknown";
      if (!acc[category][contrast]) {
        acc[category][contrast] = { total: 0, correct: 0, lastTrialDate: null };
      }
      acc[category][contrast].total++;
      if (trial.isCorrect) acc[category][contrast].correct++;

      // Track the most recent trial date
      const trialDate = new Date(trial.createdAt);
      if (
        !acc[category][contrast].lastTrialDate ||
        trialDate > new Date(acc[category][contrast].lastTrialDate)
      ) {
        acc[category][contrast].lastTrialDate = trial.createdAt;
      }
      return acc;
    }, {});

    // Merge with all available contrasts to show all contrasts even with zero trials
    const mergedByCategory = {};
    Object.keys(allContrasts).forEach((category) => {
      mergedByCategory[category] = {};
      Object.keys(allContrasts[category]).forEach((contrastName) => {
        const userStats = byCategory[category]?.[contrastName] || {
          total: 0,
          correct: 0,
          lastTrialDate: null,
        };
        mergedByCategory[category][contrastName] = userStats;
      });
    });

    return {
      total,
      correct,
      accuracy,
      byContrast,
      byDate,
      byCategory: mergedByCategory,
      deltaData,
    };
  };

  const trialStats = getTrialStats(filteredTrials, contrastViewMode);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get performance color
  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    fetchUsers();
    fetchAllContrasts();
  }, []);

  return (
    <div className="h-screen flex flex-col p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Trials Admin</h1>
        <Button variant="outline" onClick={fetchUsers}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* User List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Users
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.name || "No name"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.trialCount || 0} trials • Last active:{" "}
                        {user.lastActive
                          ? formatDate(user.lastActive)
                          : "Never"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedUser ? (
                <div className="flex items-center justify-between">
                  <span>{selectedUser.email}</span>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </div>
              ) : (
                "Select a user to view details"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {selectedUser ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-col h-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trials">Trials</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overview"
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="space-y-4 pr-4">
                      {trialStats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Overall Accuracy
                                </span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${getPerformanceColor(
                                  trialStats.accuracy
                                )}`}
                              >
                                {trialStats.accuracy}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {trialStats.correct} correct out of{" "}
                                {trialStats.total} trials
                                {contrastViewMode === "first30" &&
                                  " (first 30)"}
                                {contrastViewMode === "last30" && " (last 30)"}
                                {contrastViewMode === "delta" &&
                                  " (delta view)"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Total Trials
                                </span>
                              </div>
                              <div className="text-2xl font-bold">
                                {trialStats.total}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Across all contrasts
                                {contrastViewMode === "first30" &&
                                  " (first 30 per contrast)"}
                                {contrastViewMode === "last30" &&
                                  " (last 30 per contrast)"}
                                {contrastViewMode === "delta" &&
                                  " (delta view)"}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Active Days
                                </span>
                              </div>
                              <div className="text-2xl font-bold">
                                {Object.keys(trialStats.byDate).length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Days with quiz activity
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {(trialStats?.byCategory || trialStats?.byContrast) && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                Performance by Contrast
                              </CardTitle>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => setContrastViewMode("total")}
                                  variant={
                                    contrastViewMode === "total"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Total
                                </Button>
                                <Button
                                  onClick={() => setContrastViewMode("first30")}
                                  variant={
                                    contrastViewMode === "first30"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  First 30
                                </Button>
                                <Button
                                  onClick={() => setContrastViewMode("last30")}
                                  variant={
                                    contrastViewMode === "last30"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Last 30
                                </Button>
                                <Button
                                  onClick={() => setContrastViewMode("delta")}
                                  variant={
                                    contrastViewMode === "delta"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Delta
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Vowels Column */}
                              <div>
                                <h3 className="font-semibold text-lg mb-3 text-center">
                                  Vowels
                                </h3>
                                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                  {/* Column 1: First 3 vowel contrasts */}
                                  <div className="space-y-1 sm:space-y-2">
                                    {Object.entries(
                                      trialStats.byCategory.vowels || {}
                                    )
                                      .slice(0, 3)
                                      .map(([contrast, stats]) => (
                                        <div
                                          key={contrast}
                                          className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                                            stats.total > 0
                                              ? ""
                                              : "border-gray-300"
                                          }`}
                                          style={
                                            stats.total > 0
                                              ? getGradientBorderStyle(
                                                  Math.round(
                                                    (stats.correct /
                                                      stats.total) *
                                                      100
                                                  )
                                                )
                                              : {}
                                          }
                                        >
                                          <ContrastScoreBar
                                            correct={stats.correct}
                                            total={stats.total}
                                            contrastName={contrast}
                                            viewMode={contrastViewMode}
                                            deltaData={
                                              trialStats.deltaData?.[contrast]
                                            }
                                            lastTrialDate={stats.lastTrialDate}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                  {/* Column 2: Remaining vowel contrasts */}
                                  <div className="space-y-1 sm:space-y-2">
                                    {Object.entries(
                                      trialStats.byCategory.vowels || {}
                                    )
                                      .slice(3)
                                      .map(([contrast, stats]) => (
                                        <div
                                          key={contrast}
                                          className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                                            stats.total > 0
                                              ? ""
                                              : "border-gray-300"
                                          }`}
                                          style={
                                            stats.total > 0
                                              ? getGradientBorderStyle(
                                                  Math.round(
                                                    (stats.correct /
                                                      stats.total) *
                                                      100
                                                  )
                                                )
                                              : {}
                                          }
                                        >
                                          <ContrastScoreBar
                                            correct={stats.correct}
                                            total={stats.total}
                                            contrastName={contrast}
                                            viewMode={contrastViewMode}
                                            deltaData={
                                              trialStats.deltaData?.[contrast]
                                            }
                                            lastTrialDate={stats.lastTrialDate}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>

                              {/* Consonants Column */}
                              <div>
                                <h3 className="font-semibold text-lg mb-3 text-center">
                                  Consonants
                                </h3>
                                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                  {/* Column 1: First 4 consonant contrasts */}
                                  <div className="space-y-1 sm:space-y-2">
                                    {Object.entries(
                                      trialStats.byCategory.consonants || {}
                                    )
                                      .slice(0, 4)
                                      .map(([contrast, stats]) => (
                                        <div
                                          key={contrast}
                                          className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                                            stats.total > 0
                                              ? ""
                                              : "border-gray-300"
                                          }`}
                                          style={
                                            stats.total > 0
                                              ? getGradientBorderStyle(
                                                  Math.round(
                                                    (stats.correct /
                                                      stats.total) *
                                                      100
                                                  )
                                                )
                                              : {}
                                          }
                                        >
                                          <ContrastScoreBar
                                            correct={stats.correct}
                                            total={stats.total}
                                            contrastName={contrast}
                                            viewMode={contrastViewMode}
                                            deltaData={
                                              trialStats.deltaData?.[contrast]
                                            }
                                            lastTrialDate={stats.lastTrialDate}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                  {/* Column 2: Next 4 consonant contrasts */}
                                  <div className="space-y-1 sm:space-y-2">
                                    {Object.entries(
                                      trialStats.byCategory.consonants || {}
                                    )
                                      .slice(4, 8)
                                      .map(([contrast, stats]) => (
                                        <div
                                          key={contrast}
                                          className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                                            stats.total > 0
                                              ? ""
                                              : "border-gray-300"
                                          }`}
                                          style={
                                            stats.total > 0
                                              ? getGradientBorderStyle(
                                                  Math.round(
                                                    (stats.correct /
                                                      stats.total) *
                                                      100
                                                  )
                                                )
                                              : {}
                                          }
                                        >
                                          <ContrastScoreBar
                                            correct={stats.correct}
                                            total={stats.total}
                                            contrastName={contrast}
                                            viewMode={contrastViewMode}
                                            deltaData={
                                              trialStats.deltaData?.[contrast]
                                            }
                                            lastTrialDate={stats.lastTrialDate}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                  {/* Column 3: Remaining consonant contrasts */}
                                  <div className="space-y-1 sm:space-y-2">
                                    {Object.entries(
                                      trialStats.byCategory.consonants || {}
                                    )
                                      .slice(8)
                                      .map(([contrast, stats]) => (
                                        <div
                                          key={contrast}
                                          className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                                            stats.total > 0
                                              ? ""
                                              : "border-gray-300"
                                          }`}
                                          style={
                                            stats.total > 0
                                              ? getGradientBorderStyle(
                                                  Math.round(
                                                    (stats.correct /
                                                      stats.total) *
                                                      100
                                                  )
                                                )
                                              : {}
                                          }
                                        >
                                          <ContrastScoreBar
                                            correct={stats.correct}
                                            total={stats.total}
                                            contrastName={contrast}
                                            viewMode={contrastViewMode}
                                            deltaData={
                                              trialStats.deltaData?.[contrast]
                                            }
                                            lastTrialDate={stats.lastTrialDate}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="trials"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">Trials</h3>
                      <p className="text-sm text-muted-foreground">
                        Showing {userTrials.length} of{" "}
                        {pagination.total || userTrials.length} trials
                        {pagination.hasMore && " (scroll to load more)"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {pagination.hasMore && (
                        <Button
                          onClick={loadAllTrials}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          {isLoading ? "Loading..." : "Load All"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-2">
                      {filteredTrials.map((trial) => (
                        <div key={trial.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {trial.contrastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trial.wordA} vs {trial.wordB}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Presented: {trial.presentedSide} • Chose:{" "}
                                {trial.choiceSide}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">
                                {formatDate(trial.createdAt)}
                              </div>
                              {trial.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {pagination.hasMore && (
                        <div className="flex justify-center pt-4">
                          <Button
                            onClick={loadMoreTrials}
                            disabled={isLoading}
                            variant="outline"
                          >
                            {isLoading ? "Loading..." : "Load More Trials"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="stats"
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-4 pr-4">
                      {userStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Quiz Completion
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Vowels</span>
                                  <span>
                                    {userStats.vowels?.completed || 0}/
                                    {userStats.vowels?.total || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Consonants</span>
                                  <span>
                                    {userStats.consonants?.completed || 0}/
                                    {userStats.consonants?.total || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>
                                    {userStats.overall?.completed || 0}/
                                    {userStats.overall?.total || 0}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Average Scores
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Vowels</span>
                                  <span
                                    className={getPerformanceColor(
                                      userStats.vowels?.average || 0
                                    )}
                                  >
                                    {userStats.vowels?.average || 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Consonants</span>
                                  <span
                                    className={getPerformanceColor(
                                      userStats.consonants?.average || 0
                                    )}
                                  >
                                    {userStats.consonants?.average || 0}%
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Overall</span>
                                  <span
                                    className={getPerformanceColor(
                                      userStats.overall?.average || 0
                                    )}
                                  >
                                    {userStats.overall?.average || 0}%
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a user from the list to view their quiz data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTrialsAdmin;
