import React, { useState, useMemo } from "react";
import GatedVideo from "../components/GatedVideo.jsx";
import { replaysData } from "../data/replaysData.js";

export default function ReplaysHub() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFeatured, setShowFeatured] = useState(true);

  const filteredVideos = useMemo(() => {
    let videos = replaysData.videos;

    if (selectedCategory !== "all") {
      videos = videos.filter((video) => video.category === selectedCategory);
    }

    if (showFeatured) {
      videos = videos.filter((video) => video.featured);
    }

    // Sort by date (newest first)
    return videos.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCategory, showFeatured]);

  const getCategoryInfo = (categoryKey) => {
    return (
      replaysData.categories[categoryKey] || {
        name: "All",
        icon: "📺",
        color: "gray",
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Call Replays</h1>

      {/* Calendar Link */}
      <div className="text-center mb-8">
        <a
          href="https://simpleamericanaccent.com/mgcalendar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          📅 Upcoming Call Calendar
        </a>
      </div>

      {/* Filter Controls */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              📺 All Categories
            </button>
            {Object.entries(replaysData.categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedCategory === key
                    ? `bg-${category.color}-600 text-white`
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Featured Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => setShowFeatured(e.target.checked)}
              className="rounded"
            />
            <span>Featured Only</span>
          </label>
        </div>

        {/* Category Description */}
        {selectedCategory !== "all" && (
          <div className="text-center mt-4">
            <p className="text-muted-foreground">
              {getCategoryInfo(selectedCategory).description}
            </p>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div key={video.id} className="w-full max-w-[500px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">
                  {getCategoryInfo(video.category).icon}
                </span>
                <h2 className="text-xl font-semibold text-center flex-1">
                  {video.title}
                </h2>
              </div>
              <GatedVideo slug={video.slug} title={video.title} />
              {video.description && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {video.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center col-span-full">
            <p className="text-muted-foreground text-lg">
              No videos found for the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Special handling for Smart Practice chapters */}
      {selectedCategory === "smart-practice" &&
        filteredVideos.some((v) => v.id === "smart-practice-2025") && (
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Video Chapters
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <ul className="space-y-3">
                {replaysData.videos
                  .find((v) => v.id === "smart-practice-2025")
                  ?.chapters?.map((chapter, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                        {chapter.time}
                      </span>
                      <span>{chapter.title}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

      {/* Link to Resources page */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">
            Looking for Training Resources?
          </h2>
          <p className="text-muted-foreground mb-4">
            Find practice tools, pronunciation guides, and external resources
          </p>
          <a
            href="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📚 View Resources
          </a>
        </div>
      </div>
    </div>
  );
}
