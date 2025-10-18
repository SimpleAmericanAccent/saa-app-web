import React from "react";
import { resourcesData } from "../data/resourcesData.js";
import { ExternalLink } from "lucide-react";

export default function Resources() {
  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
        Training Resources & Tools
      </h1>

      {/* Resources Sections */}
      <div className="max-w-6xl mx-auto">
        {Object.entries(resourcesData.resources).map(
          ([sectionTitle, resources]) => (
            <div key={sectionTitle} className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
                {sectionTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 pr-2">
                        {resource.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>

                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">
                        {resource.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                        Visit Resource
                        <ExternalLink className="h-3 w-3" />
                      </div>

                      {resource.subLinks && resource.subLinks.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Related Links:
                          </h4>
                          <ul className="space-y-2">
                            {resource.subLinks.map((subLink, subIndex) => (
                              <li key={subIndex}>
                                <span
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(
                                      subLink.url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-start gap-1 cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="flex-1">{subLink.name}</span>
                                </span>
                                {subLink.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                                    {subLink.description}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
