///////////////////
////// variable declarations
///////////////////
const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
const audioOffsetTuner = document.getElementById("audioOffsetTuner");
const transcriptDiv = document.getElementById("transcript");
const toolTip = document.getElementById("toolTip");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const openFromAirtableBtn = document.getElementById("openFromAirtable");
const saveToAirtableBtn = document.getElementById("saveToAirtable");
const tempBtn = document.getElementById("tempBtn");
const list = document.getElementById("list");
const playbackSpeed = document.getElementById("playbackSpeed");
const peopleSelect = document.getElementById("peopleSelect");
const audioSelect = document.getElementById("audioSelect");
let submenu = document.querySelectorAll(".submenu");
let authz,
  audios,
  defaultData,
  defaultAudio,
  defaultAirtableWords,
  selectedData,
  audio,
  accentFeature,
  accentIssues,
  issuesSelected,
  issueSelected,
  featureSelected,
  user,
  people,
  userRole;
let audioData,
  speechData,
  annotationsLoaded,
  issues,
  audioURLSelected,
  transcriptSelected,
  speechDataURL,
  audioName,
  audioNameURLEncoded,
  airtableWords;
let airtableIssues;
let airtableIssuesObject = {};
let activeWord = 0; // index of the word currently being spoken
let selectedWord; // index of the word whose annotations are being edited
let inProgress = {
  timeIntervals: [],
  words: [],
  notes: [],
  ATRecs: [],
};

//////////////////////////
////// main execution
//////////////////////////

// install banner for iOS

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

/// main

loadDefault();

//////////////////////////
////// event listeners
//////////////////////////

openFromAirtableBtn.addEventListener("click", getAudio);
saveToAirtableBtn.addEventListener("click", saveToAirtable);
tempBtn.addEventListener("click", tempAirtableTest);
saveBtn.addEventListener("click", saveToJSON);
loadBtn.addEventListener("click", loadFromJSON);
peopleSelect.addEventListener("change", filterAudios);

// detects key presses for keyboard playback control
document.addEventListener("keydown", (e) => {
  let code = e.code;
  if (Object.keys(playbackObj).includes(code)) {
    playbackObj[code](e);
  }
});

/////////////////////////////
////// function definitions
///////////////////////////////

async function loadDefault() {
  await fetch(`/data/loadDefault`)
    .then((response) => response.json())
    .then((json) => (defaultData = json));

  await fetch("./JSON/issues2.json")
    .then((response) => response.json())
    .then((json) => (issues = json));

  audio = defaultData.defaultAudio;
  airtableWords = defaultData.defaultAirtableWords;
  audioURLSelected = audio.mp3url;
  speechDataURL = audio.tranurl;

  await fetch(speechDataURL)
    .then((response) => response.json())
    .then((json) => (speechData = json));

  transcriptSelected = speechData.speech.transcripts;

  loadAll(audioURLSelected, transcriptSelected);
  getCurrentUserResources();
  setInterval(function () {
    showCurrentWord();
  }, 30);

  // document.querySelectorAll("td").forEach((tableElement) => {
  //   // tableElementContent = tableElement.innerHTML;
  //   tableElement.addEventListener("click", filterAnnotations);
  // });
}

function loadAll(audioURLSelected, transcriptSelected, annotationsData) {
  updateAudio(audioURLSelected);
  clearTranscript();
  displayTranscript(transcriptSelected);
  updateWordSpanListeners();
}

function updateAudio(audioURLSelected) {
  audioSource.src = audioURLSelected;
  audioPlayer.load();
}

function clearTranscript() {
  speechData = {};
  inProgress = {
    timeIntervals: [],
    words: [],
    notes: [],
    ATRecs: [],
  };
  transcriptDiv.innerHTML = "";
  list.innerHTML = "";
}

function displayTranscript(transcriptSelected) {
  transcriptSelected.forEach((tranData) => {
    const start_offset = tranData.start_offset;
    const start_offset_conv = start_offset / 16000;
    const alignment = tranData.alignment;

    alignment.forEach((wordData) => {
      const wordSpan = document.createElement("span");
      wordSpan.setAttribute("id", `word${inProgress.words.length}`);
      wordSpan.textContent = wordData.word;
      wordSpan.dataset.startTime = wordData.start + start_offset_conv;

      //populating inProgress object
      inProgress.timeIntervals.push(wordData.start + start_offset_conv);
      inProgress.words.push(wordData.word);
      inProgress.notes.push([]);
      inProgress.ATRecs.push(undefined);

      wordSpan.addEventListener("click", () => {
        audioPlayer.currentTime =
          wordData.start + start_offset_conv + audioOffsetTuner.value * 1;
        audioPlayer.play();
      });
      transcriptDiv.appendChild(wordSpan);
      transcriptDiv.append("\x20");
    });
    const para = document.createElement("p");
    transcriptDiv.appendChild(para);
  });
}

function updateWordSpanListeners() {
  // add annotation and context menu event listeners to word spans in transcript div
  for (let i = 0; i < inProgress.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];
    s.addEventListener(
      "mouseover",
      (f) => {
        let ind = parseInt(s.id.slice(4));
        showAnnotations(ind);
      },
      false
    );
    s.addEventListener(
      "contextmenu",
      (f) => {
        let ind = parseInt(s.id.slice(4));
        selectedWord = ind;
        let x = f.clientX;
        let y = f.clientY;
        list.style.display = "block";
        list.style.top = "0px";
        list.style.left = x + "px";

        //prevent page overflow
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let menuWidth = list.offsetWidth;
        let menuHeight = list.offsetHeight;
        let secMargin = 20;

        if (x + menuWidth > winWidth) {
          list.style.left = winWidth - menuWidth - secMargin + "px";
        }

        document.addEventListener("click", onClickOutside);
        f.preventDefault();
      },
      false
    );
  }

  for (let i = 0; i < Object.keys(issues.targets).length; i++) {
    const listFeature = document.createElement("li");
    listFeature.textContent = Object.keys(issues.targets)[i];
    listFeature.addEventListener("mouseover", moveContextSubmenu);
    list.appendChild(listFeature);
    const listFeatureUL = document.createElement("ul");
    listFeatureUL.classList.add("submenu");
    listFeature.appendChild(listFeatureUL);

    for (
      let j = 0;
      j < Object.values(Object.values(issues.targets)[i]).length;
      j++
    ) {
      const listIssue = document.createElement("li");
      listIssue.textContent = Object.keys(Object.values(issues.targets)[i])[j];
      listIssue.addEventListener("click", adjustAnnotations);
      listFeatureUL.appendChild(listIssue);
    }
  }
}

function showCurrentWord() {
  // highlights the word currently being spoken
  let currentTime = audioPlayer.currentTime;
  let wordIndex = 0;
  for (let i = 0; i < inProgress.timeIntervals.length; i++) {
    if (currentTime > inProgress.timeIntervals[i]) {
      wordIndex++;
    } else {
      break;
    }
  }
  if (wordIndex != activeWord) {
    activeWord = wordIndex;
    document.querySelectorAll("span").forEach((sp) => {
      sp.classList.remove("active");
    });
    document.getElementById(`word${activeWord - 1}`).classList.add("active");
  }
}

function showAnnotations(ind) {
  // displays any annotations applied to the word being hovered over
  document.getElementById("toolTip").innerHTML =
    inProgress.notes[ind].join(", ");
}

const onClickOutside = (event) => {
  list.style.display = "none";
  document.removeEventListener("click", onClickOutside);
};

function saveToJSON() {
  console.log(inProgress);
  let saveData = JSON.stringify(inProgress);
  console.log(saveData);

  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(saveData)
  );
  element.setAttribute("download", "annotations.json");

  element.style.display = "none";
  document.body.appendChild(element);

  // page currently refreshes after save. I tried some code to prevent refresh but it ends up stopping the download, not sure yet. leaving as comment, TBD

  /*   element.addEventListener('click', function(e) {
    e.preventDefault();
    return false;
  }); */

  element.click();

  document.body.removeChild(element);
}

async function loadFromJSON() {
  await fetch("./JSON/annotations.json")
    .then((response) => response.json())
    .then((json) => (annotationsLoaded = json));
  inProgress = {
    timeIntervals: [],
    words: [],
    notes: [],
    ATRecs: [],
  };

  // consider updating to handle local JSON both with and without the ATRecs data
  for (let i = 0; i < annotationsLoaded.notes.length; i++) {
    inProgress.timeIntervals[i] = annotationsLoaded.timeIntervals[i];
    inProgress.words[i] = annotationsLoaded.words[i];
    inProgress.notes[i] = annotationsLoaded.notes[i];
    inProgress.ATRecs[i] = undefined;
  }

  for (let i = 0; i < inProgress.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];

    if (inProgress.notes[i].length != 0) {
      s.classList.add("annotated");
    } else {
      s.classList.remove("annotated");
    }
  }
}

function portAnnotationsFromAirtable() {
  for (let i = 0; i < inProgress.notes.length; i++) {
    inProgress.notes[i] = [];
  }

  for (let i = 0; i < airtableWords.records.length; i++) {
    let tempWordIndex = airtableWords.records[i].fields["word index"];
    let tempIssueObject = Object.values(
      airtableWords.records[i].fields["BR issues"]
    );
    let tempATRec = airtableWords.records[i].id;

    inProgress.ATRecs[tempWordIndex] = tempATRec;

    for (
      let j = 0;
      j < Object.values(airtableWords.records[i].fields["BR issues"]).length;
      j++
    ) {
      if (Object.keys(airtableIssuesObject).includes(tempIssueObject[j])) {
        inProgress.notes[tempWordIndex].push(
          airtableIssuesObject[tempIssueObject[j]]
        );
      }
    }
  }

  for (let i = 0; i < inProgress.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];

    if (inProgress.notes[i].length != 0) {
      s.classList.add("annotated");
    } else {
      s.classList.remove("annotated");
    }
  }
}

async function getCurrentUserResources() {
  await fetch("/authz")
    .then((response) => response.json())
    .then((json) => (authz = json));

  people = authz.people;
  audios = authz.audios;
  userRole = authz.userRole;

  for (let i = 0; i < people.length; i++) {
    let personName = people[i].Name;
    let personRecID = people[i].id;
    const peopleSelectItem = document.createElement("option");
    peopleSelectItem.textContent = personName;
    peopleSelectItem.value = personRecID;
    peopleSelect.appendChild(peopleSelectItem);
  }

  for (let i = 0; i < audios.length; i++) {
    let audioName = audios[i].Name;
    const audioSelectItem = document.createElement("option");
    audioSelectItem.textContent = audioName;
    audioSelectItem.value = audios[i].id;
    audioSelect.appendChild(audioSelectItem);
  }
  getAirtableIssues();
}

async function getUser() {
  await fetch("/user")
    .then((response) => response.json())
    .then((json) => (user = json));

  console.log("user:", user);
}

function filterAudios() {
  let results = [];
  audioSelect.options.length = 0;
  for (let i = 0; i < audios.length; i++) {
    if (audios[i].SpeakerName.indexOf(peopleSelect.value) !== -1) {
      results.push(audios[i].id);
      let audioName = audios[i].Name;
      const audioSelectItem = document.createElement("option");
      audioSelectItem.textContent = audioName;
      audioSelectItem.value = audios[i].id;
      audioSelect.appendChild(audioSelectItem);
    }
  }
}

async function getAirtableIssues() {
  await fetch("/data/loadIssues")
    .then((response) => response.json())
    .then((json) => (airtableIssues = json));

  airtableIssuesObject = airtableIssues;
  portAnnotationsFromAirtable();
}

async function getAudio() {
  clearTranscript();

  await fetch(`/data/loadAudio/${audioSelect.value}`)
    .then((response) => response.json())
    .then((json) => (selectedData = json));

  audio = selectedData.selectedAudio;
  airtableWords = selectedData.selectedAirtableWords;
  audioName = audio.Name;
  audioNameURLEncoded = encodeURIComponent(audioName);
  audioURLSelected = audio.mp3url;
  speechDataURL = audio.tranurl;

  await fetch(speechDataURL)
    .then((response) => response.json())
    .then((json) => (speechData = json));

  transcriptSelected = speechData.speech.transcripts;
  loadAll(audioURLSelected, transcriptSelected);
  portAnnotationsFromAirtable();
}

async function saveToAirtable(ATMethod, ATRec, ATFields) {
  if (ATMethod !== "DELETE") {
    let ATResponse;
    let ATBody = {
      records: [
        {
          id: ATRec,
          fields: ATFields,
        },
      ],
    };

    await fetch("/api/Words%20%28instance%29", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: `${ATMethod}`,
      body: JSON.stringify(ATBody),
    })
      .then((response) => response.json())
      .then((json) => (ATResponse = json))
      .catch((response) => console.log(response));

    return ATResponse;
  } else if (ATMethod === "DELETE") {
    let ATResponse;
    let ATURL = `?records[]=${ATRec}`;

    await fetch(`/api/Words%20%28instance%29${ATURL}`, {
      headers: {},
      method: `${ATMethod}`,
    })
      .then((response) => response.json())
      .then((json) => (ATResponse = json))
      .catch((response) => console.log(response));

    return ATResponse;
  }
}

async function tempAirtableTest() {
  let airtableBody = {
    records: [
      {
        id: "recg8kk6hwtxiIZWg",
        fields: {
          Name: "testsdfsdfsdf",
          "word index": 123,
          "BR issues": ["recFP4gVaCnxNkrsP", "recAx3HTRTmuUsoix"],
        },
      },
    ],
  };

  await fetch("/api/tblmi1PP4EWaVFxhm", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify(airtableBody),
  })
    .then((response) => console.log(response))
    .catch((response) => console.log(response));
}

function hideAnnotations() {
  document.querySelectorAll("span").forEach((sp) => {
    sp.classList.remove("annotated");
  });
}

function filterAnnotations(evt) {
  hideAnnotations();
  accentFeature = evt.currentTarget.innerHTML;
  console.log(accentFeature);
  if (Object.keys(issues.targets).includes(accentFeature)) {
    issuesSelected = issues.targets[accentFeature];
    console.log(issuesSelected);
    console.log(issuesSelected.length);
  } else {
    console.log("no");
  }
  for (let i = 0; i < inProgress.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];

    for (let j = 0; j < issuesSelected.length; j++) {
      if (inProgress.notes[i].includes(issuesSelected[j])) {
        s.classList.add("annotated");
      }
    }
  }
}

function adjustAnnotations(evt) {
  if (userRole === "write") {
    issueSelected = evt.currentTarget.innerHTML;
    let s = document.querySelectorAll("span")[selectedWord];

    let notes = inProgress.notes[selectedWord];
    let tempATRec = inProgress.ATRecs[selectedWord];

    s.classList.add("annotated");

    // may need to make this logic smarter than just checking relative to undefined
    // I think airtableWords is probably getting out of sync with inProgress and airtable's actual state
    if (tempATRec !== undefined) {
      // if we're here, we already have an Airtable Record ID. need to update the record using PATCH and/or delete the record using DELETE

      if (notes.includes(issueSelected)) {
        notes.splice(notes.indexOf(issueSelected), 1);
        if (notes.length == 0) {
          s.classList.remove("annotated");
          //need to add DELETE here, once DELETE is implemented in back-end
          saveToAirtable("DELETE", tempATRec, buildATFields());

          // need to remove airtable record ID (set as undefined?) from local airtableWords object and/or inProgress object
          // console.log(airtableWords);
          // remove here then console log to verify result

          for (let i = 0; i < airtableWords.records.length; i++) {
            if (airtableWords.records[i] == tempATRec) {
              airtableWords.records.splice(i, i);
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
        airtableWords.records.push(ATResponse.records[0]);
        inProgress.ATRecs[selectedWord] = ATResponse.records[0].id;
        return ATResponse.records[0];
      }

      asyncCaller();
    }

    showAnnotations(selectedWord);

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
        Name: inProgress.words[selectedWord],
        "BR issues": convertIssuesToATIssueRecIDs(notes, airtableIssuesObject),
        "in timestamp (seconds)": inProgress.timeIntervals[selectedWord],
        "word index": selectedWord,
        "Audio Source": [audioSelect.value],
        Note: "test - delete",
      };
    }
  }
}

function moveContextSubmenu(evt) {
  featureSelected = evt.currentTarget;

  featureSelected.children[0].style.top = featureSelected.offsetTop + "px";
  featureSelected.children[0].style.left = featureSelected.offsetWidth + "px";

  let x = evt.clientX;
  let y = evt.clientY;

  //prevent page overflow
  let winWidth = window.innerWidth;
  let winHeight = window.innerHeight;
  let secMargin = 20;
  let menuRect = featureSelected.getBoundingClientRect();
  let submenuRect = featureSelected.children[0].getBoundingClientRect();

  if (submenuRect.x + submenuRect.width > winWidth) {
    featureSelected.children[0].style.left = -submenuRect.width + "px";
  }

  if (submenuRect.y + submenuRect.height > winHeight) {
    featureSelected.children[0].style.top =
      winHeight - submenuRect.height + "px";
  }
}

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
    console.log("inProgress:", inProgress);
    console.log("airtableWords:", airtableWords);
    console.log("speechData:", speechData);
    console.log("transcriptSelected:", transcriptSelected);
    console.log("==============");
  },
};

export { moveContextSubmenu };
