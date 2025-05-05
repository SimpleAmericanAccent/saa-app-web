import express from "express";
import * as dictionaryController from "../../shared/backend-node/controllers/dictionaryController.js";

const dictionaryRouter = express.Router();

// Add logging middleware
dictionaryRouter.use((req, res, next) => {
  console.log(`Dictionary API Request: ${req.method} ${req.url}`);
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  console.log("Request query:", req.query);

  // Add response logging
  const originalJson = res.json;
  res.json = function (data) {
    console.log("Response:", data);
    return originalJson.call(this, data);
  };

  next();
});

// Dictionary entry routes (original endpoints)
dictionaryRouter.get("/entries", dictionaryController.getAllEntries);
dictionaryRouter.get("/entries/:id", dictionaryController.getEntryById);
dictionaryRouter.post("/entries", dictionaryController.createEntry);
dictionaryRouter.put("/entries/:id", dictionaryController.updateEntry);
dictionaryRouter.delete("/entries/:id", dictionaryController.deleteEntry);

// Dictionary word routes (same functionality, new names)
dictionaryRouter.get("/words", dictionaryController.getAllEntries);
dictionaryRouter.get("/words/:id", dictionaryController.getEntryById);
dictionaryRouter.post("/words", dictionaryController.createEntry);
dictionaryRouter.put("/words/:id", dictionaryController.updateEntry);
dictionaryRouter.delete("/words/:id", dictionaryController.deleteEntry);

// Usage routes
dictionaryRouter.delete(
  "/entries/:entryId/usages/:usageId",
  dictionaryController.deleteUsage
);

// Lexical set routes
dictionaryRouter.get("/lexical-sets", dictionaryController.getLexicalSets);
dictionaryRouter.get(
  "/lexical-sets/:id",
  dictionaryController.getLexicalSetById
);
dictionaryRouter.post("/lexical-sets", dictionaryController.createLexicalSet);
dictionaryRouter.put(
  "/lexical-sets/:id",
  dictionaryController.updateLexicalSet
);
dictionaryRouter.delete(
  "/lexical-sets/:id",
  dictionaryController.deleteLexicalSet
);

// Lexical set usage routes
dictionaryRouter.post(
  "/lexical-sets/:lexicalSetId/usages/:usageId",
  dictionaryController.addUsageToLexicalSet
);
dictionaryRouter.delete(
  "/lexical-sets/:lexicalSetId/usages/:usageId",
  dictionaryController.removeUsageFromLexicalSet
);

// Consonant phoneme routes
dictionaryRouter.get(
  "/consonant-phonemes",
  dictionaryController.getConsonantPhonemes
);
dictionaryRouter.get(
  "/consonant-phonemes/:id",
  dictionaryController.getConsonantPhonemeById
);
dictionaryRouter.post(
  "/consonant-phonemes",
  dictionaryController.createConsonantPhoneme
);
dictionaryRouter.put(
  "/consonant-phonemes/:id",
  dictionaryController.updateConsonantPhoneme
);
dictionaryRouter.delete(
  "/consonant-phonemes/:id",
  dictionaryController.deleteConsonantPhoneme
);

// Consonant phoneme usage routes
dictionaryRouter.post(
  "/consonant-phonemes/:phonemeId/usages/:usageId",
  dictionaryController.addUsageToConsonantPhoneme
);

export default dictionaryRouter;
