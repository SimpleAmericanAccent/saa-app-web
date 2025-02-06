import { Routes, Route } from "react-router-dom";
import Home0 from "./pages/Home0.jsx";
import Home1 from "./pages/Home1.jsx";
import Home2 from "./pages/Home2.jsx";
import Home3 from "./pages/Home3.jsx";
import Home4 from "./pages/Home4.jsx";
import SuccessPath from "./pages/SuccessPath.jsx";
import Quiz from "./pages/Quiz.jsx";
import NavBar from "./components/navbar/NavBar.jsx";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home0 />} />
        <Route path="/home0" element={<Home0 />} />
        <Route path="/home1" element={<Home1 />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/home3" element={<Home3 />} />
        <Route path="/home4" element={<Home4 />} />
        <Route path="/path" element={<SuccessPath />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="*" element={<Home0 />} />
      </Routes>
    </>
  );
}

export default App;
