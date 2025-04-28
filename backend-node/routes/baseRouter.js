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
  const airtableFeatures = await fetchAirtableRecords("Target");
  const airtableIssues = await fetchAirtableRecords("BR%20issues");

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
    const issueData = {
      id: record.id,
      name: record.fields.Name || "",
      po: record.fields["Presentation order"] || Infinity,
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
