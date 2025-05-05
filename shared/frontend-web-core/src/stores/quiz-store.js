import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useQuizStore = create(
  persist(
    (set) => ({
      mode: "fixed", // default to 10 questions mode
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "quiz-settings", // unique name for localStorage
    }
  )
);
