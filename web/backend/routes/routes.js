import express from "express";
import https from "https";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
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

  // ✅ Wraps any async route in a try-catch, preventing server crashes
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

  //#region new routes
  // NEW API (v1) - all new endpoints start with /v1/

  const v1Router = express.Router();

  v1Router.get("/authz", requiresAuth(), async (req, res) => {
    // route not finished, use legacy route for now

    const currentUserId = req.oidc.user.sub;

    let peopleData, audioData;
    try {
      [peopleData, audioData] = await Promise.all([
        fetchAirtableData("People"),
        fetchAirtableData("Audio%20Source"),
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

      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        console.log("body:", body);
        let {
          wordIndex,
          annotations: annotationsDesired,
          audioId,
          word,
          timestamp,
        } = JSON.parse(body);
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

        // Update local wordsData cache to match new state
        if (results.every((r) => r.success)) {
          updateLocalWordsData(wordIndex, annotationsDesired);
        }

        res.setHeader("Content-Type", "application/json");
        res.json({
          "server response": {
            input: {
              method: req.method,
              wordIndex,
              annotationsCurrent: annotationsCurrent,
              annotationsDesired: annotationsDesired,
              body,
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
        res.end();
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
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.airtable.com",
        path: `/v0/${AIRTABLE_BASE_ID}/${path}`,
        method: method,
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
          "Content-Type": "application/json",
        },
      };

      const req = https.request(options, (res) => {
        let responseData = "";
        res.on("data", (chunk) => (responseData += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (e) {
              resolve(responseData);
            }
          } else {
            reject(
              new Error(
                `Airtable request failed: ${res.statusCode} ${responseData}`
              )
            );
          }
        });
      });

      req.on("error", reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Helper function to update local cache
  function updateLocalWordsData(wordIndex, newAnnotations) {
    // Find the entry index
    const entryIndex = app.locals.wordsData.findIndex(
      (entry) => entry.fields["word index"] == wordIndex
    );

    if (entryIndex !== -1) {
      if (newAnnotations.length === 0) {
        // If no annotations left, remove the entry completely
        app.locals.wordsData.splice(entryIndex, 1);
      } else {
        // Update existing entry with new annotations
        app.locals.wordsData[entryIndex].fields["BR issues"] = newAnnotations;
      }
    } else if (newAnnotations.length > 0) {
      // Add new entry if it doesn't exist and we have annotations
      app.locals.wordsData.push({
        fields: {
          "word index": wordIndex,
          "BR issues": newAnnotations,
        },
      });
    }
  }

  router.use("/v1", v1Router);
  //#endregion

  //#region legacy routes
  // 🔹 AUTHORIZATION ROUTE (Legacy /authz)
  router.get("/authz", requiresAuth(), (req, res) => {
    ///////////////////////
    ///// 1) look up people/user list in Airtable and see if can find currently logged in user. if yes, store relevant info such as which resources they have access to
    //////////////////////

    ///////////////////////
    ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
    //////////////////////

    ///////////////////////
    ///// 3) respond with whatever info the front-end needs / is allowed to see
    //////////////////////

    ///////////////////////
    ///// 1
    //////////////////////

    let currentUserId = req.oidc.user.sub;
    let peopleObjectString = "";
    let peopleObject = {};
    let currentUserAirtable;
    let currentUserAudioAccess;
    let audioObjectString = "";
    let audioObject = {};
    let currentUserAudioAccessObject = [];
    let currentUserAudioAccessObjectSpeakerNames = [];
    let currentUserRole;
    const postData1 = "";
    let options1 = {
      hostname: "api.airtable.com",
      path: `/v0/${AIRTABLE_BASE_ID}/People`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
      },
    };

    const req1 = https.request(options1, (res1) => {
      res1.setEncoding("utf8");
      res1.on("data", (chunk) => {
        peopleObjectString += chunk;
      });
      res1.on("end", () => {
        peopleObject = JSON.parse(peopleObjectString);
        for (let i = 0; i < Object.keys(peopleObject.records).length; i++) {
          let user_id = peopleObject.records[i].fields["auth0 user_id"];
          if (typeof user_id !== "undefined") {
            if (user_id == currentUserId) {
              // console.log("peopleObject.records[i]:", peopleObject.records[i]);
              currentUserAirtable = peopleObject.records[i];
              currentUserAudioAccess =
                peopleObject.records[i].fields["Access to audios"];
              currentUserRole = peopleObject.records[i].fields["Role"];
              // console.log(
              //   "Airtable match found for current user's Autho0 user_id: ",
              //   user_id
              // );
              console.log("Current user email is: ", req.oidc.user.email);
              // console.log(
              //   "Per Airtable, current user has access to the following audio/transcripts: ",
              //   currentUserAudioAccess
              // );
              // console.log(
              //   "Per Airtable, current user has role: ",
              //   currentUserRole
              // );
              app.locals.currentUserAudioAccess = currentUserAudioAccess;
              app.locals.currentUserRole = currentUserRole;
            }
          }
        }

        ///////////////////////
        ///// 2) look up audio list in Airtable and grab the info for the audios the currently logged in user has access to
        //////////////////////

        const postData2 = "";
        let options2 = {
          hostname: "api.airtable.com",
          path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
          },
        };

        const req2 = https.request(options2, (res2) => {
          res2.setEncoding("utf8");
          res2.on("data", (chunk) => {
            audioObjectString += chunk;
          });
          res2.on("end", () => {
            audioObject = JSON.parse(audioObjectString);
            peopleObject;

            for (let i = 0, k = 0; i < currentUserAudioAccess.length; i++) {
              for (
                let j = 0;
                j < Object.keys(audioObject.records).length;
                j++
              ) {
                if (currentUserAudioAccess[i] === audioObject.records[j].id) {
                  currentUserAudioAccessObject[k] = {};
                  currentUserAudioAccessObject[k].id =
                    audioObject.records[j].id;
                  currentUserAudioAccessObject[k].Name =
                    audioObject.records[j].fields.Name;
                  currentUserAudioAccessObject[k].SpeakerName =
                    audioObject.records[j].fields.Speaker[0];
                  k++;
                }
              }
            }

            for (
              let i = 0, k = 0;
              i < Object.keys(peopleObject.records).length;
              i++
            ) {
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
            ///// 3
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

            res.setHeader("Content-Type", "application/json");
            res.write(
              JSON.stringify({
                people: currentUserAudioAccessObjectSpeakerNames,
                audios: currentUserAudioAccessObject,
                userRole: currentUserRole,
              })
            );
            res.end();
          });
        });
        req2.write(postData2);
        req2.end();
      });
    });
    req1.write(postData1);
    req1.end();
  });

  // 🔹 DATA ROUTES
  router.get("/data/loadDefault", (req, res) => {
    const postData = "";
    let defaultAudioDataString = "";
    let defaultAudioData = {};
    let defaultAudioDataSanitized = {};
    let defaultAudioRecId = `${DEFAULT_AUDIO_REC_ID}`;
    let defaultTranscriptDataString = "";
    let defaultTranscriptData = {};
    let audioName;
    let audioNameURLEncoded;
    const options1 = {
      hostname: "api.airtable.com",
      path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${defaultAudioRecId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
      },
    };

    const req1 = https.request(options1, (res1) => {
      res1.setEncoding("utf8");
      res1.on("data", (chunk) => {
        defaultAudioDataString += chunk;
      });
      res1.on("end", () => {
        defaultAudioData = JSON.parse(defaultAudioDataString);

        defaultAudioDataSanitized.mp3url = defaultAudioData.fields["mp3 url"];
        defaultAudioDataSanitized.tranurl =
          defaultAudioData.fields["tran/alignment JSON url"];
        defaultAudioDataSanitized.name = defaultAudioData.fields.Name;
        audioName = defaultAudioData.fields["Name"];
        audioNameURLEncoded = encodeURIComponent(audioName);

        const postData2 = "";
        let options2 = {
          hostname: "api.airtable.com",
          path: `/v0/${AIRTABLE_BASE_ID}/Words%20(instance)?filterByFormula=%7BAudio%20Source%7D%3D%22${audioNameURLEncoded}%22`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
          },
        };

        const req2 = https.request(options2, (res2) => {
          res2.setEncoding("utf8");
          res2.on("data", (chunk) => {
            defaultTranscriptDataString += chunk;
          });
          res2.on("end", () => {
            defaultTranscriptData = JSON.parse(defaultTranscriptDataString);

            res.setHeader("Content-Type", "application/json");
            res.write(
              JSON.stringify({
                audio: defaultAudioDataSanitized,
                airtableWords: defaultTranscriptData,
              })
            );
            res.end();
          });
        });
        req2.write(postData2);
        req2.end();
      });
    });
    req1.write(postData);
    req1.end();
  });

  router.get("/data/loadIssues", async (req, res) => {
    let airtableFeaturesString = "";
    let airtableIssuesString = "";

    const airtableFeaturesSanitized = [];

    const airtableFeatures = await fetchAllPages2("Target");

    const airtableIssues = await fetchAllPages2("BR%20issues");

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
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(airtableFeaturesSanitized));
  });

  router.get("/data/loadAudio/:AudioRecId", async (req, res) => {
    if (app.locals.currentUserAudioAccess?.includes(req.params.AudioRecId)) {
      // const postData = "";
      // let selectedAudioDataString = "";
      // let selectedAudioData = {};
      // let selectedAudioDataSanitized = {};
      // let selectedAirtableWordsDataString = "";
      // let selectedAirtableWordsData = {};
      // let audioName;
      // let audioNameURLEncoded;
      // const options1 = {
      //   hostname: "api.airtable.com",
      //   path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${req.params.AudioRecId}`,
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
      //   },
      // };

      const audioData = await fetchAirtablePage(
        `Audio%20Source/${req.params.AudioRecId}`
      );

      const wordsData = await fetchAllPages(
        "Words%20(instance)",
        encodeURIComponent(audioData.fields.Name)
      );

      app.locals.wordsData = wordsData;

      res.json({
        audio: {
          mp3url: audioData.fields["mp3 url"],
          tranurl: audioData.fields["tran/alignment JSON url"],
          name: audioData.fields.Name,
        },
        airtableWords: { records: wordsData }, // Now includes ALL records
      });

      // const req1 = https.request(options1, (res1) => {
      //   res1.setEncoding("utf8");
      //   res1.on("data", (chunk) => {
      //     selectedAudioDataString += chunk;
      //   });
      //   res1.on("end", () => {
      //     selectedAudioData = JSON.parse(selectedAudioDataString);

      //     selectedAudioDataSanitized.mp3url =
      //       selectedAudioData.fields["mp3 url"];
      //     selectedAudioDataSanitized.tranurl =
      //       selectedAudioData.fields["tran/alignment JSON url"];
      //     selectedAudioDataSanitized.name = selectedAudioData.fields.Name;

      //     audioName = selectedAudioData.fields["Name"];
      //     audioNameURLEncoded = encodeURIComponent(audioName);

      //     const postData2 = "";
      //     let options2 = {
      //       hostname: "api.airtable.com",
      //       path: `/v0/${AIRTABLE_BASE_ID}/Words%20(instance)?filterByFormula=%7BAudio%20Source%7D%3D%22${audioNameURLEncoded}%22`,
      //       method: "GET",
      //       headers: {
      //         Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
      //       },
      //     };

      //     const req2 = https.request(options2, (res2) => {
      //       res2.setEncoding("utf8");
      //       res2.on("data", (chunk) => {
      //         selectedAirtableWordsDataString += chunk;
      //       });
      //       res2.on("end", () => {
      //         selectedAirtableWordsData = JSON.parse(
      //           selectedAirtableWordsDataString
      //         );

      //         res.setHeader("Content-Type", "application/json");
      //         res.write(
      //           JSON.stringify({
      //             audio: selectedAudioDataSanitized,
      //             airtableWords: selectedAirtableWordsData,
      //           })
      //         );
      //         res.end();
      //       });
      //     });
      //     req2.write(postData2);
      //     req2.end();
      //   });
      // });
      // req1.write(postData);
      // req1.end();
    } else {
      res.setHeader("Content-Type", "text/plain");
      res.write("not found");
      res.end();
    }
  });

  router.get("/data/loadSuccessPath", (req, res) => {
    const postData = "";
    let successPathString = "";
    let successPath = {};
    const options1 = {
      hostname: "saa-success-path.s3.us-east-2.amazonaws.com",
      path: `/path.json`,
      method: "GET",
    };

    const req1 = https.request(options1, (res1) => {
      res1.setEncoding("utf8");
      res1.on("data", (chunk) => {
        successPathString += chunk;
      });
      res1.on("end", () => {
        successPath = JSON.parse(successPathString);
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(successPath));
        res.end();
      });
    });
    req1.write(postData);
    req1.end();
  });

  // 🔹 GENERIC AIRTABLE API ROUTE
  router.all("/api/*", (req, res) => {
    if (app.locals.currentUserRole === "write") {
      console.log("\x1b[33m =====NEW CRUD OPERATION===== \x1b[0m");
      console.log("Request URL:", req.url);
      console.log("Request method:", req.method);
      AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_WRITE_VALUE;

      let pathSegments = req.url.split("/");
      let pathSegmentsFirst = pathSegments[1];
      let pathSegmentsExceptFirst = pathSegments.slice(2, pathSegments.length);
      let pathMinusFirstSegment = path.join
        .apply(null, pathSegmentsExceptFirst)
        .replace("\\", "/");

      if (req.method === "GET") {
        const postData = "";
        const options = {
          hostname: "api.airtable.com",
          path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
          },
        };

        const req2 = https.request(options, (res2) => {
          res2.setEncoding("utf8");
          res.setHeader("Content-Type", "application/json");
          res2.on("data", (chunk) => {
            res.write(chunk);
          });
          res2.on("end", () => {
            res.end();
          });
        });
        req2.write(postData);
        req2.end();
      } else if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          const options = {
            hostname: "api.airtable.com",
            path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
            },
          };

          const req2 = https.request(options, (res2) => {
            let body2 = "";
            res2.setEncoding("utf8");
            res.setHeader("Content-Type", "application/json");
            res2.on("data", (chunk2) => {
              body2 += chunk2.toString();
            });
            res2.on("end", () => {
              res.write(body2);
              res.end();
            });
          });
          req2.write(body);
          console.log(body);
          req2.end();
        });
      } else if (req.method === "PATCH") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          const options = {
            hostname: "api.airtable.com",
            path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
            },
          };

          const req2 = https.request(options, (res2) => {
            res2.setEncoding("utf8");
            res.setHeader("Content-Type", "application/json");
            res2.on("data", (chunk2) => {
              res.write(chunk2);
            });
            res2.on("end", () => {
              res.end();
            });
          });
          req2.write(body);
          console.log(body);
          req2.end();
        });
      } else if (req.method === "DELETE") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          const options = {
            hostname: "api.airtable.com",
            path: `/v0/${AIRTABLE_BASE_ID}/${pathMinusFirstSegment}`,
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
            },
          };

          const req2 = https.request(options, (res2) => {
            let body2 = "";
            res2.setEncoding("utf8");
            res.setHeader("Content-Type", "application/json");
            res2.on("data", (chunk2) => {
              body2 += chunk2.toString();
            });
            res2.on("end", () => {
              res.write(body2);
              res.end();
            });
          });
          req2.write(body);
          console.log(body);
          req2.end();
        });
      }
    } else {
      res.setHeader("Content-Type", "text/plain");
      res.write("not authorized");
      res.end();
    }
  });

  // 🔹 Postgres routes
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

  // 🔹 USER ROUTES
  router.get("/user", requiresAuth(), (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(req.oidc.user, null, 3));
  });

  const staticPath =
    environment_flag === "dev" ? "../frontend/public" : "../frontend/dist";

  router.get("/callback", requiresAuth(), (req, res) => {
    console.log("callback");
    res.redirect("/");
  });

  // 🔹 CATCH-ALL ROUTE (Frontend SPA)
  router.get("*", (req, res) => {
    console.log(
      "catch-all -> send file at:",
      path.join(__dirname, staticPath, "/index.html")
    );
    res.sendFile(path.join(__dirname, staticPath, "/index.html"));
  });

  //#endregion

  // ✅ Helper: Fetch data from Airtable
  async function fetchAllAirtableRecords(tableName) {
    return new Promise((resolve, reject) => {
      let allRecords = [];
      let offset = null; // Starts as null

      function fetchPage(nextOffset) {
        let path = `/v0/${AIRTABLE_BASE_ID}/${tableName}`;
        if (nextOffset) {
          // Will be null on first pass, so this block is skipped
          path += `?offset=${nextOffset}`;
        }

        const options = {
          hostname: "api.airtable.com",
          path: path,
          method: "GET",
          headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
        };

        const airtableReq = https.request(options, (airtableRes) => {
          let data = "";
          airtableRes.setEncoding("utf8");

          airtableRes.on("data", (chunk) => {
            data += chunk;
          });

          airtableRes.on("end", () => {
            try {
              const parsedData = JSON.parse(data);
              if (!parsedData.records) {
                return reject(new Error("Invalid response from Airtable"));
              }

              allRecords.push(...parsedData.records);
              if (parsedData.offset) {
                fetchPage(parsedData.offset); // Recursively fetch next batch
              } else {
                resolve(allRecords); // No more pages, return all records
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        airtableReq.on("error", (err) => reject(err));
        airtableReq.end();
      }

      fetchPage(offset); // ✅ This always runs on the first pass!
    });
  }

  async function fetchAirtablePage(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.airtable.com",
        path: `/v0/${AIRTABLE_BASE_ID}/${endpoint}`,
        method: "GET",
        headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
      };

      const airtableReq = https.request(options, (airtableRes) => {
        let data = "";
        airtableRes.setEncoding("utf8");

        airtableRes.on("data", (chunk) => {
          data += chunk;
        });

        airtableRes.on("end", () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        });
      });

      airtableReq.on("error", (err) => reject(err));
      airtableReq.end();
    });
  }

  async function fetchAllPages(tableName, filterValue) {
    return new Promise((resolve, reject) => {
      let allRecords = [];
      let offset = null;

      function fetchPage(nextOffset) {
        let path = `/v0/${AIRTABLE_BASE_ID}/${tableName}?filterByFormula=%7BAudio%20Source%7D%3D%22${filterValue}%22`;
        if (nextOffset) {
          path += `&offset=${nextOffset}`;
        }

        const options = {
          hostname: "api.airtable.com",
          path: path,
          method: "GET",
          headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
        };

        const airtableReq = https.request(options, (airtableRes) => {
          let data = "";
          airtableRes.setEncoding("utf8");

          airtableRes.on("data", (chunk) => {
            data += chunk;
          });

          airtableRes.on("end", () => {
            try {
              const parsedData = JSON.parse(data);
              if (!parsedData.records) {
                return reject(new Error("Invalid response from Airtable"));
              }

              allRecords.push(...parsedData.records);
              if (parsedData.offset) {
                fetchPage(parsedData.offset); // Recursively fetch next batch
              } else {
                resolve(allRecords); // No more pages, return all records
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        airtableReq.on("error", (err) => reject(err));
        airtableReq.end();
      }

      fetchPage(offset);
    });
  }

  async function fetchAllPages2(tableName) {
    // console.log("tableName:", tableName);
    return new Promise((resolve, reject) => {
      let allRecords = [];
      let offset = null;

      function fetchPage(nextOffset) {
        let path = `/v0/${AIRTABLE_BASE_ID}/${tableName}`;
        if (nextOffset) {
          path += `?offset=${nextOffset}`;
        }

        // console.log("path:", path);

        const options = {
          hostname: "api.airtable.com",
          path: path,
          method: "GET",
          headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
        };

        const airtableReq = https.request(options, (airtableRes) => {
          let data = "";
          airtableRes.setEncoding("utf8");

          airtableRes.on("data", (chunk) => {
            data += chunk;
          });

          airtableRes.on("end", async () => {
            if (tableName === "BR%20issues") {
              // console.log("data:", data);
            }
            try {
              const parsedData = JSON.parse(data);
              if (!parsedData.records) {
                return reject(new Error("Invalid response from Airtable"));
              }

              allRecords.push(...parsedData.records);
              if (parsedData.offset) {
                // console.log("allRecords", allRecords);
                // console.log("parsedData.offset:", parsedData.offset);
                // await new Promise((r) => setTimeout(r, 5000));
                fetchPage(parsedData.offset); // Recursively fetch next batch
              } else {
                resolve(allRecords); // No more pages, return all records
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        airtableReq.on("error", (err) => reject(err));
        airtableReq.end();
      }

      fetchPage(offset);
    });
  }

  function fetchAirtableData(tableName) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.airtable.com",
        path: `/v0/${AIRTABLE_BASE_ID}/${tableName}`,
        method: "GET",
        headers: { Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}` },
      };

      const airtableReq = https.request(options, (airtableRes) => {
        let data = "";
        airtableRes.setEncoding("utf8");
        airtableRes.on("data", (chunk) => {
          data += chunk;
        });
        airtableRes.on("end", () => {
          try {
            console.log("Fetch function: Received response from Airtable");
            const parsedData = JSON.parse(data);

            if (!parsedData.records) {
              console.error(
                "Fetch function: No records field found in Airtable response",
                parsedData
              );
              return reject(
                "Fetch function: No records field found in Airtable response"
              );
            }

            console.log(
              "Fetch function: Successfully parsed data from Airtable"
            );
            resolve(parsedData.records);
          } catch (error) {
            console.error("Fetch function: JSON parse error");
            reject("Fetch function: JSON parse error");
          }
        });
      });

      airtableReq.on("error", (err) => {
        console.error("Airtable Request Error:", err);
        reject(err);
      });

      airtableReq.end();
    });
  }

  // ✅ Helper: Forward API request to Airtable
  function forwardAirtableRequest(req, res, airtablePath) {
    const options = {
      hostname: "api.airtable.com",
      path: `/v0/${AIRTABLE_BASE_ID}/${airtablePath}`,
      method: req.method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
        "Content-Type": "application/json",
      },
    };

    const airtableReq = https.request(options, (airtableRes) => {
      let data = "";
      airtableRes.setEncoding("utf8");
      airtableRes.on("data", (chunk) => {
        data += chunk;
      });
      airtableRes.on("end", () => {
        res.json(JSON.parse(data));
      });
    });

    req.on("data", (chunk) => airtableReq.write(chunk));
    req.on("end", () => airtableReq.end());
  }

  return router;
}
