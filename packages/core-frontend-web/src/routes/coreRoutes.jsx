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
import UserDashboard from "core-frontend-web/src/pages/UserDashboard.jsx";
import VowelReplays from "core-frontend-web/src/pages/replays/vowels.jsx";
import ConsonantReplays from "core-frontend-web/src/pages/replays/consonants.jsx";
import FlowReplays from "core-frontend-web/src/pages/replays/flow.jsx";
import SmartPracticeReplays from "core-frontend-web/src/pages/replays/smart-practice.jsx";
import Quiz from "core-frontend-web/src/pages/Quiz.jsx";
import QuizAudioAdmin from "core-frontend-web/src/pages/QuizAudioAdmin.jsx";
import Join from "core-frontend-web/src/pages/Join.jsx";
import JoinThankYou from "core-frontend-web/src/pages/JoinThankYou.jsx";
import ImitationPractice from "core-frontend-web/src/pages/ImitationPractice.jsx";

const coreRoutes = (
  <>
    {/* Add new route with audioId parameter */}
    <Route path="/transcript/:audioId" element={<Transcript />} />
    <Route path="/transcript" element={<Transcript />} />
    <Route path="/dashboard" element={<UserDashboard />} />
    <Route path="/wls" element={<WLS />} />
    <Route path="/vsounds" element={<VSounds />} />
    <Route path="/vsynth" element={<VSynth />} />
    <Route path="/stats" element={<Home6 />} />
    <Route path="/links" element={<Links />} />
    <Route path="/phonemes" element={<Phonemes />} />
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/quiz-audio-admin" element={<QuizAudioAdmin />} />
    <Route path="/imitate" element={<ImitationPractice />} />

    <Route
      path="/spelling-pronunciation"
      element={<SpellingPronunciationPage />}
    />
    <Route path="/replays/vowels" element={<VowelReplays />} />
    <Route path="/replays/consonants" element={<ConsonantReplays />} />
    <Route path="/replays/flow" element={<FlowReplays />} />
    <Route path="/replays/smart-practice" element={<SmartPracticeReplays />} />

    <Route path="/join" element={<Join />} />
    <Route path="/join-ty" element={<JoinThankYou />} />

    <Route path="/onboarding/lexical-sets" element={<LexicalSets />} />
    <Route path="/onboarding/lexical-sets-quiz" element={<LexicalSetsQuiz />} />

    <Route path="/learn/:moduleId" element={<ModulePage />} />
    <Route path="/learn/:moduleId/:lessonId" element={<ModulePage />} />
    <Route path="/" element={<Quiz />} />
    <Route path="*" element={<Quiz />} />
  </>
);

export default coreRoutes;
