// Ensure your JSON data is correctly formatted and available
const jsonData = {
    "audio_url": "https://speech-prod.s3.us-west-2.amazonaws.com/u870396/22HCZYGULYAHKXQ2.mp3?response-content-disposition=attachment%3B%20filename%3D%22Note.mp3%22&AWSAccessKeyId=ASIA5XW35FGZBRUJLZ6X&Signature=yDVf0Qn7OvWxru72l5QGkfzJxp8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAEaCXVzLXdlc3QtMiJHMEUCIQDhli0RWOW5gwqvmG78sBAWsNzD%2FnJOK2ctAOLAKJnksgIgE4WZwxBgCdOqAfIkzs5bo9owJE%2FDY3dJfu1r7HgfohoqvQUI2v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAEGgw5NDQyODAyNTA4MDIiDONVChAsCD9Kv%2BjvliqRBaRWpcToOL09lvm9Mi44yh86ZNFOSlRyC1FpP3okhmBSN1irtFXO8SQ%2Ffg6rGw7YoeJOnoFNAr1QfDI3%2BjyBE3mAKDAAXLtVdnSdo8PdaUCcU8GPxx26LDbtYsOZUBuezKqEohlPCXpNjHC9qErKPwr40c%2Fo9QSqUlMv0GAVbvR%2B8IoORE3M3Hm%2FWw0YLB%2FJYpW5vBHbFiRmLWSmfzq4mQbB5PEeIox4Sj6EWgaP8hjvTwIhOWDqSarv6J7qSYL098B9puWcsp1LwiQjkhExx461QE4Bu0UjcSTg4ymaoTxq0V8UoE%2FO8BfDhQG3kcPmRauCpeRa0cK%2F2FycaCm0HVVMY%2F2JAS9jyT5ZMCZKUo47NigvvpGis7oWOWtzRz3NeO161Rxa7uOOAdXdmLZu5kUeSBebSygzRo8WFPKl3oJKaBXeTo8XxU%2BjYbP82vLmi52LSs2%2FZ0GajyU8M%2B8myL5khavz3tlEzgBw%2FvFIKFtyIVZySB3Z69eeccTmkY0bVW5Pnn62S2x%2BaVXVQxQUpx3svC5esMAA4wVcEZY2w55LbSJPFXPZo8h3EMSZic9B7s4HgxItpEN2LQDTN5TAC7PNy7wfPTtpfqNk1UjcZNeq8zs0DDQijPFoX0dL6FhGo5B8PmavaRI7p7JtVbHhkjGMryYCeNRvP9uOvXYNnIOwvGwSqoo1xUGOrVKaS7q%2BsQjBJnuqwMyFGPGfGwuHCMxv4KfPCNlwfP1%2F%2FrjF%2FDF%2FB97%2BHapZnEg3XWpcX1iBa2grSt7Rnusw2GcauRbp41YaTc%2BhIrAD2T8%2BqjS2tfntodTcOe2wswAiRHfL4ofeA4EDd0TcUv5Wa3%2B%2FoSKoAMnIdJFR1Alxfim9vSGlFQZ%2BqjDCqo%2B1BjqxAUyd3YcLulOINcRgBDZc6mfAqNenlSb%2F1sLt5kVi3Tyyb8mTXmbUc97UXQ07XlnB0RykLts%2BnZ8IGFMBxSyP7Xl5Frv45TmDiP1JEzkhnrjBWz0xWjlylThzlCKuaIjcYf0VIP0%2FuG5o%2F71b1ZOmTm8e0tWkjn1cH4KDYsyWUG0JgJyr48voCY%2FBZ7h2h0jdQFJYFw%2FSqBNI6Ckv4JxEzM5y5O70%2Bbxt1ks%2FYNONIvl08A%3D%3D&Expires=1722189483",
    "transcripts": [
        {
            "alignment": [
                {"word": "There", "start": 0.0, "end": 0.18},
                {"word": "was", "start": 0.18, "end": 0.33},
                {"word": "once", "start": 0.33, "end": 0.63},
                {"word": "a", "start": 0.63, "end": 0.69},
                {"word": "poor", "start": 0.69, "end": 0.96},
                {"word": "shepherd", "start": 0.96, "end": 1.35},
                {"word": "boy", "start": 1.35, "end": 1.65},
                {"word": "who", "start": 1.68, "end": 1.74},
                {"word": "used", "start": 1.74, "end": 1.98},
                {"word": "to", "start": 1.98, "end": 2.04},
                {"word": "watch", "start": 2.04, "end": 2.28},
                {"word": "his", "start": 2.28, "end": 2.4},
                {"word": "flocks", "start": 2.4, "end": 2.76},
                {"word": "in", "start": 2.76, "end": 2.85},
                {"word": "the", "start": 2.85, "end": 2.91},
                {"word": "fields", "start": 2.91, "end": 3.33},
                {"word": "next", "start": 3.36, "end": 3.57},
                {"word": "to", "start": 3.57, "end": 3.66},
                {"word": "a", "start": 3.66, "end": 3.69},
                {"word": "dark", "start": 3.69, "end": 3.96},
                {"word": "forest", "start": 3.96, "end": 4.44},
                {"word": ".", "start": 4.44, "end": 4.53}
            ]
        }
    ]
};

// Set audio source
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
audioSource.src = jsonData.audio_url;
audioPlayer.load();

// Display the transcript
const transcriptDiv = document.getElementById('transcript');
const alignment = jsonData.transcripts[0].alignment;

alignment.forEach(wordData => {
    const wordSpan = document.createElement('span');
    wordSpan.textContent = wordData.word + ' ';
    wordSpan.dataset.startTime = wordData.start;

    wordSpan.addEventListener('click', () => {
        audioPlayer.currentTime = wordData.start;
        audioPlayer.play();
    });

    transcriptDiv.appendChild(wordSpan);
});
