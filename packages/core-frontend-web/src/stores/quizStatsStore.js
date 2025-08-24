import { create } from "zustand";
import { getQuizStats } from "../utils/quizStats";

// Centralized quiz stats store
export const useQuizStatsStore = create((set, get) => ({
  // Preload stats on store creation
  _preloadStats: () => {
    // Start loading stats immediately when store is created
    setTimeout(() => {
      get().loadStats();
    }, 100);
  },
  // State
  stats: null,
  isLoading: false,
  lastUpdated: null,
  error: null,

  // Actions
  loadStats: async () => {
    const state = get();

    // Don't reload if we're already loading
    if (state.isLoading) return;

    // Don't reload if we have recent data (within 30 seconds)
    if (
      state.stats &&
      state.lastUpdated &&
      Date.now() - state.lastUpdated < 30000
    ) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const stats = await getQuizStats();
      set({
        stats,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null,
      });
    } catch (error) {
      console.error("Failed to load quiz stats:", error);
      set({
        isLoading: false,
        error: error.message,
      });
    }
  },

  refreshStats: async () => {
    // Force refresh by clearing lastUpdated
    set({ lastUpdated: null });
    await get().loadStats();
  },

  clearStats: () => {
    set({
      stats: null,
      isLoading: false,
      lastUpdated: null,
      error: null,
    });
  },

  // Getters
  getStats: () => get().stats,
  getIsLoading: () => get().isLoading,
  getError: () => get().error,
}));

// Start preloading stats when the store is first accessed
const store = useQuizStatsStore.getState();
store._preloadStats();
