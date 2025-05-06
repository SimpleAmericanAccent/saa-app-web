import { Routes, Route } from "react-router";
import { ThemeProvider } from "frontend-web-core/src/components/theme-provider";
import { SidebarProvider } from "frontend-web-core/src/components/ui/sidebar";
import Layout1 from "frontend-web-core/src/components/layout1.jsx";
import { allRoutes } from "frontend-web-core/src/routes/soundRoutes";

import ProtectedRoute from "frontend-web-core/src/components/ProtectedRoute.jsx";
import Transcript from "frontend-web-core/src/pages/transcript.jsx";
import WLS from "frontend-web-core/src/pages/wls.jsx";
import VSounds from "frontend-web-core/src/pages/vsounds.jsx";
import VSynth from "frontend-web-core/src/pages/vsynth.jsx";
import Home6 from "frontend-web-core/src/pages/stats.jsx";
import Links from "frontend-web-core/src/pages/links.jsx";
import LexicalSets from "frontend-web-core/src/pages/onboarding/lexical-sets.jsx";
import LexicalSetsQuiz from "frontend-web-core/src/pages/onboarding/lexical-sets-quiz.jsx";
import Phonemes from "frontend-web-core/src/pages/phonemes.jsx";
import SpellingPronunciationPage from "frontend-web-core/src/pages/SpellingPronunciationPage.jsx";
import WLSDataExplorer from "frontend-web-core/src/pages/WLSDataExplorer.jsx";
import DictionaryAdmin from "frontend-web-core/src/pages/DictionaryAdmin.jsx";
import { ModulePage } from "frontend-web-core/src/pages/ModulePage.jsx";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider
          style={{
            "--sidebar-width": "var(--rsidebar-width)",
          }}
        >
          <Routes>
            <Route element={<Layout1 />}>
              <Route path="/transcript" element={<Transcript />} />
              <Route path="/" element={<Transcript />} />
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
              <Route
                path="/onboarding/lexical-sets"
                element={<LexicalSets />}
              />
              <Route
                path="/onboarding/lexical-sets-quiz"
                element={<LexicalSetsQuiz />}
              />

              <Route path="/learn/:moduleId" element={<ModulePage />} />
              <Route
                path="/learn/:moduleId/:lessonId"
                element={<ModulePage />}
              />

              {/* Protected routes for write access */}
              <Route
                path="/wls-data"
                element={
                  <ProtectedRoute requiredRole="write">
                    <WLSDataExplorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dictionary-admin"
                element={
                  <ProtectedRoute requiredRole="write">
                    <DictionaryAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/path"
                element={
                  <ProtectedRoute requiredRole="write">
                    {/* <SuccessPath /> */}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute requiredRole="write">
                    {/* <Quiz /> */}
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Transcript />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
