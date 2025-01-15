let audioContext;
let oscillator, gainNode;
let filterF1, filterF2, filterF3;
let isPlaying = false;

const vowelDiagram = document.getElementById('vowelDiagram');
const F1ValueSpan = document.getElementById('F1Value');
const F2ValueSpan = document.getElementById('F2Value');
const F3ValueSpan = document.getElementById('F3Value');
const volumeSlider = document.getElementById('volume');
const volumeValueSpan = document.getElementById('volumeValue');
const pitchSlider = document.getElementById('pitch');
const pitchValueSpan = document.getElementById('pitchValue');

// F1, F2, F3 Slider and Input Elements
const F1Slider = document.getElementById('F1');
const F1Input = document.getElementById('F1Input');
const F2Slider = document.getElementById('F2');
const F2Input = document.getElementById('F2Input');
const F3Slider = document.getElementById('F3');
const F3Input = document.getElementById('F3Input');

const startStopButton = document.getElementById('startStopButton');

const F1F2Marker = document.createElement('div');
F1F2Marker.id = 'F1F2Marker';
F1F2Marker.style.position = 'absolute';
F1F2Marker.style.width = '10px';
F1F2Marker.style.height = '10px';
F1F2Marker.style.backgroundColor = 'red';
F1F2Marker.style.borderRadius = '50%';
F1F2Marker.style.pointerEvents = 'none';
vowelDiagram.appendChild(F1F2Marker);

const phoneticSymbols = [
    { symbol: 'i', F1: 300, F2: 2500 },
    { symbol: 'e', F1: 400, F2: 2300 },
    { symbol: 'a', F1: 700, F2: 1200 },
    { symbol: 'o', F1: 500, F2: 800 },
    { symbol: 'u', F1: 350, F2: 600 },
    { symbol: 'æ', F1: 650, F2: 1700 },
    { symbol: 'ɪ', F1: 400, F2: 1900 },
    { symbol: 'ɛ', F1: 550, F2: 1700 },
    { symbol: 'ʌ', F1: 600, F2: 1200 },
    { symbol: 'ɔ', F1: 500, F2: 900 },
    { symbol: 'ʊ', F1: 450, F2: 1100 },
    { symbol: 'ɑ', F1: 700, F2: 1100 }
];

const xAxisMin = document.getElementById('xAxisMin');
const xAxisMax = document.getElementById('xAxisMax');
const yAxisMin = document.getElementById('yAxisMin');
const yAxisMax = document.getElementById('yAxisMax');

const F1_MIN = 300 - (0.05 * (700 - 300));
const F1_MAX = 700 + (0.05 * (700 - 300));
const F2_MIN = 500 - (0.05 * (2500 - 600));
const F2_MAX = 2500 + (0.05 * (2500 - 600));

xAxisMin.textContent = F2_MAX;
xAxisMax.textContent = F2_MIN;
yAxisMin.textContent = F1_MIN;
yAxisMax.textContent = F1_MAX;

phoneticSymbols.forEach(({ symbol, F1, F2 }) => {
    const symbolElement = document.createElement('div');
    symbolElement.textContent = symbol;
    symbolElement.style.position = 'absolute';
    symbolElement.style.fontSize = '1.2em';
    symbolElement.style.color = 'black';
    symbolElement.style.userSelect = 'none'; // Make non-highlightable
    symbolElement.style.pointerEvents = 'none'; // Prevent interaction
    symbolElement.style.transform = 'translate(-50%, -50%)'; // Center the symbol
    const rect = vowelDiagram.getBoundingClientRect();
    const x = ((F2_MAX - F2) / (F2_MAX - F2_MIN)) * rect.width;
    const y = ((F1 - F1_MIN) / (F1_MAX - F1_MIN)) * rect.height;
    symbolElement.style.left = `${x}px`;
    symbolElement.style.top = `${y}px`;
    vowelDiagram.appendChild(symbolElement);
});

vowelDiagram.addEventListener('mousedown', startSound);
vowelDiagram.addEventListener('mouseup', stopSound);
vowelDiagram.addEventListener('mousemove', function(event) {
    if (isPlaying) {
        const rect = vowelDiagram.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const F1 = F1_MIN + (y / rect.height) * (F1_MAX - F1_MIN); // Adjusted mapping y to F1 range
        const F2 = F2_MAX - (x / rect.width) * (F2_MAX - F2_MIN); // Adjusted mapping x to F2 range
        F1ValueSpan.textContent = Math.round(F1);
        F2ValueSpan.textContent = Math.round(F2);
        F1Slider.value = F1;
        F2Slider.value = F2;
        F1Input.value = F1;
        F2Input.value = F2;
        F1F2Marker.style.left = `${x - 5}px`;
        F1F2Marker.style.top = `${y - 5}px`;
        if (filterF1 && filterF2 && filterF3) {
            filterF1.frequency.setValueAtTime(F1, audioContext.currentTime);
            filterF2.frequency.setValueAtTime(F2, audioContext.currentTime);
            filterF3.frequency.setValueAtTime(parseFloat(F3ValueSpan.textContent), audioContext.currentTime);
        }
    }
});

volumeSlider.addEventListener('input', function() {
    const volume = this.value;
    volumeValueSpan.textContent = volume;
    if (gainNode) {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }
});

pitchSlider.addEventListener('input', function() {
    const pitch = this.value;
    pitchValueSpan.textContent = pitch;
    if (oscillator) {
        oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
    }
});

function updateF1F2Marker(F1, F2) {
    const rect = vowelDiagram.getBoundingClientRect();
    const x = ((F2_MAX - F2) / (F2_MAX - F2_MIN)) * rect.width;
    const y = ((F1 - F1_MIN) / (F1_MAX - F1_MIN)) * rect.height;
    F1F2Marker.style.left = `${x - 5}px`;
    F1F2Marker.style.top = `${y - 5}px`;
}

F1Slider.addEventListener('input', function() {
    const F1 = this.value;
    F1ValueSpan.textContent = F1;
    F1Input.value = F1;
    updateF1F2Marker(F1, F2Slider.value);
    if (filterF1) {
        filterF1.frequency.setValueAtTime(F1, audioContext.currentTime);
    }
});

F2Slider.addEventListener('input', function() {
    const F2 = this.value;
    F2ValueSpan.textContent = F2;
    F2Input.value = F2;
    updateF1F2Marker(F1Slider.value, F2);
    if (filterF2) {
        filterF2.frequency.setValueAtTime(F2, audioContext.currentTime);
    }
});

F3Slider.addEventListener('input', function() {
    const F3 = this.value;
    F3ValueSpan.textContent = F3;
    F3Input.value = F3;
    if (filterF3) {
        filterF3.frequency.setValueAtTime(F3, audioContext.currentTime);
    }
});

F1Input.addEventListener('input', function() {
    const F1 = this.value;
    F1ValueSpan.textContent = F1;
    F1Slider.value = F1;
    updateF1F2Marker(F1, F2Input.value);
    if (filterF1) {
        filterF1.frequency.setValueAtTime(F1, audioContext.currentTime);
    }
});

F2Input.addEventListener('input', function() {
    const F2 = this.value;
    F2ValueSpan.textContent = F2;
    F2Slider.value = F2;
    updateF1F2Marker(F1Input.value, F2);
    if (filterF2) {
        filterF2.frequency.setValueAtTime(F2, audioContext.currentTime);
    }
});

F3Input.addEventListener('input', function() {
    const F3 = this.value;
    F3ValueSpan.textContent = F3;
    F3Slider.value = F3;
    if (filterF3) {
        filterF3.frequency.setValueAtTime(F3, audioContext.currentTime);
    }
});

startStopButton.addEventListener('click', function() {
    if (isPlaying) {
        stopSound();
        startStopButton.textContent = 'Start';
    } else {
        startSound();
        startStopButton.textContent = 'Stop';
    }
});

function startSound() {
    if (isPlaying) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';  // Sawtooth waveform has rich harmonics
    oscillator.frequency.setValueAtTime(parseFloat(pitchValueSpan.textContent), audioContext.currentTime);  // Fundamental frequency

    filterF1 = audioContext.createBiquadFilter();
    filterF1.type = 'bandpass';
    filterF1.frequency.setValueAtTime(parseFloat(F1ValueSpan.textContent), audioContext.currentTime);
    filterF1.Q.setValueAtTime(10, audioContext.currentTime);  // Q factor controls bandwidth

    filterF2 = audioContext.createBiquadFilter();
    filterF2.type = 'bandpass';
    filterF2.frequency.setValueAtTime(parseFloat(F2ValueSpan.textContent), audioContext.currentTime);
    filterF2.Q.setValueAtTime(10, audioContext.currentTime);

    filterF3 = audioContext.createBiquadFilter();
    filterF3.type = 'bandpass';
    filterF3.frequency.setValueAtTime(parseFloat(F3ValueSpan.textContent), audioContext.currentTime);
    filterF3.Q.setValueAtTime(10, audioContext.currentTime);

    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(parseFloat(volumeValueSpan.textContent), audioContext.currentTime);  // Volume control

    oscillator.connect(filterF1);
    filterF1.connect(filterF2);
    filterF2.connect(filterF3);
    filterF3.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    isPlaying = true;
}

function stopSound() {
    if (!isPlaying) return;

    oscillator.stop();
    audioContext.close();
    isPlaying = false;
}