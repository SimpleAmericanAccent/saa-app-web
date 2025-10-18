import { useParams } from "react-router-dom";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import ModuleLayout from "core-frontend-web/src/components/ModuleLayout";
import {
  SoundContent,
  SoundGrid,
} from "core-frontend-web/src/components/SoundContent";
import wlsData from "core-frontend-web/src/data/wls-data.json";

export default function ModulePage() {
  const { moduleId, lessonId } = useParams();

  // Determine if we're on a vowel or consonant page
  const isVowelPage = moduleId === "vowels";
  const isConsonantPage = moduleId === "consonants";

  // Get the sounds data object based on the module type
  const soundsData = isVowelPage ? wlsData.vowels : wlsData.consonants;

  // Find the exact key from the data structure using case-insensitive matching
  const soundKey =
    lessonId &&
    Object.keys(soundsData).find(
      (key) => key.toLowerCase() === decodeURIComponent(lessonId).toLowerCase()
    );

  // Get the sound data using the exact key
  const soundData = soundKey ? soundsData[soundKey] : null;

  // Show index page for vowels or consonants
  if ((isVowelPage || isConsonantPage) && !lessonId) {
    const sounds = isVowelPage ? wlsData.vowels : wlsData.consonants;
    const title = isVowelPage ? "Vowel Sounds" : "Consonant Sounds";

    return (
      <ModuleLayout
        moduleTitle={title}
        currentPage={1}
        totalPages={1}
        type={isVowelPage ? "vowel" : "consonant"}
      >
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          <SoundGrid
            sounds={sounds}
            moduleId={moduleId}
            type={isVowelPage ? "vowel" : "consonant"}
          />
        </div>
      </ModuleLayout>
    );
  }

  // Error handling for missing or invalid parameters
  if (!moduleId || ((isVowelPage || isConsonantPage) && !soundData)) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Error: {!moduleId ? "Missing Module ID" : "Sound Not Found"}
        </h1>
        <p>Module ID: {moduleId || "missing"}</p>
        <p>Lesson ID: {lessonId || "missing"}</p>
        {(isVowelPage || isConsonantPage) && (
          <div className="mt-4">
            <p>Available {isVowelPage ? "vowels" : "consonants"}:</p>
            <ul className="list-disc pl-6 mt-2">
              {Object.keys(
                isVowelPage ? wlsData.vowels : wlsData.consonants
              ).map((key) => (
                <li key={key}>
                  <Link
                    to={`/learn/${moduleId}/${key.toLowerCase()}`}
                    className="text-blue-500 hover:underline"
                  >
                    {key}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Individual sound page (vowel or consonant)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModuleLayout
        moduleTitle={
          soundData
            ? soundKey
            : isVowelPage
            ? "Vowel Sounds"
            : "Consonant Sounds"
        }
        currentPage={1}
        totalPages={5}
        prevLesson={`/learn/${moduleId}`}
        nextLesson={`/learn/${moduleId}/${getNextSound(
          soundKey,
          isVowelPage ? wlsData.vowels : wlsData.consonants
        )}`}
        soundData={soundData}
        type={isVowelPage ? "vowel" : "consonant"}
      >
        <SoundContent
          data={soundData}
          type={isVowelPage ? "vowel" : "consonant"}
          soundKey={soundKey}
          moduleId={moduleId}
        />
      </ModuleLayout>
    </Suspense>
  );
}

// Helper function to get the next sound in the list
function getNextSound(currentSound, soundsData) {
  const sounds = Object.keys(soundsData);
  const currentIndex = sounds.indexOf(currentSound);
  if (currentIndex === -1 || currentIndex === sounds.length - 1) {
    return sounds[0].toLowerCase();
  }
  return sounds[currentIndex + 1].toLowerCase();
}
