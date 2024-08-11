//// import json files (transcripts including alignment data)
//// this async method is working better for me than the import method
let speech1;
await fetch("./JSON/speech1.json")
  .then((response) => response.json())
  .then((json) => (speech1 = json));

//// DOM selection and associated variables
const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
const transcriptDiv = document.getElementById("transcript");
const toolTip = document.getElementById("toolTip");

//// variable declarations

let inProgress = {
  // an object containing user-generated edits
  // could be developed into an output
  timeIntervals: [],
  words: [],
  notes: [],
};

let issueObj = {
  // an object used to convert between keypresses and pronunciation issues
  // just an idea. Not sure how many unique labels are needed / if this approach is enough
  KeyA: "Too Brazilian",
  KeyB: "Not Brazilian Enough",
  KeyC: "Поссиблы Руссиан",
  KeyD: "Lorem Ipsum",
  KeyE: "Baa'rekde",
};

let activeWord = 0; // index of the word currently being spoken

const speechOptions = [1, 2, 3];
let speechIndex = speechOptions[2];

const audioURLSelected = `./audio/audio${speechIndex}.mp3`;
const transcriptSelected = speech1.speech.transcripts;

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

// equivalent but runs a bit faster and more reliably than 'timeupdate'
// the last argument is the time (ms) between calls of showCurrentWord()
// could definitely be slowed down a bit if it becomes a performance issue
setInterval(function () {
  showCurrentWord();
}, 30);

// detects hotkey-entered annotations for highlighted span
// see issueObj for conversions
document.addEventListener("keydown", (e) => {
  let hov = document.querySelector("span:hover");
  if (hov) {
    hov.classList.add("annotated");
    let code = e.code;
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
      console.log(inProgress.words[ind]);
    },
    false
  );
}
