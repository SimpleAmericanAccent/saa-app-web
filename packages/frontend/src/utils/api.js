const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const buildUrl = (url) => {
  if (url.startsWith("https://")) {
    return url;
  }

  if (!BACKEND_URL) {
    return url;
  }

  const cleanBase = BACKEND_URL.endsWith("/")
    ? BACKEND_URL.slice(0, -1)
    : BACKEND_URL;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

export async function fetchData(url, options = {}) {
  try {
    const fullUrl = buildUrl(url);
    const response = await fetch(fullUrl, {
      ...options,
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null; // Handle errors gracefully
  }
}
