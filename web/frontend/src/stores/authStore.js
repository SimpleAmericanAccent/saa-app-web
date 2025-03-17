import { create } from "zustand";
import { fetchData } from "../utils/api";

const useAuthStore = create((set) => ({
  userRole: null,
  isLoading: true,
  error: null,

  // Fetch user role
  fetchUserRole: async () => {
    try {
      set({ isLoading: true });
      const { userRole } = await fetchData("/authz");
      set({ userRole, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Reset state
  reset: () => {
    set({ userRole: null, isLoading: false, error: null });
  },
}));

export default useAuthStore;
