import express from "express";
import { fetchAirtableRecords } from "../services/airtable.js";

const baseRouter = express.Router();

baseRouter.get("/authz", async (req, res) => {
  // Helper function to find a record by user ID
  const findUserById = (peopleRecords, userId) => {
    return peopleRecords.find(
      (record) => record.fields["auth0 user_id"] === userId
    );
  };

  // Helper function to find audio records the user has access to
  const findAudiosByAccess = (audioRecords, accessList) => {
    return accessList
      .map((audioId) => {
        const audio = audioRecords.find((record) => record.id === audioId);
        return audio
          ? {
              id: audio.id,
              Name: audio.fields.Name,
              SpeakerName: audio.fields.Speaker[0],
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
  const peopleObject = { records: await fetchAirtableRecords("People") };
  const currentUser = findUserById(peopleObject.records, currentUserId);
  if (currentUser) {
    const {
      "Access to audios": currentUserAudioAccess,
      Role: currentUserRole,
    } = currentUser.fields;
    req.app.locals.currentUserRole = currentUserRole;
    req.app.locals.currentUserAudioAccess = currentUserAudioAccess;

    // Step 2: Look up audio list
    const audioObject = {
      records: await fetchAirtableRecords("Audio%20Source"),
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
      userRole: currentUserRole,
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
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
