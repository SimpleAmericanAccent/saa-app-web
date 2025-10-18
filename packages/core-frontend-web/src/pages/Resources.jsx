import React, { useState, useMemo } from "react";
import { replaysData } from "../data/replaysData.js";

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getFilteredResources = (sectionKey) => {
    const resources = replaysData.sharedResources[sectionKey] || [];
    if (selectedCategory === "all") {
      return resources;
    }
    return resources.filter(
      (resource) =>
        resource.category === "all" || resource.category === selectedCategory
    );
  };

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
      <h1 className="text-4xl font-bold text-center mb-8">
        Training Resources & Tools
      </h1>

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

      {/* Link to Replays page */}
      <div className="text-center mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 inline-block">
          <p className="text-muted-foreground mb-2">
            Looking for training videos and call replays?
          </p>
          <a
            href="/replays"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🎥 View Replays
          </a>
        </div>
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

      {/* Resources Sections */}
      <div className="max-w-4xl mx-auto">
        {Object.entries(replaysData.sharedResources).map(
          ([sectionTitle, resources]) => {
            const filteredResources = getFilteredResources(sectionTitle);
            if (filteredResources.length === 0) return null;

            return (
              <div key={sectionTitle} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  {sectionTitle}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <ul className="space-y-4">
                    {filteredResources.map((resource, index) => (
                      <li key={index} className="flex flex-col">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          {resource.name}
                        </a>
                        {resource.description && (
                          <p className="text-muted-foreground mt-1">
                            {resource.description}
                          </p>
                        )}
                        {resource.subLinks && (
                          <ul className="mt-2 ml-4 space-y-2">
                            {resource.subLinks.map((subLink, subIndex) => (
                              <li key={subIndex}>
                                <a
                                  href={subLink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                >
                                  {subLink.name}
                                </a>
                                {subLink.description && (
                                  <span className="text-muted-foreground ml-2">
                                    - {subLink.description}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }
        )}

        {/* Show message if no resources found */}
        {Object.entries(replaysData.sharedResources).every(
          ([sectionTitle]) => getFilteredResources(sectionTitle).length === 0
        ) && (
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              No resources found for the selected category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
