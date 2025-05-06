import wlsData from "frontend-web-core/src/data/wls-data.json";

// Helper function to create URL-friendly slugs
const createSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "-");

// Generate routes for vowels
export const vowelRoutes = Object.keys(wlsData.vowels).map((vowelName) => ({
  path: `/learn/vowels/${createSlug(vowelName)}`,
  soundKey: vowelName,
  title: vowelName,
  type: "vowel",
}));

// Generate routes for consonants (if they exist in the data)
export const consonantRoutes = wlsData.consonants
  ? Object.keys(wlsData.consonants).map((consonantName) => ({
      path: `/learn/consonants/${createSlug(consonantName)}`,
      soundKey: consonantName,
      title: consonantName,
      type: "consonant",
    }))
  : [];

// Combine all sound routes
export const allSoundRoutes = [...vowelRoutes, ...consonantRoutes];

// Create index routes for each category
export const indexRoutes = [
  {
    path: "/learn/vowels",
    title: "Vowel Sounds",
    type: "index",
    children: vowelRoutes,
  },
  {
    path: "/learn/consonants",
    title: "Consonant Sounds",
    type: "index",
    children: consonantRoutes,
  },
];

// Export all routes together
export const allRoutes = [...indexRoutes, ...allSoundRoutes];
