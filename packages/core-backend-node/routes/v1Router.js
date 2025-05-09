//#region v1 routes
// NEW API (v1) - all new endpoints start with /v1/
import express from "express";

const v1Router = express.Router();

v1Router.post("/api/annotations/update", async (req, res) => {
  const airtable = req.app.locals.airtable;
  //tbd

  if (!req.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    // Add validation
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "Invalid request body",
        received: req.body,
      });
    }

    const {
      wordIndex,
      annotations: annotationsDesired,
      audioId,
      word,
      timestamp,
    } = req.body;

    // Add validation for required fields
    if (!wordIndex || !annotationsDesired) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["wordIndex", "annotations"],
        received: req.body,
      });
    }

    console.log("wordIndex:", wordIndex);
    console.log("desired annotations:", annotationsDesired);

    let wordsData = req.app.locals.wordsData;
    let wordsEntry = wordsData.find(
      (entry) => entry.fields["word index"] == wordIndex
    );

    // Get current annotations or empty array if none exist
    const annotationsCurrent = wordsEntry?.fields["BR issues"] || [];
    console.log("current annotations:", annotationsCurrent);

    // Determine operations needed
    const operations = determineRequiredOperations(
      annotationsCurrent,
      annotationsDesired,
      wordsEntry
    );

    // Execute the operations
    const results = [];
    for (const operation of operations) {
      try {
        let result;
        switch (operation.type) {
          case "CREATE":
            result = await airtable.executeAirtableOperation({
              method: "POST",
              path: "Words%20(instance)",
              data: {
                fields: {
                  "word index": wordIndex,
                  "BR issues": operation.data.annotations,
                  // Add other required fields here
                  "Audio Source": audioId, // Need to track this
                  Name: word,
                  "in timestamp (seconds)": timestamp,
                  Note: "Created via SAA web app",
                },
              },
            });
            break;

          case "UPDATE":
            result = await airtable.executeAirtableOperation({
              method: "PATCH",
              path: `Words%20(instance)/${operation.recordId}`,
              data: {
                fields: {
                  "BR issues": operation.data.annotations,
                  Note: "Updated via SAA web app",
                },
              },
            });
            break;

          case "DELETE":
            result = await airtable.executeAirtableOperation({
              method: "DELETE",
              path: `Words%20(instance)/${operation.recordId}`,
            });
            break;
        }
        results.push({ type: operation.type, success: true, data: result });
      } catch (err) {
        results.push({
          type: operation.type,
          success: false,
          error: err.message,
        });
      }
    }

    res.json({
      "server response": {
        input: {
          method: req.method,
          wordIndex,
          annotationsCurrent: annotationsCurrent,
          annotationsDesired: annotationsDesired,
          body: req.body,
        },
        output: {
          operations: {
            "operations to be done": operations,
            "operations done": results,
          },
          success: results.every((r) => r.success),
          newState: {
            wordIndex,
            annotations: annotationsDesired,
            wordsData,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error updating annotations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to determine required operations
function determineRequiredOperations(current, desired, existingEntry) {
  const operations = [];

  // If no existing entry and desired annotations exist - need CREATE
  if (!existingEntry && desired.length > 0) {
    operations.push({
      type: "CREATE",
      data: {
        annotations: desired,
      },
    });
    return operations;
  }

  // If existing entry but no desired annotations - need DELETE
  if (existingEntry && desired.length === 0) {
    operations.push({
      type: "DELETE",
      recordId: existingEntry.id,
    });
    return operations;
  }

  // If has both existing and desired - need UPDATE if they're different
  if (existingEntry && !arraysMatch(current, desired)) {
    operations.push({
      type: "UPDATE",
      recordId: existingEntry.id,
      data: {
        annotations: desired,
      },
    });
  }

  return operations;
}

// Helper to compare arrays
function arraysMatch(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
}

export default v1Router;

//#endregion
