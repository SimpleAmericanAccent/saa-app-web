///////////////////
////// variable declarations
///////////////////
const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
const transcriptDiv = document.getElementById("transcript");
const toolTip = document.getElementById("toolTip");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const openBtn = document.getElementById("openAudio");
const list = document.getElementById("list");
const playbackSpeed = document.getElementById("playbackSpeed");
const peopleSelect = document.getElementById("peopleSelect");
const audioSelect = document.getElementById("audioSelect");
let submenu = document.querySelectorAll(".submenu");
// let tableElementContent;
let people, audios, audio, accentFeature, accentIssues, issuesSelected, issueSelected, featureSelected;
let audioData, speechData, annotationsLoaded, issues, audioURLSelected, transcriptSelected;
let activeWord = 0; // index of the word currently being spoken
let selectedWord; // index of the word whose annotations are being edited
let inProgress = {
  // an object containing user-generated edits
  // could be developed into an output
  timeIntervals: [],
  words: [],
  notes: [],
};

//////////////////////////
////// main execution
//////////////////////////

loadDefault();

//////////////////////////
////// event listeners
//////////////////////////

openBtn.addEventListener("click", getAudio);
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
  await fetch("./JSON/speech3.json")
    .then((response) => response.json())
    .then((json) => (speechData = json));

  await fetch("./JSON/issues2.json")
    .then((response) => response.json())
    .then((json) => (issues = json));

  audioURLSelected = './audio/audio3.mp3';
  transcriptSelected = speechData.speech.transcripts;
  console.log(transcriptSelected);

  loadAll(audioURLSelected, transcriptSelected);
  getAudios();
  getPeople();
  loadFromJSON();

  // equivalent but runs a bit faster and more reliably than 'timeupdate'
  // the last argument is the time (ms) between calls of showCurrentWord()
  // could definitely be slowed down a bit if it becomes a performance issue
  setInterval(function () {
    showCurrentWord();
  }, 30);

  document.querySelectorAll("td").forEach((tableElement) => {
    // tableElementContent = tableElement.innerHTML;
    tableElement.addEventListener("click", filterAnnotations);
  });
}

function loadAll(audioURLSelected, transcriptSelected, annotationsData) {
  updateAudio(audioURLSelected);
  displayTranscript(transcriptSelected);
  updateWordSpanListeners();
}

function updateAudio (audioURLSelected) {
  audioSource.src = audioURLSelected;
  audioPlayer.load();
}

function clearTranscript () {
  console.log("initial values");
  console.log(transcriptSelected);
  console.log(inProgress);
  console.log("attempting to clear speechData and inProgress");
  speechData = {};
  inProgress = {
    // an object containing user-generated edits
    // could be developed into an output
    timeIntervals: [],
    words: [],
    notes: [],
  };
  console.log(speechData);
  console.log(inProgress);
  transcriptDiv.innerHTML = '';
}

function displayTranscript (transcriptSelected) {
  console.log('transcriptSelected is');
  console.log(transcriptSelected);
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
  
      wordSpan.addEventListener("click", () => {
        audioPlayer.currentTime = wordData.start + start_offset_conv;
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
        console.log("hi");
        // console.log(inProgress.words[ind]);
      },
      false
    );
    s.addEventListener(
      "contextmenu",
      (f) => {
        let ind = parseInt(s.id.slice(4));
        // console.log(ind);
        selectedWord = ind;
        let x = f.clientX;
        let y = f.clientY;
        list.style.display = "block";
        // list.style.top = y + "px";
        list.style.top = "0px";
        list.style.left = x + "px";




        //prevent page overflow
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let menuWidth = list.offsetWidth;
        let menuHeight = list.offsetHeight;
        let secMargin = 20;

        // console.log(winWidth);
        // console.log(winHeight);
        // console.log(menuWidth);
        // console.log(menuHeight);
        // console.log(secMargin);

        if (x + menuWidth > winWidth) {
          list.style.left = winWidth - menuWidth - secMargin + "px";
        }

        // if (y + menuHeight > winHeight) {
        //   list.style.top = winHeight - menuHeight - secMargin + "px";
        // }
        
        document.addEventListener("click", onClickOutside);
        // console.log(submenu[0]);
        f.preventDefault();
      },
      false
    );
  }

  for (let i = 0; i < Object.keys(issues.targets).length; i++) {
    // console.log(Object.keys(issues.targets)[i]);
    const listFeature = document.createElement("li");
    listFeature.textContent = Object.keys(issues.targets)[i];
    listFeature.addEventListener("mouseover", moveContextSubmenu);
    list.appendChild(listFeature);
    const listFeatureUL = document.createElement("ul");
    listFeatureUL.classList.add("submenu");
    listFeature.appendChild(listFeatureUL);

    for (let j = 0; j < Object.values(issues.targets)[i].length; j++) {
      // console.log(Object.values(issues.targets)[i][j]);
      const listIssue = document.createElement("li");
      listIssue.textContent = Object.values(issues.targets)[i][j];
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

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveData));
  element.setAttribute('download', "annotations.json");

  element.style.display = 'none';
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
  inProgress = annotationsLoaded;

  for (let i = 0; i < inProgress.notes.length; i++) {
    let s = document.querySelectorAll("span")[i];

    if (inProgress.notes[i].length != 0) {
      s.classList.add("annotated");
    }
    else {
      s.classList.remove("annotated");
    }
  }
}

async function getPeople() {
  await fetch("/api/People")
  .then((response) => response.json())
  .then((json) => (people = json));

  // console.log(people);

  for (let i =0; i < people.records.length; i++) {
    let personName = people.records[i].fields.Name;
    // console.log(personName);
    const peopleSelectItem = document.createElement("option");
    peopleSelectItem.textContent = personName;
    peopleSelectItem.value = personName;
    peopleSelect.appendChild(peopleSelectItem);
  }
}

function filterAudios() {
  let results = [];
  audioSelect.options.length=0;
  for (let i =0; i < audios.records.length; i++) {
    if (audios.records[i].fields['Speaker (from Words (instance))'].indexOf(peopleSelect.value) !== -1) {
      results.push(audios.records[i].id);
      let audioName = audios.records[i].fields.Name;
      const audioSelectItem = document.createElement("option");
      audioSelectItem.textContent = audioName;
      audioSelectItem.value = audios.records[i].id;
      audioSelect.appendChild(audioSelectItem);
    }
  }
}

async function getAudios() {
  await fetch("/api/Audio%20Source")
  .then ((response) => response.json())
  .then ((json) => (audios = json));

  // console.log(audios);
  // console.log(audios.records[0].fields['Speaker (from Words (instance))']);

  for (let i =0; i < audios.records.length; i++) {
    let audioName = audios.records[i].fields.Name;
    // console.log(audioName);
    const audioSelectItem = document.createElement("option");
    audioSelectItem.textContent = audioName;
    audioSelectItem.value = audios.records[i].id;
    audioSelect.appendChild(audioSelectItem);
  }
}

async function getAudio() {
  clearTranscript();
  
  await fetch(`/api/Audio%20Source/${audioSelect.value}`)
  .then ((response) => response.json())
  .then ((json) => (audio = json));

  audioURLSelected = audio.fields['mp3 url'];
  speechData = JSON.parse(audio.fields['tran/alignment JSON']);
  transcriptSelected = speechData.speech.transcripts;
  loadAll(audioURLSelected, transcriptSelected);
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
  }
  else {
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
  issueSelected = evt.currentTarget.innerHTML;
  let s = document.querySelectorAll("span")[selectedWord];

  let notes = inProgress.notes[selectedWord];

  s.classList.add("annotated");

  console.log(issueSelected);
  console.log(selectedWord);
  console.log(inProgress.words[selectedWord]);
  console.log(notes);

  if (notes.includes(issueSelected)) {
    console.log("already included");
    notes.splice(notes.indexOf(issueSelected), 1);
    if (notes.length == 0) {
      s.classList.remove("annotated");
    }
  }
  else {
    console.log("not already included");
    notes.push(issueSelected);
  }
  showAnnotations(selectedWord);
}

function moveContextSubmenu(evt) {
  featureSelected = evt.currentTarget;
  // let n = submenu.length;
  // console.log(featureSelected.offsetTop);
  // console.log(featureSelected.offsetLeft);
  // console.log(featureSelected.right);
  // console.log(featureSelected.bottom);
  // console.log(featureSelected.offsetWidth);

  // console.log(featureSelected);
  // console.log(featureSelected.children[0]);

  featureSelected.children[0].style.top = featureSelected.offsetTop + "px";
  featureSelected.children[0].style.left = featureSelected.offsetWidth + "px";

  // console.log(submenu.length);
  // console.log(submenu[1]);


  let x = evt.clientX;
  let y = evt.clientY;
  // list.style.display = "block";
  // // list.style.top = y + "px";
  // list.style.top = "0px";
  // list.style.left = x + "px";




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
    featureSelected.children[0].style.top = winHeight - submenuRect.height + "px";
  }

  // console.log(winWidth);
  // console.log(winHeight);
  // console.log(secMargin);

  // if (x + menuWidth > winWidth) {
  //   list.style.left = winWidth - menuWidth - secMargin + "px";
  // }

  // if (y + menuHeight > winHeight) {
  //   list.style.top = winHeight - menuHeight - secMargin + "px";
  // }






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
    }
    else {
      audioPlayer.pause();
    }
  },
  Comma: () => {
    audioPlayer.playbackRate = audioPlayer.playbackRate - 0.1;
    playbackSpeed.innerHTML = "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  },
  Period: () => {
    audioPlayer.playbackRate = audioPlayer.playbackRate + 0.1;
    playbackSpeed.innerHTML = "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  }
};