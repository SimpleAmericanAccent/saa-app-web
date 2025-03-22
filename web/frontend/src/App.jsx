import { Routes, Route } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout1 from "./components/layout1.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Transcript from "./pages/transcript.jsx";
import WLS from "./pages/wls.jsx";
import VSounds from "./pages/vsounds.jsx";
import Home4 from "./pages/Home4.jsx";
import VSynth from "./pages/vsynth.jsx";
import Home6 from "./pages/stats.jsx";
// import SuccessPath from "./pages/SuccessPath.jsx";
// import Quiz from "./pages/Quiz.jsx";
// import NavBar from "./components/navbar/NavBar";

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

              {/* Protected routes for write access */}
              <Route
                path="/home4"
                element={
                  <ProtectedRoute requiredRole="write">
                    {/* <Home4 /> */}
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
