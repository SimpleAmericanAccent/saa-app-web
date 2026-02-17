import { Route } from "react-router-dom";
import Transcript from "frontend/src/pages/transcript.jsx";
import WLS from "frontend/src/pages/wls.jsx";
import VSounds from "frontend/src/pages/vsounds.jsx";
import VSynth from "frontend/src/pages/vsynth.jsx";
import Stats from "frontend/src/pages/stats.jsx";
import SpellingPronunciationPage from "frontend/src/pages/spelling-pronunciation-page.jsx";
import LexicalSets from "frontend/src/pages/lexical-sets.jsx";
import ModulePage from "frontend/src/pages/module-page.jsx";
import UserDashboard from "frontend/src/pages/user-dashboard.jsx";
import ReplaysHub from "@/pages/calls.jsx";
import Resources from "frontend/src/pages/resources.jsx";
import Quiz from "frontend/src/pages/quiz.jsx";
import QuizAudioAdmin from "frontend/src/pages/quiz-audio-admin.jsx";
import Join from "frontend/src/pages/join.jsx";
import JoinThankYou from "frontend/src/pages/join-ty.jsx";
import Imitate from "frontend/src/pages/imitate.jsx";
import AccentExplorer from "frontend/src/pages/accent-explorer.jsx";
import SpectrogramTest from "frontend/src/pages/spectrogram-test.jsx";

const coreRoutes = (
  <>
    {/* Add new route with audioId parameter */}
    <Route path="/transcript/:audioId" element={<Transcript />} />
    <Route path="/transcript" element={<Transcript />} />
    <Route path="/sp" element={<SpectrogramTest />} />
    <Route path="/dashboard" element={<UserDashboard />} />
    <Route path="/wls" element={<WLS />} />
    <Route path="/vsounds" element={<VSounds />} />
    <Route path="/vsynth" element={<VSynth />} />
    <Route path="/stats" element={<Stats />} />
    <Route path="/links" element={<Resources />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/quiz/:category" element={<Quiz />} />
    <Route path="/quiz/:targetSlug/:issueSlug" element={<Quiz />} />
    <Route path="/quiz-audio-admin" element={<QuizAudioAdmin />} />
    <Route path="/imitate" element={<Imitate />} />
    <Route path="/imitate/:word" element={<Imitate />} />

    <Route
      path="/spelling-pronunciation"
      element={<SpellingPronunciationPage />}
    />
    <Route path="/calls" element={<ReplaysHub />} />

    <Route path="/join" element={<Join />} />
    <Route path="/join-ty" element={<JoinThankYou />} />

    <Route path="/lexical-sets" element={<LexicalSets />} />

    {/* Accent Issue Routes */}
    <Route path="/accent-explorer" element={<AccentExplorer />} />
    <Route path="/:targetSlug/:issueSlug" element={<AccentExplorer />} />
    <Route path="/:targetSlug" element={<AccentExplorer />} />

    <Route path="/learn/:moduleId" element={<ModulePage />} />
    <Route path="/learn/:moduleId/:lessonId" element={<ModulePage />} />

    <Route path="/" element={<Quiz />} />
    <Route path="*" element={<Quiz />} />
  </>
);

export default coreRoutes;
