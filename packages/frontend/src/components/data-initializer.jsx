import { useEffect, useRef } from "react";
import { useIssuesStore } from "../stores/issues-store";
import useAuthStore from "../stores/auth-store";
import { useReplaysStore } from "../stores/replays-store";

export default function DataInitializer() {
  const { fetchIssues } = useIssuesStore();
  const { fetchUserData } = useAuthStore();
  const { fetchReplays } = useReplaysStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch once when the app starts
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Fetch issues, user data, and replays in parallel
      Promise.all([fetchIssues(), fetchUserData(), fetchReplays()]);
    }
  }, []); // Empty dependency array - only run once

  // This component doesn't render anything
  return null;
}
