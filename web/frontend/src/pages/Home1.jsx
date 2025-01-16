import React, { useState, useEffect, useRef } from "react";
import styles from "./Home1.module.css";

function Home1() {
  const [authz, setAuthz] = useState(null);
  const [audios, setAudios] = useState(null);
  const [defaultData, setDefaultData] = useState(null);
  const [defaultAudio, setDefaultAudio] = useState(null);
  const [defaultAirtableWords, setDefaultAirtableWords] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [audio, setAudio] = useState(null);
  const [accentFeature, setAccentFeature] = useState(null);
  const [accentIssues, setAccentIssues] = useState(null);
  const [issuesSelected, setIssuesSelected] = useState(null);
  const [issueSelected, setIssueSelected] = useState(null);
  const [featureSelected, setFeatureSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [people, setPeople] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [speechData, setSpeechData] = useState(null);
  const [annotationsLoaded, setAnnotationsLoaded] = useState(null);
  const [issues, setIssues] = useState(null);
  const [audioURLSelected, setAudioURLSelected] = useState(null);
  const [transcriptSelected, setTranscriptSelected] = useState(null);
  const [speechDataURL, setSpeechDataURL] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [audioNameURLEncoded, setAudioNameURLEncoded] = useState(null);
  const [airtableWords, setAirtableWords] = useState(null);
  const [airtableIssues, setAirtableIssues] = useState(null);
  const [airtableIssuesObject, setAirtableIssuesObject] = useState({});
  const [activeWord, setActiveWord] = useState(0); // index of the word currently being spoken
  const [selectedWord, setSelectedWord] = useState(null); // index of the word whose annotations are being edited
  const [inProgress, setInProgress] = useState({
    // an object containing user-generated edits
    // could be developed into an output
    timeIntervals: [],
    words: [],
    notes: [],
    ATRecs: [],
  });

  const audioPlayerRef = useRef(null);
  const audioSourceRef = useRef(null);
  const audioOffsetTunerRef = useRef(null);
  const transcriptDivRef = useRef(null);
  const toolTipRef = useRef(null);
  const saveBtnRef = useRef(null);
  const loadBtnRef = useRef(null);
  const openFromAirtableBtnRef = useRef(null);
  const saveToAirtableBtnRef = useRef(null);
  const tempBtnRef = useRef(null);
  const listRef = useRef(null);
  const playbackSpeedRef = useRef(null);
  const peopleSelectRef = useRef(null);
  const audioSelectRef = useRef(null);

  useEffect(() => {
    // Add event listeners and other initialization logic here
    const saveBtn = saveBtnRef.current;
    const loadBtn = loadBtnRef.current;
    const openFromAirtableBtn = openFromAirtableBtnRef.current;
    const saveToAirtableBtn = saveToAirtableBtnRef.current;
    const tempBtn = tempBtnRef.current;

    saveBtn.addEventListener("click", saveToJSON);
    loadBtn.addEventListener("click", loadFromJSON);
    openFromAirtableBtn.addEventListener("click", getAudio);
    saveToAirtableBtn.addEventListener("click", saveToAirtable);
    tempBtn.addEventListener("click", tempAirtableTest);

    return () => {
      // Clean up event listeners
      saveBtn.removeEventListener("click", saveToJSON);
      loadBtn.removeEventListener("click", loadFromJSON);
      openFromAirtableBtn.removeEventListener("click", getAudio);
      saveToAirtableBtn.removeEventListener("click", saveToAirtable);
      tempBtn.removeEventListener("click", tempAirtableTest);
    };
  }, []);

  async function saveToJSON() {
    // Implement saveToJSON logic here
  }

  async function loadFromJSON() {
    // Implement loadFromJSON logic here
  }

  async function getAudio() {
    // Implement getAudio logic here
  }

  async function saveToAirtable() {
    // Implement saveToAirtable logic here
  }

  async function tempAirtableTest() {
    // Implement tempAirtableTest logic here
  }

  return (
    <div className={styles.container}>
      <audio id="audioPlayer" ref={audioPlayerRef}>
        <source id="audioSource" ref={audioSourceRef} />
      </audio>
      <input type="range" id="audioOffsetTuner" ref={audioOffsetTunerRef} />
      <div id="transcript" ref={transcriptDivRef}></div>
      <div id="toolTip" ref={toolTipRef}></div>
      <button id="save" ref={saveBtnRef} className={styles.button}>
        Save
      </button>
      <button id="load" ref={loadBtnRef} className={styles.button}>
        Load
      </button>
      <button
        id="openFromAirtable"
        ref={openFromAirtableBtnRef}
        className={styles.button}
      >
        Open from Airtable
      </button>
      <button
        id="saveToAirtable"
        ref={saveToAirtableBtnRef}
        className={styles.button}
      >
        Save to Airtable
      </button>
      <button id="tempBtn" ref={tempBtnRef} className={styles.button}>
        Temp
      </button>
      <div id="list" ref={listRef} className={styles.list}></div>
      <input type="range" id="playbackSpeed" ref={playbackSpeedRef} />
      <select id="peopleSelect" ref={peopleSelectRef}></select>
      <select id="audioSelect" ref={audioSelectRef}></select>
    </div>
  );
}

export default Home1;
