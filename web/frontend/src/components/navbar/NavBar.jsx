import { Link } from "react-router-dom";
import "./navBar.css";

function NavBar() {
  return (
    <div className="navbar">
      <a href="/logout">Log Out</a>
      {" | "}
      <Link to="/Home0">0</Link>
      {" | "}
      <Link to="/Home1">Transcript Viewer</Link>
      {" | "}
      <Link to="/Home6">Stats</Link>
      {" | "}
      <Link to="/Home2">Word Lists & Spelling</Link>
      {" | "}
      <Link to="/Home3">Vowel Sounds</Link>
      {" | "}
      <Link to="/Home5">Vowel Synth</Link>
      {" | "}
      <Link to="/Home4">TV2</Link>
      {" | "}
      <Link to="/path">Path</Link>
      {" | "}
      <Link to="/quiz">Quiz</Link>
      <br />
      {"Legacy: "}
      <a href="/home.html">Home</a>
      {" | "}
      <a href="/learn2.html">Word Lists & Spelling</a>
      {" | "}
      <a href="/learn3.html">Vowel Sounds</a>
      {" | "}
      <a href="/synth.html">Vowel Synth</a>
    </div>
  );
}

export default NavBar;
