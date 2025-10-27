import { Route } from "react-router-dom";
import Transcript from "core-frontend-web/src/pages/transcript.jsx";
import WLS from "core-frontend-web/src/pages/wls.jsx";
import VSounds from "core-frontend-web/src/pages/vsounds.jsx";
import VSynth from "core-frontend-web/src/pages/vsynth.jsx";
import Stats from "core-frontend-web/src/pages/stats.jsx";
import SpellingPronunciationPage from "core-frontend-web/src/pages/spelling-pronunciation-page.jsx";
import LexicalSets from "core-frontend-web/src/pages/lexical-sets.jsx";
import ModulePage from "core-frontend-web/src/pages/module-page.jsx";
import UserDashboard from "core-frontend-web/src/pages/user-dashboard.jsx";
import ReplaysHub from "core-frontend-web/src/pages/replays-hub.jsx";
import Resources from "core-frontend-web/src/pages/resources.jsx";
import Quiz from "core-frontend-web/src/pages/quiz.jsx";
import QuizAudioAdmin from "core-frontend-web/src/pages/quiz-audio-admin.jsx";
import Join from "core-frontend-web/src/pages/join.jsx";
import JoinThankYou from "core-frontend-web/src/pages/join-ty.jsx";
import Imitate from "core-frontend-web/src/pages/imitate.jsx";
import AccentExplorer from "core-frontend-web/src/pages/accent-explorer.jsx";

const coreRoutes = (
  <>
    {/* Add new route with audioId parameter */}
    <Route path="/transcript/:audioId" element={<Transcript />} />
    <Route path="/transcript" element={<Transcript />} />
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
    <Route path="/replays" element={<ReplaysHub />} />
    <Route path="/replays/vowels" element={<ReplaysHub />} />
    <Route path="/replays/consonants" element={<ReplaysHub />} />
    <Route path="/replays/flow" element={<ReplaysHub />} />
    <Route path="/replays/smart-practice" element={<ReplaysHub />} />

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
