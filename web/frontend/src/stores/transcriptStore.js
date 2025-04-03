// tbd - was breaking both V1 and V2, so not going to add this to other files yet.

import { create } from "zustand";

const useTranscriptStore = create((set) => ({
  annotatedTranscript: [],
  setAnnotatedTranscript: (transcript) => {
    set({ annotatedTransript: transcript });
    console.log("annotatedTranscript", transcript);
  },
  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  activeWordIndex: null,
  setActiveWordIndex: (index) => set({ activeWordIndex: index }),
}));

export default useTranscriptStore;
