import express from "express";
import pkg from "express-openid-connect";
import path from "path";
import url from "url";
import {
  AIRTABLE_BASE_ID,
  AIRTABLE_KEY_READ_WRITE_VALUE,
  AIRTABLE_KEY_READ_ONLY_VALUE,
  DEFAULT_AUDIO_REC_ID,
} from "../config.js"; // Assume environment variables are imported here
import { PrismaClient } from "@prisma/client";
import { environment_flag } from "../config.js";

const prisma = new PrismaClient();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createRoutes(app) {
  const router = express.Router();
  let AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_ONLY_VALUE;

  //#region Wraps any async route in a try-catch, preventing server crashes
  function safeRoute(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (err) {
        console.error("❌ Uncaught Route Error:", err);
        next(err); // Pass error to Express global error handler
      }
    };
  }

  // ✅ Override `router.get`, `router.post`, etc. to always apply `safeRoute`
  const methods = ["get", "post", "put", "patch", "delete", "all"];
  methods.forEach((method) => {
    const original = router[method];
    router[method] = function (path, ...handlers) {
      // Wrap every handler inside `safeRoute`
      original.call(router, path, ...handlers.map(safeRoute));
    };
  });
  //#endregion

  //#region v2 routes

  // Add to v2 routes region
  const v2Router = express.Router();

  // Get words and annotations for an audio
  v2Router.get("/api/audio/:audioId", async (req, res) => {
    if (!app.locals.currentUserAudioAccess?.includes(req.params.audioId)) {
      return res.status(404).json({ error: "Not found" });
    }

    try {
      const audioData = await fetchAirtableRecords("Audio%20Source", {
        recordId: req.params.audioId,
      });

      // Fetch v2 words and annotations
      const wordsDataV2 = await fetchAirtableRecords("Words%20(v2)", {
        filterByFormula: `{Audio Source}="${audioData.fields.Name}"`,
      });

      const annotationDataV2 = await fetchAirtableRecords(
        "Annotations%20(v2)",
        {
          filterByFormula: `{Audio Source}="${audioData.fields.Name}"`,
        }
      );

      app.locals.wordsDataV2 = wordsDataV2;

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
    if (app.locals.currentUserRole !== "write") {
      return res.status(403).json({ error: "Not authorized" });
    }

    try {
      AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_WRITE_VALUE;

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

      let wordsDataV2 = app.locals.wordsDataV2;
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

  router.use("/v2", v2Router);

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
            result = await executeAirtableOperation({
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
            result = await executeAirtableOperation({
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

  //#endregion

  //#region v1 routes
  // NEW API (v1) - all new endpoints start with /v1/

  const v1Router = express.Router();

  v1Router.get("/authz", async (req, res) => {
    // route not finished, use legacy route for now

    const currentUserId = req.oidc.user.sub;

    let peopleData, audioData;
    try {
      [peopleData, audioData] = await Promise.all([
        fetchAirtableRecords("People"),
        fetchAirtableRecords("Audio%20Source"),
      ]);
      console.log("Fetched People & Audio data from Airtable");
    } catch (e) {
      console.error("Failed to fetch People & Audio data from Airtable", e);
      return res
        .status(500)
        .json({ error: "Failed to fetch People & Audio data from Airtable" });
    }

    // Curate data before sending to frontend

    // todo

    const filteredPeopleData = peopleData.filter(
      (item) => item.fields["auth0 user_id"] === currentUserId
    );

    const currentUserAirtableId = filteredPeopleData[0].id;

    const audioFieldsToKeep = ["SpeakerName"];

    const filteredAudioData = audioData
      .filter((item) =>
        item.fields["People with access"]?.includes(currentUserAirtableId)
      )
      .map((item) => ({
        id: item.id,
        createdTime: item.createdTime,
        SpeakerName: item.fields?.SpeakerName || null,
      }));

    res.json({
      currentUserId: currentUserId,
      currentUserAirtableId: currentUserAirtableId,
      filteredAudioData: filteredAudioData,
      filteredPeopleData: filteredPeopleData,
      // peopleData: peopleData,
      audioData: audioData,
    });
  });

  v1Router.post("/api/annotations/update", async (req, res) => {
    //tbd

    if (app.locals.currentUserRole !== "write") {
      return res.status(403).json({ error: "Not authorized" });
    }

    try {
      AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_WRITE_VALUE;

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

      let wordsData = app.locals.wordsData;
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
              result = await executeAirtableOperation({
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
              result = await executeAirtableOperation({
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
              result = await executeAirtableOperation({
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

  // Helper function to execute Airtable operations
  async function executeAirtableOperation({ method, path, data = null }) {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
          "Content-Type": "application/json",
        },
        ...(data && { body: JSON.stringify(data) }),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable request failed: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  }

  router.use("/v1", v1Router);
  //#endregion

  //#region legacy routes
  // 🔹 AUTHORIZATION ROUTE (Legacy /authz)
  router.get("/authz", async (req, res) => {
    ///////////////////////
    ///// 1) look up people/user list in Airtable and see if can find currently logged in user. if yes, store relevant info such as which resources they have access to
    //////////////////////

    let currentUserId = req.oidc.user.sub;
    let peopleObject = {};
    let currentUserAirtable;
    let currentUserAudioAccess;
    let currentUserAudioAccessObject = [];
    let currentUserAudioAccessObjectSpeakerNames = [];
    let currentUserRole;

    peopleObject = { records: await fetchAirtableRecords("People") };

    for (let i = 0; i < Object.keys(peopleObject.records).length; i++) {
      let user_id = peopleObject.records[i].fields["auth0 user_id"];
      if (typeof user_id !== "undefined") {
        if (user_id == currentUserId) {
          currentUserAirtable = peopleObject.records[i];
          currentUserAudioAccess =
            peopleObject.records[i].fields["Access to audios"];
          currentUserRole = peopleObject.records[i].fields["Role"];
          console.log("Current user email is: ", req.oidc.user.email);
          app.locals.currentUserAudioAccess = currentUserAudioAccess;
          app.locals.currentUserRole = currentUserRole;
        }
      }
    }

    ///////////////////////
    ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
    //////////////////////

    const audioObject = {
      records: await fetchAirtableRecords("Audio%20Source"),
    };

    for (let i = 0, k = 0; i < currentUserAudioAccess.length; i++) {
      for (let j = 0; j < Object.keys(audioObject.records).length; j++) {
        if (currentUserAudioAccess[i] === audioObject.records[j].id) {
          currentUserAudioAccessObject[k] = {};
          currentUserAudioAccessObject[k].id = audioObject.records[j].id;
          currentUserAudioAccessObject[k].Name =
            audioObject.records[j].fields.Name;
          currentUserAudioAccessObject[k].SpeakerName =
            audioObject.records[j].fields.Speaker[0];
          k++;
        }
      }
    }

    for (let i = 0, k = 0; i < Object.keys(peopleObject.records).length; i++) {
      for (let j = 0; j < currentUserAudioAccessObject.length; j++) {
        if (
          peopleObject.records[i].id ===
          currentUserAudioAccessObject[j].SpeakerName
        ) {
          currentUserAudioAccessObjectSpeakerNames[k] = {};
          currentUserAudioAccessObjectSpeakerNames[k].id =
            peopleObject.records[i].id;
          currentUserAudioAccessObjectSpeakerNames[k].Name =
            peopleObject.records[i].fields.Name;
          k++;
        }
      }
    }

    ///////////////////////
    ///// 3) respond with whatever info the front-end needs / is allowed to see
    //////////////////////

    // Remove duplicate speakers
    const uniquePeople = {};
    currentUserAudioAccessObjectSpeakerNames =
      currentUserAudioAccessObjectSpeakerNames.filter((person) => {
        if (!uniquePeople[person.id]) {
          uniquePeople[person.id] = true;
          return true;
        }
        return false;
      });

    // Remove duplicate audios
    const uniqueAudios = {};
    currentUserAudioAccessObject = currentUserAudioAccessObject.filter(
      (audio) => {
        if (!uniqueAudios[audio.id]) {
          uniqueAudios[audio.id] = true;
          return true;
        }
        return false;
      }
    );

    res.json({
      people: currentUserAudioAccessObjectSpeakerNames,
      audios: currentUserAudioAccessObject,
      userRole: currentUserRole,
    });
  });

  // #region🔹 DATA ROUTES
  // router.get("/data/loadDefault", (req, res) => {
  //   const postData = "";
  //   let defaultAudioDataString = "";
  //   let defaultAudioData = {};
  //   let defaultAudioDataSanitized = {};
  //   let defaultAudioRecId = `${DEFAULT_AUDIO_REC_ID}`;
  //   let defaultTranscriptDataString = "";
  //   let defaultTranscriptData = {};
  //   let audioName;
  //   let audioNameURLEncoded;
  //   const options1 = {
  //     hostname: "api.airtable.com",
  //     path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${defaultAudioRecId}`,
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
  //     },
  //   };

  //   const req1 = https.request(options1, (res1) => {
  //     res1.setEncoding("utf8");
  //     res1.on("data", (chunk) => {
  //       defaultAudioDataString += chunk;
  //     });
  //     res1.on("end", () => {
  //       defaultAudioData = JSON.parse(defaultAudioDataString);

  //       defaultAudioDataSanitized.mp3url = defaultAudioData.fields["mp3 url"];
  //       defaultAudioDataSanitized.tranurl =
  //         defaultAudioData.fields["tran/alignment JSON url"];
  //       defaultAudioDataSanitized.name = defaultAudioData.fields.Name;
  //       audioName = defaultAudioData.fields["Name"];
  //       audioNameURLEncoded = encodeURIComponent(audioName);

  //       const postData2 = "";
  //       let options2 = {
  //         hostname: "api.airtable.com",
  //         path: `/v0/${AIRTABLE_BASE_ID}/Words%20(instance)?filterByFormula=%7BAudio%20Source%7D%3D%22${audioNameURLEncoded}%22`,
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
  //         },
  //       };

  //       const req2 = https.request(options2, (res2) => {
  //         res2.setEncoding("utf8");
  //         res2.on("data", (chunk) => {
  //           defaultTranscriptDataString += chunk;
  //         });
  //         res2.on("end", () => {
  //           defaultTranscriptData = JSON.parse(defaultTranscriptDataString);

  //           res.json({
  //             audio: defaultAudioDataSanitized,
  //             airtableWords: defaultTranscriptData,
  //           });
  //         });
  //       });
  //       req2.write(postData2);
  //       req2.end();
  //     });
  //   });
  //   req1.write(postData);
  //   req1.end();
  // });

  router.get("/data/loadIssues", async (req, res) => {
    let airtableFeaturesString = "";
    let airtableIssuesString = "";

    const airtableFeaturesSanitized = [];

    const airtableFeatures = await fetchAirtableRecords("Target");

    const airtableIssues = await fetchAirtableRecords("BR%20issues");

    // console.log(airtableIssues);

    // Prepare an object where each feature ID maps to a feature name and an empty issues array
    airtableFeatures.forEach((record) => {
      airtableFeaturesSanitized.push({
        id: record.id,
        name: record.fields.Name || "",
        po: record.fields["Presentation order"] || "",
        type: record.fields.type || "",
        issues: [], // Placeholder for related issues
      });
    });

    // Process Issues and link them to Features
    airtableIssues.forEach((record) => {
      const featureIds = record.fields["target"] || []; // List of related feature IDs
      const issueData = {
        id: record.id,
        name: record.fields.Name || "",
        po: record.fields["Presentation order"] || Infinity, // Default to large number for sorting
        tgt: record.fields.target || "",
      };

      featureIds.forEach((featureId) => {
        // Find feature by ID in the array
        const feature = airtableFeaturesSanitized.find(
          (f) => f.id === featureId
        );
        if (feature) {
          feature.issues.push(issueData);
        }
      });
    });

    // Step 1: Sort issues within each feature by `po`
    airtableFeaturesSanitized.forEach((feature) => {
      feature.issues.sort((a, b) => a.po - b.po);
    });

    // Step 2: Sort features by `po`
    airtableFeaturesSanitized.sort((a, b) => a.po - b.po);

    // Send response
    res.json(airtableFeaturesSanitized);
  });

  router.get("/data/loadAudio/:AudioRecId", async (req, res) => {
    if (app.locals.currentUserAudioAccess?.includes(req.params.AudioRecId)) {
      const audioData = await fetchAirtableRecords("Audio%20Source", {
        recordId: req.params.AudioRecId,
      });

      const wordsData = await fetchAirtableRecords("Words%20(instance)", {
        filterByFormula: `{Audio Source} = "${audioData.fields.Name}"`,
      });

      app.locals.wordsData = wordsData;

      res.json({
        audio: {
          mp3url: audioData.fields["mp3 url"],
          tranurl: audioData.fields["tran/alignment JSON url"],
          name: audioData.fields.Name,
        },
        airtableWords: { records: wordsData }, // Now includes ALL records
      });
    } else {
      res.status(404).json({ error: "not found" });
    }
  });

  // router.get("/data/loadSuccessPath", (req, res) => {
  //   const postData = "";
  //   let successPathString = "";
  //   let successPath = {};
  //   const options1 = {
  //     hostname: "saa-success-path.s3.us-east-2.amazonaws.com",
  //     path: `/path.json`,
  //     method: "GET",
  //   };

  //   const req1 = https.request(options1, (res1) => {
  //     res1.setEncoding("utf8");
  //     res1.on("data", (chunk) => {
  //       successPathString += chunk;
  //     });
  //     res1.on("end", () => {
  //       successPath = JSON.parse(successPathString);
  //       res.json(successPath);
  //     });
  //   });
  //   req1.write(postData);
  //   req1.end();
  // });
  // #endregion

  // #region🔹 Postgres routes
  // Add test route before returning router
  router.get("/test-prisma", async (req, res) => {
    try {
      // Test the prisma connection
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: "success",
        message: "Prisma database connection successful",
      });
    } catch (error) {
      console.error("Database Connection Error:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
      });
    }
  });

  // Basic CRUD test routes for User model
  router.get("/prisma/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/prisma/users", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await prisma.user.create({
        data: { email },
      });
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/prisma/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/prisma/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "User deleted" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  });
  //#endregion

  // #region 🔹  USER ROUTES
  router.get("/user", (req, res) => {
    res.json(req.oidc.user);
  });

  router.get("/callback", (req, res) => {
    console.log("callback");
    res.redirect("/");
  });

  // #endregion

  // 🔹 CATCH-ALL ROUTE (Frontend SPA)
  router.get("*", (req, res) => {
    // For development, proxy to Vite dev server
    if (environment_flag === "dev") {
      res.redirect("http://localhost:5173");
      return;
    }

    // For production, serve the built index.html
    const indexPath = path.join(
      __dirname,
      "../../frontend-web/dist/index.html"
    );
    console.log("catch-all -> send file at:", indexPath);
    res.sendFile(indexPath);
  });

  //#endregion

  //#region Airtable Helper Function
  /**
   * Fetches records from Airtable with support for pagination, filtering, and single record lookup
   * @param {string} tableName - Name of the table to fetch from
   * @param {Object} [options]
   * @param {string} [options.recordId] - Optional record ID for single record lookup
   * @param {string} [options.filterByFormula] - Optional Airtable formula for filtering records
   * @returns {Promise<Array|Object>} Returns array of records or single record object
   */
  async function fetchAirtableRecords(
    tableName,
    { recordId = null, filterByFormula = null } = {}
  ) {
    try {
      // Handle single record fetch
      if (recordId) {
        const path = `/v0/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`;
        const response = await fetch(`https://api.airtable.com${path}`, {
          headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
        });

        if (!response.ok) {
          throw new Error(`Airtable API request failed: ${response.status}`);
        }

        return await response.json();
      }

      // Handle paginated fetch
      let allRecords = [];
      let offset = null;
      do {
        // Build query parameters
        const params = new URLSearchParams();
        if (offset) {
          params.append("offset", offset);
        }

        if (filterByFormula) {
          params.append("filterByFormula", filterByFormula);
        }

        const queryString = params.toString();
        let path = `/v0/${AIRTABLE_BASE_ID}/${tableName}${
          queryString ? "?" + queryString : ""
        }`;

        const response = await fetch(`https://api.airtable.com${path}`, {
          headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
        });

        if (!response.ok) {
          throw new Error(`Airtable API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.records) {
          throw new Error("Invalid response from Airtable");
        }

        allRecords.push(...data.records);
        offset = data.offset;
      } while (offset);

      return allRecords;
    } catch (error) {
      console.error("Airtable fetch error:", error);
      throw error;
    }
  }

  //#endregion

  return router;
}
