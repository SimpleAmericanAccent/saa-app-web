import { create } from "zustand";
import { fetchData } from "../utils/api";

export const useIssuesStore = create((set, get) => ({
  // State
  issuesData: [],
  loading: false,
  error: null,
  lastFetched: null,
  isFetching: false, // Add flag to prevent concurrent fetches

  // Actions
  fetchIssues: async (forceRefresh = false) => {
    const state = get();

    // Don't refetch if we already have data and not forcing refresh
    if (!forceRefresh && state.issuesData.length > 0) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isFetching) {
      return;
    }

    set({ loading: true, error: null, isFetching: true });

    try {
      const data = await fetchData("/api/data/loadIssues");
      set({
        issuesData: data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
        isFetching: false,
      });
    } catch (error) {
      console.error("IssuesStore: Error fetching issues:", error);
      set({
        loading: false,
        error: error.message,
        isFetching: false,
      });
    }
  },

  // Helper to find target by slug (case insensitive)
  findTargetBySlug: (slug) => {
    const { issuesData } = get();
    return issuesData.find((t) => t.name.toLowerCase() === slug.toLowerCase());
  },

  // Helper to find issue by slug within target
  findIssueBySlug: (targetSlug, issueSlug) => {
    const { issuesData } = get();
    const target = issuesData.find(
      (t) => t.name.toLowerCase() === targetSlug.toLowerCase()
    );

    if (!target) return null;

    return target.issues.find(
      (i) => i.shortName?.toLowerCase() === issueSlug.toLowerCase()
    );
  },

  // Helper to get all issues for a target
  getIssuesForTarget: (targetSlug) => {
    const { issuesData } = get();
    const target = issuesData.find(
      (t) => t.name.toLowerCase() === targetSlug.toLowerCase()
    );

    return target ? target.issues : [];
  },

  // Helper to get all targets
  getAllTargets: () => {
    const { issuesData } = get();
    return issuesData;
  },

  // Helper to get all issues across all targets
  getAllIssues: () => {
    const { issuesData } = get();
    return issuesData.flatMap((target) => target.issues);
  },

  // Clear the store (useful for logout)
  clearIssues: () => {
    set({
      issuesData: [],
      loading: false,
      error: null,
      lastFetched: null,
      isFetching: false,
    });
  },

  // Getters for convenience
  getIsLoading: () => get().loading,
  getError: () => get().error,
  getIssuesData: () => get().issuesData,
}));
