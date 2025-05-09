import { Routes, Route } from "react-router";
import { ThemeProvider } from "core-frontend-web/src/components/theme-provider";
import { SidebarProvider } from "core-frontend-web/src/components/ui/sidebar";
import Layout1 from "core-frontend-web/src/components/layout1.jsx";
import { allRoutes } from "core-frontend-web/src/routes/soundRoutes";

import ProtectedRoute from "core-frontend-web/src/components/ProtectedRoute.jsx";
import Transcript from "core-frontend-web/src/pages/transcript.jsx";
import WLS from "core-frontend-web/src/pages/wls.jsx";
import VSounds from "core-frontend-web/src/pages/vsounds.jsx";
import VSynth from "core-frontend-web/src/pages/vsynth.jsx";
import Home6 from "core-frontend-web/src/pages/stats.jsx";
import Links from "core-frontend-web/src/pages/links.jsx";
import LexicalSets from "core-frontend-web/src/pages/onboarding/lexical-sets.jsx";
import LexicalSetsQuiz from "core-frontend-web/src/pages/onboarding/lexical-sets-quiz.jsx";
import Phonemes from "core-frontend-web/src/pages/phonemes.jsx";
import SpellingPronunciationPage from "core-frontend-web/src/pages/SpellingPronunciationPage.jsx";
import WLSDataExplorer from "core-frontend-web/src/pages/WLSDataExplorer.jsx";
import DictionaryAdmin from "core-frontend-web/src/pages/DictionaryAdmin.jsx";
import { ModulePage } from "core-frontend-web/src/pages/ModulePage.jsx";

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
