import express from "express";

const baseRouter = express.Router();

// Compute canViewReplays from an already-fetched People record
function computeCanViewReplaysFromRecord(req, currentUser) {
  if (req.isAdmin) return true;
  const raw =
    currentUser?.fields?.["blockReplays"] ??
    currentUser?.fields?.["blockreplays"] ??
    "";
  const blocked = String(raw).trim().toLowerCase() === "yes";
  return !blocked;
}

baseRouter.get("/authz", async (req, res) => {
  const airtable = req.app.locals.airtable;

  // Helper function to find a record by user ID
  const findUserById = (peopleRecords, userId) => {
    return peopleRecords.find(
      (record) => record.fields["auth0 user_id"] === userId
    );
  };

  // Helper function to find audio records the user has access to
  const findAudiosByAccess = (audioRecords, accessList) => {
    if (!accessList) {
      return [];
    }
    return accessList
      .map((audioId) => {
        const audio = audioRecords.find((record) => record.id === audioId);
        return audio
          ? {
              id: audio.id,
              Name: audio.fields.Name,
              SpeakerName: audio.fields.Speaker[0],
              date: audio.fields.Date,
            }
          : null;
      })
      .filter(Boolean);
  };

  // Helper function to get speakers info for audios the user has access to
  const findSpeakersForAudios = (peopleRecords, audioAccessList) => {
    return audioAccessList
      .map((audio) => {
        const speaker = peopleRecords.find(
          (record) => record.id === audio.SpeakerName
        );
        return speaker ? { id: speaker.id, Name: speaker.fields.Name } : null;
      })
      .filter(Boolean);
  };

  // Step 1: Look up current user
  const currentUserId = req.oidc.user.sub;
  const peopleObject = {
    records: await airtable.fetchAirtableRecords("People"),
  };
  const currentUser = findUserById(peopleObject.records, currentUserId);
  if (currentUser) {
    const currentUserAudioAccess = currentUser.fields["Access to audios"] || [];
    req.app.locals.currentUserAudioAccess = currentUserAudioAccess;

    // Step 2: Look up audio list
    const audioObject = {
      records: await airtable.fetchAirtableRecords("Audio%20Source"),
    };
    const currentUserAudioAccessObject = findAudiosByAccess(
      audioObject.records,
      currentUserAudioAccess
    );

    // Step 3: Get speakers info for audios the user has access to
    const currentUserAudioAccessObjectSpeakerNames = findSpeakersForAudios(
      peopleObject.records,
      currentUserAudioAccessObject
    );

    // Step 4: Remove duplicates
    const uniqueSpeakers = [
      ...new Map(
        currentUserAudioAccessObjectSpeakerNames.map((item) => [item.id, item])
      ).values(),
    ];
    const uniqueAudios = [
      ...new Map(
        currentUserAudioAccessObject.map((item) => [item.id, item])
      ).values(),
    ];

    // Respond with the necessary info
    res.json({
      people: uniqueSpeakers,
      audios: uniqueAudios,
      isAdmin: req.isAdmin,
      canViewReplays: computeCanViewReplaysFromRecord(req, currentUser),
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

baseRouter.get("/data/loadIssues", async (req, res) => {
  const airtable = req.app.locals.airtable;

  const airtableFeatures = await airtable.fetchAirtableRecords("Target");
  const airtableIssues = await airtable.fetchAirtableRecords("BR%20issues");

  // Prepare features with empty issues arrays
  const featuresMap = airtableFeatures.reduce((acc, record) => {
    acc[record.id] = {
      id: record.id,
      name: record.fields.Name || "",
      po: record.fields["Presentation order"] || Infinity,
      type: record.fields.type || "",
      issues: [],
    };
    return acc;
  }, {});

  // Link issues to features
  airtableIssues.forEach((record) => {
    // Parse the resources text field into an array of URLs
    const resourcesText = record.fields.resources || "";
    const resources = resourcesText
      .split(/[\n\r]+/) // Split by newlines
      .map((url) => url.trim()) // Remove whitespace
      .filter((url) => url.length > 0) // Remove empty lines
      .map((url) => url.replace(/[<>]/g, "")); // Remove angle brackets

    const issueData = {
      id: record.id,
      name: record.fields.Name || "",
      shortName: record.fields["short-name"] || "",
      po: record.fields["Presentation order"] || Infinity,
      resources: resources,
    };

    (record.fields["target"] || []).forEach((featureId) => {
      const feature = featuresMap[featureId];
      if (feature) {
        feature.issues.push(issueData);
      }
    });
  });

  // Sort issues and features by po
  Object.values(featuresMap).forEach((feature) =>
    feature.issues.sort((a, b) => a.po - b.po)
  );
  const sortedFeatures = Object.values(featuresMap).sort((a, b) => a.po - b.po);

  // Send response
  res.json(sortedFeatures);
});

baseRouter.get("/data/loadAudio/:AudioRecId", async (req, res) => {
  const airtable = req.app.locals.airtable;

  // Check if the user has access to the audio
  if (!req.app.locals.currentUserAudioAccess?.includes(req.params.AudioRecId)) {
    return res.status(404).json({ error: "Not found" });
  }

  const audioData = await airtable.fetchAirtableRecords("Audio%20Source", {
    recordId: req.params.AudioRecId,
  });

  if (!audioData) {
    return res.status(404).json({ error: "Audio not found" });
  }

  const wordsData = await airtable.fetchAirtableRecords("Words%20(instance)", {
    filterByFormula: `{Audio Source} = "${audioData.fields.Name}"`,
  });

  req.app.locals.wordsData = wordsData;

  res.json({
    audio: {
      mp3url: audioData.fields["mp3 url"],
      tranurl: audioData.fields["tran/alignment JSON url"],
      name: audioData.fields.Name,
    },
    airtableWords: { records: wordsData }, // Now includes ALL records
  });
});

// Gated endpoint to retrieve replay embed URL by slug without leaking IDs to unauthorized users
baseRouter.get("/replays/:slug/url", async (req, res) => {
  try {
    const airtable = req.app.locals.airtable;
    const user = req.oidc?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Lookup replay by slug in Airtable table "Replays" (try lowercase then capitalized field name)
    let replays = await airtable.fetchAirtableRecords("Replays", {
      filterByFormula: `{slug} = "${req.params.slug}"`,
    });
    let replay = Array.isArray(replays) ? replays[0] : replays;
    if (!replay) {
      replays = await airtable.fetchAirtableRecords("Replays", {
        filterByFormula: `{Slug} = "${req.params.slug}"`,
      });
      replay = Array.isArray(replays) ? replays[0] : replays;
    }
    if (!replay) return res.status(404).json({ error: "Replay not found" });

    // Load People and find current user
    const people = await airtable.fetchAirtableRecords("People");
    const currentUser = people.find(
      (r) => r.fields["auth0 user_id"] === user.sub
    );

    // Check permission after confirming replay exists
    const canViewReplays = computeCanViewReplaysFromRecord(req, currentUser);
    if (!canViewReplays)
      return res.status(403).json({ error: "Replay found but not authorized" });

    // Build embed URL from lowercase platform & id; also return meta including thumbUrl
    const platform = String(replay.fields["platform"] || "").toLowerCase();
    const id = replay.fields["id"];
    const thumbUrl =
      replay.fields["thumburl"] || replay.fields["thumbUrl"] || null;
    if (!platform || !id)
      return res.status(500).json({ error: "Missing platform or id" });

    let embedUrl;
    if (platform === "youtube") {
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (platform === "loom") {
      embedUrl = `https://www.loom.com/embed/${id}`;
    } else {
      return res.status(500).json({ error: "Unknown platform" });
    }

    return res.json({ embedUrl, platform, id, thumbUrl });
  } catch (error) {
    console.error("/api/replays/:slug/url error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Public (authenticated) metadata for a replay: returns non-sensitive info like thumbUrl
baseRouter.get("/replays/:slug/meta", async (req, res) => {
  try {
    const airtable = req.app.locals.airtable;
    const user = req.oidc?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Lookup replay by slug (tolerate {slug} or {Slug})
    let replays = await airtable.fetchAirtableRecords("Replays", {
      filterByFormula: `{slug} = "${req.params.slug}"`,
    });
    let replay = Array.isArray(replays) ? replays[0] : replays;
    if (!replay) {
      replays = await airtable.fetchAirtableRecords("Replays", {
        filterByFormula: `{Slug} = "${req.params.slug}"`,
      });
      replay = Array.isArray(replays) ? replays[0] : replays;
    }
    if (!replay) return res.status(404).json({ error: "Replay not found" });

    const platform = String(replay.fields["platform"] || "").toLowerCase();
    const id = replay.fields["id"] || null;
    const thumbUrl =
      replay.fields["thumburl"] || replay.fields["thumbUrl"] || null;

    return res.json({ platform, id, thumbUrl });
  } catch (error) {
    console.error("/api/replays/:slug/meta error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Bulk endpoint to retrieve all replay data at once
baseRouter.get("/replays", async (req, res) => {
  try {
    const airtable = req.app.locals.airtable;
    const user = req.oidc?.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Load People and find current user
    const people = await airtable.fetchAirtableRecords("People");
    const currentUser = people.find(
      (r) => r.fields["auth0 user_id"] === user.sub
    );

    // Check permission
    const canViewReplays = computeCanViewReplaysFromRecord(req, currentUser);

    // Fetch all replays
    const replays = await airtable.fetchAirtableRecords("Replays");

    // Process each replay
    const replayData = replays
      .map((replay) => {
        const platform = String(replay.fields["platform"] || "").toLowerCase();
        const id = replay.fields["id"];
        const thumbUrl =
          replay.fields["thumburl"] || replay.fields["thumbUrl"] || null;

        // Get slug (try both lowercase and capitalized field names)
        const slug = replay.fields["slug"] || replay.fields["Slug"] || null;

        if (!slug) return null; // Skip replays without slugs

        const result = {
          slug,
          canView: canViewReplays,
        };

        // Only include sensitive data if user can view replays
        if (canViewReplays && platform && id) {
          result.platform = platform;
          result.id = id;
          result.thumbUrl = thumbUrl;
          if (platform === "youtube") {
            result.embedUrl = `https://www.youtube.com/embed/${id}`;
          } else if (platform === "loom") {
            result.embedUrl = `https://www.loom.com/embed/${id}`;
          }
        }

        return result;
      })
      .filter(Boolean); // Remove null entries

    return res.json({ replays: replayData });
  } catch (error) {
    console.error("/api/replays error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

baseRouter.get("/me", async (req, res) => {
  const user = req.oidc.user;

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Use userId from global middleware (JIT provisioning already happened)
    const userId = req.userId;

    res.json({
      name: user.name,
      email: user.email,
      sub: user.sub,
      picture: user.picture, // optional
      id: userId, // database user ID from global JIT middleware
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    // Return user info without database ID if lookup fails
    res.json({
      name: user.name,
      email: user.email,
      sub: user.sub,
      picture: user.picture,
      id: null,
    });
  }
});

baseRouter.post("/v1/annotations/update", async (req, res) => {
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

    let wordsData = req.app.locals.wordsData;
    let wordsEntry = wordsData.find(
      (entry) => entry.fields["word index"] == wordIndex
    );

    // Get current annotations or empty array if none exist
    const annotationsCurrent = wordsEntry?.fields["BR issues"] || [];

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

// Get words and annotations for an audio
baseRouter.get("/v2/audio/:audioId", async (req, res) => {
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
baseRouter.post("/v2/annotations", async (req, res) => {
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

export default baseRouter;
