import { moveContextSubmenu } from "./utilities.js";

// #region declare variables

const audioPlayer = document.getElementById("audioPlayer"),
  audioSource = document.getElementById("audioSource"),
  transcriptDiv = document.getElementById("transcript"),
  toolTip = document.getElementById("toolTip"),
  openFromAirtableBtn = document.getElementById("openFromAirtable"),
  list = document.getElementById("list"),
  playbackSpeed = document.getElementById("playbackSpeed"),
  peopleSelect = document.getElementById("peopleSelect"),
  audioSelect = document.getElementById("audioSelect");

const appState = {
  userRole: null,
  people: [],
  audios: [],
  airtableIssues: {},
  activeTranscript: {},
};

const transcriptState = {
  timeIntervals: [],
  words: [],
  notes: [],
  ATRecs: [],
  airtableWords: {},
  selectedWord: 0,
  activeWord: 0,
};
// #endregion

// #region install banner for iOS

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("installBanner");
  const closeButton = document.getElementById("closeBanner");

  // Check if the app is on iOS, not in standalone mode, and the banner hasn't been dismissed
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const isBannerDismissed = localStorage.getItem("bannerDismissed");

  if (isIOS && !isInStandaloneMode && !isBannerDismissed) {
    banner.style.display = "block";
  }

  // Dismiss the banner and remember the choice
  closeButton.addEventListener("click", () => {
    banner.style.display = "none";
    localStorage.setItem("bannerDismissed", "true");
  });
});
// #endregion

loadDefault();

// #region event listeners

openFromAirtableBtn.addEventListener("click", getAudio);
peopleSelect.addEventListener("change", filterAudios);

// detects key presses for keyboard playback control
document.addEventListener("keydown", (e) => {
  let code = e.code;
  if (Object.keys(playbackObj).includes(code)) {
    playbackObj[code](e);
  }
});
// #endregion

// #region Main Functions
async function loadDefault() {
  const defaultData = await fetchData("/data/loadDefault");
  appState.airtableIssues = await fetchData("/data/loadIssues");
  console.log(transcriptState, appState);
  getCurrentUserResources();

  await loadTranscipt(defaultData);

  setInterval(highlightActiveWord, 30);

  // document.querySelectorAll("td").forEach((tableElement) => {
  //   tableElementContent = tableElement.innerHTML;
  //   tableElement.addEventListener("click", filterAnnotations);
  // });
}

/**
 * Initializes the transcript display with the selected audio and transcript.
 * @param {string} audioURLSelected
 * @param {object} transcriptSelected
 */
function initializeTranscript(audioURLSelected, transcriptSelected) {
  setAudioSource(audioURLSelected);
  resetTranscript();
  displayTranscript(transcriptSelected);
  updateWordSpanListeners();
}

function displayTranscript(transcriptSelected) {
  const fragment = document.createDocumentFragment();

  transcriptSelected.forEach(({ start_offset, alignment }) => {
    const start_offset_conv = start_offset / 16000;

    alignment.forEach((wordData) => {
      updateTranscriptState(wordData, start_offset_conv);
      fragment.appendChild(createWordSpan(wordData, start_offset_conv));
      fragment.appendChild(createSpace());
    });

    fragment.appendChild(document.createElement("p"));
  });

  transcriptDiv.appendChild(fragment);
}
function resetTranscript() {
  resetTranscriptState();
  clearTranscriptUI();
}
// #endregion

// #region State Management

// function resetAppState() {
//   // todo
// }

// function updateTranscriptState2() {
//   // todo
// }

function updateTranscriptState(wordData, start_offset_conv) {
  transcriptState.timeIntervals.push(wordData.start + start_offset_conv);
  transcriptState.words.push(wordData.word);
  transcriptState.notes.push([]);
  transcriptState.ATRecs.push(undefined);
}
function resetTranscriptState() {
  Object.assign(transcriptState, {
    timeIntervals: [],
    words: [],
    notes: [],
    ATRecs: [],
    activeWord: 0,
  });
}
// #endregion

// #region DOM Manipulation

function clearTranscriptUI() {
  transcriptDiv.innerHTML = "";
  list.innerHTML = "";
}
function showAnnotations(ind) {
  // displays any annotations applied to the word being hovered over
  toolTip.innerHTML = transcriptState.notes[ind].join(", ");
}
// function hideAnnotations() {
//   document.querySelectorAll("span").forEach((sp) => {
//     sp.classList.remove("annotated");
//   });
// }
function highlightActiveWord() {
  // highlights the word currently being spoken
  let currentTime = audioPlayer.currentTime;
  let wordIndex = binarySearch(transcriptState.timeIntervals, currentTime);

  if (wordIndex !== transcriptState.activeWord) {
    transcriptState.activeWord = wordIndex;
    document.querySelectorAll("span").forEach((sp) => {
      sp.classList.remove("active");
    });
    document
      .getElementById(`word${transcriptState.activeWord - 1}`)
      .classList.add("active");
  }
}
function createWordSpan(wordData, start_offset_conv) {
  const wordSpan = document.createElement("span");
  const startTime = wordData.start + start_offset_conv;
  wordSpan.id = `word${transcriptState.words.length - 1}`;
  wordSpan.textContent = wordData.word;
  wordSpan.dataset.startTime = startTime;

  wordSpan.addEventListener("click", () => {
    audioPlayer.currentTime = startTime;
    audioPlayer.play();
  });

  return wordSpan;
}
function createSpace() {
  return document.createTextNode(" ");
}
// #endregion

// #region Audio
function setAudioSource(audioURLSelected) {
  audioSource.src = audioURLSelected;
  audioPlayer.load();
}
// #endregion

// #region Airtable
async function getAudio() {
  const selectedData = await fetchData(`/data/loadAudio/${audioSelect.value}`);
  await loadTranscipt(selectedData);
}
async function loadTranscipt(audioData) {
  if (!audioData) return;
  resetTranscript();
  const audio = audioData.audio;
  transcriptState.airtableWords = audioData.airtableWords;

  const speechData = await fetchData(audio.tranurl);
  if (!speechData) return;
  const transcriptSelected = speechData.speech.transcripts;
  initializeTranscript(audio.mp3url, transcriptSelected);
  portAnnotationsFromAirtable(transcriptState.airtableWords);
}
async function saveToAirtable(ATMethod, ATRec, ATFields) {
  const url = `/api/Words%20%28instance%29${
    ATMethod === "DELETE" ? `?records[]=${ATRec}` : ""
  }`;
  const options = {
    method: ATMethod,
    ...(ATMethod !== "DELETE" && {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ id: ATRec, fields: ATFields }] }),
    }),
  };
  return await fetchData(url, options);
}
function adjustAnnotations(evt) {
  if (appState.userRole === "write") {
    const issueSelected = evt.currentTarget.innerHTML;
    let s = document.querySelectorAll("span")[transcriptState.selectedWord];

    let notes = transcriptState.notes[transcriptState.selectedWord];
    let tempATRec = transcriptState.ATRecs[transcriptState.selectedWord];

    s.classList.add("annotated");

    // may need to make this logic smarter than just checking relative to undefined
    // I think airtableWords is probably getting out of sync with transcriptState and airtable's actual state
    if (tempATRec !== undefined) {
      // if we're here, we already have an Airtable Record ID. need to update the record using PATCH and/or delete the record using DELETE

      if (notes.includes(issueSelected)) {
        notes.splice(notes.indexOf(issueSelected), 1);
        if (notes.length == 0) {
          s.classList.remove("annotated");
          //need to add DELETE here, once DELETE is implemented in back-end
          saveToAirtable("DELETE", tempATRec, buildATFields());

          // need to remove airtable record ID (set as undefined?) from local airtableWords object and/or transcriptState object
          // console.log(airtableWords);
          // remove here then console log to verify result

          for (
            let i = 0;
            i < transcriptState.airtableWords.records.length;
            i++
          ) {
            if (transcriptState.airtableWords.records[i] == tempATRec) {
              transcriptState.airtableWords.records.splice(i, i);
              i = i - 1;
            }
          }
        } else if (notes.length != 0) {
          saveToAirtable("PATCH", tempATRec, buildATFields());
        }
      } else {
        notes.push(issueSelected);

        saveToAirtable("PATCH", tempATRec, buildATFields());
      }
    } else if (tempATRec === undefined) {
      // if we're here, we don't yet have an Airtable Record ID. so need to create the record using POST

      if (notes.includes(issueSelected)) {
        notes.splice(notes.indexOf(issueSelected), 1);
        if (notes.length == 0) {
          s.classList.remove("annotated");
        } else if (notes.length != 0) {
          // do nothing
        }
      } else {
        notes.push(issueSelected);
      }

      async function asyncCaller() {
        let ATResponse = await saveToAirtable(
          "POST",
          tempATRec,
          buildATFields()
        );
        transcriptState.airtableWords.records.push(ATResponse.records[0]);
        transcriptState.ATRecs[transcriptState.selectedWord] =
          ATResponse.records[0].id;
        return ATResponse.records[0];
      }

      asyncCaller();
    }

    showAnnotations(transcriptState.selectedWord);

    function convertIssuesToATIssueRecIDs(notes, airtableIssues) {
      let convertedOutput = [];
      for (let i = 0; i < notes.length; i++) {
        for (let j = 0; j < Object.keys(airtableIssues).length; j++) {
          if (Object.values(airtableIssues)[j] == notes[i]) {
            convertedOutput.push(Object.keys(airtableIssues)[j]);
          }
        }
      }
      return convertedOutput;
    }

    function buildATFields() {
      // going to need to swap some of these with dynamically looked-up airtable records IDs, sending string won't work
      // hard-coding record IDs for now, just for testing. need to make dynamic.
      return {
        Name: transcriptState.words[transcriptState.selectedWord],
        "BR issues": convertIssuesToATIssueRecIDs(
          notes,
          transcriptState.selectedWord
        ),
        "in timestamp (seconds)":
          transcriptState.timeIntervals[transcriptState.selectedWord],
        "word index": transcriptState.selectedWord,
        "Audio Source": [audioSelect.value],
        Note: "test - delete",
      };
    }
  }
}
function portAnnotationsFromAirtable(airtableWords) {
  // Clear existing annotations
  transcriptState.notes.forEach((_, i) => (transcriptState.notes[i] = []));

  // Process Airtable records
  airtableWords.records.forEach((record) => {
    let wordIndex = record.fields["word index"];
    let issueKeys = record.fields["BR issues"];
    let airtableRecordID = record.id;

    // Store Airtable record ID in transcript state
    transcriptState.ATRecs[wordIndex] = airtableRecordID;

    function findIssue(issueKey, data) {
      for (const feature of data) {
        for (const issue of feature.issues) {
          if (issue.id === issueKey) {
            return issue; // Return the found issue object
          }
        }
      }
      return null; // Return null if not found
    }

    // Map Airtable issues to corresponding annotation descriptions
    if (issueKeys) {
      issueKeys.forEach((issueKey) => {
        const foundIssue = findIssue(issueKey, appState.airtableIssues);
        if (foundIssue) {
          transcriptState.notes[wordIndex].push(foundIssue.name);
        }
      });
    }
  });

  // DOM manipulation to reflect annotations
  document.querySelectorAll("span").forEach((span, i) => {
    if (transcriptState.notes[i].length != 0) {
      span.classList.add("annotated");
    } else {
      span.classList.remove("annotated");
    }
  });
}
// #endregion

// #region Event Handlers
let playbackObj = {
  // separate out certain keys for audio playback control
  ArrowLeft: () => {
    audioPlayer.currentTime = audioPlayer.currentTime - 1;
  },
  ArrowRight: () => {
    audioPlayer.currentTime = audioPlayer.currentTime + 1;
  },
  Space: (evt) => {
    evt.preventDefault();
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  },
  Comma: () => {
    audioPlayer.playbackRate = audioPlayer.playbackRate - 0.1;
    playbackSpeed.innerHTML =
      "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  },
  Period: () => {
    audioPlayer.playbackRate = audioPlayer.playbackRate + 0.1;
    playbackSpeed.innerHTML =
      "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  },
  ArrowUp: () => {
    console.log("==============");
    console.log("transcriptState:", transcriptState);
    console.log("appState:", appState);
    // console.log("airtableWords:", airtableWords);
    // console.log("speechData:", speechData);
    // console.log("transcriptSelected:", transcriptSelected);
    console.log("==============");
  },
};
function updateWordSpanListeners() {
  // add annotation and context menu event listeners to word spans in transcript div
  for (let i = 0; i < transcriptState.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];
    s.addEventListener(
      "mouseover",
      () => {
        let ind = parseInt(s.id.slice(4));
        showAnnotations(ind);
      },
      false
    );
    s.addEventListener(
      "contextmenu",
      (evt) => {
        evt.preventDefault();
        transcriptState.selectedWord = parseInt(s.id.slice(4));
        let x = evt.clientX;
        list.style.display = "block";
        list.style.top = "0px";
        list.style.left = x + "px";

        //prevent page overflow
        let winWidth = window.innerWidth;
        let menuWidth = list.offsetWidth;
        let secMargin = 20;

        if (x + menuWidth > winWidth) {
          list.style.left = winWidth - menuWidth - secMargin + "px";
        }

        document.addEventListener("click", onClickOutside);
      },
      false
    );
  }

  for (let i = 0; i < appState.airtableIssues.length; i++) {
    const listFeature = document.createElement("li");
    listFeature.textContent = appState.airtableIssues[i].name;
    listFeature.addEventListener("mouseover", moveContextSubmenu);
    list.appendChild(listFeature);
    const listFeatureUL = document.createElement("ul");
    listFeatureUL.classList.add("submenu");
    listFeature.appendChild(listFeatureUL);

    for (let j = 0; j < appState.airtableIssues[i].issues.length; j++) {
      const listIssue = document.createElement("li");
      listIssue.textContent = appState.airtableIssues[i].issues[j].name;
      listIssue.addEventListener("click", adjustAnnotations);
      listFeatureUL.appendChild(listIssue);
    }
  }
}
// function filterAnnotations(evt) {
//   hideAnnotations();
//   const accentFeature = evt.currentTarget.innerHTML;
//   console.log(accentFeature);
//   if (Object.keys(issues.targets).includes(accentFeature)) {
//     const issuesSelected = issues.targets[accentFeature];
//     console.log(issuesSelected);
//     console.log(issuesSelected.length);
//   } else {
//     console.log("no");
//   }
//   for (let i = 0; i < transcriptState.notes.length; i++) {
//     let s = document.querySelectorAll("span")[i];

//     for (let j = 0; j < issuesSelected.length; j++) {
//       if (transcriptState.notes[i].includes(issuesSelected[j])) {
//         s.classList.add("annotated");
//       }
//     }
//   }
// }
const onClickOutside = () => {
  list.style.display = "none";
  document.removeEventListener("click", onClickOutside);
};
// #endregion

// #region Utility Functions
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null; // Handle errors gracefully
  }
}
function binarySearch(arr, time) {
  let left = 0,
    right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] < time) left = mid + 1;
    else right = mid - 1;
  }
  return left;
}
// #endregion

// #region Auth
async function getCurrentUserResources() {
  const authz = await fetchData("/authz");

  const { people, audios, userRole } = authz;
  appState.people = people;
  appState.audios = audios;
  appState.userRole = userRole;

  updateDropdown(people, peopleSelect);
  updateDropdown(audios, audioSelect);

  function updateDropdown(items, dropdown) {
    dropdown.innerHTML = "";
    items.forEach(({ Name, id }) => {
      const option = document.createElement("option");
      option.textContent = Name;
      option.value = id;
      dropdown.appendChild(option);
    });
  }
}
function filterAudios() {
  let results = [];
  audioSelect.options.length = 0;
  for (let i = 0; i < appState.audios.length; i++) {
    if (appState.audios[i].SpeakerName.indexOf(peopleSelect.value) !== -1) {
      results.push(appState.audios[i].id);
      let audioName = appState.audios[i].Name;
      const audioSelectItem = document.createElement("option");
      audioSelectItem.textContent = audioName;
      audioSelectItem.value = appState.audios[i].id;
      audioSelect.appendChild(audioSelectItem);
    }
  }
}
// #endregion

// #endregion
