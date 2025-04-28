import express from "express";
import { fetchAirtableRecords } from "../services/airtable.js";

const baseRouter = express.Router();

baseRouter.get("/authz", async (req, res) => {
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
        req.app.locals.currentUserAudioAccess = currentUserAudioAccess;
        req.app.locals.currentUserRole = currentUserRole;
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

baseRouter.get("/data/loadIssues", async (req, res) => {
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
      const feature = airtableFeaturesSanitized.find((f) => f.id === featureId);
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

baseRouter.get("/data/loadAudio/:AudioRecId", async (req, res) => {
  if (req.app.locals.currentUserAudioAccess?.includes(req.params.AudioRecId)) {
    const audioData = await fetchAirtableRecords("Audio%20Source", {
      recordId: req.params.AudioRecId,
    });

    const wordsData = await fetchAirtableRecords("Words%20(instance)", {
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
  } else {
    res.status(404).json({ error: "not found" });
  }
});

export default baseRouter;
