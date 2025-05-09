import { Route } from "react-router-dom";
import Transcript from "core-frontend-web/src/pages/transcript.jsx";
import WLS from "core-frontend-web/src/pages/wls.jsx";
import VSounds from "core-frontend-web/src/pages/vsounds.jsx";
import VSynth from "core-frontend-web/src/pages/vsynth.jsx";
import Home6 from "core-frontend-web/src/pages/stats.jsx";
import Links from "core-frontend-web/src/pages/links.jsx";
import Phonemes from "core-frontend-web/src/pages/phonemes.jsx";
import SpellingPronunciationPage from "core-frontend-web/src/pages/SpellingPronunciationPage.jsx";
import LexicalSets from "core-frontend-web/src/pages/onboarding/lexical-sets.jsx";
import LexicalSetsQuiz from "core-frontend-web/src/pages/onboarding/lexical-sets-quiz.jsx";
import ModulePage from "core-frontend-web/src/pages/ModulePage.jsx";

const coreRoutes = (
  <>
    <Route path="/transcript" element={<Transcript />} />
    <Route path="/wls" element={<WLS />} />
    <Route path="/vsounds" element={<VSounds />} />
    <Route path="/vsynth" element={<VSynth />} />
    <Route path="/stats" element={<Home6 />} />
    <Route path="/links" element={<Links />} />
    <Route path="/phonemes" element={<Phonemes />} />
    <Route
      path="/spelling-pronunciation"
      element={<SpellingPronunciationPage />}
    />
    <Route path="/onboarding/lexical-sets" element={<LexicalSets />} />
    <Route path="/onboarding/lexical-sets-quiz" element={<LexicalSetsQuiz />} />

    <Route path="/learn/:moduleId" element={<ModulePage />} />
    <Route path="/learn/:moduleId/:lessonId" element={<ModulePage />} />
    <Route path="/" element={<Transcript />} />
  </>
);

export default coreRoutes;
