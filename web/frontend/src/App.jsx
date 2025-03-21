import { Routes, Route } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout1 from "./components/layout1.jsx";
import Layout2 from "./components/layout2.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home1 from "./pages/Home1.jsx";
import Home2 from "./pages/Home2.jsx";
import Home3 from "./pages/Home3.jsx";
import Home4 from "./pages/Home4.jsx";
import Home5 from "./pages/Home5.jsx";
import Home6 from "./pages/Home6.jsx";
// import SuccessPath from "./pages/SuccessPath.jsx";
// import Quiz from "./pages/Quiz.jsx";
// import NavBar from "./components/navbar/NavBar";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider style={{ "--sidebar-width": "500px" }}>
          <Routes>
            <Route element={<Layout1 />}>
              <Route path="/" element={<Home1 />} />
              <Route path="*" element={<Home1 />} />
              <Route path="/home1" element={<Home1 />} />
            </Route>
            <Route element={<Layout2 />}>
              <Route path="/home2" element={<Home2 />} />
              <Route path="/home3" element={<Home3 />} />
              <Route path="/home5" element={<Home5 />} />
              <Route path="/home6" element={<Home6 />} />

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
            </Route>
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
