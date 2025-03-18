import { Routes, Route } from "react-router";
import NavBar from "./components/navbar/NavBar.jsx";
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
      <NavBar />
      <Routes>
        <Route path="/" element={<Home1 />} />
        <Route path="/home1" element={<Home1 />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/home3" element={<Home3 />} />
        <Route path="/home5" element={<Home5 />} />
        <Route path="/home6" element={<Home6 />} />
        <Route path="*" element={<Home1 />} />

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
      </Routes>
    </>
  );
}

export default App;
