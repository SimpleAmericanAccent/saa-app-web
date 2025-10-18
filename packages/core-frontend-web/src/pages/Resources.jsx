import React from "react";
import { resourcesData } from "../data/resourcesData.js";

export default function Resources() {
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

      {/* Resources Sections */}
      <div className="max-w-4xl mx-auto">
        {Object.entries(resourcesData.resources).map(
          ([sectionTitle, resources]) => (
            <div key={sectionTitle} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                {sectionTitle}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <ul className="space-y-4">
                  {resources.map((resource, index) => (
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
          )
        )}
      </div>
    </div>
  );
}
