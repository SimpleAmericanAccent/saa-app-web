import { speech1, speech2 } from './app.js';

const audio2_url = './audio/audio2.mp3'

// Ensure your JSON data is correctly formatted and available


// Set audio source
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
audioSource.src = audio2_url;
audioPlayer.load();


// Display the transcript
const transcriptDiv = document.getElementById('transcript');
const alignment = speech2.speech.transcripts[0].alignment;
const start_offset = speech2.speech.transcripts[0].start_offset;
const start_offset_conv = start_offset / 16000;

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


const jsonPreview = document.getElementById('jsonPreview');
// jsonPreview.innerHTML = json;



console.log(speech1.speech.transcripts[0]);
console.log(speech2.speech.transcripts[0]);
console.log(audio2_url);
console.log(start_offset);
console.log(start_offset_conv);