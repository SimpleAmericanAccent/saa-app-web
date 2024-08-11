//import json files (transcripts including alignment data)

import speech1 from './JSON/speech1.json' with {type: 'json'};
import speech2 from './JSON/speech2.json' with {type: 'json'};
import speech3 from './JSON/speech3.json' with {type: 'json'};
// import { speech1, speech2, speech3 } from './app.js';
// separate js file no longer needed

// DOM selection and associated variables
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const transcriptDiv = document.getElementById('transcript');

// variable declarations

const speechOptions = [1, 2, 3];
let speechIndex = 3;

const audioURLSelected = `./audio/audio${speechIndex}.mp3`
const transcriptSelected = speech3.speech.transcripts;

// function definitions

function showCurrentWord (e) {
    const { duration, currentTime } = e.srcElement
    console.log(currentTime);
};

// main logic
// Set audio source
audioSource.src = audioURLSelected;
audioPlayer.load();

transcriptSelected.forEach(tranData => {
    const start_offset = tranData.start_offset;
    const start_offset_conv = start_offset / 16000;
    const alignment = tranData.alignment;

    alignment.forEach(wordData => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = wordData.word + ' ';
        wordSpan.dataset.startTime = wordData.start + start_offset_conv;

        wordSpan.addEventListener('click', () => {
            audioPlayer.currentTime = wordData.start + start_offset_conv;
            audioPlayer.play();
        });
        transcriptDiv.appendChild(wordSpan);
    });
    const para = document.createElement('p');
    transcriptDiv.appendChild(para);
});

// event listeners
audioPlayer.addEventListener('timeupdate', showCurrentWord);

// console.log(wordSpan);
// console.log(wordData);