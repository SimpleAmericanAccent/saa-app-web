import { Link } from "react-router-dom";
// import { useEffect } from "react";
// import useAuthStore from "../../stores/authStore";
import "./navBar.css";

function NavBar() {
  // const { userRole, isLoading, fetchUserRole } = useAuthStore();

  // useEffect(() => {
  //   fetchUserRole();
  // }, [fetchUserRole]);

  // if (isLoading) {
  //   return <div className="navbar">Loading...</div>;
  // }
  return (
    <div className="navbar">
      <a href="/logout">Log Out</a>
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
      {/* Show admin features only for users with write access */}
      {/* {userRole === "write" && ( */}
      <>
        {" | "}
        <Link to="/Home4">TV2</Link>
        {" | "}
        <Link to="/path">Path</Link>
        {" | "}
        <Link to="/quiz">Quiz</Link>
      </>
      {/* )} */}
    </div>
  );
}

export default NavBar;
