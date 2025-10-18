import React from "react";
import { resourcesData } from "../data/resourcesData.js";
import { ExternalLink } from "lucide-react";

export default function Resources() {
  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
        External Resources & Tools
      </h1>

      {/* All Resources */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {resourcesData.resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              title={resource.description}
              className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              {/* Icon and Title */}
              <div className="flex flex-col items-center text-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <div className="text-blue-600 dark:text-blue-400">
                    {resource.icon ? (
                      <resource.icon className="h-5 w-5" />
                    ) : (
                      <ExternalLink className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {resource.name}
                </h3>
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 line-clamp-3">
                  {resource.description}
                </p>
              )}

              {/* External Link Indicator */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  <span className="hidden sm:inline">Visit</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>

              {/* Sub-links (if any) - shown on hover or as small indicator */}
              {resource.subLinks && resource.subLinks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{resource.subLinks.length} more link
                    {resource.subLinks.length > 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
