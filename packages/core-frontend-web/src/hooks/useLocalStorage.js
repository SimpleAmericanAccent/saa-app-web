import { useState, useEffect } from "react";

// Custom hook to sync with localStorage changes
export function useLocalStorage(key, initialValue = null) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
          setValue(initialValue);
        }
      }
    };

    // Listen for storage events (cross-tab)
    window.addEventListener("storage", handleStorageChange);

    // Create a custom event for same-tab updates
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setValue(e.detail.value);
      }
    };
    window.addEventListener("localStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageChange",
        handleCustomStorageChange
      );
    };
  }, [key, initialValue]);

  // Function to update localStorage and trigger the event
  const updateValue = (newValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, value: newValue },
        })
      );
      setValue(newValue);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, updateValue];
}
