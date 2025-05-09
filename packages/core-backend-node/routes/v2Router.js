import express from "express";

const v2Router = express.Router();

// Get words and annotations for an audio
v2Router.get("/api/audio/:audioId", async (req, res) => {
  const airtable = req.app.locals.airtable;
  if (!req.app.locals.currentUserAudioAccess?.includes(req.params.audioId)) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const audioData = await airtable.fetchAirtableRecords("Audio%20Source", {
      recordId: req.params.audioId,
    });

    // Fetch v2 words and annotations
    const wordsDataV2 = await airtable.fetchAirtableRecords("Words%20(v2)", {
      filterByFormula: `{Audio Source}="${audioData.fields.Name}"`,
    });

    const annotationDataV2 = await airtable.fetchAirtableRecords(
      "Annotations%20(v2)",
      {
        filterByFormula: `{Audio Source}="${audioData.fields.Name}"`,
      }
    );

    req.app.locals.wordsDataV2 = wordsDataV2;

    // console.log("Fetched wordsDataV2:", wordsDataV2);
    // console.log("Fetched annotationDataV2:", annotationDataV2);

    res.json({
      audio: {
        mp3url: audioData.fields["mp3 url"],
        tranurl: audioData.fields["tran/alignment JSON url"],
        name: audioData.fields.Name,
      },
      airtableWords: { records: wordsDataV2 },
      annotationData: { records: annotationDataV2 },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update annotations
v2Router.post("/api/annotations", async (req, res) => {
  const airtable = req.app.locals.airtable;
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const {
      wordIndex,
      annotations: annotationsDesired,
      audioId,
      word,
    } = req.body;

    console.table({
      wordIndex,
      annotations: annotationsDesired,
      audioId,
      word,
    });

    let wordsDataV2 = req.app.locals.wordsDataV2;
    let wordsEntry = wordsDataV2.find(
      (entry) => entry.fields["word index"] == wordIndex
    );

    // Get current annotations or empty array if none exist
    const annotationsCurrent = wordsEntry?.fields["Annotations"] || [];
    console.log("current annotations:", annotationsCurrent);

    const operations = determineV2Operations(
      wordIndex,
      annotationsDesired,
      audioId,
      word
    );
    const results = await executeV2Operations(operations);

    res.json({
      success: results.every((r) => r.success),
      operations: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function determineV2Operations(wordIndex, annotations) {
  // Find existing word without relying on cache
  const operations = [];

  operations.push({
    type: "CREATE_WORD",
    data: {
      wordIndex,
      annotations: [], // Will be populated by annotation operations
    },
  });

  // Handle annotation operations
  annotations.forEach((annotation) => {
    operations.push({
      type: "UPSERT_ANNOTATION",
      data: {
        wordIndex,
        ortho_start: annotation.ortho_start,
        ortho_end: annotation.ortho_end,
        stoplight: annotation.stoplight,
        target: annotation.target,
      },
    });
  });

  return operations;
}

async function executeV2Operations(operations) {
  const results = [];

  for (const op of operations) {
    try {
      let result;
      switch (op.type) {
        case "CREATE_WORD":
          result = await airtable.executeAirtableOperation({
            method: "POST",
            path: "Words%20(v2)",
            data: {
              fields: {
                "word index": op.data.wordIndex,
                "annotation version": "v2",
              },
            },
          });
          // Store word ID for annotations
          op.wordId = result.id;
          break;

        case "UPSERT_ANNOTATION":
          result = await airtable.executeAirtableOperation({
            method: "POST",
            path: "Annotations%20(v2)",
            data: {
              fields: {
                Word: [operations[0].wordId], // Get ID from created word
                ortho_start: op.data.ortho_start,
                ortho_end: op.data.ortho_end,
                stoplight: op.data.stoplight,
                target: [op.data.target],
              },
            },
          });
          break;
      }
      results.push({ success: true, data: result });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }

  return results;
}

export default v2Router;
