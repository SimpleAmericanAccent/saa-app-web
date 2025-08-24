import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ProgressChart } from "./ProgressChart";
import { fetchProgressData, fetchContrasts } from "../utils/quizApi";
import { TrendingUp, Target, Clock, X, BarChart3 } from "lucide-react";

export default function ProgressModal({
  isOpen,
  onClose,
  contrastKey = "kit_fleece",
}) {
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowSize, setWindowSize] = useState(30);
  const [selectedView, setSelectedView] = useState("vowels"); // vowels, consonants, overall
  const [selectedQuizType, setSelectedQuizType] = useState(contrastKey);
  const [availableQuizTypes, setAvailableQuizTypes] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAvailableQuizTypes();
      loadProgressData();
    }
  }, [isOpen, windowSize, selectedView, selectedQuizType]);

  useEffect(() => {
    if (contrastKey !== selectedQuizType) {
      setSelectedQuizType(contrastKey);
    }
  }, [contrastKey]);

  // Auto-select first available quiz type when switching categories
  useEffect(() => {
    if (Object.keys(availableQuizTypes).length > 0) {
      const categoryQuizTypes = getQuizTypesByCategory(selectedView);
      const categoryKeys = Object.keys(categoryQuizTypes);
      const allOption =
        selectedView === "vowels" ? "all_vowels" : "all_consonants";

      if (categoryKeys.length > 0) {
        // If current selection is not in the new category, select the "all" option first
        if (
          !categoryKeys.includes(selectedQuizType) &&
          selectedQuizType !== allOption
        ) {
          setSelectedQuizType(allOption);
        }
      }
    }
  }, [selectedView, availableQuizTypes]);

  const loadAvailableQuizTypes = async () => {
    try {
      const quizTypes = await fetchContrasts();
      setAvailableQuizTypes(quizTypes);
    } catch (err) {
      console.error("Failed to load quiz types:", err);
    }
  };

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let dataKey;
      if (selectedQuizType === "all_vowels") {
        dataKey = "vowels";
      } else if (selectedQuizType === "all_consonants") {
        dataKey = "consonants";
      } else {
        dataKey = selectedQuizType;
      }

      const data = await fetchProgressData(dataKey, windowSize);
      setProgressData(data);
    } catch (err) {
      console.error("Failed to load progress data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadProgressData();
  };

  const getQuizTypesByCategory = (category) => {
    return Object.entries(availableQuizTypes)
      .filter(([key, quizData]) => quizData.category === category)
      .reduce((acc, [key, quizData]) => {
        acc[key] = quizData;
        return acc;
      }, {});
  };

  const getViewDisplayName = () => {
    if (selectedQuizType === "all_vowels") {
      return "All Vowels";
    } else if (selectedQuizType === "all_consonants") {
      return "All Consonants";
    } else {
      const quizData = availableQuizTypes[selectedQuizType];
      return quizData ? quizData.name : "Selected Quiz";
    }
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    if (!progressData || !progressData.rollingAverages.length) {
      return null;
    }

    const averages = progressData.rollingAverages;
    const latest = averages[averages.length - 1];
    const first = averages[0];

    const improvement = latest.accuracy - first.accuracy;
    const trend =
      improvement > 0 ? "improving" : improvement < 0 ? "declining" : "stable";

    return {
      currentAccuracy: latest.accuracy,
      totalTrials: progressData.totalTrials,
      improvement,
      trend,
      totalDataPoints: averages.length,
    };
  };

  const summaryStats = getSummaryStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* View Selector */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              onClick={() => setSelectedView("vowels")}
              variant={selectedView === "vowels" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Vowels
            </Button>
            <Button
              onClick={() => setSelectedView("consonants")}
              variant={selectedView === "consonants" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              Consonants
            </Button>
            <Button
              onClick={() => setSelectedView("overall")}
              variant={selectedView === "overall" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Overall
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {(selectedView === "vowels" || selectedView === "consonants") && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Quiz Type:</label>
                <select
                  value={selectedQuizType}
                  onChange={(e) => setSelectedQuizType(e.target.value)}
                  className="px-3 py-1 border border-border rounded-md text-sm bg-background min-w-[150px]"
                >
                  {selectedView === "vowels" && (
                    <option value="all_vowels">All Vowels</option>
                  )}
                  {selectedView === "consonants" && (
                    <option value="all_consonants">All Consonants</option>
                  )}
                  {Object.entries(getQuizTypesByCategory(selectedView)).map(
                    ([key, quizData]) => (
                      <option key={key} value={key}>
                        {quizData.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Rolling Average:</label>
              <select
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                className="px-3 py-1 border border-border rounded-md text-sm bg-background"
              >
                <option value={10}>10 trials</option>
                <option value={20}>20 trials</option>
                <option value={30}>30 trials</option>
                <option value={50}>50 trials</option>
              </select>
            </div>

            <Button onClick={handleRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Current Accuracy
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {summaryStats.currentAccuracy}%
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Trials</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {summaryStats.totalTrials}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Improvement</span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      summaryStats.improvement > 0
                        ? "text-green-600"
                        : summaryStats.improvement < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {summaryStats.improvement > 0 ? "+" : ""}
                    {summaryStats.improvement}%
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Data Points</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {summaryStats.totalDataPoints}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {getViewDisplayName()} - Accuracy Over Trials (Rolling{" "}
                {windowSize}-trial Average)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ProgressChart
                data={progressData}
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            <p>
              This chart shows your {getViewDisplayName().toLowerCase()}{" "}
              accuracy over time using a rolling average of {windowSize} trials.
              Each point represents the average accuracy of the previous{" "}
              {windowSize} trials, which helps smooth out natural variability
              and shows your true progress trend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
