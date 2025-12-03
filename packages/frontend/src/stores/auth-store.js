import { create } from "zustand";
import { fetchData } from "frontend/src/utils/api";
import { useReplaysStore } from "./replays-store";

const useAuthStore = create((set, get) => ({
  isAdmin: false,
  canViewReplays: false,
  mgAccess: false,
  isLoading: false, // Initialize as false instead of true
  isLoggedOut: null, // Add new state
  error: null,
  user: null,
  // Add resources data
  people: [],
  audios: [],
  filteredAudios: [],
  selectedPerson: "",
  selectedAudio: "",
  isFetching: false, // Prevent concurrent fetches

  // Unified function to fetch all user data
  fetchUserData: async () => {
    const state = get();

    // Prevent concurrent fetches
    if (state.isFetching) {
      return;
    }

    try {
      set({ isLoading: true, isFetching: true, error: null });

      // Fetch both user profile and auth data in parallel
      const [user, authzData] = await Promise.all([
        fetchData("/api/me"),
        fetchData("/api/authz"),
      ]);

      set({
        user,
        isAdmin: authzData.isAdmin,
        canViewReplays: authzData.canViewReplays !== false,
        mgAccess: authzData.mgAccess !== false,
        people: authzData.people || [],
        audios: authzData.audios || [],
        isLoading: false,
        isFetching: false,
        isLoggedOut: false,
      });
    } catch (error) {
      console.error("AuthStore: Error fetching user data:", error);
      set({
        error: error.message,
        isLoading: false,
        isFetching: false,
      });
    }
  },

  // Keep individual functions for backward compatibility
  fetchUserProfile: async () => {
    const state = get();
    if (!state.user) {
      await get().fetchUserData();
    }
  },

  fetchAdminStatus: async () => {
    const state = get();
    if (state.people.length === 0) {
      await get().fetchUserData();
    }
  },

  logout: async () => {
    try {
      console.log("1. Starting logout process...");
      // Clear all state and storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear any auth cookies
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear replays store
      useReplaysStore.getState().clearReplays();

      set({ isAdmin: false, isLoading: false, isLoggedOut: true, error: null });

      // Add a small delay to ensure state updates complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use the built-in Auth0 logout route
      window.location.replace("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Resource management functions
  setSelectedPerson: (person) => {
    set({ selectedPerson: person });
    // Auto-filter audios when person changes
    const state = get();
    if (person) {
      const filtered = state.audios.filter((a) => a.SpeakerName === person);
      set({ filteredAudios: filtered });
    } else {
      set({ filteredAudios: [], selectedAudio: "" });
    }
  },

  setSelectedAudio: (audio) => {
    set({ selectedAudio: audio });
  },

  // Reset state
  reset: () => {
    set({
      isAdmin: false,
      canViewReplays: false,
      mgAccess: false,
      isLoading: false,
      isLoggedOut: null,
      error: null,
      user: null,
      people: [],
      audios: [],
      filteredAudios: [],
      selectedPerson: "",
      selectedAudio: "",
      isFetching: false,
    });
  },
}));

export default useAuthStore;
