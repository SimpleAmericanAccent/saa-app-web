import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ProgressChart } from "./progress-chart";
import { fetchProgressData, fetchContrasts } from "../utils/quiz-api";
import { TrendingUp, Target, Clock, X, RefreshCw } from "lucide-react";

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
  const [trialCounts, setTrialCounts] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAvailableQuizTypes();
      loadProgressData();
      loadTrialCounts();
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

  const loadTrialCounts = async () => {
    try {
      const counts = {};

      // Get trial counts for all available quiz types
      const quizTypes = Object.keys(availableQuizTypes);
      for (const quizType of quizTypes) {
        try {
          const data = await fetchProgressData(quizType, 1); // Use minimal window size
          counts[quizType] = data.totalTrials || 0;
        } catch (err) {
          counts[quizType] = 0;
        }
      }

      // Get counts for aggregated views
      try {
        const vowelsData = await fetchProgressData("vowels", 1);
        counts["all_vowels"] = vowelsData.totalTrials || 0;
      } catch (err) {
        counts["all_vowels"] = 0;
      }

      try {
        const consonantsData = await fetchProgressData("consonants", 1);
        counts["all_consonants"] = consonantsData.totalTrials || 0;
      } catch (err) {
        counts["all_consonants"] = 0;
      }

      setTrialCounts(counts);
    } catch (err) {
      console.error("Failed to load trial counts:", err);
    }
  };

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let dataKey;
      if (selectedView === "overall") {
        dataKey = "overall";
      } else if (selectedQuizType === "all_vowels") {
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
    if (selectedView === "overall") {
      return "Overall Progress";
    } else if (selectedQuizType === "all_vowels") {
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
    if (!progressData) {
      return null;
    }

    // If we have rolling averages, use them for more detailed stats
    if (
      progressData.rollingAverages &&
      progressData.rollingAverages.length > 0
    ) {
      const averages = progressData.rollingAverages;
      const latest = averages[averages.length - 1];
      const first = averages[0];

      const improvement = latest.accuracy - first.accuracy;
      const trend =
        improvement > 0
          ? "improving"
          : improvement < 0
          ? "declining"
          : "stable";

      return {
        currentAccuracy: latest.accuracy,
        totalTrials: progressData.totalTrials,
        improvement,
        trend,
        totalDataPoints: averages.length,
      };
    }

    // If we don't have rolling averages but have trials data, calculate basic stats
    if (progressData.trials && progressData.trials.length > 0) {
      const trials = progressData.trials;
      const totalTrials = trials.length;
      const correctTrials = trials.filter((trial) => trial.isCorrect).length;
      const currentAccuracy =
        totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

      return {
        currentAccuracy,
        totalTrials,
        improvement: 0, // Can't calculate improvement without enough data
        trend: "insufficient data",
        totalDataPoints: totalTrials,
      };
    }

    return null;
  };

  // Calculate comparison stats (first 30 vs last 30 trials)
  const getComparisonStats = () => {
    if (
      !progressData ||
      !progressData.trials ||
      progressData.trials.length < 31
    ) {
      return null;
    }

    const trials = progressData.trials;
    const first30Trials = trials.slice(0, 30);
    const last30Trials = trials.slice(-30);

    const first30Correct = first30Trials.filter(
      (trial) => trial.isCorrect
    ).length;
    const last30Correct = last30Trials.filter(
      (trial) => trial.isCorrect
    ).length;

    const first30Accuracy = Math.round((first30Correct / 30) * 100);
    const last30Accuracy = Math.round((last30Correct / 30) * 100);
    const improvement = last30Accuracy - first30Accuracy;

    return {
      first30: {
        correct: first30Correct,
        total: 30,
        accuracy: first30Accuracy,
      },
      last30: {
        correct: last30Correct,
        total: 30,
        accuracy: last30Accuracy,
      },
      improvement,
      hasImproved: improvement > 0,
      hasDeclined: improvement < 0,
      isStable: improvement === 0,
    };
  };

  const summaryStats = getSummaryStats();
  const comparisonStats = getComparisonStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col gap-0">
        <CardHeader className="pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* View Selector */}
          <div className="flex gap-1 mt-0">
            <Button
              onClick={() => setSelectedView("vowels")}
              variant={selectedView === "vowels" ? "default" : "outline"}
              size="sm"
              className="text-xs px-1 py-1 h-7 flex-1 min-w-0 cursor-pointer"
            >
              Vowels
            </Button>
            <Button
              onClick={() => setSelectedView("consonants")}
              variant={selectedView === "consonants" ? "default" : "outline"}
              size="sm"
              className="text-xs px-1 py-1 h-7 flex-1 min-w-0 cursor-pointer"
            >
              Consonants
            </Button>
            <Button
              onClick={() => {
                setSelectedView("overall");
                setSelectedQuizType(null);
              }}
              variant={selectedView === "overall" ? "default" : "outline"}
              size="sm"
              className="text-xs px-1 py-1 h-7 flex-1 min-w-0 cursor-pointer"
            >
              Overall
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-2 mt-2">
            {(selectedView === "vowels" || selectedView === "consonants") && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedQuizType}
                  onValueChange={setSelectedQuizType}
                >
                  <SelectTrigger className="min-w-[130px] cursor-pointer">
                    <SelectValue>
                      {selectedQuizType === "all_vowels"
                        ? "All Vowels"
                        : selectedQuizType === "all_consonants"
                        ? "All Consonants"
                        : availableQuizTypes[selectedQuizType]?.name ||
                          "Select quiz type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectedView === "vowels" && (
                      <SelectItem value="all_vowels">
                        All Vowels 📊 {trialCounts["all_vowels"] || 0} trials
                      </SelectItem>
                    )}
                    {selectedView === "consonants" && (
                      <SelectItem value="all_consonants">
                        All Consonants 📊 {trialCounts["all_consonants"] || 0}{" "}
                        trials
                      </SelectItem>
                    )}
                    {Object.entries(getQuizTypesByCategory(selectedView)).map(
                      ([key, quizData]) => (
                        <SelectItem key={key} value={key}>
                          {quizData.name} 📊 {trialCounts[key] || 0} trials
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="cursor-pointer p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Chart */}
          <div className="w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getViewDisplayName()} {/* Summary Stats */}
                {summaryStats && (
                  <>
                    {/* Mobile: Simple text layout */}
                    <div className="md:hidden justify-between text-center">
                      <div className="flex">
                        {summaryStats.trend === "insufficient data" ? (
                          <>
                            <span className="text-lg font-bold text-muted-foreground">
                              TBD
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`text-lg font-bold ${
                                summaryStats.improvement > 0
                                  ? "text-green-600"
                                  : summaryStats.improvement < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {summaryStats.improvement >= 0 ? "+" : ""}
                              {summaryStats.improvement}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Card layout */}
                    <div className="hidden md:block gap-3 text-center">
                      <div
                        className={`text-lg font-bold ${
                          summaryStats.trend === "insufficient data"
                            ? "text-muted-foreground"
                            : summaryStats.improvement > 0
                            ? "text-green-600"
                            : summaryStats.improvement < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {summaryStats.trend === "insufficient data"
                          ? "Need more data"
                          : `${summaryStats.improvement >= 0 ? "+" : ""}${
                              summaryStats.improvement
                            }%`}
                      </div>
                    </div>
                  </>
                )}
              </h3>
            </div>

            <div className="-mx-6 max-w-4xl mx-auto">
              <ProgressChart
                data={progressData}
                isLoading={isLoading}
                error={error}
                comparisonStats={comparisonStats}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-2 max-w-xl m-auto">
              <p>
                This chart shows your {getViewDisplayName()} accuracy over time
                using a rolling average of {windowSize} trials. Each point
                represents the average accuracy of the previous {windowSize}{" "}
                trials, which helps smooth out natural variability and shows a
                more useful progress trend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
