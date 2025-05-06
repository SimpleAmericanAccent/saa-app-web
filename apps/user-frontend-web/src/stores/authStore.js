import { create } from "zustand";
import { fetchData } from "../utils/api";

const useAuthStore = create((set) => ({
  userRole: null,
  isLoading: false, // Initialize as false instead of true
  isLoggedOut: null, // Add new state
  error: null,

  // Fetch user role
  fetchUserRole: async () => {
    try {
      set({ isLoading: true });
      const { userRole } = await fetchData("/authz");
      set({ userRole, isLoading: false, isLoggedOut: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
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

      set({ userRole: null, isLoading: false, isLoggedOut: true, error: null });

      // Add a small delay to ensure state updates complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use the built-in Auth0 logout route
      window.location.replace("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Reset state
  reset: () => {
    set({ userRole: null, isLoading: false, isLoggedOut: null, error: null });
  },
}));

export default useAuthStore;
