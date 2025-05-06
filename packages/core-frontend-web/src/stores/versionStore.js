import { create } from "zustand";
import { persist } from "zustand/middleware";

const useVersionStore = create(
  persist(
    (set) => ({
      version: "v1",
      setVersion: (version) => set({ version }),
    }),
    {
      name: "saa-version-storage",
    }
  )
);

export default useVersionStore;
