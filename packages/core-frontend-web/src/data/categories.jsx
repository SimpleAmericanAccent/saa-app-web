/**
 * Single source of truth for category definitions
 * Used across replays, resources, sidebar, and other components
 */

import { Waves, Construction, Music, Brain } from "lucide-react";

export const categories = {
  vowels: {
    name: "Vowels",
    iconComponent: Waves,
    description: "",
    shortDescription: "",
  },
  consonants: {
    name: "Consonants",
    iconComponent: Construction,
    description: "",
    shortDescription: "",
  },
  flow: {
    name: "Flow",
    iconComponent: Music,
    description: "",
    shortDescription: "",
  },
  "smart-practice": {
    name: "Smart Practice",
    iconComponent: Brain,
    description: "",
    shortDescription: "",
  },
};

/**
 * Helper function to get category info by key
 */
export const getCategoryInfo = (categoryKey) => {
  return (
    categories[categoryKey] || {
      name: "Unknown",
      iconComponent: null,
      description: "",
      shortDescription: "",
    }
  );
};

/**
 * Helper function to render category icon
 */
export const renderCategoryIcon = (categoryKey, className = "h-4 w-4") => {
  const category = getCategoryInfo(categoryKey);
  const IconComponent = category.iconComponent;
  return IconComponent ? <IconComponent className={className} /> : null;
};

/**
 * Get all category keys
 */
export const getCategoryKeys = () => Object.keys(categories);

/**
 * Get all categories as array
 */
export const getCategoriesArray = () =>
  Object.entries(categories).map(([key, value]) => ({
    key,
    ...value,
  }));
