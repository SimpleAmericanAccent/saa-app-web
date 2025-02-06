import http from "http";
import https from "https";
import url from "url";
import path from "path";
import express from "express";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_KEY_READ_WRITE_VALUE = process.env.AIRTABLE_KEY_READ_WRITE_VALUE;
const AIRTABLE_KEY_READ_ONLY_VALUE = process.env.AIRTABLE_KEY_READ_ONLY_VALUE;
let AIRTABLE_KEY_SELECTED = AIRTABLE_KEY_READ_ONLY_VALUE;
const DEFAULT_AUDIO_REC_ID = process.env.DEFAULT_AUDIO_REC_ID;
const auth0_secret = process.env.AUTH0_SECRET;
const auth0_base_url = process.env.AUTH0_BASE_URL;
const auth0_client_id = process.env.AUTH0_CLIENT_ID;
const auth0_issuer_base_url = process.env.AUTH0_ISSUER_BASE_ID;
const environment_flag = process.env.ENVIRONMENT_FLAG;
let currentUserAudioAccess;

const config = {
  authRequired: true,
  auth0Logout: true,
  secret: `${auth0_secret}`,
  baseURL: `${auth0_base_url}`,
  clientID: `${auth0_client_id}`,
  issuerBaseURL: `${auth0_issuer_base_url}`,
};

const app = express();

// Configuration & environment
// Express app creation
// Initialize services
// Initialize controllers
// Auth middleware
// Routes
// Error handling

app.use(auth(config));

app.use(function (req, res, next) {
  app.locals.user = req.oidc.user;
  next();
});

if (environment_flag === "deva") {
  app.use(express.static("../frontend/public", { index: "home.html" }));
} else {
  app.use(express.static("../frontend/dist", { index: "home.html" }));
}

app.get("/authz", requiresAuth(), (req, res) => {
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

  let peopleObjectString = "";
  let peopleObject = {};
  let currentUserId = req.oidc.user.sub;
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
            console.log("peopleObject.records[i]:", peopleObject.records[i]);
            currentUserAirtable = peopleObject.records[i];
            currentUserAudioAccess =
              peopleObject.records[i].fields["Access to audios"];
            currentUserRole = peopleObject.records[i].fields["Role"];
            console.log(
              "Airtable match found for current user's Autho0 user_id: ",
              user_id
            );
            console.log("Current user email is: ", req.oidc.user.email);
            console.log(
              "Per Airtable, current user has access to the following audio/transcripts: ",
              currentUserAudioAccess
            );
            console.log(
              "Per Airtable, current user has role: ",
              currentUserRole
            );
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

app.get("/data/loadDefault", (req, res) => {
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

app.get("/data/loadIssues", (req, res) => {
  let airtableFeaturesString = "";
  let airtableIssuesString = "";

  const airtableFeaturesSanitized = [];

  const optionsFeatures = {
    hostname: "api.airtable.com",
    path: `/v0/${AIRTABLE_BASE_ID}/Target`, // Features table
    method: "GET",
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
    },
  };

  const optionsIssues = {
    hostname: "api.airtable.com",
    path: `/v0/${AIRTABLE_BASE_ID}/BR%20issues`, // Issues table
    method: "GET",
    headers: {
      Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
    },
  };

  // First API call: Fetch Features
  const reqFeatures = https.request(optionsFeatures, (resFeatures) => {
    resFeatures.setEncoding("utf8");

    resFeatures.on("data", (chunk) => {
      airtableFeaturesString += chunk;
    });

    resFeatures.on("end", () => {
      const airtableFeatures = JSON.parse(airtableFeaturesString);

      // Prepare an object where each feature ID maps to a feature name and an empty issues array
      airtableFeatures.records.forEach((record) => {
        airtableFeaturesSanitized.push({
          id: record.id,
          name: record.fields.Name || "",
          po: record.fields["Presentation order"] || "",
          type: record.fields.type || "",
          issues: [], // Placeholder for related issues
        });
      });

      // Second API call: Fetch Issues
      const reqIssues = https.request(optionsIssues, (resIssues) => {
        resIssues.setEncoding("utf8");

        resIssues.on("data", (chunk) => {
          airtableIssuesString += chunk;
        });

        resIssues.on("end", () => {
          const airtableIssues = JSON.parse(airtableIssuesString);

          // Process Issues and link them to Features
          airtableIssues.records.forEach((record) => {
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
      });

      reqIssues.on("error", (error) => {
        console.error("Airtable Issues Request Error:", error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Failed to fetch issues" }));
      });

      reqIssues.end();
    });
  });

  reqFeatures.on("error", (error) => {
    console.error("Airtable Features Request Error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Failed to fetch features" }));
  });

  reqFeatures.end();
});

app.get("/data/loadAudio/:AudioRecId", (req, res) => {
  if (app.locals.currentUserAudioAccess.includes(req.params.AudioRecId)) {
    const postData = "";
    let selectedAudioDataString = "";
    let selectedAudioData = {};
    let selectedAudioDataSanitized = {};
    let selectedAirtableWordsDataString = "";
    let selectedAirtableWordsData = {};
    let audioName;
    let audioNameURLEncoded;
    const options1 = {
      hostname: "api.airtable.com",
      path: `/v0/${AIRTABLE_BASE_ID}/Audio%20Source/${req.params.AudioRecId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY_SELECTED}`,
      },
    };

    const req1 = https.request(options1, (res1) => {
      res1.setEncoding("utf8");
      res1.on("data", (chunk) => {
        selectedAudioDataString += chunk;
      });
      res1.on("end", () => {
        selectedAudioData = JSON.parse(selectedAudioDataString);

        selectedAudioDataSanitized.mp3url = selectedAudioData.fields["mp3 url"];
        selectedAudioDataSanitized.tranurl =
          selectedAudioData.fields["tran/alignment JSON url"];
        selectedAudioDataSanitized.name = selectedAudioData.fields.Name;

        audioName = selectedAudioData.fields["Name"];
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
            selectedAirtableWordsDataString += chunk;
          });
          res2.on("end", () => {
            selectedAirtableWordsData = JSON.parse(
              selectedAirtableWordsDataString
            );

            res.setHeader("Content-Type", "application/json");
            res.write(
              JSON.stringify({
                audio: selectedAudioDataSanitized,
                airtableWords: selectedAirtableWordsData,
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
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.write("not found");
    res.end();
  }
});

app.get("/data/loadSuccessPath", (req, res) => {
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

app.all("/api/*", (req, res) => {
  if (app.locals.currentUserRole === "write") {
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
            console.log(body2);
            res.end();
          });
        });
        req2.write(body);
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
        req2.end();
      });
    }
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.write("not authorized");
    res.end();
  }
});

app.get("/user", requiresAuth(), (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(req.oidc.user, null, 3));
});

app.get("/callback", requiresAuth(), (req, res) => {
  res.sendFile("../frontend/public/home.html");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

http.createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
