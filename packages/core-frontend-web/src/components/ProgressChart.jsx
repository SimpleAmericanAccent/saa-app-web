import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-gray-900 dark:text-white">
          Trial {data.trialIndex}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Accuracy:{" "}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {data.accuracy}%
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {data.correctTrials}/{data.totalTrials} correct
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(data.timestamp).toLocaleDateString()}
        </p>
      </div>
    );
  }
  return null;
};

// Progress chart component
export function ProgressChart({ data, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Loading progress data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">
            Failed to load progress data
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.rollingAverages || data.rollingAverages.length === 0) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            No progress data available
          </p>
          <p className="text-xs text-muted-foreground">
            Complete more trials to see your progress over time
          </p>
        </div>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.rollingAverages.map((point) => ({
    ...point,
    timestamp: new Date(point.timestamp).toISOString(),
  }));

  return (
    <div className="w-full h-48 md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.2} />
          <XAxis
            dataKey="trialIndex"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af" }}
            label={{
              value: "# of Trials",
              position: "bottom",
              offset: 0,
              style: { textAnchor: "middle", fill: "#9ca3af", fontSize: 12 },
            }}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "#9ca3af" }}
            width={40}
            label={{
              value: "Accuracy",
              angle: -90,
              position: "left",
              offset: 0,
              style: { textAnchor: "middle", fill: "#9ca3af", fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={4}
            fill="#3b82f6"
            fillOpacity={0.4}
            className="cursor-pointer"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
