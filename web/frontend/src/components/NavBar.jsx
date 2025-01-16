import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="navbar">
      <Link to="/Home0">Home0</Link>
      {" | "}
      <Link to="/Home1">Home1</Link>
      {" | "}
      <Link to="/Home2">Home2</Link>
      {" | "}
      <Link to="/Home3">Home3</Link>
      {" | "}
      <Link to="/Home4">Home4</Link>
      {" | "}
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
