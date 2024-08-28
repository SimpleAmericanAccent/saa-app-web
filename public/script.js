//// import json files (transcripts including alignment data)
//// this async method is working better for me than the import method
let speech3;
let annotationsLoaded;
let issues;

await fetch("./JSON/speech3.json")
  .then((response) => response.json())
  .then((json) => (speech3 = json));

await fetch("./JSON/issues2.json")
  .then((response) => response.json())
  .then((json) => (issues = json));

//// DOM selection and associated variables
const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
const transcriptDiv = document.getElementById("transcript");
const toolTip = document.getElementById("toolTip");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const list = document.getElementById("list");
const playbackSpeed = document.getElementById("playbackSpeed");
const peopleSelect = document.getElementById("peopleSelect");
const audioSelect = document.getElementById("audioSelect");
let submenu;

//// variable declarations

let inProgress = {
  // an object containing user-generated edits
  // could be developed into an output
  timeIntervals: [],
  words: [],
  notes: [],
};

// let issueObj = {
//   // an object used to convert between keypresses and pronunciation issues
//   // just an idea. Not sure how many unique labels are needed / if this approach is enough
//   KeyA: "TH x D/flap",
//   KeyB: "dark L x U/O",
//   KeyC: "sick x seek",
//   KeyD: "stress",
//   KeyE: "R x missing R",
//   KeyF: "on, om x (c)om",
//   KeyG: "T x TCH",
//   KeyH: "in, im x (s)im",
//   KeyI: "seek x sick",
//   KeyJ: "extra vowel",
//   KeyK: "GOAT tuning",
//   KeyL: "sim x sin x sing",
//   KeyM: "grammar/vocab/word usage",
//   KeyN: "luck x lock",
//   KeyO: "S x Z",
//   KeyP: "TH x T",
//   KeyQ: "listening x reading (or BR similar word)",
//   KeyR: "missing syllable",
//   KeyS: "em, en x hein",
//   KeyT: "Y x missing Y",
//   KeyU: "bed x bad",
//   KeyV: "lock x ó",
//   KeyW: "look x Luke",
//   KeyX: "luck tuning",
//   KeyY: "T x TS",
//   KeyZ: "V x F"
// };

let activeWord = 0; // index of the word currently being spoken
let selectedWord; // index of the word whose annotations are being edited

const speechOptions = [1, 2, 3];
let speechIndex = speechOptions[2];

const audioURLSelected = `./audio/audio${speechIndex}.mp3`;
const transcriptSelected = speech3.speech.transcripts;

//// function definitions
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

//// main logic
// Set audio source
audioSource.src = audioURLSelected;
audioPlayer.load();

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

//// event listeners

saveBtn.addEventListener("click", saveToJSON);
loadBtn.addEventListener("click", loadFromJSON);

// equivalent but runs a bit faster and more reliably than 'timeupdate'
// the last argument is the time (ms) between calls of showCurrentWord()
// could definitely be slowed down a bit if it becomes a performance issue
setInterval(function () {
  showCurrentWord();
}, 30);

let playbackObj = {
  // separate out certain keys for audio playback control
  ArrowLeft: function () {
    // audioPlayer.pause();
    // console.log(audioPlayer.paused);
    // console.log('left');
    audioPlayer.currentTime = audioPlayer.currentTime - 1;
  },
  ArrowRight: function () {
    // audioPlayer.pause();
    // console.log(audioPlayer.paused);
    // console.log('left');
    audioPlayer.currentTime = audioPlayer.currentTime + 1;
  },
  Space: function (evt) {
    evt.preventDefault();
    // console.log(audioPlayer.paused);
    // console.log('space');
    // console.log(audioPlayer.currentTime);

    if (audioPlayer.paused) {
      audioPlayer.play();
    }
    else {
      audioPlayer.pause();
    }
  },
  Comma: function () {
    // audioPlayer.pause();
    // console.log(audioPlayer.paused);
    // console.log('left');
    audioPlayer.playbackRate = audioPlayer.playbackRate - 0.1;
    playbackSpeed.innerHTML = "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  },
  Period: function () {
    // audioPlayer.pause();
    // console.log(audioPlayer.paused);
    // console.log('left');
    audioPlayer.playbackRate = audioPlayer.playbackRate + 0.1;
    playbackSpeed.innerHTML = "Playback speed is " + audioPlayer.playbackRate.toFixed(1);
  }
};

// detects hotkey-entered annotations for highlighted span
// see issueObj for conversions
document.addEventListener("keydown", (e) => {
  let hov = document.querySelector("span:hover");
  let code = e.code;
  if (Object.keys(playbackObj).includes(code)) {
    // console.log("playback control keydown has been recognized");
    // console.log(audioPlayer.paused);
    playbackObj[code](e);
  }
  else {
    if (hov) {
      hov.classList.add("annotated");
      let ind = parseInt(hov.id.slice(4));
      let notes = inProgress.notes[ind];
      if (Object.keys(issueObj).includes(code)) {
        code = issueObj[code];
      }
      if (notes.includes(code)) {
        notes.splice(notes.indexOf(code), 1);
        if (notes.length == 0) {
          hov.classList.remove("annotated");
        }
      } else {
        notes.push(code);
      }
      showAnnotations(ind);
    }
  }
});

// displays annotations in upper right box
// not a huge fan of the fixed box as the format for this
// maybe it could be more like a tooltip?
// better approach will depend on whether it needs to be mobile friendly
for (let i = 0; i < inProgress.notes.length; i++) {
  let s = document.querySelectorAll("span")[i];
  s.addEventListener(
    "mouseover",
    (f) => {
      let ind = parseInt(s.id.slice(4));
      showAnnotations(ind);
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
  // console.log(annotationsLoaded);
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

let people;

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

peopleSelect.addEventListener("change", filterAudios);

function filterAudios() {
  // console.log(peopleSelect.value);
  // console.log(audios);
  let results = [];
  audioSelect.options.length=0;
  for (let i =0; i < audios.records.length; i++) {

    // console.log(audios.records[i].fields['Speaker (from Words (instance))'].indexOf(peopleSelect.value));

    if (audios.records[i].fields['Speaker (from Words (instance))'].indexOf(peopleSelect.value) !== -1) {
      results.push(audios.records[i].id);
      let audioName = audios.records[i].fields.Name;
      // console.log(audioName);
      const audioSelectItem = document.createElement("option");
      audioSelectItem.textContent = audioName;
      audioSelectItem.value = audios.records[i].id;
      audioSelect.appendChild(audioSelectItem);
    }
    else {

    }


    // let audioName = audios.records[i].fields.Name;
    // // console.log(audioName);
    // const audioSelectItem = document.createElement("option");
    // audioSelectItem.textContent = audioName;
    // audioSelectItem.value = audios.records[i].id;
    // audioSelect.appendChild(audioSelectItem);
  }
  console.log(results);
}

getPeople();

let audios;

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

audioSelect.addEventListener("change", getAudio);

let audio;

async function getAudio() {
  await fetch(`/api/Audio%20Source/${audioSelect.value}`)
  .then ((response) => response.json())
  .then ((json) => (audio = json));

  console.log(audio);
  console.log(audios.records[0].fields['Speaker (from Words (instance))']);

  // for (let i =0; i < audios.records.length; i++) {
  //   let audioName = audios.records[i].fields.Name;
  //   console.log(audioName);
  //   const audioSelectItem = document.createElement("option");
  //   audioSelectItem.textContent = audioName;
  //   audioSelectItem.value = audios.records[i].id;
  //   audioSelect.appendChild(audioSelectItem);
  // }
}

getAudios();



loadFromJSON();

function hideAnnotations() {
  document.querySelectorAll("span").forEach((sp) => {
  sp.classList.remove("annotated");
  });
}

let accentFeature;
let accentIssues;
let issuesSelected;
let issueSelected;
let featureSelected;

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

submenu = document.querySelectorAll(".submenu");


// let tableElementContent;

document.querySelectorAll("td").forEach((tableElement) => {
  // tableElementContent = tableElement.innerHTML;
  tableElement.addEventListener("click", filterAnnotations);
});

