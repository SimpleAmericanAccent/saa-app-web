import React, { useState, useMemo } from "react";
import GatedVideo from "../components/gated-video.jsx";
import { replaysData } from "../data/replays-data.js";
import { getCategoryInfo, renderCategoryIcon } from "../data/categories.jsx";
import { Button } from "../components/ui/button.js";

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

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
        Zoom Calls & Selected Recordings
      </h1>

      {/* Calendar Link */}
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <a
          href="https://simpleamericanaccent.com/mgcalendar"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          📅 Upcoming Call Calendar
        </a>
      </div>

      {/* Filter Controls */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
            >
              📺 <span className="hidden sm:inline">All Categories</span>
              <span className="sm:hidden">All</span>
            </Button>
            {Object.entries(replaysData.categories).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                className="flex items-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm"
              >
                {renderCategoryIcon(key)}
                <span className="sm:inline">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Featured Toggle */}
          {/* <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => setShowFeatured(e.target.checked)}
              className="rounded"
            />
            <span>Featured Only</span>
          </label> */}
        </div>

        {/* Category Description */}
        {selectedCategory !== "all" && (
          <div className="text-center mt-3 sm:mt-4 px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              {getCategoryInfo(selectedCategory).description}
            </p>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div key={video.id} className="w-full">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                {renderCategoryIcon(video.category)}
                <h2 className="text-lg sm:text-xl font-semibold text-center flex-1">
                  {video.title}
                </h2>
              </div>
              <GatedVideo slug={video.slug} title={video.title} />
              {video.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                  {video.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center">
            <p className="text-muted-foreground text-base sm:text-lg">
              No videos found for the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Special handling for Smart Practice chapters */}
      {selectedCategory === "smart-practice" &&
        filteredVideos.some((v) => v.id === "smart-practice-2025") && (
          <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-2 sm:px-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">
              Video Chapters
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <ul className="space-y-2 sm:space-y-3">
                {replaysData.videos
                  .find((v) => v.id === "smart-practice-2025")
                  ?.chapters?.map((chapter, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <span className="font-mono text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded flex-shrink-0">
                        {chapter.time}
                      </span>
                      <span className="text-sm sm:text-base">
                        {chapter.title}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
    </div>
  );
}
