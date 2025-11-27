import React, { useState, useMemo } from "react";
import { resourcesData } from "../data/resources-data.js";
import { ExternalLink, Filter, X, Check } from "lucide-react";
import { Button } from "../components/ui/button.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command.js";
import { Badge } from "../components/ui/badge.js";

export default function Resources() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // Get all tags for each category type in the order defined in data
  const allTags = useMemo(() => {
    const tags = {};
    Object.keys(resourcesData.categoryTypes).forEach((categoryType) => {
      const categoryData = resourcesData.categoryTypes[categoryType];

      // Use the order defined in the data - show all available options
      tags[categoryType] = Object.keys(categoryData.categories);
    });
    return tags;
  }, []);

  // Filter resources based on selected filters
  const filteredResources = useMemo(() => {
    return resourcesData.resources.filter((resource) => {
      return Object.entries(selectedFilters).every(
        ([categoryType, selectedTags]) => {
          if (!selectedTags || selectedTags.length === 0) return true;
          return selectedTags.some((tag) =>
            resource.tags[categoryType]?.includes(tag)
          );
        }
      );
    });
  }, [selectedFilters]);

  const handleFilterChange = (categoryType, tag) => {
    setSelectedFilters((prev) => {
      const currentTags = prev[categoryType] || [];
      const isSelected = currentTags.includes(tag);

      if (isSelected) {
        // Remove tag if already selected
        return {
          ...prev,
          [categoryType]: currentTags.filter((t) => t !== tag),
        };
      } else {
        // Add tag if not selected
        return {
          ...prev,
          [categoryType]: [...currentTags, tag],
        };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  const removeFilter = (categoryType, tag = null) => {
    setSelectedFilters((prev) => {
      if (tag) {
        // Remove specific tag from category
        const currentTags = prev[categoryType] || [];
        const newTags = currentTags.filter((t) => t !== tag);
        return {
          ...prev,
          [categoryType]: newTags.length > 0 ? newTags : undefined,
        };
      } else {
        // Remove entire category
        const newFilters = { ...prev };
        delete newFilters[categoryType];
        return newFilters;
      }
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some((tags) =>
    Array.isArray(tags) ? tags.length > 0 : Boolean(tags)
  );

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-center sm:items-start">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left">
                External Resources & Tools
              </h1>
            </div>

            {/* Tag Picker */}
            <Popover
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Filter</span>
                  <span className="sm:hidden">Filter</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.values(selectedFilters).reduce(
                        (total, tags) =>
                          total + (Array.isArray(tags) ? tags.length : 0),
                        0
                      )}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[95vw] max-w-[500px] max-h-[85vh] overflow-hidden p-2 sm:p-3"
                align="center"
                side="bottom"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <span className="font-medium text-xs sm:text-sm">
                      Filter Resources
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-[70vh] overflow-y-auto">
                    {Object.entries(resourcesData.categoryTypes).map(
                      ([categoryType, categoryData]) => (
                        <div
                          key={categoryType}
                          className="space-y-0.5 sm:space-y-1"
                        >
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            {categoryData.name}
                          </h4>
                          <div className="space-y-0.5">
                            {allTags[categoryType]?.map((tag) => {
                              const tagInfo = categoryData.categories[tag];
                              const isSelected =
                                selectedFilters[categoryType]?.includes(tag) ||
                                false;
                              return (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    handleFilterChange(categoryType, tag);
                                  }}
                                  className={`w-full flex items-center gap-1 sm:gap-1.5 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`flex h-3 w-3 items-center justify-center rounded-sm border flex-shrink-0 ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="h-2 w-2" />
                                    )}
                                  </div>
                                  {tagInfo?.icon && (
                                    <tagInfo.icon className="h-3 w-3 flex-shrink-0" />
                                  )}
                                  <span className="text-left truncate text-xs">
                                    {tagInfo?.name || tag}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="sticky top-[65px] sm:top-[73px] z-40 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center justify-center">
              {Object.entries(selectedFilters).map(
                ([categoryType, selectedTags]) => {
                  if (!selectedTags || selectedTags.length === 0) return null;
                  const categoryData =
                    resourcesData.categoryTypes[categoryType];

                  return selectedTags.map((selectedTag) => {
                    const tagInfo = categoryData.categories[selectedTag];
                    return (
                      <Badge
                        key={`${categoryType}-${selectedTag}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tagInfo?.icon && <tagInfo.icon className="h-3 w-3" />}
                        <span className="text-xs">
                          {categoryData.name}: {tagInfo?.name || selectedTag}
                        </span>
                        <button
                          onClick={() =>
                            removeFilter(categoryType, selectedTag)
                          }
                          className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  });
                }
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-gray-300 dark:border-gray-600"
              >
                Clear all
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-2 sm:p-4">
        {/* Resources Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener"
                  title={resource.description}
                  className="group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer relative"
                >
                  {/* Pricing Indicator */}
                  {resource.tags.pricing &&
                    resource.tags.pricing.length > 0 && (
                      <div className="absolute top-1 right-1">
                        {(() => {
                          const pricingTag = resource.tags.pricing[0];
                          const pricingInfo =
                            resourcesData.categoryTypes.pricing.categories[
                              pricingTag
                            ];
                          if (!pricingInfo) return null;

                          const getDisplayText = (tag) => {
                            switch (tag) {
                              case "freemium":
                                return (
                                  <span className="hidden sm:inline text-center leading-tight">
                                    Free
                                    <br />
                                    with
                                    <br />
                                    Limits
                                  </span>
                                );
                              case "trial":
                                return (
                                  <span className="hidden sm:inline text-center leading-tight">
                                    Free
                                    <br />
                                    Trial
                                  </span>
                                );
                              default:
                                return (
                                  <span className="hidden sm:inline">
                                    {pricingInfo.name}
                                  </span>
                                );
                            }
                          };

                          return (
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shadow-sm ${pricingInfo.color}`}
                            >
                              <pricingInfo.icon className="h-3 w-3" />
                              {getDisplayText(pricingTag)}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                  {/* Icon and Title */}
                  <div className="flex flex-col items-center text-center mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <div className="text-blue-600 dark:text-blue-400">
                        <resource.icon className="h-5 w-5" />
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

                  {/* Tags */}
                  {/* <div className="mb-3 space-y-1">
                    {Object.entries(resource.tags).map(
                      ([categoryType, tags]) => (
                        <div
                          key={categoryType}
                          className="flex flex-wrap gap-1 justify-center"
                        >
                          {tags.map((tag) => {
                            const tagInfo =
                              resourcesData.categoryTypes[categoryType]
                                ?.categories[tag];
                            return (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                              >
                                {tagInfo?.icon && (
                                  <tagInfo.icon className="h-2 w-2" />
                                )}
                                <span className="hidden sm:inline">
                                  {tagInfo?.name || tag}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div> */}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No resources match your current filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
