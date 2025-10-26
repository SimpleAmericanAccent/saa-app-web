import { useEffect, useRef } from "react";
import { useIssuesStore } from "../stores/issues-store";
// import useAuthStore from "../stores/auth-store";

export default function DataInitializer() {
  const { fetchIssues } = useIssuesStore();
  // const { fetchUserData } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch once when the app starts
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Fetch both issues and user data in parallel
      // Promise.all([fetchIssues(), fetchUserData()]);
      fetchIssues();
    }
  }, []); // Empty dependency array - only run once

  // This component doesn't render anything
  return null;
}
