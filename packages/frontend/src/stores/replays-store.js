import { create } from "zustand";
import { fetchData } from "../utils/api";

export const useReplaysStore = create((set, get) => ({
  // State
  replaysData: {},
  loading: false,
  error: null,
  lastFetched: null,
  isFetching: false, // Prevent concurrent fetches

  // Actions
  fetchReplays: async (forceRefresh = false) => {
    const state = get();

    // Don't refetch if we already have data and not forcing refresh
    if (!forceRefresh && Object.keys(state.replaysData).length > 0) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isFetching) {
      return;
    }

    set({ loading: true, error: null, isFetching: true });

    try {
      const data = await fetchData("/api/replays");

      // Convert array to object keyed by slug for easy lookup
      const replaysMap = {};
      if (data.replays && Array.isArray(data.replays)) {
        data.replays.forEach((replay) => {
          if (replay.slug) {
            replaysMap[replay.slug] = replay;
          }
        });
      }

      set({
        replaysData: replaysMap,
        loading: false,
        error: null,
        lastFetched: Date.now(),
        isFetching: false,
      });
    } catch (error) {
      console.error("ReplaysStore: Error fetching replays:", error);
      set({
        loading: false,
        error: error.message,
        isFetching: false,
      });
    }
  },

  // Helper to get replay data by slug
  getReplayBySlug: (slug) => {
    const { replaysData } = get();
    return replaysData[slug] || null;
  },

  // Helper to get all replays
  getAllReplays: () => {
    const { replaysData } = get();
    return Object.values(replaysData);
  },

  // Clear the store (useful for logout)
  clearReplays: () => {
    set({
      replaysData: {},
      loading: false,
      error: null,
      lastFetched: null,
      isFetching: false,
    });
  },

  // Getters for convenience
  getIsLoading: () => get().loading,
  getError: () => get().error,
  getReplaysData: () => get().replaysData,
}));
